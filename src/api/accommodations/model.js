import { text } from "express";
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const accommodationsSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    host: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    maxGuests: { type: Number, required: true },
    city: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Accommodation", accommodationsSchema);
