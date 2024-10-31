import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const JWT_SECRET = "your-secret-key";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("session_token");

        if (!token) {
            return NextResponse.json({ message: "Unauthorized: No session token found" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token.value, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ message: "Invalid or expired session", error }, { status: 401 });
        }

        const { username } = decoded as { username: string };

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "User retrieved successfully",
            user: {
                username: user.username,
                name: user.name,
            },
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Something went wrong", error }, { status: 500 });
    }
}
