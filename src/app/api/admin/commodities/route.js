import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import Commodity from "@/models/Commodity";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const CATEGORIES = [
  "CEREAL",
  "PULSE",
  "OILSEED",
  "VEGETABLE",
  "FRUIT",
  "OTHER",
];

const UNITS = ["KG", "QUINTAL", "TON"];

function responseError(message, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

async function getAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  if (session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function parseNumber(value, fallback = 0) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : NaN;
}

function cleanDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function cleanQualityParameters(parameters) {
  if (!Array.isArray(parameters)) {
    return [];
  }

  return parameters
    .filter(
      (parameter) =>
        parameter &&
        cleanString(parameter.name)
    )
    .map((parameter) => {
      const minimum =
        parameter.minimum === "" ||
        parameter.minimum === null ||
        parameter.minimum === undefined
          ? null
          : Number(parameter.minimum);

      const maximum =
        parameter.maximum === "" ||
        parameter.maximum === null ||
        parameter.maximum === undefined
          ? null
          : Number(parameter.maximum);

      return {
        name: cleanString(parameter.name),
        minimum,
        maximum,
        unit: cleanString(parameter.unit),
      };
    });
}

function validateQualityParameters(parameters) {
  if (!Array.isArray(parameters)) {
    return "Quality parameters must be an array.";
  }

  for (const parameter of parameters) {
    if (!cleanString(parameter?.name)) {
      return "Every quality parameter must have a name.";
    }

    const minimum =
      parameter.minimum === null ||
      parameter.minimum === undefined ||
      parameter.minimum === ""
        ? null
        : Number(parameter.minimum);

    const maximum =
      parameter.maximum === null ||
      parameter.maximum === undefined ||
      parameter.maximum === ""
        ? null
        : Number(parameter.maximum);

    if (
      minimum !== null &&
      (!Number.isFinite(minimum) || minimum < 0)
    ) {
      return `Invalid minimum value for "${parameter.name}".`;
    }

    if (
      maximum !== null &&
      (!Number.isFinite(maximum) || maximum < 0)
    ) {
      return `Invalid maximum value for "${parameter.name}".`;
    }

    if (
      minimum !== null &&
      maximum !== null &&
      minimum > maximum
    ) {
      return `Minimum cannot be greater than maximum for "${parameter.name}".`;
    }
  }

  return null;
}

function buildCommodityData(body) {
  const name = cleanString(body.name);
  const code = cleanString(body.code).toUpperCase();
  const description = cleanString(body.description);

  const category = body.category;
  const unit = body.unit || "QUINTAL";

  const minimumSupportPrice = parseNumber(
    body.minimumSupportPrice,
    0
  );

  const procurementStartDate = cleanDate(
    body.procurementStartDate
  );

  const procurementEndDate = cleanDate(
    body.procurementEndDate
  );

  const qualityParameters =
    cleanQualityParameters(
      body.qualityParameters
    );

  return {
    name,
    code,
    description,
    category,
    unit,
    minimumSupportPrice,
    procurementStartDate,
    procurementEndDate,
    qualityParameters,
    isActive: body.isActive !== false,
  };
}

function validateCommodityData(data) {
  if (!data.name) {
    return "Commodity name is required.";
  }

  if (data.name.length < 2) {
    return "Commodity name must contain at least 2 characters.";
  }

  if (!data.code) {
    return "Commodity code is required.";
  }

  if (!data.category) {
    return "Commodity category is required.";
  }

  if (!CATEGORIES.includes(data.category)) {
    return "Invalid commodity category.";
  }

  if (!UNITS.includes(data.unit)) {
    return "Invalid commodity unit.";
  }

  if (
    !Number.isFinite(data.minimumSupportPrice) ||
    data.minimumSupportPrice < 0
  ) {
    return "Minimum support price must be a valid non-negative number.";
  }

  if (
    data.procurementStartDate &&
    data.procurementEndDate &&
    data.procurementEndDate <
      data.procurementStartDate
  ) {
    return "Procurement end date cannot be earlier than start date.";
  }

  return validateQualityParameters(
    data.qualityParameters
  );
}

async function findDuplicate(id, name, code) {
  const query = {
    $or: [{ name }, { code }],
  };

  if (id) {
    query._id = { $ne: id };
  }

  return Commodity.findOne(query).lean();
}

/**
 * GET
 * /api/admin/commodities
 */
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return responseError(
        "Admin authentication required.",
        401
      );
    }

    await connectDB();

    const commodities = await Commodity.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      commodities,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/commodities:",
      error
    );

    return responseError(
      "Failed to fetch commodities.",
      500
    );
  }
}

