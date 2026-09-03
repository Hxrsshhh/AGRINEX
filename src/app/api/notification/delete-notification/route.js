import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route.js";

export const dynamic = "force-dynamic";

export async function DELETE({ params }) {
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
            )
        }

        const { notificationId } = await params;

        if (!notificationId || !mongoose.isValidObjectId(notificationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid object id"
                },
                {
                    status: 400
                }
            );
        }

        await connectDB();

        const deletedNotification = await Notification.findOneAndDelete(
            {
                _id: notificationId,
                farmerId: session.user.id
            }
        )

        if (!deletedNotification) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Notification not found"
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Notification deleted"
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error(
            "Error occurred while deleting the notification:",
            error
        );
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete notification"
            },
            {
                status: 500
            }
        );
    }
}