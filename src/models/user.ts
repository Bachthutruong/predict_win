import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
  points: { type: Number, default: 0 },
  avatarUrl: { type: String, required: true },
  checkInStreak: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  referralCode: { type: String, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  consecutiveCheckIns: { type: Number, default: 0 },
  lastCheckInDate: { type: Date },
  totalSuccessfulReferrals: { type: Number, default: 0 },
}, { timestamps: true });

// Generate unique referral code before saving
UserSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = `REF${this.name.replace(/\s+/g, '').toUpperCase()}${Date.now().toString().slice(-4)}`;
  }
  next();
});

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Don't send password in JSON
    delete ret.emailVerificationToken; // Don't send verification token
  },
});

const User = models?.User || model('User', UserSchema);
export default User;
