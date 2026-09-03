import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification.js";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route.js";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
    try {

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized Access"
                },
                {
                    status: 401
                }
            );
        }

        const { notificationId } = await params;

        if (!notificationId || !mongoose.isValidObjectId(notificationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid notification ID",
                },
                {
                    status: 400
                }
            )
        }

        await connectDB();

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                farmerId: session.user.id
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                },
            },
            {
                new: true
            }
        ).lean();

        if (!notification) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Notification not found",
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Notification marked as read",
                notification
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error(
            "PATCH /api/notifications/[notificationId]/read error:",
            error
        );
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update notification",
            },
            {
                status: 500
            }
        );
    }
}
