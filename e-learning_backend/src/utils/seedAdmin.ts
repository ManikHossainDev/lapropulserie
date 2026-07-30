import bcryptjs from 'bcryptjs';
import { config } from '../config';
import { TRole } from '../middlewares/roles';
import { UserProfile } from '../modules/user.module/userProfile/userProfile.model';
import { User } from '../modules/user.module/user/user.model';

export const seedAdminIfNeeded = async () => {
  console.info('seeding admin....');
  if (!config.adminSeed.enabled) {
    console.info(
      'Admin seed is disabled. Set ADMIN_SEED_ENABLED=true to enable.',
    );
    return;
  }

  if (!config.adminSeed.email || !config.adminSeed.password) {
    console.info('Admin seed email or password not configured.');
    return;
  }

  const existingAdmin = await User.findOne({
    email: config.adminSeed.email.trim().toLowerCase(),
    role: TRole.admin,
    isDeleted: false,
  });

  if (existingAdmin) {
    console.info('Admin already exists. Skipping seed.');
    return;
  }

  const profile = await UserProfile.create({
    acceptTOC: true,
  });

  const hashedPassword = await bcryptjs.hash(
    config.adminSeed.password,
    config.bcrypt.saltRounds,
  );

  const admin = await User.create({
    name: config.adminSeed.name,
    email: config.adminSeed.email.trim().toLowerCase(),
    password: hashedPassword,
    role: TRole.admin,
    profileId: profile._id,
    isEmailVerified: true,
    hasCompletedQuestionnaire: true,
  });

  await UserProfile.findByIdAndUpdate(profile._id, { userId: admin._id });
  console.info('Admin seeded successfully!');
  console.info(`Admin Email: ${config.adminSeed.email}`);
};

// Only run as standalone script when executed directly
if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();

  const connectToDatabase = async () => {
    try {
      const dbUrl = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/e-learning';
      console.log('Connecting to:', dbUrl);
      await mongoose.connect(dbUrl);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);
    }
  };

  const seedAdmin = async () => {
    try {
      await connectToDatabase();
      await seedAdminIfNeeded();
      console.log(
        '--------------> Admin seeding process completed <--------------',
      );
    } catch (err) {
      console.error('Error seeding admin:', err);
    } finally {
      mongoose
        .disconnect()
        .then(() => console.log('Disconnected from MongoDB'));
    }
  };

  seedAdmin();
}
