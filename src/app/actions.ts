'use server';

// import { suggestBonusPoints, type SuggestBonusPointsInput, type SuggestBonusPointsOutput } from '@/ai/flows/suggest-bonus-points';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { hashPassword, verifyPassword, setAuthCookie, clearAuthCookie, generateVerificationToken, isValidEmail, getCurrentUser } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import Feedback from '@/models/feedback';
import User from '@/models/user';
import Prediction from '@/models/prediction';
import Question from '@/models/question';
import PointTransaction from '@/models/point-transaction';
import Referral from '@/models/referral';
import UserPrediction from '@/models/user-prediction';
import CheckIn from '@/models/check-in';
import SystemSettings from '@/models/system-settings';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { 
  Feedback as FeedbackType, 
  PointTransaction as PointTransactionType, 
  User as UserType, 
  Prediction as PredictionType, 
  Question as QuestionType, 
  Referral as ReferralType,
  UserPrediction as UserPredictionType,
  CheckIn as CheckInType,
  RegisterData,
  LoginCredentials
} from '@/types';
import { getCachedData, invalidateCache } from '@/lib/cache';

// Helper to serialize MongoDB documents
function serialize<T>(data: any): T {
  return JSON.parse(JSON.stringify(data));
}

// AUTHENTICATION ACTIONS
export async function registerAction(data: RegisterData): Promise<{success: boolean, message: string}> {
  try {
    await dbConnect();

    // Validate input
    if (!data.name || !data.email || !data.password) {
      return { success: false, message: 'All fields are required' };
    }

    if (!isValidEmail(data.email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (data.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }

    // Check referral code if provided
    let referrer = null;
    if (data.referralCode) {
      referrer = await User.findOne({ referralCode: data.referralCode });
      if (!referrer) {
        return { success: false, message: 'Invalid referral code' };
      }
    }

    // Create user
    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      avatarUrl: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      referredBy: referrer?._id,
    });

    // Create referral record if user was referred
    if (referrer) {
      await Referral.create({
        referrerId: referrer._id,
        referredUserId: user._id,
      });
    }

    // Send verification email
    await sendVerificationEmail(data.email, verificationToken);

    return { success: true, message: 'Registration successful! Please check your email to verify your account.' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}

export async function loginAction(credentials: LoginCredentials): Promise<{success: boolean, message: string}> {
  try {
    await dbConnect();

    if (!credentials.email || !credentials.password) {
      return { success: false, message: 'Email and password are required' };
    }

    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const isPasswordValid = await verifyPassword(credentials.password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    if (!user.isEmailVerified) {
      return { success: false, message: 'Please verify your email before logging in' };
    }

    await setAuthCookie(user._id.toString());
    
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect('/login');
}

export async function verifyEmailAction(token: string): Promise<{success: boolean, message: string}> {
  try {
    await dbConnect();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return { success: false, message: 'Invalid or expired verification token' };
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { success: true, message: 'Email verified successfully! You can now login.' };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, message: 'Verification failed. Please try again.' };
  }
}

// PREDICTION ACTIONS
export async function createPredictionAction(data: {
  title: string;
  description: string;
  imageUrl?: string;
  answer: string;
  pointsCost: number;
}): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    await Prediction.create({
      ...data,
      authorId: user.id,
    });

    revalidatePath('/admin-predictions');
    revalidatePath('/predictions');
    return { success: true };
  } catch (error) {
    console.error('Create prediction error:', error);
    return { success: false, message: 'Failed to create prediction' };
  }
}

export async function updatePredictionAction(predictionId: string, data: {
  title?: string;
  description?: string;
  imageUrl?: string;
  answer?: string;
  pointsCost?: number;
  status?: 'active' | 'finished';
}): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    await Prediction.findByIdAndUpdate(predictionId, data);

    revalidatePath('/admin-predictions');
    revalidatePath('/predictions');
    return { success: true };
  } catch (error) {
    console.error('Update prediction error:', error);
    return { success: false, message: 'Failed to update prediction' };
  }
}

