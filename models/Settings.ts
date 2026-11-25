
import mongoose, { Schema, Model } from "mongoose";

export interface ISettings {
  adminName: string;
  email: string;
  phone: string;

  businessName: string;
  businessEmail: string;
  businessPhone: string;
  address: string;

  timezone: string;
  currency: string;

  slotDuration: string;
  advanceBooking: string;
  cancellationNotice: string;

  startTime: string;
  endTime: string;
  workingDays: string[];

  emailNotifications: boolean;
  bookingNotifications: boolean;
  reminderNotifications: boolean;
  marketingNotifications: boolean;
}

const settingsSchema = new Schema<ISettings>(
  {
    adminName: { type: String, default: "QuickBook Admin", trim: true },
    email: { type: String, default: "admin@quickbook.com", trim: true },
    phone: { type: String, default: "" },

    businessName: { type: String, default: "QuickBook Business", trim: true },
    businessEmail: { type: String, default: "" },
    businessPhone: { type: String, default: "" },
    address: { type: String, default: "" },

    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },

    slotDuration: { type: String, default: "30" },
    advanceBooking: { type: String, default: "30" },
    cancellationNotice: { type: String, default: "24" },

    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "18:00" },

    workingDays: {
      type: [String],
      default: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },

    emailNotifications: { type: Boolean, default: true },
    bookingNotifications: { type: Boolean, default: true },
    reminderNotifications: { type: Boolean, default: true },
    marketingNotifications: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", settingsSchema, "settings");

export default Settings;