/**
 * POST
 * /api/admin/commodities
 */
export async function POST(request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return responseError(
        "Admin authentication required.",
        401
      );
    }

    await connectDB();

    let body;

    try {
      body = await request.json();
    } catch {
      return responseError(
        "Invalid request body."
      );
    }

    const data = buildCommodityData(body);

    const validationError =
      validateCommodityData(data);

    if (validationError) {
      return responseError(
        validationError,
        400
      );
    }

    const duplicate = await findDuplicate(
      null,
      data.name,
      data.code
    );

    if (duplicate) {
      const duplicateField =
        duplicate.code === data.code
          ? "code"
          : "name";

      return responseError(
        `A commodity with this ${duplicateField} already exists.`,
        409
      );
    }

    const commodity =
      await Commodity.create({
        ...data,

        createdBy: session.user.id,
        updatedBy: session.user.id,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Commodity created successfully.",
        commodity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/commodities:",
      error
    );

    if (error?.code === 11000) {
      return responseError(
        "A commodity with this name or code already exists.",
        409
      );
    }

    return responseError(
      error?.message ||
        "Failed to create commodity.",
      500
    );
  }
}

/**
 * PATCH
 * /api/admin/commodities
 */
export async function PATCH(request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return responseError(
        "Admin authentication required.",
        401
      );
    }

    await connectDB();

    let body;

    try {
      body = await request.json();
    } catch {
      return responseError(
        "Invalid request body."
      );
    }

    const id = cleanString(body.id);

    if (!id) {
      return responseError(
        "Commodity ID is required."
      );
    }

    const commodity =
      await Commodity.findById(id);

    if (!commodity) {
      return responseError(
        "Commodity not found.",
        404
      );
    }

    /*
     * Explicit status action.
     *
     * The previous implementation checked:
     * Object.keys(body).length === 2
     *
     * That is fragile because adding another harmless
     * property could accidentally turn a status request
     * into a full commodity update.
     */
    if (body.action === "STATUS") {
      if (
        typeof body.isActive !== "boolean"
      ) {
        return responseError(
          "isActive must be a boolean."
        );
      }

      commodity.isActive =
        body.isActive;

      commodity.updatedBy =
        session.user.id;

      await commodity.save();

      return NextResponse.json({
        success: true,
        message: `Commodity ${
          commodity.isActive
            ? "activated"
            : "deactivated"
        } successfully.`,
        commodity,
      });
    }

    const data = buildCommodityData(body);

    const validationError =
      validateCommodityData(data);

    if (validationError) {
      return responseError(
        validationError,
        400
      );
    }

    const duplicate = await findDuplicate(
      id,
      data.name,
      data.code
    );

    if (duplicate) {
      const duplicateField =
        duplicate.code === data.code
          ? "code"
          : "name";

      return responseError(
        `Another commodity with this ${duplicateField} already exists.`,
        409
      );
    }

    commodity.name = data.name;
    commodity.code = data.code;
    commodity.description =
      data.description;
    commodity.category = data.category;
    commodity.unit = data.unit;
    commodity.minimumSupportPrice =
      data.minimumSupportPrice;
    commodity.procurementStartDate =
      data.procurementStartDate;
    commodity.procurementEndDate =
      data.procurementEndDate;
    commodity.qualityParameters =
      data.qualityParameters;
    commodity.isActive =
      data.isActive;
    commodity.updatedBy =
      session.user.id;

    await commodity.save();

    return NextResponse.json({
      success: true,
      message:
        "Commodity updated successfully.",
      commodity,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/commodities:",
      error
    );

    if (error?.code === 11000) {
      return responseError(
        "A commodity with this name or code already exists.",
        409
      );
    }

    return responseError(
      error?.message ||
        "Failed to update commodity.",
      500
    );
  }
}

/**
 * DELETE
 * /api/admin/commodities?id=...
 */
export async function DELETE(request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return responseError(
        "Admin authentication required.",
        401
      );
    }

    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return responseError(
        "Commodity ID is required."
      );
    }

    const commodity =
      await Commodity.findById(id);

    if (!commodity) {
      return responseError(
        "Commodity not found.",
        404
      );
    }

    await Commodity.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message:
        "Commodity deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/commodities:",
      error
    );

    return responseError(
      "Failed to delete commodity.",
      500
    );
  }
}