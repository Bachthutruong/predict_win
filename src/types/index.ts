export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  points: number;
  avatarUrl: string;
  checkInStreak?: number;
  lastCheckIn?: string;
};

export type Prediction = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  'data-ai-hint'?: string;
  answer: string;
  pointsCost: number;
  status: 'active' | 'finished';
  authorId: string;
  createdAt: string;
  winnerId?: string;
};

export type UserPrediction = {
  id: string;
  userId: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  predictionId: string;
  guess: string;
  createdAt: string;
};

export type Feedback = {
  id: string;
  userId: string;
  user: User;
  feedbackText: string;
  status: 'pending' | 'approved' | 'rejected';
  awardedPoints?: number;
  createdAt: string;
};

export type PointTransaction = {
  id: string;
  userId: string;
  user: { name: string };
  adminId?: string;
  admin?: { name: string };
  amount: number;
  reason:
    | 'check-in'
    | 'referral'
    | 'feedback'
    | 'prediction-win'
    | 'admin-grant';
  createdAt: string;
  notes?: string;
};

export type Question = {
  id: string;
  questionText: string;
  imageUrl?: string;
  answer: string;
  isPriority: boolean;
  status: 'active' | 'inactive';
  displayCount: number;
  correctAnswerCount: number;
  points: number;
};

export type Referral = {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUser: { name: string; createdAt: string };
  status: 'pending' | 'completed'; // completed after 3 days check-in
};
