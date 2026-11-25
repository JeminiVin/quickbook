
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const existingUser = await User.findOne();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Admin account already exists." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return NextResponse.json(
        { success: false, message: "Enter valid details. Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully.",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);

    return NextResponse.json(
      { success: false, message: "Registration failed." },
      { status: 500 }
    );
  }
}
