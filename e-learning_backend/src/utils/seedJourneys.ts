//@ts-ignore
import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../modules/user.module/user/user.model';
import { Journey } from '../modules/journey.module/journey/journey.model';
import { JourneyCapsule } from '../modules/journey.module/journey-capsule/journey-capsule.model';
import { JourneyModule } from '../modules/journey.module/journey-module/journey-module.model';
import { JourneyLesson } from '../modules/journey.module/journey-lesson/journey-lesson.model';
import { Questionary } from '../modules/question.module/questionary/questionary.model';
import { Question } from '../modules/question.module/question/question.model';
import { TQuestionaryCategory } from '../modules/question.module/question.constant';
import { TQuestionType } from '../modules/question.module/question.constant';

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

const cleanExistingJourneyData = async () => {
  console.log('Cleaning existing journey data...');

  await JourneyLesson.deleteMany({});
  console.log('Deleted journey lessons');

  await JourneyModule.deleteMany({});
  console.log('Deleted journey modules');

  await JourneyCapsule.deleteMany({});
  console.log('Deleted journey capsules');

  await Journey.deleteMany({});
  console.log('Deleted journeys');

  await Questionary.deleteMany({ category: TQuestionaryCategory.capsule });
  await Questionary.deleteMany({ category: TQuestionaryCategory.module });
  console.log('Deleted questionaries');
};