export async function submitPredictionAction(predictionId: string, guess: string): Promise<{success: boolean, message?: string, isCorrect?: boolean}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Authentication required' };
    }

    await dbConnect();
    
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return { success: false, message: 'Prediction not found' };
    }

    if (prediction.status !== 'active') {
      return { success: false, message: 'This prediction is no longer active' };
    }

    // Check if user has enough points
    const userDoc = await User.findById(user.id);
    if (userDoc.points < prediction.pointsCost) {
      return { success: false, message: 'Insufficient points' };
    }

    // Allow multiple predictions from the same user if they have enough points

    const isCorrect = guess.toLowerCase().trim() === prediction.answer.toLowerCase().trim();

    // Create user prediction
    await UserPrediction.create({
      userId: user.id,
      predictionId: predictionId,
      guess: guess,
      isCorrect: isCorrect,
      pointsSpent: prediction.pointsCost,
    });

    // Deduct points
    await User.findByIdAndUpdate(user.id, { $inc: { points: -prediction.pointsCost } });

    // Record point transaction
    await PointTransaction.create({
      userId: user.id,
      amount: -prediction.pointsCost,
      reason: 'prediction-win',
      notes: `Prediction: ${prediction.title}`,
    });

    // If correct, mark winner but keep prediction active
    if (isCorrect) {
      prediction.winnerId = user.id;
      await prediction.save();

      // Award bonus points for correct prediction
      const bonusPoints = Math.round(prediction.pointsCost * 1.5);
      await User.findByIdAndUpdate(user.id, { $inc: { points: bonusPoints } });
      
      await PointTransaction.create({
        userId: user.id,
        amount: bonusPoints,
        reason: 'prediction-win',
        notes: `Won prediction: ${prediction.title}`,
      });
    }

    revalidatePath('/predictions');
    revalidatePath('/profile');
    return { success: true, isCorrect };
  } catch (error) {
    console.error('Submit prediction error:', error);
    return { success: false, message: 'Failed to submit prediction' };
  }
}

export async function getPredictionDetails(predictionId: string, page: number = 1): Promise<{
  prediction: PredictionType | null;
  userPredictions: UserPredictionType[];
  totalPages: number;
  currentUserPrediction?: UserPredictionType;
  currentUserId?: string;
}> {
  try {
    const user = await getCurrentUser();
    await dbConnect();

    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return { prediction: null, userPredictions: [], totalPages: 0 };
    }

    const limit = 20;
    const skip = (page - 1) * limit;

    const [userPredictions, totalCount, currentUserPrediction] = await Promise.all([
      UserPrediction.find({ predictionId })
        .populate('userId', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserPrediction.countDocuments({ predictionId }),
      user ? UserPrediction.findOne({ predictionId, userId: user.id }).populate('userId', 'name avatarUrl') : null,
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      prediction: serialize(prediction),
      userPredictions: serialize(userPredictions.map((up: any) => ({
        ...up.toJSON(),
        user: up.userId,
      }))),
      totalPages,
      currentUserPrediction: currentUserPrediction ? serialize({
        ...currentUserPrediction.toJSON(),
        user: currentUserPrediction.userId,
      }) : undefined,
      currentUserId: user?.id,
    };
  } catch (error) {
    console.error('Get prediction details error:', error);
    return { prediction: null, userPredictions: [], totalPages: 0 };
  }
}

// CHECK-IN ACTIONS
export async function checkInAction(questionId: string, answer: string): Promise<{success: boolean, message?: string, pointsEarned?: number}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Authentication required' };
    }

    await dbConnect();

    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingCheckIn = await CheckIn.findOne({
      userId: user.id,
      checkInDate: { $gte: today },
    });

    if (existingCheckIn) {
      return { success: false, message: 'You have already checked in today' };
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return { success: false, message: 'Question not found' };
    }

    const isCorrect = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    let pointsEarned = 0;

    if (isCorrect) {
      // Get check-in points from settings
      const checkInSetting = await SystemSettings.findOne({ settingKey: 'checkInPoints' });
      pointsEarned = checkInSetting?.settingValue || 10;

      const userDoc = await User.findById(user.id);
      let consecutiveCheckIns = 1;

      // Check for consecutive check-ins
      if (userDoc.lastCheckInDate) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (userDoc.lastCheckInDate >= yesterday) {
          consecutiveCheckIns = userDoc.consecutiveCheckIns + 1;
        }
      }

      // Award streak bonus for 7 consecutive days
      if (consecutiveCheckIns >= 7 && consecutiveCheckIns % 7 === 0) {
        const streakSetting = await SystemSettings.findOne({ settingKey: 'streakBonusPoints' });
        const streakBonus = streakSetting?.settingValue || 50;
        pointsEarned += streakBonus;

        await PointTransaction.create({
          userId: user.id,
          amount: streakBonus,
          reason: 'streak-bonus',
          notes: `7-day check-in streak bonus`,
        });
      }

      // Update user
      await User.findByIdAndUpdate(user.id, {
        $inc: { points: pointsEarned },
        lastCheckInDate: today,
        consecutiveCheckIns: consecutiveCheckIns,
      });

      // Record transaction
      await PointTransaction.create({
        userId: user.id,
        amount: pointsEarned,
        reason: 'check-in',
        notes: `Daily check-in`,
      });

      // Update question stats
      await Question.findByIdAndUpdate(questionId, {
        $inc: { displayCount: 1, correctAnswerCount: 1 },
      });
    } else {
      // Still count as displayed but not correct
      await Question.findByIdAndUpdate(questionId, {
        $inc: { displayCount: 1 },
      });
    }

    // Only allow check-in if answer is correct
    if (!isCorrect) {
      // Update question stats for incorrect answer
      await Question.findByIdAndUpdate(questionId, {
        $inc: { displayCount: 1 },
      });
      
      return { 
        success: false, 
        message: 'Incorrect answer. Please try again with the correct answer to check in.',
        pointsEarned: 0 
      };
    }

    // Record successful check-in (only for correct answers)
    await CheckIn.create({
      userId: user.id,
      questionId: questionId,
      answer: answer,
      isCorrect: isCorrect,
      pointsEarned: pointsEarned,
    });

    revalidatePath('/check-in');
    revalidatePath('/profile');
    
    return { 
      success: true, 
      message: `Correct! You earned ${pointsEarned} points.`,
      pointsEarned 
    };
  } catch (error) {
    console.error('Check-in error:', error);
    return { success: false, message: 'Check-in failed. Please try again.' };
  }
}

