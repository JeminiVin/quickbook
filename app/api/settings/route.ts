
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Settings from "@/models/Settings";

const allowedDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const allowedFields = [
  "adminName",
  "email",
  "phone",
  "businessName",
  "businessEmail",
  "businessPhone",
  "address",
  "timezone",
  "currency",
  "slotDuration",
  "advanceBooking",
  "cancellationNotice",
  "startTime",
  "endTime",
  "workingDays",
  "emailNotifications",
  "bookingNotifications",
  "reminderNotifications",
  "marketingNotifications",
];

const defaultSettings = {
  adminName: "QuickBook Admin",
  email: "admin@quickbook.com",
  phone: "",
  businessName: "QuickBook Business",
  businessEmail: "",
  businessPhone: "",
  address: "",
  timezone: "Asia/Kolkata",
  currency: "INR",
  slotDuration: "30",
  advanceBooking: "30",
  cancellationNotice: "24",
  startTime: "09:00",
  endTime: "18:00",
  workingDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  emailNotifications: true,
  bookingNotifications: true,
  reminderNotifications: true,
  marketingNotifications: false,
};

// GET: Fetch settings
export async function GET() {
  try {
    await connectDB();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(defaultSettings);
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GET Settings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch settings.",
      },
      { status: 500 }
    );
  }
}

// PUT: Update settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid settings provided." },
        { status: 400 }
      );
    }

    // Validate string fields
    for (const field of allowedFields) {
      if (
        field !== "workingDays" &&
        !field.endsWith("Notifications") &&
        Object.prototype.hasOwnProperty.call(updateData, field) &&
        typeof updateData[field] !== "string"
      ) {
        return NextResponse.json(
          { success: false, message: `${field} must be a string.` },
          { status: 400 }
        );
      }
    }

    // Validate notification fields
    const notificationFields = [
      "emailNotifications",
      "bookingNotifications",
      "reminderNotifications",
      "marketingNotifications",
    ];

    for (const field of notificationFields) {
      if (
        Object.prototype.hasOwnProperty.call(updateData, field) &&
        typeof updateData[field] !== "boolean"
      ) {
        return NextResponse.json(
          { success: false, message: `${field} must be a boolean.` },
          { status: 400 }
        );
      }
    }

    // Validate working days
    if (updateData.workingDays !== undefined) {
      const days = updateData.workingDays;

      if (
        !Array.isArray(days) ||
        days.length === 0 ||
        !days.every(
          (day) => typeof day === "string" && allowedDays.includes(day)
        ) ||
        new Set(days).size !== days.length
      ) {
        return NextResponse.json(
          { success: false, message: "Please provide valid working days." },
          { status: 400 }
        );
      }
    }

    // Validate time range when both values are provided
    const currentSettings = await Settings.findOne();

    const startTime =
      (updateData.startTime as string) ??
      currentSettings?.startTime ??
      defaultSettings.startTime;

    const endTime =
      (updateData.endTime as string) ??
      currentSettings?.endTime ??
      defaultSettings.endTime;

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      return NextResponse.json(
        { success: false, message: "Invalid time format." },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Closing time must be later than opening time.",
        },
        { status: 400 }
      );
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("PUT Settings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings.",
      },
      { status: 500 }
    );
  }
}
