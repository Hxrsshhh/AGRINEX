import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification.js";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route.js";

export const dynamic = "force-dynamic";

export async function GET() {
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

    await connectDB();

    const unreadCount = await Notification.countDocuments({
        farmerId: session.user.id,
        isRead: false
    });

    return NextResponse.json(
        {
            success: true,
            message: "Unread notification count fetched successfully",
            unreadCount
        },
        {
            status: 200
        }
    );
}