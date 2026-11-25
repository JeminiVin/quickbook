
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Service from "@/models/Service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      "name",
      "category",
      "duration",
      "price",
      "status",
      "description",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided" },
        { status: 400 }
      );
    }

    if ("name" in updates) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return NextResponse.json(
          { success: false, message: "Invalid service name" },
          { status: 400 }
        );
      }
      updates.name = updates.name.trim();
    }

    if ("category" in updates) {
      if (
        typeof updates.category !== "string" ||
        !updates.category.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid category" },
          { status: 400 }
        );
      }
      updates.category = updates.category.trim();
    }

    if (
      "duration" in updates &&
      (!Number.isFinite(updates.duration) ||
        (updates.duration as number) < 1)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid duration" },
        { status: 400 }
      );
    }

    if (
      "price" in updates &&
      (!Number.isFinite(updates.price) ||
        (updates.price as number) < 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid price" },
        { status: 400 }
      );
    }

    if (
      "status" in updates &&
      !["Active", "Inactive"].includes(updates.status as string)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    if (
      "description" in updates &&
      typeof updates.description !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid description" },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("PUT Service Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID" },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Service Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
