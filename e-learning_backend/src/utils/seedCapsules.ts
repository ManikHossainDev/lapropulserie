/**
 * Seed Individual Capsule categories + capsules (6-part learning content).
 *
 * Run:  npm run seedCapsules
 *
 * - Removes only categories listed in SEED_CATALOG (and their capsules)
 * - Does NOT delete manually created categories with other titles
 * - Requires an admin user (run seedAdmin first if needed)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../config';
import { User } from '../modules/user.module/user/user.model';
import { IndividualCapsuleCategory } from '../modules/individualCapsule.module/individual-capsule-category/individual-capsule-category.model';
import { IndividualCapsule } from '../modules/individualCapsule.module/individual-capsule/individual-capsule.model';
import { TIndividualCapsuleLevel } from '../modules/individualCapsule.module/individual-capsule/individual-capsule.constant';

dotenv.config();

type SeedCapsule = {
  title: string;
  level?: TIndividualCapsuleLevel;
  price?: number;
  capsuleType?: 'free' | 'regular';
  introduction?: {
    title: string;
    text: string;
  };
  inspiration?: {
    title: string;
    text: string;
  };
  reflection?: {
    title: string;
    instructions: string;
    questions: Array<{ question: string; orderNumber: number }>;
  };
  practicalExercises?: {
    title: string;
    exercises: Array<{ exercise: string; orderNumber: number }>;
  };
  science?: {
    title: string;
    text: string;
  };
};

type SeedCategory = {
  title: string;
  description: string;
  about: string;
  level: TIndividualCapsuleLevel;
  estimatedDuration: number;
  price: number;
  capsuleType: 'free' | 'regular';
  whatYouLearn: string[];
  capsules: SeedCapsule[];
};

const SEED_CATALOG: SeedCategory[] = [
  {
    title: 'Trouver son pourquoi',
    description: 'Explorez ce qui vous motive vraiment au quotidien.',
    about: 'Un parcours pour clarifier votre direction personnelle et professionnelle.',
    level: TIndividualCapsuleLevel.beginner,
    estimatedDuration: 120,
    price: 49,
    capsuleType: 'regular',
    whatYouLearn: [
      'Identifier vos valeurs profondes',
      'Comprendre ce qui vous énergise',
      'Clarifier votre direction',
    ],
    capsules: [
      {
        title: 'Découvrir votre pourquoi',
        level: TIndividualCapsuleLevel.beginner,
        introduction: {
          title: 'Bienvenue dans la capsule',
          text: 'Cette capsule vous guide pas à pas pour identifier ce qui compte vraiment pour vous.',
        },
        inspiration: {
          title: 'Inspiration du fondateur',
          text: 'Chaque parcours commence par une question simple : qu\'est-ce qui vous fait lever le matin ?',
        },
        reflection: {
          title: 'Réflexion personnelle',
          instructions: 'Prenez le temps de répondre honnêtement. Il n\'y a pas de bonne ou mauvaise réponse.',
          questions: [
            { question: 'Qu\'est-ce qui vous passionne aujourd\'hui ?', orderNumber: 1 },
            { question: 'Quand vous vous sentez le plus vivant(e) ?', orderNumber: 2 },
            { question: 'Quelle contribution aimeriez-vous apporter au monde ?', orderNumber: 3 },
          ],
        },
        practicalExercises: {
          title: 'Exercices pratiques',
          exercises: [
            { exercise: 'Listez 5 moments où vous vous êtes senti(e) fier(ère) cette année.', orderNumber: 1 },
            { exercise: 'Notez 3 activités qui vous font perdre la notion du temps.', orderNumber: 2 },
          ],
        },
        science: {
          title: 'Les fondements',
          text: 'La recherche en psychologie positive montre que l\'alignement entre valeurs et actions augmente la satisfaction durable.',
        },
      },
      {
        title: 'Aligner valeurs et actions',
        level: TIndividualCapsuleLevel.intermediate,
        introduction: {
          title: 'Passer à l\'action',
          text: 'Vous connaissez vos valeurs — voyons comment les traduire en choix concrets.',
        },
        inspiration: {
          title: 'Inspiration',
          text: 'L\'alignement n\'est pas la perfection. C\'est un mouvement continu vers ce qui compte.',
        },
        reflection: {
          title: 'Auto-évaluation',
          instructions: 'Comparez votre quotidien actuel avec vos valeurs identifiées.',
          questions: [
            { question: 'Quels écarts voyez-vous entre vos valeurs et votre quotidien ?', orderNumber: 1 },
            { question: 'Quel petit changement pourriez-vous tester cette semaine ?', orderNumber: 2 },
          ],
        },
        practicalExercises: {
          title: 'Plan d\'action',
          exercises: [
            { exercise: 'Choisissez une valeur et une action concrète à réaliser sous 7 jours.', orderNumber: 1 },
          ],
        },
        science: {
          title: 'Science du comportement',
          text: 'Les micro-habitudes répétées créent plus de changement durable que les grandes résolutions.',
        },
      },
    ],
  },
  {
    title: 'Confiance en soi',
    description: 'Renforcez votre confiance et osez prendre votre place.',
    about: 'Développez une confiance authentique et durable.',
    level: TIndividualCapsuleLevel.intermediate,
    estimatedDuration: 90,
    price: 39,
    capsuleType: 'regular',
    whatYouLearn: [
      'Reconnaître vos forces',
      'Transformer le doute en action',
      'Oser de nouvelles expériences',
    ],
    capsules: [
      {
        title: 'Reconnaître vos forces',
        level: TIndividualCapsuleLevel.intermediate,
        introduction: {
          title: 'Vos forces existent déjà',
          text: 'La confiance commence par reconnaître ce que vous savez déjà faire.',
        },
        inspiration: {
          title: 'Inspiration',
          text: 'La confiance n\'est pas l\'absence de peur — c\'est agir malgré elle.',
        },
        reflection: {
          title: 'Réflexion',
          instructions: 'Soyez bienveillant(e) envers vous-même pendant cet exercice.',
          questions: [
            { question: 'Quelles compétences vos proches vous reconnaissent-ils ?', orderNumber: 1 },
            { question: 'Quel défi récent avez-vous surmonté ?', orderNumber: 2 },
          ],
        },
        practicalExercises: {
          title: 'Exercice',
          exercises: [
            { exercise: 'Demandez à deux personnes de confiance quelle est votre plus grande force.', orderNumber: 1 },
          ],
        },
        science: {
          title: 'Psychologie positive',
          text: 'L\'effet Barnum aside, l\'auto-affirmation ciblée sur nos forces réelles améliore la performance sous stress.',
        },
      },
    ],
  },
  {
    title: 'Gestion du stress',
    description: 'Retrouvez l\'équilibre et apprenez à gérer votre énergie.',
    about: 'Des outils pratiques pour réduire le stress au quotidien.',
    level: TIndividualCapsuleLevel.beginner,
    estimatedDuration: 60,
    price: 0,
    capsuleType: 'free',
    whatYouLearn: [
      'Comprendre vos signaux de stress',
      'Pratiquer des exercices de régulation',
      'Créer des routines apaisantes',
    ],
    capsules: [
      {
        title: 'Respirer et recentrer',
        level: TIndividualCapsuleLevel.beginner,
        price: 0,
        capsuleType: 'free',
        introduction: {
          title: 'Pause bienvenue',
          text: 'Cette capsule gratuite vous offre des outils immédiats pour gérer le stress.',
        },
        inspiration: {
          title: 'Inspiration',
          text: 'Prendre soin de soi n\'est pas un luxe — c\'est une condition pour avancer.',
        },
        reflection: {
          title: 'Où en êtes-vous ?',
          instructions: 'Identifiez vos signaux corporels de stress.',
          questions: [
            { question: 'Comment le stress se manifeste-t-il dans votre corps ?', orderNumber: 1 },
            { question: 'À quel moment de la journée vous sentez-vous le plus tendu(e) ?', orderNumber: 2 },
          ],
        },
        practicalExercises: {
          title: 'Exercice de respiration',
          exercises: [
            { exercise: 'Pratiquez 5 minutes de respiration 4-7-8, deux fois par jour pendant 3 jours.', orderNumber: 1 },
          ],
        },
        science: {
          title: 'Neurosciences',
          text: 'La respiration contrôlée active le système nerveux parasympathique et réduit le cortisol.',
        },
      },
    ],
  },
];

const SEED_CATEGORY_TITLES = SEED_CATALOG.map((item) => item.title);

async function removePreviousSeedData() {
  const existingCategories = await IndividualCapsuleCategory.find({
    title: { $in: SEED_CATEGORY_TITLES },
  }).select('_id title');

  if (existingCategories.length === 0) {
    console.info('No previous seed categories to remove.');
    return;
  }

  const categoryIds = existingCategories.map((cat) => cat._id);

  const deletedCapsules = await IndividualCapsule.deleteMany({
    capsuleCategoryId: { $in: categoryIds },
  });
  console.info(`Removed ${deletedCapsules.deletedCount} capsule(s) from seed categories`);

  const deletedCategories = await IndividualCapsuleCategory.deleteMany({
    _id: { $in: categoryIds },
  });
  console.info(`Removed ${deletedCategories.deletedCount} seed categor(ies)`);
}

export async function seedCapsules() {
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    throw new Error('Admin user not found. Run npm run seedAdmin first.');
  }

  await removePreviousSeedData();

  let categoryCount = 0;
  let capsuleCount = 0;

  for (const entry of SEED_CATALOG) {
    const { capsules, ...categoryFields } = entry;

    const category = await IndividualCapsuleCategory.create(categoryFields);
    categoryCount += 1;
    console.info(`Created category: "${category.title}"`);

    for (const capsuleData of capsules) {
      const {
        price: capsulePrice,
        capsuleType: capsuleTypeOverride,
        ...rest
      } = capsuleData;

      await IndividualCapsule.create({
        ...rest,
        description: category.description,
        about: category.about,
        numberOfModules: 0,
        whatYouLearn: category.whatYouLearn,
        price: capsulePrice ?? category.price,
        capsuleType: capsuleTypeOverride ?? category.capsuleType,
        capsuleCategoryId: category._id,
        adminId: adminUser._id,
      });

      capsuleCount += 1;
      console.info(`  Created capsule: "${capsuleData.title}"`);
    }
  }

  console.info(
    `Capsule seed completed — ${categoryCount} categories, ${capsuleCount} capsules.`,
  );
}

async function main() {
  try {
    await mongoose.connect(config.database.mongoUrl as string);
    console.info('Connected to MongoDB');
    await seedCapsules();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.info('Disconnected from MongoDB');
  }
}

if (require.main === module) {
  main();
}
