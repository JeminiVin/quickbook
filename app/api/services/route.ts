
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Service from "@/models/Service";

export async function GET() {
  try {
    await connectDB();

    const services = await Service.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("GET Services Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, category, duration, price, status, description } = body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof category !== "string" || !category.trim() ||
      !Number.isFinite(duration) || duration < 1 ||
      !Number.isFinite(price) || price < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide valid service details" },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !["Active", "Inactive"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid service status" },
        { status: 400 }
      );
    }

    const service = await Service.create({
      name: name.trim(),
      category: category.trim(),
      duration,
      price,
      status,
      description:
        typeof description === "string" ? description.trim() : "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Service Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create service" },
      { status: 500 }
    );
  }
}
