import bcryptjs from 'bcryptjs';
import { config } from '../config';
import { TRole } from '../middlewares/roles';
import { UserProfile } from '../modules/user.module/userProfile/userProfile.model';
import { User } from '../modules/user.module/user/user.model';
import { Wallet } from '../modules/wallet.module/wallet/wallet.model';

export const seedStudentIfNeeded = async () => {
  if (!config.studentSeed.enabled) {
    return;
  }

  if (!config.studentSeed.email || !config.studentSeed.password) {
    console.info('Student seed email or password not configured.');
    return;
  }

  const email = config.studentSeed.email.trim().toLowerCase();
  const hashedPassword = await bcryptjs.hash(
    config.studentSeed.password,
    config.bcrypt.saltRounds,
  );

  const existingStudent = await User.findOne({
    email,
    role: TRole.student,
    isDeleted: false,
  }).select('+password');

  if (existingStudent) {
    const passwordValid = await bcryptjs.compare(
      config.studentSeed.password,
      existingStudent.password,
    );

    if (!passwordValid) {
      existingStudent.password = hashedPassword;
      existingStudent.isEmailVerified = true;
      existingStudent.hasCompletedQuestionnaire = true;
      existingStudent.failedLoginAttempts = 0;
      await existingStudent.save();
      console.info(`Student password reset for: ${email}`);
    } else {
      console.info('Test student already exists with correct password. Skipping seed.');
    }
    return;
  }

  const profile = await UserProfile.create({
    gender: 'female',
    acceptTOC: true,
    dob: new Date('1995-01-15').toISOString(),
  });

  const wallet = await Wallet.create({
    amount: 100,
  });

  const student = await User.create({
    name: config.studentSeed.name,
    email,
    password: hashedPassword,
    role: TRole.student,
    profileId: profile._id,
    walletId: wallet._id,
    isEmailVerified: true,
    hasCompletedQuestionnaire: true,
    isDeleted: false,
    isResetPassword: false,
    failedLoginAttempts: 0,
  });

  await UserProfile.findByIdAndUpdate(profile._id, { userId: student._id });
  await Wallet.findByIdAndUpdate(wallet._id, { userId: student._id });

  console.info('Test student seeded successfully!');
  console.info(`Student Email: ${email}`);
  console.info(`Student Password: ${config.studentSeed.password}`);
};

if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();

  const run = async () => {
    try {
      await mongoose.connect(config.database.mongoUrl as string);
      await seedStudentIfNeeded();
    } finally {
      await mongoose.disconnect();
    }
  };

  run();
}
