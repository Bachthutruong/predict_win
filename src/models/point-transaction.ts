import mongoose, { Schema, models, model } from 'mongoose';

const PointTransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['check-in', 'referral', 'feedback', 'prediction-win', 'admin-grant'],
    required: true,
  },
  notes: { type: String },
}, { timestamps: true });

PointTransactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const PointTransaction = models.PointTransaction || model('PointTransaction', PointTransactionSchema);
export default PointTransaction;
