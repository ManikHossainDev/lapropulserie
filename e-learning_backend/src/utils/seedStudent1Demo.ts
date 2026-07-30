/**
 * Demo seed for local testing — student1@example.com + purchased capsules + mentor1.
 *
 * Run: npm run seedStudent1Demo
 *
 * Safe: does NOT delete all students/mentors. Only upserts demo accounts and purchases.
 */
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { config } from '../config';
import { TRole } from '../middlewares/roles';
import { User } from '../modules/user.module/user/user.model';
import { UserProfile } from '../modules/user.module/userProfile/userProfile.model';
import { Wallet } from '../modules/wallet.module/wallet/wallet.model';
import { IndividualCapsule } from '../modules/individualCapsule.module/individual-capsule/individual-capsule.model';
import { PurchasedIndividualCapsule } from '../modules/individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.model';
import { TPurchasedIndividualCapsuleStatus } from '../modules/individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.constant';
import { TPaymentStatus } from '../modules/payment.module/paymentTransaction/paymentTransaction.constant';
import { seedCapsules } from './seedCapsules';
import { seedMentorIfNeeded } from './seedMentor';
import { seedAdminIfNeeded } from './seedAdmin';

dotenv.config();

const DEMO_PASSWORD = 'asdfasdf';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_NAME = 'Demo Student One';

/** Capsules from seedCapsules catalog — must have 6-part content for Luna/Marii flow */
const DEMO_CAPSULE_TITLES = [
  'Découvrir votre pourquoi',
  'Aligner valeurs et actions',
  'Reconnaître vos forces',
  'Respirer et recentrer',
];

async function upsertStudent() {
  const email = STUDENT_EMAIL.toLowerCase();
  const hashedPassword = await bcryptjs.hash(DEMO_PASSWORD, config.bcrypt.saltRounds);

  let student = await User.findOne({ email, role: TRole.student, isDeleted: false }).select(
    '+password',
  );

  if (student) {
    student.password = hashedPassword;
    student.isEmailVerified = true;
    student.hasCompletedQuestionnaire = true;
    student.failedLoginAttempts = 0;
    student.name = STUDENT_NAME;
    await student.save();
    console.info(`Updated student: ${email}`);
    return student;
  }

  const profile = await UserProfile.create({
    gender: 'female',
    acceptTOC: true,
    dob: new Date('1996-03-20').toISOString(),
  });
  const wallet = await Wallet.create({ amount: 100 });

  student = await User.create({
    name: STUDENT_NAME,
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

  console.info(`Created student: ${email}`);
  return student;
}

async function ensureSeedCapsulesExist() {
  const existing = await IndividualCapsule.countDocuments({
    title: { $in: DEMO_CAPSULE_TITLES },
    isDeleted: false,
  });

  if (existing >= DEMO_CAPSULE_TITLES.length) {
    console.info(`Found ${existing} seed capsules — skipping seedCapsules.`);
    return;
  }

  console.info('Seed capsules missing — running seedCapsules (replaces seed categories only)...');
  await seedCapsules();
}

async function grantCapsulesToStudent(studentId: mongoose.Types.ObjectId) {
  const capsules = await IndividualCapsule.find({
    title: { $in: DEMO_CAPSULE_TITLES },
    isDeleted: false,
  }).lean();

  if (capsules.length === 0) {
    throw new Error('No demo capsules found after seed. Check seedCapsules catalog.');
  }

  let created = 0;
  let skipped = 0;

  for (const [index, capsule] of capsules.entries()) {
    const existing = await PurchasedIndividualCapsule.findOne({
      studentId,
      capsuleId: capsule._id,
      paymentStatus: TPaymentStatus.completed,
      isDeleted: false,
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await PurchasedIndividualCapsule.create({
      studentId,
      capsuleId: capsule._id,
      paymentStatus: TPaymentStatus.completed,
      price: capsule.price ?? 0,
      status: TPurchasedIndividualCapsuleStatus.start,
      isGifted: index === capsules.length - 1,
      isCertificateUploaded: false,
      totalModules: capsule.numberOfModules ?? 0,
      paymentMethod: null,
      isDeleted: false,
    });

    created += 1;
    console.info(
      `  Granted "${capsule.title}" (${index === capsules.length - 1 ? 'gifted' : 'purchased'})`,
    );
  }

  console.info(`Capsule access: ${created} created, ${skipped} already owned.`);
}

export async function seedStudent1Demo() {
  await seedAdminIfNeeded();
  await ensureSeedCapsulesExist();
  await seedMentorIfNeeded();

  const student = await upsertStudent();
  await grantCapsulesToStudent(student._id as mongoose.Types.ObjectId);

  console.info('\n--- Demo ready ---');
  console.info(`Student login: ${STUDENT_EMAIL} / ${DEMO_PASSWORD}`);
  console.info(`Mentor login:  ${config.mentorSeed.email} / ${config.mentorSeed.password}`);
  console.info('My Capsules → Purchased + Gifted sections should show capsules.');
  console.info('Open any capsule → /students/individual-capsule/[id] for Luna chat.');
}

async function main() {
  try {
    await mongoose.connect(config.database.mongoUrl as string);
    console.info('Connected to MongoDB');
    await seedStudent1Demo();
  } catch (error) {
    console.error('seedStudent1Demo failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.info('Disconnected from MongoDB');
  }
}

if (require.main === module) {
  main();
}
