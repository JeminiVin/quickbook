
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const decoded = getAuthenticatedUser(request);

    if (typeof decoded.userId !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }
}
