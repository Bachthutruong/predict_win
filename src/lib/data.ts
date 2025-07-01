import type { User, Feedback, Prediction, Question, PointTransaction, Referral } from '@/types';

export const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@predictwin.com', role: 'admin', points: 1000, avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
  { id: '2', name: 'Vũ Bách', email: 'bach@example.com', role: 'user', points: 250, avatarUrl: 'https://i.pravatar.cc/150?u=bach' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', points: 50, avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'user', points: 750, avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
];

export const mockFeedback: Feedback[] = [
  {
    id: 'feedback-1',
    userId: '2',
    user: users[1],
    feedbackText: 'The referral system is great, but it would be even better if we got a small bonus instantly, not just after 3 days of check-in.',
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feedback-2',
    userId: '3',
    user: users[2],
    feedbackText: 'I love the daily check-in questions! Could you add more questions about sports history? That would be fun.',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feedback-3',
    userId: '2',
    user: users[1],
    feedbackText: 'The prediction UI is a bit cluttered on mobile. Maybe a simpler layout could work better on smaller screens.',
    status: 'approved',
    awardedPoints: 150,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feedback-4',
    userId: '3',
    user: users[2],
    feedbackText: 'The point history page should have filters to see only points gained or points spent.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const mockPredictions: Prediction[] = [
    {
        id: 'pred-1',
        title: 'Who will win the Premier League 2024/2025?',
        description: 'The new season is upon us. Which team will lift the trophy at the end of the season? Make your prediction and earn points.',
        imageUrl: 'https://placehold.co/600x400.png',
        'data-ai-hint': 'soccer premier-league',
        answer: 'Manchester City',
        pointsCost: 20,
        status: 'active',
        authorId: '1',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'pred-2',
        title: 'Will Bitcoin reach $100k by end of year?',
        description: 'The crypto market is volatile. Predict if the king of crypto will reach a new all-time high before the year is out.',
        imageUrl: 'https://placehold.co/600x400.png',
        'data-ai-hint': 'crypto bitcoin',
        answer: 'Yes',
        pointsCost: 10,
        status: 'active',
        authorId: '1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'pred-3',
        title: 'Who will be the next US President?',
        description: 'The election is heating up. Who will win the race to the White House? This is a high-stakes prediction!',
        imageUrl: 'https://placehold.co/600x400.png',
        'data-ai-hint': 'politics election',
        answer: 'Donald Trump',
        pointsCost: 50,
        status: 'finished',
        authorId: '1',
        winnerId: '3',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const mockQuestions: Question[] = [
    {
        id: 'q-1',
        questionText: 'Which country won the first ever FIFA World Cup in 1930?',
        answer: 'Uruguay',
        isPriority: true,
        status: 'active',
        displayCount: 150,
        correctAnswerCount: 120,
        points: 10,
    },
    {
        id: 'q-2',
        questionText: 'What is the capital of Japan?',
        answer: 'Tokyo',
        isPriority: false,
        status: 'active',
        displayCount: 200,
        correctAnswerCount: 195,
        points: 5,
    },
    {
        id: 'q-3',
        questionText: 'Who wrote the play "Romeo and Juliet"?',
        answer: 'William Shakespeare',
        isPriority: false,
        status: 'inactive',
        displayCount: 50,
        correctAnswerCount: 40,
        points: 5,
    }
];


export const mockPointTransactions: PointTransaction[] = [
    {
        id: 'pt-1',
        userId: '2',
        user: { name: users[1].name },
        adminId: '1',
        admin: { name: users[0].name },
        amount: 500,
        reason: 'admin-grant',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: 'Welcome bonus'
    },
    {
        id: 'pt-2',
        userId: '3',
        user: { name: users[2].name },
        amount: 10,
        reason: 'check-in',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'pt-3',
        userId: '4',
        user: { name: users[3].name },
        amount: -20,
        reason: 'prediction-win',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'pt-4',
        userId: '2',
        user: { name: users[1].name },
        amount: 150,
        reason: 'feedback',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export const mockReferrals: Referral[] = [
    {
        id: 'ref-1',
        referrerId: '2',
        referredUserId: '3',
        referredUser: { name: users[2].name, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        status: 'completed',
    },
    {
        id: 'ref-2',
        referrerId: '2',
        referredUserId: '4',
        referredUser: { name: users[3].name, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        status: 'pending',
    }
];