// QUESTION MANAGEMENT ACTIONS
export async function createQuestionAction(data: {
  questionText: string;
  imageUrl?: string;
  answer: string;
  isPriority: boolean;
  points: number;
}): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    await Question.create(data);

    // Invalidate related cache
    invalidateCache('question');
    
    revalidatePath('/questions');
    return { success: true };
  } catch (error) {
    console.error('Create question error:', error);
    return { success: false, message: 'Failed to create question' };
  }
}

export async function updateQuestionAction(questionId: string, data: {
  questionText?: string;
  imageUrl?: string;
  answer?: string;
  isPriority?: boolean;
  status?: 'active' | 'inactive';
  points?: number;
}): Promise<{success: boolean}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    await Question.findByIdAndUpdate(questionId, data);

    // Invalidate related cache
    invalidateCache('question');

    revalidatePath('/questions');
    return { success: true };
  } catch (error) {
    console.error('Update question error:', error);
    return { success: false };
  }
}

// REFERRAL ACTIONS
export async function updateReferralStatusAction() {
  try {
    await dbConnect();
    
    // Find users who were referred and have checked in for 3+ days
    const referrals = await Referral.find({ status: 'pending' }).populate('referredUserId');
    
    for (const referral of referrals) {
      const user = referral.referredUserId as any;
      if (user.consecutiveCheckIns >= 3) {
        referral.status = 'completed';
        await referral.save();

        // Award points to referrer
        const referralSetting = await SystemSettings.findOne({ settingKey: 'referralPoints' });
        const referralPoints = referralSetting?.settingValue || 100;

        await User.findByIdAndUpdate(referral.referrerId, { 
          $inc: { 
            points: referralPoints,
            totalSuccessfulReferrals: 1 
          }
        });

        await PointTransaction.create({
          userId: referral.referrerId,
          amount: referralPoints,
          reason: 'referral',
          notes: `Successful referral: ${user.name}`,
        });

        // Check for milestone bonuses (every 10 referrals)
        const referrer = await User.findById(referral.referrerId);
        if (referrer.totalSuccessfulReferrals % 10 === 0) {
          const milestoneSetting = await SystemSettings.findOne({ settingKey: 'milestone10Points' });
          const milestonePoints = milestoneSetting?.settingValue || 500;

          await User.findByIdAndUpdate(referral.referrerId, { 
            $inc: { points: milestonePoints }
          });

          await PointTransaction.create({
            userId: referral.referrerId,
            amount: milestonePoints,
            reason: 'referral',
            notes: `Milestone bonus: ${referrer.totalSuccessfulReferrals} successful referrals`,
          });
        }
      }
    }

    revalidatePath('/referrals');
    revalidatePath('/profile');
  } catch (error) {
    console.error('Update referral status error:', error);
  }
}

