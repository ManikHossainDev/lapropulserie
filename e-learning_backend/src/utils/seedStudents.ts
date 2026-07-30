import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { config } from '../config';
import { User } from '../modules/user.module/user/user.model';
import { UserProfile } from '../modules/user.module/userProfile/userProfile.model';
import { Wallet } from '../modules/wallet.module/wallet/wallet.model';

const DEFAULT_SEED_PASSWORD = 'asdfasdf';

const connectToDatabase = async () => {
  try {
    console.log('Connecting to:', config.database.mongoUrl);
    await mongoose.connect(config.database.mongoUrl as string);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

const cleanExistingStudentData = async () => {
  console.log('Cleaning existing student data...');

  const studentUsers = await User.find({ role: 'student' }).select('_id').lean();
  const studentUserIds = studentUsers.map((u) => u._id);

  await UserProfile.deleteMany({ userId: { $in: studentUserIds } });
  console.log('Deleted student user profiles');

  await Wallet.deleteMany({ userId: { $in: studentUserIds } });
  console.log('Deleted student wallets');

  await User.deleteMany({ role: 'student' });
  console.log('Deleted student users');
};

async function hashSeedPassword() {
  return bcryptjs.hash(DEFAULT_SEED_PASSWORD, config.bcrypt.saltRounds);
}

const generateRandomStudents = async (count: number) => {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const password = await hashSeedPassword();

  const students = [];

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `student${i}@example.com`;

    students.push({
      name,
      email,
      role: 'student',
      isEmailVerified: true,
      password,
      hasCompletedQuestionnaire: true,
      isDeleted: false,
      isResetPassword: false,
      failedLoginAttempts: 0,
      deletedAt: null,
    });
  }

  return students;
};

const seedStudents = async () => {
  try {
    const password = await hashSeedPassword();
    const constantStudent = {
      name: 'Test Student',
      email: 'student@gmail.com',
      role: 'student',
      isEmailVerified: true,
      password,
      hasCompletedQuestionnaire: true,
      isDeleted: false,
      isResetPassword: false,
      failedLoginAttempts: 0,
      deletedAt: null,
    };

    const randomStudents = await generateRandomStudents(20);
    const allStudents = [constantStudent, ...randomStudents];

    for (const studentData of allStudents) {
      const email = studentData.email.trim().toLowerCase();
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        existingUser.password = password;
        existingUser.isEmailVerified = true;
        existingUser.hasCompletedQuestionnaire = true;
        existingUser.failedLoginAttempts = 0;
        await existingUser.save();
        console.log(`Updated existing student password: ${email}`);
        continue;
      }

      const userProfile = await UserProfile.create({
        gender: Math.random() > 0.5 ? 'male' : 'female',
        acceptTOC: true,
        dob: new Date(
          1990 + Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        ).toISOString(),
      });

      const wallet = await Wallet.create({
        amount: Math.floor(Math.random() * 500) + 100,
      });

      const user = await User.create({
        ...studentData,
        email,
        profileId: userProfile._id,
        walletId: wallet._id,
      });

      await Wallet.findByIdAndUpdate(wallet._id, { userId: user._id });
      await UserProfile.findByIdAndUpdate(userProfile._id, { userId: user._id });

      console.log(`Created student: ${user.name} (${user.email})`);
    }

    console.log(`All students seeded with password: ${DEFAULT_SEED_PASSWORD}`);
  } catch (err) {
    console.error('Error seeding students:', err);
  }
};

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    await cleanExistingStudentData();
    await seedStudents();
    console.log('--------------> Student seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};

seedDatabase();
