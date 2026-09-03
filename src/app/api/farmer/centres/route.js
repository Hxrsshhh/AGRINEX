import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import ProcurementCentre from "@/models/ProcurementCentre";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const json = (success, message, status = 200, extra = {}) =>
  NextResponse.json({ success, message, ...extra }, { status });

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasPath = (p) => Object.prototype.hasOwnProperty.call(ProcurementCentre.schema.paths, p);

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return json(false, "Unauthorized", 401);
    if (session.user.role !== "FARMER") return json(false, "Only farmers can access procurement centres", 403);

    await connectDB();
    const farmer = await Farmer.findById(session.user.id).select("name mobile role isActive farmLocation preferredCentre").lean();
    if (!farmer) return json(false, "Farmer not found", 404);
    if (!farmer.isActive) return json(false, "Farmer account is inactive", 403);

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state")?.trim();
    const district = searchParams.get("district")?.trim();
    const search = searchParams.get("search")?.trim();

    const filter = {};
    if (hasPath("isActive")) filter.isActive = true;
    if (hasPath("status")) filter.status = { $nin: ["INACTIVE", "CLOSED"] };

    const addLocationCond = (val, keys) => {
      if (!val) return;
      const rx = new RegExp(`^${escapeRegex(val)}$`, "i");
      const conds = keys.filter(hasPath).map((k) => ({ [k]: rx }));
      if (conds.length === 1) Object.assign(filter, conds[0]);
      else if (conds.length > 1) (filter.$and = filter.$and || []).push({ $or: conds });
    };

    addLocationCond(state, ["state", "address.state"]);
    addLocationCond(district, ["district", "address.district"]);

    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      const fields = ["name", "code", "centreCode", "village", "district", "block", "state", "address.name", "address.village", "address.district", "address.block", "address.state"];
      const sConds = fields.filter(hasPath).map((f) => ({ [f]: rx }));
      if (sConds.length) (filter.$and = filter.$and || []).push({ $or: sConds });
    }

    const centres = await ProcurementCentre.find(filter)
      .sort(hasPath("name") ? { name: 1 } : { createdAt: -1 })
      .lean();

    const prefId = farmer.preferredCentre ? String(farmer.preferredCentre) : null;
    const formattedCentres = centres.map((c) => ({ ...c, isPreferred: prefId === String(c._id) }));

    return json(true, undefined, 200, {
      farmer: {
        id: farmer._id,
        name: farmer.name,
        mobile: farmer.mobile,
        farmLocation: farmer.farmLocation,
        preferredCentre: farmer.preferredCentre,
      },
      centres: formattedCentres,
      count: formattedCentres.length,
    });
  } catch (error) {
    console.error("GET /api/farmer/centres error:", error);
    return json(false, "Failed to fetch procurement centres", 500, {
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
}