// Keep existing actions...
export async function getBonusSuggestion(
  input: any
): Promise<any> {
  try {
    // const result = await suggestBonusPoints(input);
    // return result;
    return {
      suggestedPointsRange: "10-50 points",
      reasoning: "AI suggestion feature temporarily disabled. Default range provided."
    };
  } catch (error) {
    console.error("Error calling GenAI flow:", error);
    return {
      suggestedPointsRange: "Error",
      reasoning: "Could not get suggestion from AI."
    }
  }
}

export async function getFeedbackItems(): Promise<FeedbackType[]> {
  try {
    await dbConnect();
    const feedbackItems = await Feedback.find({}).populate<{userId: UserType}>('userId', 'name avatarUrl points id email role').sort({ createdAt: -1 });
    
    const serialized = serialize(feedbackItems) as any[];
    
    return serialized.map((item: any) => {
      const id = item.id || item._id?.toString();
      console.log('Processing feedback item:', { originalId: item._id, convertedId: id, itemKeys: Object.keys(item) });
      
      return {
        ...item,
        user: item.userId,
        id: id,
      };
    });
  } catch (error) {
    console.error('Get feedback items error:', error);
    return [];
  }
}

export async function approveFeedbackAction(feedbackId: string, points: number): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Admin access required' };
    }

    console.log('Approve feedback ID:', feedbackId, 'Type:', typeof feedbackId);
    
    await dbConnect();
    
    // Validate ObjectId format
    if (!feedbackId || !mongoose.Types.ObjectId.isValid(feedbackId)) {
      return { success: false, message: 'Invalid feedback ID format' };
    }
    
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return { success: false, message: 'Feedback not found' };
    }

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

    revalidatePath('/admin-feedback');
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Approve feedback error:', error);
    return { success: false, message: 'Failed to approve feedback' };
  }
}

export async function rejectFeedbackAction(feedbackId: string): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Admin access required' };
    }

    console.log('Reject feedback ID:', feedbackId, 'Type:', typeof feedbackId);

    await dbConnect();
    
    // Validate ObjectId format
    if (!feedbackId || !mongoose.Types.ObjectId.isValid(feedbackId)) {
      return { success: false, message: 'Invalid feedback ID format' };
    }
    
    const feedback = await Feedback.findByIdAndUpdate(feedbackId, { status: 'rejected' });
    if (!feedback) {
      return { success: false, message: 'Feedback not found' };
    }
    
    revalidatePath('/admin-feedback');
    return { success: true };
  } catch (error) {
    console.error('Reject feedback error:', error);
    return { success: false, message: 'Failed to reject feedback' };
  }
}

export async function submitFeedbackAction(feedbackText: string): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Authentication required' };
    }

    await dbConnect();
    await Feedback.create({
      userId: user.id,
      feedbackText,
    });

    revalidatePath('/feedback');
    return { success: true };
  } catch (error) {
    console.error('Submit feedback error:', error);
    return { success: false, message: 'Failed to submit feedback' };
  }
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

  const serialized = serialize(transactions) as any[];
  
  return serialized.map((t: any) => ({
    ...t,
    user: t.userId,
    admin: t.adminId,
    id: t._id,
  }));
}

export async function grantPointsAction(data: { userId: string, amount: number, notes?: string }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();

    await User.findByIdAndUpdate(data.userId, { $inc: { points: data.amount } });

    await PointTransaction.create({
      ...data,
      adminId: currentUser.id,
      reason: 'admin-grant',
    });

    revalidatePath('/grant-points');
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Grant points error:', error);
    throw error;
  }
}

