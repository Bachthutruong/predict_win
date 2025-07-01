import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  points: { type: Number, default: 0 },
  avatarUrl: { type: String, required: true },
  checkInStreak: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;
