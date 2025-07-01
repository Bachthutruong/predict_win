import dbConnect from './mongodb';
import Question from '@/models/question';
import SystemSettings from '@/models/system-settings';
import User from '@/models/user';
import Prediction from '@/models/prediction';
import { hashPassword } from './auth';

export async function seedDatabase() {
  await dbConnect();

  // Create system settings
  const defaultSettings = [
    { settingKey: 'checkInPoints', settingValue: 10, description: 'Points awarded for daily check-in' },
    { settingKey: 'streakBonusPoints', settingValue: 50, description: 'Bonus points for 7-day streak' },
    { settingKey: 'referralPoints', settingValue: 100, description: 'Points for successful referral' },
    { settingKey: 'milestone10Points', settingValue: 500, description: 'Milestone bonus for 10 referrals' },
  ];

  for (const setting of defaultSettings) {
    await SystemSettings.findOneAndUpdate(
      { settingKey: setting.settingKey },
      setting,
      { upsert: true }
    );
  }

  // Create sample questions
  const sampleQuestions = [
    {
      questionText: 'Thủ đô của Việt Nam là gì?',
      answer: 'Hà Nội',
      isPriority: true,
      status: 'active',
      points: 10,
    },
    {
      questionText: 'Ai là người sáng lập Facebook?',
      answer: 'Mark Zuckerberg',
      isPriority: false,
      status: 'active',
      points: 15,
    },
    {
      questionText: 'Đồng tiền của Nhật Bản là gì?',
      answer: 'Yen',
      isPriority: false,
      status: 'active',
      points: 10,
    },
    {
      questionText: 'Con sông dài nhất thế giới là gì?',
      answer: 'Sông Nile',
      isPriority: false,
      status: 'active',
      points: 15,
    },
    {
      questionText: 'Python là ngôn ngữ lập trình được phát triển bởi ai?',
      answer: 'Guido van Rossum',
      isPriority: false,
      status: 'active',
      points: 20,
    },
  ];

  for (const questionData of sampleQuestions) {
    const existingQuestion = await Question.findOne({ questionText: questionData.questionText });
    if (!existingQuestion) {
      await Question.create(questionData);
    }
  }

  // Create admin user if not exists
  const adminEmail = 'admin@predictwin.com';
  let adminUser = await User.findOne({ email: adminEmail });
  
  if (!adminUser) {
    const hashedPassword = await hashPassword('admin123');
    adminUser = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      points: 1000,
      avatarUrl: `https://api.dicebear.com/6.x/initials/svg?seed=Admin`,
    });
    console.log('Admin user created:', adminEmail, 'password: admin123');
  }

  // Create sample predictions
  const samplePredictions = [
    {
      title: 'Giá Bitcoin sẽ vượt $100,000 trong năm 2024?',
      description: 'Dự đoán giá Bitcoin sẽ đạt mức $100,000 USD trong năm 2024. Hãy đưa ra dự đoán của bạn: Có hoặc Không',
      imageUrl: 'https://images.unsplash.com/photo-1621554329653-0493c47a8fc7?w=400',
      answer: 'Có',
      pointsCost: 20,
      status: 'active',
      authorId: adminUser._id,
    },
    {
      title: 'Đội tuyển Việt Nam có vào được vòng 1/8 Asian Cup 2024?',
      description: 'Dự đoán đội tuyển Việt Nam có thể vượt qua vòng bảng và vào được vòng 1/8 Asian Cup 2024',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400',
      answer: 'Có',
      pointsCost: 15,
      status: 'active',
      authorId: adminUser._id,
    },
    {
      title: 'Tesla sẽ ra mắt xe ô tô tự lái hoàn toàn trong năm 2024?',
      description: 'Dự đoán Tesla có ra mắt phiên bản xe ô tô tự lái hoàn toàn (Level 5) trong năm 2024',
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
      answer: 'Không',
      pointsCost: 25,
      status: 'active',
      authorId: adminUser._id,
    },
  ];

  for (const predictionData of samplePredictions) {
    const existingPrediction = await Prediction.findOne({ title: predictionData.title });
    if (!existingPrediction) {
      await Prediction.create(predictionData);
    }
  }

  console.log('Database seeded successfully!');
} 