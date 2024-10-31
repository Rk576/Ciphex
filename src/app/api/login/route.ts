import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const prisma = new PrismaClient();
const JWT_SECRET = "your-secret-key";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, {
            expiresIn: "1d",
        });

        const cookie = serialize("session_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        return new NextResponse(
            JSON.stringify({ message: "Login successful", user: { username: user.username, name: user.name } }),
            {
                status: 200,
                headers: { "Set-Cookie": cookie },
            }
        );
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong", error }, { status: 500 });
    }
}
