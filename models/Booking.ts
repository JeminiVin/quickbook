
import mongoose, { Schema, Model } from "mongoose";

export interface IBooking {
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

const bookingSchema = new Schema<IBooking>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Confirmed", "Pending", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
