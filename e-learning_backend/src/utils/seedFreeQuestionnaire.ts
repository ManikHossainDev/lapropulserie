/**
 * Seed the 7-step free onboarding questionnaires for students.
 *
 * Run:  npm run seedFreeQuestionnaire
 *
 * - Removes existing `free` category questionaries + their questions
 * - Inserts 7 sections (matches student /students/all-questions steps)
 * - Does NOT delete module/capsule questionaries
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../config';
import { Questionary } from '../modules/question.module/questionary/questionary.model';
import { Question } from '../modules/question.module/question/question.model';
import {
  TQuestionaryCategory,
  TQuestionType,
} from '../modules/question.module/question.constant';

dotenv.config();

type SeedOption = { sl: number; details: string };
type SeedQuestion = {
  title: string;
  type: TQuestionType;
  helperText?: string;
  options?: SeedOption[];
};
type SeedSection = {
  title: string;
  brief: string;
  questions: SeedQuestion[];
};

/** 7 sections — one per student questionnaire step */
const FREE_QUESTIONNAIRE_SECTIONS: SeedSection[] = [
  {
    title: 'Identification',
    brief: 'Tell us a little about who you are.',
    questions: [
      {
        title: 'What should we call you?',
        type: TQuestionType.textInput,
        helperText: 'Your first name or preferred name',
      },
      {
        title: 'Which best describes you right now?',
        type: TQuestionType.single,
        helperText: 'Choose the option that fits best',
        options: [
          { sl: 1, details: 'Student' },
          { sl: 2, details: 'Employed professional' },
          { sl: 3, details: 'Career changer' },
          { sl: 4, details: 'Entrepreneur' },
        ],
      },
    ],
  },
  {
    title: 'Current Situation',
    brief: 'Where are you in your career today?',
    questions: [
      {
        title: 'How many years of professional experience do you have?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Less than 2 years' },
          { sl: 2, details: '2–5 years' },
          { sl: 3, details: '5–10 years' },
          { sl: 4, details: 'More than 10 years' },
        ],
      },
      {
        title: 'Briefly describe your current situation',
        type: TQuestionType.textArea,
        helperText: 'Role, industry, or what you are exploring',
      },
    ],
  },
  {
    title: 'Values',
    brief: 'What matters most to you in your work?',
    questions: [
      {
        title: 'Which values guide your career choices?',
        type: TQuestionType.multi,
        helperText: "Select up to 4 / Sélectionnez jusqu'à 4 réponses",
        options: [
          { sl: 1, details: 'Autonomy' },
          { sl: 2, details: 'Impact' },
          { sl: 3, details: 'Creativity' },
          { sl: 4, details: 'Stability' },
          { sl: 5, details: 'Growth' },
          { sl: 6, details: 'Balance' },
        ],
      },
    ],
  },
  {
    title: 'Idea Future',
    brief: 'Picture where you want to go next.',
    questions: [
      {
        title: 'Where would you like to be in 3 years?',
        type: TQuestionType.textArea,
        helperText: 'Describe your ideal professional future',
      },
      {
        title: 'What is your main career goal right now?',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Find clarity on direction' },
          { sl: 2, details: 'Change career or role' },
          { sl: 3, details: 'Grow in current path' },
          { sl: 4, details: 'Build my own project' },
        ],
      },
    ],
  },
  {
    title: 'Work Conditions',
    brief: 'What environment helps you do your best work?',
    questions: [
      {
        title: 'Preferred work setup',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Remote' },
          { sl: 2, details: 'Hybrid' },
          { sl: 3, details: 'On-site' },
          { sl: 4, details: 'Flexible / no preference' },
        ],
      },
      {
        title: 'Hours per week you can dedicate to learning',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Less than 3 hours' },
          { sl: 2, details: '3–5 hours' },
          { sl: 3, details: '5–10 hours' },
          { sl: 4, details: 'More than 10 hours' },
        ],
      },
    ],
  },
  {
    title: 'Work Style',
    brief: 'How do you naturally approach work and learning?',
    questions: [
      {
        title: 'You work best when…',
        type: TQuestionType.single,
        options: [
          { sl: 1, details: 'Working independently' },
          { sl: 2, details: 'Collaborating in a team' },
          { sl: 3, details: 'Mix of both' },
          { sl: 4, details: 'With clear structure and deadlines' },
        ],
      },
      {
        title: 'Describe your ideal mentor or coach',
        type: TQuestionType.textArea,
        helperText: 'What support style would help you most?',
      },
    ],
  },
  {
    title: 'Skills',
    brief: 'What do you bring — and what do you want to build?',
    questions: [
      {
        title: 'Your strongest skills today',
        type: TQuestionType.textArea,
        helperText: 'Technical and soft skills welcome',
      },
      {
        title: 'Skills you most want to develop',
        type: TQuestionType.multi,
        helperText: 'Select up to 4',
        options: [
          { sl: 1, details: 'Leadership' },
          { sl: 2, details: 'Communication' },
          { sl: 3, details: 'Strategic thinking' },
          { sl: 4, details: 'Technical / digital skills' },
          { sl: 5, details: 'Confidence & mindset' },
          { sl: 6, details: 'Networking' },
        ],
      },
    ],
  },
];

export const seedFreeQuestionnaire = async () => {
  const existingFree = await Questionary.find({
    category: TQuestionaryCategory.free,
  }).select('_id');

  const freeIds = existingFree.map(q => q._id);

  if (freeIds.length > 0) {
    await Question.deleteMany({ questionaryId: { $in: freeIds } });
    console.info(`Removed questions for ${freeIds.length} free questionaries`);
  }

  const deletedQuestionaries = await Questionary.deleteMany({
    category: TQuestionaryCategory.free,
  });
  console.info(
    `Removed ${deletedQuestionaries.deletedCount} free questionaries`,
  );

  for (const section of FREE_QUESTIONNAIRE_SECTIONS) {
    const questionary = await Questionary.create({
      title: section.title,
      brief: section.brief,
      category: TQuestionaryCategory.free,
    });

    for (let i = 0; i < section.questions.length; i++) {
      const q = section.questions[i]!;
      await Question.create({
        questionaryId: questionary._id,
        sl: i + 1,
        title: q.title,
        type: q.type,
        helperText: q.helperText,
        options: q.options ?? [],
      });
    }

    console.info(
      `Created "${section.title}" with ${section.questions.length} question(s)`,
    );
  }

  console.info('Free questionnaire seed completed (7 sections).');
};

async function main() {
  try {
    await mongoose.connect(config.database.mongoUrl as string);
    console.info('Connected to MongoDB');
    await seedFreeQuestionnaire();
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
