import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

/**
 * GET
 * Get the currently logged-in farmer's complete profile.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const farmer = await User.findById(session.user.id)
      .populate({
        path: "preferredCentre",
        select:
          "name code centreCode address state district block village pincode location status isActive",
      })
      .lean();

    if (!farmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    if (farmer.role !== "FARMER") {
      return NextResponse.json(
        {
          success: false,
          message: "This account is not a farmer account",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      farmer,
    });
  } catch (error) {
    console.error("GET /api/farmer/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch farmer profile",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 * Update editable farmer profile fields.
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const farmer = await User.findById(session.user.id);

    if (!farmer) {
      return NextResponse.json(
        {
          success: false,
          message: "Farmer not found",
        },
        { status: 404 }
      );
    }

    if (farmer.role !== "FARMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only farmers can use this route",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    /*
     * ---------------------------------------------------------
     * BASIC INFORMATION
     * ---------------------------------------------------------
     */

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 100
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Name must be between 2 and 100 characters",
          },
          { status: 400 }
        );
      }

      farmer.name = body.name.trim();
    }

    if (body.email !== undefined) {
      if (body.email === null || body.email === "") {
        farmer.email = null;
      } else {
        if (typeof body.email !== "string") {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid email",
            },
            { status: 400 }
          );
        }

        const email = body.email.trim().toLowerCase();

        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid email address",
            },
            { status: 400 }
          );
        }

        const existingUser = await User.findOne({
          email,
          _id: { $ne: farmer._id },
        });

        if (existingUser) {
          return NextResponse.json(
            {
              success: false,
              message: "Email is already in use",
            },
            { status: 409 }
          );
        }

        farmer.email = email;
      }
    }

    /*
     * ---------------------------------------------------------
     * FARM LOCATION
     * ---------------------------------------------------------
     */

    if (body.farmLocation !== undefined) {
      const location = body.farmLocation || {};

      if (location.state !== undefined) {
        farmer.farmLocation.state =
          location.state?.trim() || null;
      }

      if (location.district !== undefined) {
        farmer.farmLocation.district =
          location.district?.trim() || null;
      }

      if (location.village !== undefined) {
        farmer.farmLocation.village =
          location.village?.trim() || null;
      }

      if (location.pincode !== undefined) {
        const pincode =
          location.pincode?.toString().trim() || "";

        if (pincode && !/^\d{6}$/.test(pincode)) {
          return NextResponse.json(
            {
              success: false,
              message: "Pincode must contain exactly 6 digits",
            },
            { status: 400 }
          );
        }

        farmer.farmLocation.pincode =
          pincode || null;
      }
    }

    /*
     * ---------------------------------------------------------
     * FARM INFORMATION
     * ---------------------------------------------------------
     */

    if (body.farm !== undefined) {
      const farm = body.farm || {};

      if (farm.landArea !== undefined) {
        if (
          farm.landArea === null ||
          farm.landArea === ""
        ) {
          farmer.farm.landArea = null;
        } else {
          const landArea = Number(farm.landArea);

          if (
            Number.isNaN(landArea) ||
            landArea < 0
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid land area",
              },
              { status: 400 }
            );
          }

          farmer.farm.landArea = landArea;
        }
      }

      if (farm.landUnit !== undefined) {
        const allowedUnits = [
          "Acre",
          "Hectare",
        ];

        if (
          farm.landUnit !== null &&
          !allowedUnits.includes(farm.landUnit)
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Land unit must be Acre or Hectare",
            },
            { status: 400 }
          );
        }

        farmer.farm.landUnit =
          farm.landUnit || null;
      }

      if (farm.mainCrop !== undefined) {
        farmer.farm.mainCrop =
          farm.mainCrop?.trim() || null;
      }
    }

    /*
     * ---------------------------------------------------------
     * PREFERRED CENTRE
     * ---------------------------------------------------------
     */

    if (body.preferredCentre !== undefined) {
      if (
        body.preferredCentre === null ||
        body.preferredCentre === ""
      ) {
        farmer.preferredCentre = null;
      } else {
        const mongoose = await import("mongoose");

        if (
          !mongoose.Types.ObjectId.isValid(
            body.preferredCentre
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid procurement centre",
            },
            { status: 400 }
          );
        }

        farmer.preferredCentre =
          body.preferredCentre;
      }
    }

    /*
     * ---------------------------------------------------------
     * LANGUAGE
     * ---------------------------------------------------------
     */

    if (body.preferredLanguage !== undefined) {
      const allowedLanguages = [
        "hi",
        "en",
        "bn",
        "or",
        "te",
        "mr",
      ];

      if (
        !allowedLanguages.includes(
          body.preferredLanguage
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid preferred language",
          },
          { status: 400 }
        );
      }

      farmer.preferredLanguage =
        body.preferredLanguage;
    }

    /*
     * ---------------------------------------------------------
     * NOTIFICATIONS
     * ---------------------------------------------------------
     */

    if (body.notifications !== undefined) {
      const notifications =
        body.notifications || {};

      if (
        notifications.sms !== undefined
      ) {
        farmer.notifications.sms =
          Boolean(notifications.sms);
      }

      if (
        notifications.whatsapp !== undefined
      ) {
        farmer.notifications.whatsapp =
          Boolean(notifications.whatsapp);
      }

      if (
        notifications.push !== undefined
      ) {
        farmer.notifications.push =
          Boolean(notifications.push);
      }
    }

    /*
     * ---------------------------------------------------------
     * SAVE
     * ---------------------------------------------------------
     */

    await farmer.save();

    const updatedFarmer = await User.findById(
      farmer._id
    )
      .populate({
        path: "preferredCentre",
        select:
          "name code centreCode address state district block village pincode location status isActive",
      })
      .lean();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      farmer: updatedFarmer,
    });
  } catch (error) {
    console.error(
      "PATCH /api/farmer/profile error:",
      error
    );

    /*
     * Mongo duplicate key error
     */
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The provided information already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update farmer profile",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}