export async function getPredictions(): Promise<PredictionType[]> {
  return getCachedData('all-predictions', async () => {
    await dbConnect();
    const predictions = await Prediction.find({})
      .populate('winnerId', 'name avatarUrl')
      .select('title description imageUrl status pointsCost createdAt winnerId')
      .sort({ createdAt: -1 })
      .lean();
    return serialize(predictions);
  }, 60); // Cache for 60 seconds
}

export async function getAllPredictions(): Promise<PredictionType[]> {
  await dbConnect();
  const predictions = await Prediction.find({}).sort({ createdAt: -1 });
  return serialize(predictions);
}

export async function getQuestions(): Promise<QuestionType[]> {
  return getCachedData('all-questions', async () => {
    await dbConnect();
    const questions = await Question.find({})
      .select('questionText imageUrl answer isPriority status displayCount correctAnswerCount points createdAt')
      .sort({ createdAt: -1 })
      .lean();
    return serialize(questions);
  }, 60); // Cache for 60 seconds
}

export async function getActiveQuestion(): Promise<QuestionType | null> {
  return getCachedData('active-question', async () => {
    await dbConnect();
    let question = await Question.findOne({ status: 'active', isPriority: true }).lean();
    if (!question) {
      question = await Question.findOne({ status: 'active' }).lean();
    }
    return serialize(question);
  }, 120); // Cache for 2 minutes
}

export async function getDashboardStats() {
  return getCachedData('dashboard-stats', async () => {
    await dbConnect();
    
    try {
      // Use aggregation for better performance
      const [statsResult] = await Promise.all([
        PointTransaction.aggregate([
          {
            $facet: {
              totalPointsAwarded: [
                { $match: { amount: { $gt: 0 } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
              ],
              activeUsers: [
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'users' } },
                { $unwind: '$users' },
                { $match: { 'users.role': 'user' } },
                { $group: { _id: null, count: { $sum: 1 } } }
              ]
            }
          }
        ])
      ]);

      // Get counts in parallel
      const [activePredictions, pendingFeedback] = await Promise.all([
        Prediction.countDocuments({ status: 'active' }),
        Feedback.countDocuments({ status: 'pending' })
      ]);

      const totalPointsAwarded = statsResult[0]?.totalPointsAwarded[0]?.total || 0;
      const activeUsers = await User.countDocuments({ role: 'user' }); // Fallback to simple count

      return {
        totalPointsAwarded,
        activeUsers,
        activePredictions,
        pendingFeedback
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      // Fallback to original implementation
      const [totalPointsResult, activeUsers, activePredictions, pendingFeedback] = await Promise.all([
        PointTransaction.aggregate([
          { $match: { amount: { $gt: 0 } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        User.countDocuments({ role: 'user' }),
        Prediction.countDocuments({ status: 'active' }),
        Feedback.countDocuments({ status: 'pending' })
      ]);

      return {
        totalPointsAwarded: totalPointsResult[0]?.total || 0,
        activeUsers,
        activePredictions,
        pendingFeedback
      };
    }
  }, 30); // Cache for 30 seconds
}

export async function getUserProfileData() {
    const user = await getCurrentUser();
    if (!user) return { user: null, transactions: [] };

    await dbConnect();
    
    try {
        // Use aggregation to get user and transactions in one query
        const [userWithTransactions] = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(user.id) } },
            {
                $lookup: {
                    from: 'pointtransactions',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'transactions',
                    pipeline: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 20 } // Only get recent transactions for better performance
                    ]
                }
            }
        ]);

        if (!userWithTransactions) {
            return { user: null, transactions: [] };
        }

        return { 
            user: serialize(userWithTransactions), 
            transactions: serialize(userWithTransactions.transactions || [])
        };
    } catch (error) {
        console.error('Profile data error:', error);
        // Fallback to original implementation
        const userDoc = await User.findById(user.id);
        const transactions = await PointTransaction.find({ userId: user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        
        return { 
            user: serialize(userDoc), 
            transactions: serialize(transactions) 
        };
    }
}

export async function getReferralsData() {
    const user = await getCurrentUser();
    if (!user) return { referrals: [], currentUser: null };

    await dbConnect();
    
    try {
        // Use aggregation for better performance
        const [userWithReferrals] = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(user.id) } },
            {
                $lookup: {
                    from: 'referrals',
                    localField: '_id',
                    foreignField: 'referrerId',
                    as: 'referrals',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'referredUserId',
                                foreignField: '_id',
                                as: 'referredUser',
                                pipeline: [
                                    { $project: { name: 1, createdAt: 1, consecutiveCheckIns: 1 } }
                                ]
                            }
                        },
                        { $unwind: '$referredUser' },
                        { $sort: { createdAt: -1 } }
                    ]
                }
            }
        ]);

        if (!userWithReferrals) {
            return { referrals: [], currentUser: null };
        }

        const referrals = userWithReferrals.referrals || [];
        const formattedReferrals = referrals.map((r: any) => ({
            ...r,
            id: r._id,
            referredUser: r.referredUser
        }));

        return { 
            referrals: serialize(formattedReferrals), 
            currentUser: serialize(userWithReferrals) 
        };
    } catch (error) {
        console.error('Referrals data error:', error);
        // Fallback to original implementation
        const referrals = await Referral.find({ referrerId: user.id })
            .populate('referredUserId', 'name createdAt consecutiveCheckIns');
        
        const validReferrals = referrals.filter(r => r.referredUserId);
        const serialized = serialize(validReferrals) as any[];
        const formatted = serialized.map((r: any) => ({
            ...r,
            referredUser: r.referredUserId,
            id: r._id
        }));

        return { 
            referrals: formatted, 
            currentUser: serialize(await User.findById(user.id)) 
        };
    }
}

