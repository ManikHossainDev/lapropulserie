import bcryptjs from 'bcryptjs';
import { config } from '../config';
import { TRole } from '../middlewares/roles';
import { THaveAdminApproval, TMentorClass } from '../modules/mentor.module/mentorProfile/mentorProfile.constant';
import { MentorProfile } from '../modules/mentor.module/mentorProfile/mentorProfile.model';
import { UserProfile } from '../modules/user.module/userProfile/userProfile.model';
import { User } from '../modules/user.module/user/user.model';
import { Wallet } from '../modules/wallet.module/wallet/wallet.model';

const defaultMentorProfile = {
  title: 'Senior Career Coach & Mentor',
  topics: ['Career Development', 'Leadership', 'Coaching'],
  language: ['English', 'French'],
  location: 'Paris, France',
  availableIn: TMentorClass.online,
  sessionPrice: 75,
  currentJobTitle: 'Senior Career Coach',
  companyName: 'Propulsaria',
  yearsOfExperience: 10,
  bio: 'Experienced mentor helping professionals find meaning and direction in their careers.',
  careerStage: ['Mid-Level', 'Senior', 'Lead'],
  focusArea: ['Career Growth', 'Leadership', 'Personal Development'],
  industry: ['Technology', 'Consulting', 'Education'],
  coreValues: ['Empathy', 'Growth', 'Integrity'],
  specialties: ['Career Coaching', 'Leadership Development', 'Work-Life Balance'],
  coachingMethodologies: ['One-on-One Coaching', 'Goal Setting', 'Career Roadmap Planning'],
  calendlyProfileLink: 'https://calendly.com/mentor1-example',
  avatarUrl: 'https://i.pravatar.cc/300?img=32',
  rating: 4.9,
  profileInfoFillUpCount: 5,
  haveAdminApproval: THaveAdminApproval.approved,
  isLive: true,
  isDeleted: false,
};

export const seedMentorIfNeeded = async () => {
  if (!config.mentorSeed.enabled) {
    return;
  }

  if (!config.mentorSeed.email || !config.mentorSeed.password) {
    console.info('Mentor seed email or password not configured.');
    return;
  }

  const email = config.mentorSeed.email.trim().toLowerCase();
  const hashedPassword = await bcryptjs.hash(
    config.mentorSeed.password,
    config.bcrypt.saltRounds,
  );

  const existingMentor = await User.findOne({
    email,
    role: TRole.mentor,
    isDeleted: false,
  }).select('+password');

  if (existingMentor) {
    const passwordValid = await bcryptjs.compare(
      config.mentorSeed.password,
      existingMentor.password,
    );

    if (!passwordValid) {
      existingMentor.password = hashedPassword;
      existingMentor.isEmailVerified = true;
      existingMentor.failedLoginAttempts = 0;
      await existingMentor.save();
      console.info(`Mentor password reset for: ${email}`);
    } else {
      console.info('Test mentor already exists with correct password.');
    }

    const existingProfile = await MentorProfile.findOne({ userId: existingMentor._id });
    if (!existingProfile) {
      await MentorProfile.create({
        userId: existingMentor._id,
        ...defaultMentorProfile,
      });
      console.info(`Mentor profile created for existing user: ${email}`);
    }

    return;
  }

  const profile = await UserProfile.create({
    gender: 'male',
    acceptTOC: true,
    dob: new Date('1988-06-15').toISOString(),
  });

  const wallet = await Wallet.create({
    amount: 0,
  });

  const mentor = await User.create({
    name: config.mentorSeed.name,
    email,
    password: hashedPassword,
    role: TRole.mentor,
    profileId: profile._id,
    walletId: wallet._id,
    isEmailVerified: true,
    isDeleted: false,
    isResetPassword: false,
    failedLoginAttempts: 0,
  });

  await UserProfile.findByIdAndUpdate(profile._id, { userId: mentor._id });
  await Wallet.findByIdAndUpdate(wallet._id, { userId: mentor._id });

  await MentorProfile.create({
    userId: mentor._id,
    ...defaultMentorProfile,
  });

  console.info('Test mentor seeded successfully!');
  console.info(`Mentor Email: ${email}`);
  console.info(`Mentor Password: ${config.mentorSeed.password}`);
};

if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();

  const run = async () => {
    try {
      await mongoose.connect(config.database.mongoUrl as string);
      await seedMentorIfNeeded();
    } finally {
      await mongoose.disconnect();
    }
  };

  run();
}
