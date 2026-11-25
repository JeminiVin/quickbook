import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";

// GET customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("GET Customer Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, phone, address } = body;

    const updates: Record<string, string> = {};

    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();

    if (
      (updates.name !== undefined && !updates.name) ||
      (updates.email !== undefined && !updates.email) ||
      (updates.phone !== undefined && !updates.phone)
    ) {
      return NextResponse.json(
        { success: false, message: "Name, email and phone cannot be empty" },
        { status: 400 }
      );
    }

    if (updates.email) {
      const duplicate = await Customer.findOne({
        email: updates.email,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Email already belongs to another customer" },
          { status: 409 }
        );
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("PUT Customer Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Customer Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete customer" },
      { status: 500 }
    );
  }
}