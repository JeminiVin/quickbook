
import mongoose, { Schema, Model } from "mongoose";

export interface IService {
  name: string;
  category: string;
  duration: number;
  price: number;
  status: "Active" | "Inactive";
  description: string;
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service: Model<IService> =
  mongoose.models.Service ||
  mongoose.model<IService>("Service", serviceSchema, "services");

export default Service;
