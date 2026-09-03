import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification.js";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route.js";

export const dynamic = "force-dynamic";

export async function PATCH() {
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

        await connectDB();

        const updateResult = await Notification.updateMany(
            {
                farmerId: session.user.id,
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: "All notifications marked as read",
                modifiedCount: result.modifiedCount
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error(
            "Error occurred while marking all notifications as read:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to mark all notifications as read"
            },
            {
                status: 500
            }
        );
    }
}