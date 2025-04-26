// src/models/Session.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string; // Use string for UUID
  userId: number; // Assuming userId is a number
  sessionExpiry: Date;
  invitedEmails: string[]; // Add this line
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
}

const SessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true }, // Use String for UUID
  userId: { type: Number, required: true }, // Assuming userId is a number
  sessionExpiry: { type: Date, required: true },
  invitedEmails: { type: [String], default: [] }, // Define invitedEmails as an array of strings
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Number },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Number },
});

// Update the timestamps automatically
SessionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISession>('Session', SessionSchema);