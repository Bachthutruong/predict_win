
'use server';

import { suggestBonusPoints, type SuggestBonusPointsInput, type SuggestBonusPointsOutput } from '@/ai/flows/suggest-bonus-points';
import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/feedback';
import User from '@/models/user';
import Prediction from '@/models/prediction';
import Question from '@/models/question';
import PointTransaction from '@/models/point-transaction';
import Referral from '@/models/referral';
import { revalidatePath } from 'next/cache';
import type { Feedback as FeedbackType, PointTransaction as PointTransactionType, User as UserType, Prediction as PredictionType, Question as QuestionType, Referral as ReferralType } from '@/types';

// Helper to serialize MongoDB documents
function serialize<T>(data: any): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getBonusSuggestion(
  input: SuggestBonusPointsInput
): Promise<SuggestBonusPointsOutput> {
  // In a real app, you might have more complex logic here.
  // For now, we directly call the Genkit flow.
  try {
    const result = await suggestBonusPoints(input);
    return result;
  } catch (error) {
    console.error("Error calling GenAI flow:", error);
    // Return a default or error state
    return {
      suggestedPointsRange: "Error",
      reasoning: "Could not get suggestion from AI."
    }
  }
}

export async function getFeedbackItems(): Promise<FeedbackType[]> {
  await dbConnect();
  const feedbackItems = await Feedback.find({}).populate<{userId: UserType}>('userId', 'name avatarUrl points id email role').sort({ createdAt: -1 });
  
  const serialized = serialize(feedbackItems);
  
  // Map userId to user to match component props
  return serialized.map((item: any) => ({
    ...item,
    user: item.userId,
    id: item._id,
  }));
}

export async function approveFeedbackAction(feedbackId: string, points: number): Promise<{success: boolean}> {
  await dbConnect();
  const feedback = await Feedback.findById(feedbackId);
  if (feedback) {
    feedback.status = 'approved';
    feedback.awardedPoints = points;
    await feedback.save();
    
    await User.findByIdAndUpdate(feedback.userId, { $inc: { points }});

    await PointTransaction.create({
      userId: feedback.userId,
      amount: points,
      reason: 'feedback',
      notes: `For feedback: "${feedback.feedbackText.substring(0, 50)}..."`
    });

    revalidatePath('/admin/feedback');
    revalidatePath('/profile');
    return { success: true };
  }
  return { success: false };
}

export async function rejectFeedbackAction(feedbackId: string): Promise<{success: boolean}> {
    await dbConnect();
    const feedback = await Feedback.findByIdAndUpdate(feedbackId, { status: 'rejected' });
    if (feedback) {
      revalidatePath('/admin/feedback');
      return { success: true };
    }
    return { success: false };
}

export async function getUsers(): Promise<UserType[]> {
  await dbConnect();
  const users = await User.find({}).sort({ name: 1 });
  return serialize(users);
}

export async function getPointTransactions(): Promise<PointTransactionType[]> {
  await dbConnect();
  const transactions = await PointTransaction.find({})
    .populate<{userId: UserType}>('userId', 'name')
    .populate<{adminId: UserType}>('adminId', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

  const serialized = serialize(transactions);
  
  return serialized.map((t: any) => ({
    ...t,
    user: t.userId,
    admin: t.adminId,
    id: t._id,
  }));
}

export async function grantPointsAction(data: { userId: string, amount: number, notes?: string }) {
  await dbConnect();

  // Find an admin to associate with the transaction
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    throw new Error("No admin user found to grant points.");
  }

  await User.findByIdAndUpdate(data.userId, { $inc: { points: data.amount } });

  await PointTransaction.create({
    ...data,
    adminId: adminUser._id,
    reason: 'admin-grant',
  });

  revalidatePath('/admin/grant-points');
  revalidatePath('/profile');
  return { success: true };
}


export async function getPredictions(): Promise<PredictionType[]> {
  await dbConnect();
  const predictions = await Prediction.find({}).sort({ createdAt: -1 });
  return serialize(predictions);
}

export async function getQuestions(): Promise<QuestionType[]> {
  await dbConnect();
  const questions = await Question.find({}).sort({ createdAt: -1 });
  return serialize(questions);
}

// For the check-in page
export async function getActiveQuestion(): Promise<QuestionType | null> {
    await dbConnect();
    let question = await Question.findOne({ status: 'active', isPriority: true });
    if (!question) {
        question = await Question.findOne({ status: 'active' });
    }
    return serialize(question);
}

export async function getDashboardStats() {
    await dbConnect();
    const totalPointsAwardedPromise = PointTransaction.aggregate([
        { $match: { amount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const activeUsersPromise = User.countDocuments({ role: 'user' });
    const activePredictionsPromise = Prediction.countDocuments({ status: 'active' });
    const pendingFeedbackPromise = Feedback.countDocuments({ status: 'pending' });

    const [totalPointsResult, activeUsers, activePredictions, pendingFeedback] = await Promise.all([
        totalPointsAwardedPromise,
        activeUsersPromise,
        activePredictionsPromise,
        pendingFeedbackPromise
    ]);

    return {
        totalPointsAwarded: totalPointsResult[0]?.total || 0,
        activeUsers,
        activePredictions,
        pendingFeedback
    };
}

// Hardcoded to user 'Vũ Bách' for now since there is no auth.
// In a real app, this would come from a session.
async function getCurrentUser() {
    await dbConnect();
    let user = await User.findOne({ email: 'bach@example.com' });
    // For first run, seed this user if they don't exist.
    if (!user) {
        user = await User.create({
            id: '2',
            name: 'Vũ Bách',
            email: 'bach@example.com',
            role: 'user',
            points: 250,
            avatarUrl: 'https://i.pravatar.cc/150?u=bach'
        });
    }
    return serialize(user);
}

export async function getUserProfileData() {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) return { user: null, transactions: [] };

    const transactions = await PointTransaction.find({ userId: user.id }).sort({ createdAt: -1 });
    return { user: serialize(user), transactions: serialize(transactions) };
}


export async function getReferralsData() {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) return { referrals: [], currentUser: null };

    const referrals = await Referral.find({ referrerId: user.id }).populate<{referredUserId: UserType}>('referredUserId', 'name createdAt');
    
    const serialized = serialize(referrals);
    const formatted = serialized.map((r: any) => ({
      ...r,
      referredUser: r.referredUserId,
      id: r._id
    }));

    return { referrals: formatted, currentUser: user };
}