// STAFF MANAGEMENT ACTIONS
export async function getStaffUsers(): Promise<UserType[]> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    const staff = await User.find({ role: 'staff' }).sort({ createdAt: -1 });
    return serialize(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    return [];
  }
}

export async function createStaffAction(data: {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { success: false, message: 'Email already exists' };
    }

    const hashedPassword = await hashPassword(data.password);
    await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'staff',
      isEmailVerified: true,
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
    });

    revalidatePath('/admin/staff');
    return { success: true };
  } catch (error) {
    console.error('Create staff error:', error);
    return { success: false, message: 'Failed to create staff account' };
  }
}

export async function updateStaffAction(staffId: string, data: {
  name?: string;
  email?: string;
  avatarUrl?: string;
  password?: string;
}): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.avatarUrl) updateData.avatarUrl = data.avatarUrl;
    if (data.password) updateData.password = await hashPassword(data.password);

    await User.findByIdAndUpdate(staffId, updateData);

    revalidatePath('/admin/staff');
    return { success: true };
  } catch (error) {
    console.error('Update staff error:', error);
    return { success: false, message: 'Failed to update staff account' };
  }
}

export async function deleteStaffAction(staffId: string): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    await User.findByIdAndDelete(staffId);

    revalidatePath('/admin/staff');
    return { success: true };
  } catch (error) {
    console.error('Delete staff error:', error);
    return { success: false, message: 'Failed to delete staff account' };
  }
}

// USER MANAGEMENT ACTIONS
export async function getAllUsers(): Promise<UserType[]> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      throw new Error('Admin or staff access required');
    }

    await dbConnect();
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    return serialize(users);
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
}

export async function updateUserAction(userId: string, data: {
  name?: string;
  email?: string;
  points?: number;
  avatarUrl?: string;
  isEmailVerified?: boolean;
}): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    await User.findByIdAndUpdate(userId, data);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, message: 'Failed to update user' };
  }
}

export async function deleteUserAction(userId: string): Promise<{success: boolean, message?: string}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await dbConnect();
    
    // Also clean up related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Feedback.deleteMany({ userId }),
      UserPrediction.deleteMany({ userId }),
      CheckIn.deleteMany({ userId }),
      PointTransaction.deleteMany({ userId }),
      Referral.deleteMany({ $or: [{ referrerId: userId }, { referredUserId: userId }] }),
    ]);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: 'Failed to delete user' };
  }
}
