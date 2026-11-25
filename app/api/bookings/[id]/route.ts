
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Context) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("GET Booking Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const allowedFields = ["name", "email", "service", "date", "time", "status"];
    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
          return NextResponse.json(
            { success: false, message: `${field} cannot be empty` },
            { status: 400 }
          );
        }

        updates[field] = body[field].trim();
      }
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    if (
      updates.status &&
      !["Confirmed", "Pending", "Cancelled"].includes(updates.status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid booking status" },
        { status: 400 }
      );
    }

    const currentBooking = await Booking.findById(id);

    if (!currentBooking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    const service = updates.service ?? currentBooking.service;
    const date = updates.date ?? currentBooking.date;
    const time = updates.time ?? currentBooking.time;
    const status = updates.status ?? currentBooking.status;

    if (status !== "Cancelled") {
      const conflict = await Booking.findOne({
        _id: { $ne: id },
        service,
        date,
        time,
        status: { $ne: "Cancelled" },
      });

      if (conflict) {
        return NextResponse.json(
          { success: false, message: "This time slot is already booked" },
          { status: 409 }
        );
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("PUT Booking Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Booking Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
