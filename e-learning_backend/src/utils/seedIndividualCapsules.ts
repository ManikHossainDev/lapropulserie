//@ts-ignore
import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../modules/user.module/user/user.model';
import { IndividualCapsuleCategory } from '../modules/individualCapsule.module/individual-capsule-category/individual-capsule-category.model';
import { IndividualCapsule } from '../modules/individualCapsule.module/individual-capsule/individual-capsule.model';
import { IndividualModule } from '../modules/individualCapsule.module/individual-module/individual-module.model';
import { IndividualLesson } from '../modules/individualCapsule.module/individual-lesson/individual-lesson.model';
import { TIndividualCapsuleLevel } from '../modules/individualCapsule.module/individual-capsule/individual-capsule.constant';

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

const cleanExistingIndividualCapsuleData = async () => {
  console.log('Cleaning existing individual capsule data...');

  await IndividualLesson.deleteMany({});
  console.log('Deleted individual lessons');

  await IndividualModule.deleteMany({});
  console.log('Deleted individual modules');

  await IndividualCapsule.deleteMany({});
  console.log('Deleted individual capsules');

  await IndividualCapsuleCategory.deleteMany({});
  console.log('Deleted individual capsule categories');
};

const categoriesData = [
  {
    title: 'Trouver son pourquoi',
    description: 'Une capsule pour explorer ce qui vous motive vraiment.',
    about: 'Découvrez ce qui donne du sens à votre vie professionnelle et personnelle.',
    level: 'beginner',
    estimatedDuration: 120,
    price: 49,
    whatYouLearn: [
      'Identifier vos valeurs profondes',
      'Comprendre ce qui vous énergise',
      'Clarifier votre direction personnelle',
    ],
    capsuleType: 'regular',
  },
  {
    title: 'Confiance en soi',
    description: 'Renforcez votre confiance et osez prendre votre place.',
    about: 'Un parcours pour développer une confiance durable et authentique.',
    level: 'intermediate',
    estimatedDuration: 90,
    price: 39,
    whatYouLearn: [
      'Reconnaître vos forces',
      'Transformer le doute en action',
      'Oser de nouvelles expériences',
    ],
    capsuleType: 'regular',
  },
  {
    title: 'Reconversion professionnelle',
    description: 'Explorez de nouvelles voies professionnelles alignées avec vos aspirations.',
    about: 'Un programme pour clarifier votre projet de reconversion étape par étape.',
    level: 'advanced',
    estimatedDuration: 180,
    price: 59,
    whatYouLearn: [
      'Cartographier vos compétences',
      'Identifier des pistes concrètes',
      'Construire un plan d\'action',
    ],
    capsuleType: 'regular',
  },
  {
    title: 'Gestion du stress',
    description: 'Retrouvez l\'équilibre et apprenez à gérer votre énergie.',
    about: 'Des outils pratiques pour réduire le stress et retrouver votre calme intérieur.',
    level: 'beginner',
    estimatedDuration: 60,
    price: 0,
    whatYouLearn: [
      'Comprendre vos signaux de stress',
      'Pratiquer des exercices de régulation',
      'Créer des routines apaisantes',
    ],
    capsuleType: 'free',
  },
  {
    title: 'Communication interpersonnelle',
    description: 'Améliorez vos relations professionnelles et personnelles.',
    about: 'Développez une communication claire, assertive et bienveillante.',
    level: 'intermediate',
    estimatedDuration: 75,
    price: 35,
    whatYouLearn: [
      'Écoute active',
      'Gérer les conversations difficiles',
      'Exprimer vos besoins avec clarté',
    ],
    capsuleType: 'regular',
  },
  {
    title: 'Motivation et élan',
    description: 'Retrouvez votre motivation et passez à l\'action.',
    about: 'Identifiez vos moteurs internes et transformez-les en actions concrètes.',
    level: 'beginner',
    estimatedDuration: 45,
    price: 29,
    whatYouLearn: [
      'Identifier vos sources d\'énergie',
      'Définir des objectifs réalistes',
      'Maintenir l\'élan dans la durée',
    ],
    capsuleType: 'regular',
  },
];

