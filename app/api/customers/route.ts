import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";

export async function GET() {
  try {
    await connectDB();

    const customers = await Customer.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("GET Customers Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, address } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name, email and phone are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingCustomer = await Customer.findOne({
      email: normalizedEmail,
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer email already exists" },
        { status: 409 }
      );
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      address: address?.trim() || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Customer Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create customer" },
      { status: 500 }
    );
  }
}