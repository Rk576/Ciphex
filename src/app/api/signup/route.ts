import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { name, password, username } = await req.json();

        if (!name || !password || !username) {
            return NextResponse.json({ message: "Email, username & password are required" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { username } });

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        const hashedPassword = await hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                name,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong", error}, { status: 500 });
    }
}