const capsulesData = [
  {
    categoryTitle: 'Web Development',
    capsules: [
      {
        title: 'Advanced React Patterns',
        level: TIndividualCapsuleLevel.advanced,
        description: 'Master advanced React concepts including hooks, performance optimization, and complex state management.',
        about: 'This capsule dives deep into React\'s advanced features, helping you build scalable and performant React applications.',
        price: 89,
        whatYouLearn: [
          'Advanced React Hooks (useReducer, useMemo, useCallback)',
          'Performance optimization techniques',
          'Complex state management with Context API',
          'Custom hooks development',
          'React patterns and anti-patterns',
        ],
        modules: [
          {
            title: 'Advanced Hooks',
            estimatedTime: '8 hours',
            orderNumber: 1,
            lessons: [
              {
                title: 'useReducer for Complex State',
                estimatedTime: '2 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/react-usereducer.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'useMemo and useCallback',
                estimatedTime: '2.5 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/react-usememo.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                title: 'Custom Hooks Patterns',
                estimatedTime: '3.5 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/react-custom-hooks.mp4',
                  duration: 12600,
                  status: 'ready',
                },
              },
            ],
          },
          {
            title: 'Performance Optimization',
            estimatedTime: '6 hours',
            orderNumber: 2,
            lessons: [
              {
                title: 'React.memo and PureComponent',
                estimatedTime: '2 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/react-memo.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Code Splitting',
                estimatedTime: '2 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/react-code-splitting.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Virtualization',
                estimatedTime: '2 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/react-virtualization.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
        ],
      },
      {
        title: 'Node.js Microservices',
        level: TIndividualCapsuleLevel.intermediate,
        description: 'Build scalable microservices architecture with Node.js, Docker, and Kubernetes.',
        about: 'Learn to design, develop, and deploy microservices using modern tools and best practices.',
        price: 129,
        whatYouLearn: [
          'Microservices architecture principles',
          'Docker containerization',
          'API Gateway patterns',
          'Service communication',
          'Database per service pattern',
        ],
        modules: [
          {
            title: 'Microservices Fundamentals',
            estimatedTime: '10 hours',
            orderNumber: 1,
            lessons: [
              {
                title: 'Monolith vs Microservices',
                estimatedTime: '2 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/microservices-intro.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Service Boundaries',
                estimatedTime: '3 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/service-boundaries.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'API Design',
                estimatedTime: '2.5 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/api-design.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                title: 'Service Discovery',
                estimatedTime: '2.5 hours',
                orderNumber: 4,
                lessonVideo: {
                  url: 'https://example.com/videos/service-discovery.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
            ],
          },
          {
            title: 'Containerization & Orchestration',
            estimatedTime: '12 hours',
            orderNumber: 2,
            lessons: [
              {
                title: 'Docker Fundamentals',
                estimatedTime: '3 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/docker-basics.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'Docker Compose',
                estimatedTime: '2 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/docker-compose.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Kubernetes Basics',
                estimatedTime: '4 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/kubernetes-basics.mp4',
                  duration: 14400,
                  status: 'ready',
                },
              },
              {
                title: 'Service Mesh',
                estimatedTime: '3 hours',
                orderNumber: 4,
                lessonVideo: {
                  url: 'https://example.com/videos/service-mesh.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    categoryTitle: 'Data Science',
    capsules: [
      {
        title: 'Machine Learning with Python',
        level: TIndividualCapsuleLevel.intermediate,
        description: 'Learn supervised and unsupervised machine learning algorithms using scikit-learn.',
        about: 'Master the fundamentals of machine learning and build predictive models with Python.',
        price: 149,
        whatYouLearn: [
          'Supervised learning algorithms',
          'Unsupervised learning techniques',
          'Model evaluation and validation',
          'Feature engineering',
          'Scikit-learn best practices',
        ],
        modules: [
          {
            title: 'Supervised Learning',
            estimatedTime: '12 hours',
            orderNumber: 1,
            lessons: [
              {
                title: 'Linear Regression',
                estimatedTime: '3 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/linear-regression.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'Logistic Regression',
                estimatedTime: '2.5 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/logistic-regression.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                title: 'Decision Trees',
                estimatedTime: '3 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/decision-trees.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'Random Forest',
                estimatedTime: '3.5 hours',
                orderNumber: 4,
                lessonVideo: {
                  url: 'https://example.com/videos/random-forest.mp4',
                  duration: 12600,
                  status: 'ready',
                },
              },
            ],
          },
          {
            title: 'Unsupervised Learning',
            estimatedTime: '10 hours',
            orderNumber: 2,
            lessons: [
              {
                title: 'K-Means Clustering',
                estimatedTime: '3 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/kmeans-clustering.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'Principal Component Analysis',
                estimatedTime: '3 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/pca.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'Dimensionality Reduction',
                estimatedTime: '2 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/dimensionality-reduction.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Anomaly Detection',
                estimatedTime: '2 hours',
                orderNumber: 4,
                lessonVideo: {
                  url: 'https://example.com/videos/anomaly-detection.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    categoryTitle: 'Mobile Development',
    capsules: [
      {
        title: 'React Native Cross-Platform Apps',
        level: TIndividualCapsuleLevel.beginner,
        description: 'Build native mobile apps for iOS and Android using React Native.',
        about: 'Learn to create beautiful, performant mobile applications that work on both platforms.',
        price: 99,
        whatYouLearn: [
          'React Native fundamentals',
          'Navigation patterns',
          'Native device features',
          'App store deployment',
          'Performance optimization',
        ],
        modules: [
          {
            title: 'React Native Basics',
            estimatedTime: '8 hours',
            orderNumber: 1,
            lessons: [
              {
                title: 'Setting up React Native',
                estimatedTime: '2 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/react-native-setup.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Components and Styling',
                estimatedTime: '3 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/react-native-components.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'State Management',
                estimatedTime: '3 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/react-native-state.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
            ],
          },
          {
            title: 'Navigation & APIs',
            estimatedTime: '10 hours',
            orderNumber: 2,
            lessons: [
              {
                title: 'React Navigation',
                estimatedTime: '3 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/react-navigation.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'REST API Integration',
                estimatedTime: '3 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/react-native-api.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'Async Storage',
                estimatedTime: '2 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/async-storage.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Push Notifications',
                estimatedTime: '2 hours',
                orderNumber: 4,
                lessonVideo: {
                  url: 'https://example.com/videos/push-notifications.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    categoryTitle: 'DevOps & Cloud',
    capsules: [
      {
        title: 'AWS Cloud Architecture',
        level: TIndividualCapsuleLevel.advanced,
        description: 'Design and implement scalable cloud architectures on Amazon Web Services.',
        about: 'Master AWS services and learn to build highly available, scalable cloud solutions.',
        price: 199,
        whatYouLearn: [
          'AWS core services (EC2, S3, RDS)',
          'Serverless architecture',
          'Infrastructure as Code',
          'Security best practices',
          'Cost optimization',
        ],
        modules: [
          {
            title: 'AWS Fundamentals',
            estimatedTime: '15 hours',
            orderNumber: 1,
            lessons: [
              {
                title: 'AWS Global Infrastructure',
                estimatedTime: '2 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-infrastructure.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'Identity and Access Management',
                estimatedTime: '3 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-iam.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'EC2 Instances',
                estimatedTime: '4 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-ec2.mp4',
                  duration: 14400,
                  status: 'ready',
                },
              },
              {
                title: 'S3 Storage',
                estimatedTime: '3 hours',
                orderNumber: 4,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-s3.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'RDS Databases',
                estimatedTime: '3 hours',
                orderNumber: 5,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-rds.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
            ],
          },
          {
            title: 'Serverless & DevOps',
            estimatedTime: '12 hours',
            orderNumber: 2,
            lessons: [
              {
                title: 'Lambda Functions',
                estimatedTime: '3 hours',
                orderNumber: 1,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-lambda.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'API Gateway',
                estimatedTime: '2 hours',
                orderNumber: 2,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-api-gateway.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                title: 'CloudFormation',
                estimatedTime: '3 hours',
                orderNumber: 3,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-cloudformation.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                title: 'CI/CD with CodePipeline',
                estimatedTime: '4 hours',
                orderNumber: 4,
                lessonVideo: {
                  url: 'https://example.com/videos/aws-codepipeline.mp4',
                  duration: 14400,
                  status: 'ready',
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

const seedIndividualCapsules = async () => {
  try {
    // Get admin user for adminId
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found. Please run admin seeder first.');
      return;
    }

    // Create categories first
    const categoryMap = new Map();

    for (const categoryData of categoriesData) {
      const existingCategory = await IndividualCapsuleCategory.findOne({ title: categoryData.title });
      if (existingCategory) {
        console.log(`Category "${categoryData.title}" already exists, skipping...`);
        categoryMap.set(categoryData.title, existingCategory._id);
        continue;
      }

      const category = await IndividualCapsuleCategory.create({
        ...categoryData,
      });

      categoryMap.set(category.title, category._id);
      console.log(`Created category: ${category.title}`);
    }

    // Create capsules
    for (const categoryGroup of capsulesData) {
      const categoryId = categoryMap.get(categoryGroup.categoryTitle);
      if (!categoryId) {
        console.log(`Category "${categoryGroup.categoryTitle}" not found, skipping capsules...`);
        continue;
      }

      for (const capsuleData of categoryGroup.capsules) {
        // Check if capsule already exists
        const existingCapsule = await IndividualCapsule.findOne({ title: capsuleData.title });
        if (existingCapsule) {
          console.log(`Capsule "${capsuleData.title}" already exists, skipping...`);
          continue;
        }

        // Create capsule
        const capsule = await IndividualCapsule.create({
          title: capsuleData.title,
          level: capsuleData.level,
          description: capsuleData.description,
          about: capsuleData.about,
          numberOfModules: capsuleData.modules.length,
          price: capsuleData.price,
          whatYouLearn: capsuleData.whatYouLearn,
          capsuleCategoryId: categoryId,
          adminId: adminUser._id,
        });

        console.log(`Created capsule: ${capsule.title}`);

        // Create modules and lessons
        for (const moduleData of capsuleData.modules) {
          const module = await IndividualModule.create({
            title: moduleData.title,
            numberOfLessons: moduleData.lessons.length,
            estimatedTime: moduleData.estimatedTime,
            capsuleId: capsule._id,
            orderNumber: moduleData.orderNumber,
          });

          console.log(`  Created module: ${module.title}`);

          for (const lessonData of moduleData.lessons) {
            await IndividualLesson.create({
              title: lessonData.title,
              estimatedTime: lessonData.estimatedTime,
              moduleId: module._id,
              orderNumber: lessonData.orderNumber,
              lessonVideo: lessonData.lessonVideo,
            });
          }

          console.log(`    Created ${moduleData.lessons.length} lessons for module`);
        }

        console.log(`Capsule "${capsule.title}" completed with ${capsuleData.modules.length} modules`);
      }
    }

    console.log('All individual capsules seeded successfully!');
  } catch (err) {
    console.error('Error seeding individual capsules:', err);
  }
};

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    await cleanExistingIndividualCapsuleData();
    await seedIndividualCapsules();
    console.log('--------------> Individual capsule seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};

seedDatabase();