//@ts-ignore
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
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

const questionariesData = [
  {
    title: 'Identification',
    brief: 'Discovering who is at the helm of the vessel',
    topic: 'Identification',
    questions: [
      {
        title: 'What is your name?',
        type: TQuestionType.textInput,
        helperText: 'Enter your full name',
      },
      {
        title: 'What is your email address?',
        type: TQuestionType.textInput,
        helperText: 'Enter a valid email address',
      },
      {
        title: 'What is your phone number?',
        type: TQuestionType.textInput,
        helperText: 'Enter your phone number',
      },
      {
        title: 'How would you describe yourself in one sentence?',
        type: TQuestionType.textArea,
        helperText: 'A brief description of who you are',
      },
      {
        title: 'What is your date of birth?',
        type: TQuestionType.textInput,
        helperText: 'Enter your date of birth (YYYY-MM-DD)',
      },
      {
        title: 'What is your current location (city/country)?',
        type: TQuestionType.textInput,
        helperText: 'Enter your current location',
      },
    ],
  },
  {
    title: 'Current Situation',
    brief: 'Observe your daily work without judgment',
    topic: 'Current Situation',
    questions: [
      {
        title: 'What is your current occupation?',
        type: TQuestionType.textInput,
        helperText: 'Your current job title or role',
      },
      {
        title: 'How many years of work experience do you have?',
        type: TQuestionType.single,
        helperText: 'Select your experience level',
        options: [
          { sl: 1, details: 'Less than 1 year' },
          { sl: 2, details: '1-3 years' },
          { sl: 3, details: '3-5 years' },
          { sl: 4, details: '5-10 years' },
          { sl: 5, details: 'More than 10 years' },
        ],
      },
      {
        title: 'What industry are you currently working in?',
        type: TQuestionType.single,
        helperText: 'Select your industry',
        options: [
          { sl: 1, details: 'Technology' },
          { sl: 2, details: 'Healthcare' },
          { sl: 3, details: 'Education' },
          { sl: 4, details: 'Finance' },
          { sl: 5, details: 'Retail' },
          { sl: 6, details: 'Manufacturing' },
          { sl: 7, details: 'Marketing' },
          { sl: 8, details: 'Other' },
        ],
      },
      {
        title: 'Are you currently employed?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Full-time employed' },
          { sl: 2, details: 'Part-time employed' },
          { sl: 3, details: 'Self-employed' },
          { sl: 4, details: 'Unemployed' },
          { sl: 5, details: 'Student' },
        ],
      },
      {
        title: 'What is your current job role?',
        type: TQuestionType.textInput,
        helperText: 'Describe your specific role',
      },
      {
        title: 'Who do you work for?',
        type: TQuestionType.textInput,
        helperText: 'Company or organization name',
      },
    ],
  },
  {
    title: 'Values',
    brief: 'Identify the values that give your work meaning',
    topic: 'Values',
    questions: [
      {
        title: 'What values are most important to you in your career?',
        type: TQuestionType.multi,
        helperText: 'Select all that apply',
        options: [
          { sl: 1, details: 'Work-life balance' },
          { sl: 2, details: 'Financial stability' },
          { sl: 3, details: 'Personal growth' },
          { sl: 4, details: 'Making an impact' },
          { sl: 5, details: 'Creative freedom' },
          { sl: 6, details: 'Team collaboration' },
          { sl: 7, details: 'Independence' },
          { sl: 8, details: 'Recognition' },
        ],
      },
      {
        title: 'What motivates you the most in your work?',
        type: TQuestionType.textArea,
        helperText: 'Describe what drives you professionally',
      },
      {
        title: 'Which work environment do you prefer?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Remote work' },
          { sl: 2, details: 'Office-based' },
          { sl: 3, details: 'Hybrid' },
          { sl: 4, details: 'Flexible - depends on the task' },
        ],
      },
      {
        title: 'What type of projects inspire you?',
        type: TQuestionType.multi,
        options: [
          { sl: 1, details: 'Innovative projects' },
          { sl: 2, details: 'Social impact projects' },
          { sl: 3, details: 'Profit-driven projects' },
          { sl: 4, details: 'Research & development' },
          { sl: 5, details: 'Creative/artistic projects' },
        ],
      },
      {
        title: 'How do you define success in your career?',
        type: TQuestionType.textArea,
        helperText: 'Your definition of career success',
      },
    ],
  },
  {
    title: 'FutureWork',
    brief: 'Envision your ideal professional future',
    topic: 'FutureWork',
    questions: [
      {
        title: 'Where do you see yourself in 5 years?',
        type: TQuestionType.textArea,
        helperText: 'Describe your long-term career goals',
      },
      {
        title: 'What type of work do you want to do in the future?',
        type: TQuestionType.single,
        helperText: 'Select your preferred work type',
        options: [
          { sl: 1, details: 'Full-time employment' },
          { sl: 2, details: 'Freelancing' },
          { sl: 3, details: 'Entrepreneurship' },
          { sl: 4, details: 'Consulting' },
          { sl: 5, details: 'Teaching/Mentoring' },
          { sl: 6, details: 'Not sure' },
        ],
      },
      {
        title: 'What industry would you like to transition to?',
        type: TQuestionType.single,
        helperText: 'Select your target industry',
        options: [
          { sl: 1, details: 'Technology' },
          { sl: 2, details: 'Healthcare' },
          { sl: 3, details: 'Education' },
          { sl: 4, details: 'Finance' },
          { sl: 5, details: 'E-commerce' },
          { sl: 6, details: 'Sustainability' },
          { sl: 7, details: 'Entertainment' },
          { sl: 8, details: 'Same industry' },
        ],
      },
      {
        title: 'What is your ultimate career goal?',
        type: TQuestionType.textArea,
        helperText: 'Your biggest professional aspiration',
      },
      {
        title: 'What role level are you targeting?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Entry level' },
          { sl: 2, details: 'Mid-level' },
          { sl: 3, details: 'Senior level' },
          { sl: 4, details: 'Management' },
          { sl: 5, details: 'Executive/C-Level' },
          { sl: 6, details: 'Entrepreneur' },
        ],
      },
    ],
  },
  {
    title: 'Work Conditions',
    brief: 'Future vision & ideal job',
    topic: 'Work Conditions',
    questions: [
      {
        title: 'What is your current monthly income range?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Less than $500' },
          { sl: 2, details: '$500 - $1000' },
          { sl: 3, details: '$1000 - $3000' },
          { sl: 4, details: '$3000 - $5000' },
          { sl: 5, details: 'More than $5000' },
          { sl: 6, details: 'Prefer not to say' },
        ],
      },
      {
        title: 'Are you willing to invest in your education/career development?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Yes, fully' },
          { sl: 2, details: 'Yes, but with limitations' },
          { sl: 3, details: 'No, I cannot afford it' },
          { sl: 4, details: 'Depends on the return on investment' },
        ],
      },
      {
        title: 'How many hours per week can you dedicate to learning?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Less than 5 hours' },
          { sl: 2, details: '5-10 hours' },
          { sl: 3, details: '10-20 hours' },
          { sl: 4, details: 'More than 20 hours' },
        ],
      },
      {
        title: 'What is your preferred salary range for your next role?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Less than $30,000' },
          { sl: 2, details: '$30,000 - $50,000' },
          { sl: 3, details: '$50,000 - $80,000' },
          { sl: 4, details: '$80,000 - $120,000' },
          { sl: 5, details: 'More than $120,000' },
          { sl: 6, details: 'Open to negotiation' },
        ],
      },
      {
        title: 'What benefits are important to you?',
        type: TQuestionType.multi,
        options: [
          { sl: 1, details: 'Health insurance' },
          { sl: 2, details: 'Remote work options' },
          { sl: 3, details: 'Paid time off' },
          { sl: 4, details: 'Stock options/Equity' },
          { sl: 5, details: 'Professional development budget' },
          { sl: 6, details: 'Flexible hours' },
        ],
      },
      {
        title: 'Do you have any financial constraints?',
        type: TQuestionType.textArea,
        helperText: 'Any constraints that might affect your career decisions',
      },
    ],
  },
  {
    title: 'Work Style',
    brief: "Discover your instinctive way of working",
    topic: 'Work Style',
    questions: [
      {
        title: 'How do you prefer to work on projects?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Independently' },
          { sl: 2, details: 'In a team' },
          { sl: 3, details: 'Mix of both' },
          { sl: 4, details: 'Depends on the project' },
        ],
      },
      {
        title: 'What is your preferred method of communication?',
        type: TQuestionType.multi,
        options: [
          { sl: 1, details: 'Email' },
          { sl: 2, details: 'Video calls' },
          { sl: 3, details: 'Instant messaging' },
          { sl: 4, details: 'In-person meetings' },
          { sl: 5, details: 'Phone calls' },
        ],
      },
      {
        title: 'How do you handle deadlines?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'I complete tasks well before the deadline' },
          { sl: 2, details: 'I complete tasks just before the deadline' },
          { sl: 3, details: 'I sometimes need extensions' },
          { sl: 4, details: 'I work best under pressure' },
        ],
      },
      {
        title: 'Describe your ideal work culture',
        type: TQuestionType.textArea,
        helperText: 'What type of environment helps you thrive',
      },
      {
        title: 'How do you prefer to receive feedback?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Face-to-face' },
          { sl: 2, details: 'Written feedback' },
          { sl: 3, details: 'Real-time feedback' },
          { sl: 4, details: 'During performance reviews' },
        ],
      },
      {
        title: 'What type of leader do you prefer to work with?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Directive - tells me what to do' },
          { sl: 2, details: 'Supportive - guides and supports' },
          { sl: 3, details: 'Collaborative - works together as a team' },
          { sl: 4, details: 'Autonomous - gives me freedom' },
        ],
      },
    ],
  },
  {
    title: 'Skills',
    brief: 'Define the support you need to move forward',
    topic: 'Skills',
    questions: [
      {
        title: 'What are your top technical skills?',
        type: TQuestionType.textArea,
        helperText: 'List your technical competencies',
      },
      {
        title: 'What are your top soft skills?',
        type: TQuestionType.textArea,
        helperText: 'e.g., Communication, Leadership, Problem-solving',
      },
      {
        title: 'What programming languages are you proficient in?',
        type: TQuestionType.multi,
        options: [
          { sl: 1, details: 'JavaScript' },
          { sl: 2, details: 'Python' },
          { sl: 3, details: 'Java' },
          { sl: 4, details: 'C++' },
          { sl: 5, details: 'Go' },
          { sl: 6, details: 'Rust' },
          { sl: 7, details: 'TypeScript' },
          { sl: 8, details: 'None' },
        ],
      },
      {
        title: 'What tools and software are you experienced with?',
        type: TQuestionType.textArea,
        helperText: 'List relevant tools and software',
      },
      {
        title: 'What skills would you like to develop?',
        type: TQuestionType.textArea,
        helperText: 'Skills you want to learn or improve',
      },
      {
        title: 'What areas do you need the most support in?',
        type: TQuestionType.multi,
        options: [
          { sl: 1, details: 'Technical skills' },
          { sl: 2, details: 'Communication' },
          { sl: 3, details: 'Leadership' },
          { sl: 4, details: 'Time management' },
          { sl: 5, details: 'Networking' },
          { sl: 6, details: 'Job search strategies' },
          { sl: 7, details: 'Interview skills' },
        ],
      },
      {
        title: 'Do you have any certifications?',
        type: TQuestionType.textArea,
        helperText: 'List any relevant certifications',
      },
      {
        title: 'What is your educational background?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'High school' },
          { sl: 2, details: 'Some college' },
          { sl: 3, details: "Bachelor's degree" },
          { sl: 4, details: "Master's degree" },
          { sl: 5, details: 'PhD' },
          { sl: 6, details: 'Bootcamp/Certification' },
        ],
      },
    ],
  },
];

const seedFreeQuestions = async () => {
  try {
    await Questionary.deleteMany({ category: TQuestionaryCategory.free });
    console.log('Deleted existing free category questionaries');

    await Question.deleteMany({});
    console.log('Deleted existing questions');

    let globalSl = 1;
    for (const qData of questionariesData) {
      const questionary = await Questionary.create({
        title: qData.title,
        brief: qData.brief,
        category: TQuestionaryCategory.free,
      });
      console.log(`Created questionary: ${qData.title} (${questionary._id})`);

      for (const q of qData.questions) {
        await Question.create({
          questionaryId: questionary._id,
          sl: globalSl,
          title: q.title,
          type: q.type,
          helperText: q.helperText || undefined,
          options: q.options || [],
        });
        globalSl++;
      }
      console.log(`Added ${qData.questions.length} questions for: ${qData.title}`);
    }

    console.log('Free category questions seeded successfully!');
  } catch (err) {
    console.error('Error seeding free questions:', err);
  }
};

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    await seedFreeQuestions();
    console.log('---------------> Free questions seeding completed <---------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};

seedDatabase();