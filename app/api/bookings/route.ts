
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectDB();

    const bookings = await Booking.find().sort({
      date: -1,
      time: -1,
    });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("GET Bookings Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, service, date, time, status } = body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !service?.trim() ||
      !date?.trim() ||
      !time?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All booking fields are required",
        },
        { status: 400 }
      );
    }

    const existingBooking = await Booking.findOne({
      service: service.trim(),
      date: date.trim(),
      time: time.trim(),
      status: { $ne: "Cancelled" },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "This time slot is already booked",
        },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      service: service.trim(),
      date: date.trim(),
      time: time.trim(),
      status: status || "Pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        data: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Booking Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create booking" },
      { status: 500 }
    );
  }
}
