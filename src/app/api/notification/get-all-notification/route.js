import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification.js";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route.js";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if(!session?.user?.id){
            return NextResponse.json(
                {
                    success : false,
                    message: "Unauthorized Access"
                },
                {
                    status : 401
                }
            );
        }

        await connectDB();

        const notifications = await Notification.find({
            farmerId : session.user.id
        })
        .sort(
            {
                createdAt : -1
            }
        )
        .lean();

        return NextResponse.json(
            {
                success: true,
                message: "Notifications fetched successfully",
                notifications
            },
            {
                status : 200
            }
        );

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch notifications"
            },
            {
                status: 500
            }
        );
    }
}