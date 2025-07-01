import mongoose, { Schema, models, model } from 'mongoose';

const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  imageUrl: { type: String },
  answer: { type: String, required: true },
  isPriority: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  displayCount: { type: Number, default: 0 },
  correctAnswerCount: { type: Number, default: 0 },
  points: { type: Number, required: true },
}, { timestamps: true });

QuestionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const Question = models.Question || model('Question', QuestionSchema);
export default Question;