const journeysData = [
  {
    title: 'Full Stack Web Development Journey',
    price: 299,
    roadMapBrief:
      'Complete guide to becoming a full-stack developer from basics to advanced concepts',
    description:
      "This comprehensive journey covers everything you need to know to build modern web applications. From HTML/CSS basics to advanced backend architectures, you'll learn to create production-ready applications.",
    capsules: [
      {
        capsuleNumber: 1,
        title: 'Frontend Fundamentals',
        roadMapBrief: 'Master HTML, CSS, and JavaScript fundamentals',
        description:
          'Learn the building blocks of web development with modern HTML5, CSS3, and ES6+ JavaScript.',
        estimatedTime: '4 weeks',
        introduction: {
          title: 'Welcome to Frontend Development',
          estimatedTime: '30 mins',
          roadMapBrief: 'Introduction to web development concepts',
          description:
            'Get started with your frontend development journey and understand the modern web landscape.',
        },
        modules: [
          {
            sl: 1,
            title: 'HTML5 & Semantic Markup',
            roadMapBrief: 'Learn modern HTML5 and semantic elements',
            description:
              'Master HTML5 tags, semantic markup, and accessibility best practices.',
            estimatedTime: '1 week',
            lessons: [
              {
                sl: 1,
                title: 'Introduction to HTML',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/html-intro.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'HTML5 Semantic Elements',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/html5-semantic.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Forms and Input Validation',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/html-forms.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'HTML5 APIs',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/html5-apis.mp4',
                  duration: 7200,
                  status: 'processing',
                },
              },
            ],
          },
          {
            sl: 2,
            title: 'CSS3 & Modern Styling',
            roadMapBrief: 'Master CSS3 with Flexbox and Grid',
            description:
              'Learn responsive design, CSS Grid, Flexbox, and modern styling techniques.',
            estimatedTime: '1.5 weeks',
            lessons: [
              {
                sl: 1,
                title: 'CSS Fundamentals',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/css-fundamentals.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'CSS Box Model',
                estimatedTime: '1.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/css-box-model.mp4',
                  duration: 5400,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Flexbox Layout',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/css-flexbox.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'CSS Grid',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/css-grid.mp4',
                  duration: 10800,
                  status: 'processing',
                },
              },
              {
                sl: 5,
                title: 'Responsive Design',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/css-responsive.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
            ],
          },
          {
            sl: 3,
            title: 'JavaScript ES6+',
            roadMapBrief: 'Modern JavaScript programming',
            description:
              'Master ES6+ features, asynchronous programming, and JavaScript fundamentals.',
            estimatedTime: '1.5 weeks',
            lessons: [
              {
                sl: 1,
                title: 'JavaScript Basics',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/js-basics.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'ES6 Features',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/js-es6.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Asynchronous JavaScript',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/js-async.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'DOM Manipulation',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/js-dom.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
        ],
        questions: [
          {
            title: 'Frontend Fundamentals Assessment',
            questions: [
              {
                sl: 1,
                title: 'What is the purpose of semantic HTML elements?',
                type: TQuestionType.single,
                options: [
                  {
                    sl: 1,
                    details: 'To make the code look prettier',
                    isCorrect: false,
                  },
                  {
                    sl: 2,
                    details:
                      'To provide meaning to the content for browsers and developers',
                    isCorrect: true,
                  },
                  { sl: 3, details: 'To create animations', isCorrect: false },
                  { sl: 4, details: 'To store data locally', isCorrect: false },
                ],
              },
              {
                sl: 2,
                title: 'Which CSS property is used for responsive design?',
                type: TQuestionType.single,
                options: [
                  { sl: 1, details: 'margin', isCorrect: false },
                  { sl: 2, details: 'padding', isCorrect: false },
                  { sl: 3, details: 'media queries', isCorrect: true },
                  { sl: 4, details: 'border', isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        capsuleNumber: 2,
        title: 'React.js Mastery',
        roadMapBrief: 'Build modern user interfaces with React',
        description:
          'Learn React from basics to advanced patterns, including hooks, context, and performance optimization.',
        estimatedTime: '5 weeks',
        introduction: {
          title: 'React Ecosystem Overview',
          estimatedTime: '45 mins',
          roadMapBrief: 'Understanding React and its ecosystem',
          description:
            'Explore the React ecosystem, JSX, components, and modern frontend development practices.',
        },
        modules: [
          {
            sl: 1,
            title: 'React Fundamentals',
            roadMapBrief: 'Core React concepts and JSX',
            description:
              "Learn components, JSX, props, state, and React's declarative programming model.",
            estimatedTime: '2 weeks',
            lessons: [
              {
                sl: 1,
                title: 'Introduction to React',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-intro.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'JSX and Components',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-jsx.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Props and State',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-props-state.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'Event Handling',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-events.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 5,
                title: 'Conditional Rendering',
                estimatedTime: '1.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-conditional.mp4',
                  duration: 5400,
                  status: 'ready',
                },
              },
            ],
          },
          {
            sl: 2,
            title: 'Advanced React Patterns',
            roadMapBrief: 'Hooks, context, and performance',
            description:
              'Master React hooks, context API, and performance optimization techniques.',
            estimatedTime: '3 weeks',
            lessons: [
              {
                sl: 1,
                title: 'React Hooks',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-hooks.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'Custom Hooks',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-custom-hooks.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Context API',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-context.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'Performance Optimization',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-performance.mp4',
                  duration: 10800,
                  status: 'processing',
                },
              },
              {
                sl: 5,
                title: 'Error Boundaries',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/react-errors.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
        ],
        questions: [
          {
            title: 'React Mastery Assessment',
            questions: [
              {
                sl: 1,
                title: 'What is JSX?',
                type: TQuestionType.single,
                options: [
                  {
                    sl: 1,
                    details: 'A JavaScript framework',
                    isCorrect: false,
                  },
                  {
                    sl: 2,
                    details: 'A syntax extension for JavaScript',
                    isCorrect: true,
                  },
                  { sl: 3, details: 'A CSS preprocessor', isCorrect: false },
                  {
                    sl: 4,
                    details: 'A database query language',
                    isCorrect: false,
                  },
                ],
              },
              {
                sl: 2,
                title: 'Which hook is used for side effects in React?',
                type: TQuestionType.single,
                options: [
                  { sl: 1, details: 'useState', isCorrect: false },
                  { sl: 2, details: 'useEffect', isCorrect: true },
                  { sl: 3, details: 'useContext', isCorrect: false },
                  { sl: 4, details: 'useReducer', isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        capsuleNumber: 3,
        title: 'Backend Development with Node.js',
        roadMapBrief: 'Server-side JavaScript development',
        description:
          'Learn Node.js, Express, databases, and API development for full-stack applications.',
        estimatedTime: '6 weeks',
        introduction: {
          title: 'Server-Side JavaScript',
          estimatedTime: '40 mins',
          roadMapBrief: 'Introduction to backend development',
          description:
            'Understand server-side programming, APIs, and the role of backend in web applications.',
        },
        modules: [
          {
            sl: 1,
            title: 'Node.js Fundamentals',
            roadMapBrief: 'Core Node.js concepts',
            description:
              'Learn Node.js runtime, modules, file system, and asynchronous programming.',
            estimatedTime: '2 weeks',
            lessons: [
              {
                sl: 1,
                title: 'Introduction to Node.js',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/nodejs-intro.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'Modules and NPM',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/nodejs-modules.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'File System Operations',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/nodejs-fs.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'Asynchronous Programming',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/nodejs-async.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
            ],
          },
          {
            sl: 2,
            title: 'Express.js Framework',
            roadMapBrief: 'Building APIs with Express',
            description:
              'Master Express.js for creating robust REST APIs and web applications.',
            estimatedTime: '2 weeks',
            lessons: [
              {
                sl: 1,
                title: 'Express Basics',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/express-basics.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'Routing',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/express-routing.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Middleware',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/express-middleware.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'Error Handling',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/express-errors.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
          {
            sl: 3,
            title: 'Database Integration',
            roadMapBrief: 'MongoDB and Mongoose',
            description:
              'Learn MongoDB, Mongoose ODM, and database design for Node.js applications.',
            estimatedTime: '2 weeks',
            lessons: [
              {
                sl: 1,
                title: 'MongoDB Basics',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/mongodb-basics.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'Mongoose ODM',
                estimatedTime: '3 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/mongoose-odm.mp4',
                  duration: 10800,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Data Modeling',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/data-modeling.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'CRUD Operations',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/crud-operations.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
            ],
          },
        ],
        questions: [
          {
            title: 'Backend Development Assessment',
            questions: [
              {
                sl: 1,
                title: 'What is Node.js?',
                type: TQuestionType.single,
                options: [
                  { sl: 1, details: 'A frontend framework', isCorrect: false },
                  { sl: 2, details: 'A JavaScript runtime', isCorrect: true },
                  { sl: 3, details: 'A database', isCorrect: false },
                  { sl: 4, details: 'A CSS library', isCorrect: false },
                ],
              },
              {
                sl: 2,
                title: 'Which HTTP method is used to create resources?',
                type: TQuestionType.single,
                options: [
                  { sl: 1, details: 'GET', isCorrect: false },
                  { sl: 2, details: 'POST', isCorrect: true },
                  { sl: 3, details: 'PUT', isCorrect: false },
                  { sl: 4, details: 'DELETE', isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Data Science with Python',
    price: 349,
    roadMapBrief:
      'Complete data science journey from Python basics to machine learning',
    description:
      'Master Python programming, data analysis, visualization, and machine learning algorithms.',
    capsules: [
      {
        capsuleNumber: 1,
        title: 'Python Programming Fundamentals',
        roadMapBrief: 'Master Python basics and data structures',
        description:
          'Learn Python syntax, data structures, functions, and object-oriented programming.',
        estimatedTime: '3 weeks',
        introduction: {
          title: 'Python for Data Science',
          estimatedTime: '25 mins',
          roadMapBrief: 'Why Python for data science',
          description:
            "Understand Python's role in data science and the ecosystem of libraries.",
        },
        modules: [
          {
            sl: 1,
            title: 'Python Programming Fundamentals',
            roadMapBrief: 'Variables, data types, and control flow',
            description:
              'Learn Python syntax, variables, data types, and control structures.',
            estimatedTime: '1 week',
            lessons: [
              {
                sl: 1,
                title: 'Python Installation and Setup',
                estimatedTime: '1 hour',
                lessonVideo: {
                  url: 'https://example.com/videos/python-setup.mp4',
                  duration: 3600,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'Variables and Data Types',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-variables.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Control Flow',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-control-flow.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'Functions',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-functions.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
          {
            sl: 2,
            title: 'Data Structures',
            roadMapBrief: 'Lists, tuples, dictionaries, and sets',
            description:
              "Master Python's built-in data structures and their operations.",
            estimatedTime: '1 week',
            lessons: [
              {
                sl: 1,
                title: 'Lists and Tuples',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-lists-tuples.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'Dictionaries',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-dictionaries.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Sets',
                estimatedTime: '1.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-sets.mp4',
                  duration: 5400,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'List Comprehensions',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-comprehensions.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
            ],
          },
          {
            sl: 3,
            title: 'Object-Oriented Programming',
            roadMapBrief: 'Classes, objects, and inheritance',
            description:
              'Learn OOP concepts in Python for better code organization.',
            estimatedTime: '1 week',
            lessons: [
              {
                sl: 1,
                title: 'Classes and Objects',
                estimatedTime: '2.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-classes.mp4',
                  duration: 9000,
                  status: 'ready',
                },
              },
              {
                sl: 2,
                title: 'Inheritance',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-inheritance.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 3,
                title: 'Polymorphism',
                estimatedTime: '2 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-polymorphism.mp4',
                  duration: 7200,
                  status: 'ready',
                },
              },
              {
                sl: 4,
                title: 'Exception Handling',
                estimatedTime: '1.5 hours',
                lessonVideo: {
                  url: 'https://example.com/videos/python-exceptions.mp4',
                  duration: 5400,
                  status: 'ready',
                },
              },
            ],
          },
        ],
        questions: [
          {
            title: 'Python Fundamentals Assessment',
            questions: [
              {
                sl: 1,
                title: 'What is the output of print(type([]))?',
                type: TQuestionType.single,
                options: [
                  { sl: 1, details: 'list', isCorrect: true },
                  { sl: 2, details: 'tuple', isCorrect: false },
                  { sl: 3, details: 'dict', isCorrect: false },
                  { sl: 4, details: 'set', isCorrect: false },
                ],
              },
              {
                sl: 2,
                title: 'Which of these is NOT a Python data type?',
                type: TQuestionType.single,
                options: [
                  { sl: 1, details: 'int', isCorrect: false },
                  { sl: 2, details: 'str', isCorrect: false },
                  { sl: 3, details: 'array', isCorrect: true },
                  { sl: 4, details: 'bool', isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const seedJourneys = async () => {
  try {
    // Get admin user for adminId
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found. Please run admin seeder first.');
      return;
    }

    for (const journeyData of journeysData) {
      // Check if journey already exists
      const existingJourney = await Journey.findOne({
        title: journeyData.title,
      });
      if (existingJourney) {
        console.log(
          `Journey "${journeyData.title}" already exists, skipping...`,
        );
        continue;
      }

      // Create journey
      const journey = await Journey.create({
        adminId: adminUser._id,
        numberOfCapsule: journeyData.capsules.length,
        price: journeyData.price,
        title: journeyData.title,
        roadMapBrief: journeyData.roadMapBrief,
        description: journeyData.description,
        isActive: true,
      });

      console.log(`Created journey: ${journey.title}`);

      let totalModules = 0;

      for (const capsuleData of journeyData.capsules) {
        // Create questionary for capsule if questions exist
        let capsuleQuestionaryId = null;
        if (capsuleData.questions && capsuleData.questions.length > 0) {
          const questionaryData = capsuleData.questions[0];
          if (questionaryData) {
            const questionary = await Questionary.create({
              title: questionaryData.title,
              brief: `Assessment for ${capsuleData.title}`,
              category: TQuestionaryCategory.capsule,
              referenceId: null, // Will update after capsule creation
            });

            // Create questions
            for (const questionData of questionaryData.questions) {
              await Question.create({
                questionaryId: questionary._id,
                sl: questionData.sl,
                title: questionData.title,
                type: questionData.type,
                options: questionData.options,
              });
            }

            capsuleQuestionaryId = questionary._id;
          }
        }

        // Create capsule
        const capsule = await JourneyCapsule.create({
          capsuleNumber: capsuleData.capsuleNumber,
          title: capsuleData.title,
          roadMapBrief: capsuleData.roadMapBrief,
          description: capsuleData.description,
          estimatedTime: capsuleData.estimatedTime,
          journeyId: journey._id,
          totalModule: capsuleData.modules.length,
          adminId: adminUser._id,
          introduction: capsuleData.introduction,
          questionaryId: capsuleQuestionaryId,
        });

        if (capsuleQuestionaryId) {
          await Questionary.findByIdAndUpdate(capsuleQuestionaryId, {
            referenceId: capsule._id,
          });
        }

        console.log(`  Created capsule: ${capsule.title}`);

        for (const moduleData of capsuleData.modules) {
          // Create questionary for module if needed (optional)
          let moduleQuestionaryId = null;

          // Create module
          const module = await JourneyModule.create({
            sl: moduleData.sl,
            title: moduleData.title,
            roadMapBrief: moduleData.roadMapBrief,
            description: moduleData.description,
            estimatedTime: moduleData.estimatedTime,
            capsuleId: capsule._id,
            questionaryId: moduleQuestionaryId,
            orderNumber: moduleData.sl,
          });

          console.log(`    Created module: ${module.title}`);

          for (const lessonData of moduleData.lessons) {
            await JourneyLesson.create({
              sl: lessonData.sl,
              title: lessonData.title,
              moduleId: module._id,
              estimatedTime: lessonData.estimatedTime,
              orderNumber: lessonData.sl,
              lessonVideo: lessonData.lessonVideo,
            });
          }

          console.log(
            `      Created ${moduleData.lessons.length} lessons for module`,
          );
        }

        totalModules += capsuleData.modules.length;
      }

      // Update journey with total capsules and modules
      await Journey.findByIdAndUpdate(journey._id, {
        totalCapsules: journeyData.capsules.length,
      });

      console.log(
        `Journey "${journey.title}" completed with ${journeyData.capsules.length} capsules and ${totalModules} modules`,
      );
    }

    console.log('All journeys seeded successfully!');
  } catch (err) {
    console.error('Error seeding journeys:', err);
  }
};

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    await cleanExistingJourneyData();
    await seedJourneys();
    console.log('--------------> Journey seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};

seedDatabase();
