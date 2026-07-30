//@ts-ignore
import mongoose from 'mongoose';
import { config } from '../config';
import bcrypt from 'bcryptjs';
import { User } from '../modules/user.module/user/user.model';
import { UserProfile } from '../modules/user.module/userProfile/userProfile.model';
import { Wallet } from '../modules/wallet.module/wallet/wallet.model';
import { MentorProfile } from '../modules/mentor.module/mentorProfile/mentorProfile.model';
import { MentorReview } from '../modules/mentor.module/mentorReview/mentorReview.model';
import { THaveAdminApproval, TMentorClass } from '../modules/mentor.module/mentorProfile/mentorProfile.constant';

const hashedPassword = '$2b$12$cxPF29g99duEaWshhIjW6.TXTEzCccwZaL8jil3gFvhMjogg4HxiW';

const mentorsData = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@mentor.com',
    title: 'Senior Software Engineer & Tech Lead',
    topics: ['JavaScript', 'React', 'Node.js', 'System Design'],
    language: ['English', 'Spanish'],
    location: 'San Francisco, CA',
    availableIn: TMentorClass.online,
    sessionPrice: 75,
    currentJobTitle: 'Senior Software Engineer',
    companyName: 'Google',
    yearsOfExperience: 10,
    bio: 'Passionate tech lead with 10 years of experience in building scalable web applications. I love helping developers grow their careers and master modern web technologies.',
    careerStage: ['Mid-Level', 'Senior', 'Lead'],
    focusArea: ['Frontend Development', 'Full-Stack Development', 'Career Growth'],
    industry: ['Technology', 'Finance', 'E-commerce'],
    coreValues: ['Continuous Learning', 'Mentorship', 'Innovation'],
    specialties: ['React Architecture', 'Performance Optimization', 'Team Leadership'],
    coachingMethodologies: ['One-on-One Coaching', 'Code Review Sessions', 'Career Roadmap Planning'],
    calendlyProfileLink: 'https://calendly.com/sarah-johnson',
    avatarUrl: 'https://i.pravatar.cc/300?img=1',
    rating: 4.9,
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@mentor.com',
    title: 'Data Science Manager',
    topics: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'],
    language: ['English', 'Mandarin'],
    location: 'New York, NY',
    availableIn: TMentorClass.both,
    sessionPrice: 90,
    currentJobTitle: 'Data Science Manager',
    companyName: 'Netflix',
    yearsOfExperience: 12,
    bio: 'Helping professionals transition into data science and excel in their careers. Specializing in ML fundamentals and practical applications.',
    careerStage: ['Entry-Level', 'Mid-Level', 'Senior'],
    focusArea: ['Machine Learning', 'Data Science', 'Career Transition'],
    industry: ['Technology', 'Media', 'Healthcare'],
    coreValues: ['Problem Solving', 'Data-Driven Decisions', 'Teaching'],
    specialties: ['Deep Learning', 'NLP', 'Recommendation Systems'],
    coachingMethodologies: ['Project-Based Learning', 'Interview Prep', 'Career Counseling'],
    calendlyProfileLink: 'https://calendly.com/michael-chen',
    avatarUrl: 'https://i.pravatar.cc/300?img=3',
    rating: 4.8,
  },
  {
    name: 'Emily Williams',
    email: 'emily.williams@mentor.com',
    title: 'Product Design Lead',
    topics: ['UI/UX Design', 'Figma', 'User Research', 'Design Systems'],
    language: ['English', 'French'],
    location: 'London, UK',
    availableIn: TMentorClass.online,
    sessionPrice: 65,
    currentJobTitle: 'Product Design Lead',
    companyName: 'Spotify',
    yearsOfExperience: 8,
    bio: 'Award-winning designer passionate about creating user-centered products. I help designers build strong portfolios and land their dream jobs.',
    careerStage: ['Junior', 'Mid-Level', 'Senior'],
    focusArea: ['Product Design', 'UX Research', 'Design Leadership'],
    industry: ['Music', 'Fintech', 'SaaS'],
    coreValues: ['User Empathy', 'Creativity', 'Collaboration'],
    specialties: ['Design Systems', 'Prototyping', 'User Testing'],
    coachingMethodologies: ['Portfolio Reviews', 'Design Challenges', 'Mock Interviews'],
    calendlyProfileLink: 'https://calendly.com/emily-williams',
    avatarUrl: 'https://i.pravatar.cc/300?img=5',
    rating: 4.95,
  },
  {
    name: 'David Martinez',
    email: 'david.martinez@mentor.com',
    title: 'DevOps & Cloud Architect',
    topics: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    language: ['English', 'Portuguese'],
    location: 'Austin, TX',
    availableIn: TMentorClass.both,
    sessionPrice: 85,
    currentJobTitle: 'Cloud Infrastructure Architect',
    companyName: 'Amazon',
    yearsOfExperience: 11,
    bio: 'Cloud expert with deep expertise in AWS and infrastructure as code. I help developers master cloud technologies and advance their DevOps careers.',
    careerStage: ['Mid-Level', 'Senior', 'Architect'],
    focusArea: ['Cloud Computing', 'DevOps', 'Infrastructure'],
    industry: ['Technology', 'E-commerce', 'Cloud Services'],
    coreValues: ['Automation', 'Reliability', 'Knowledge Sharing'],
    specialties: ['AWS Solutions', 'Terraform', 'Container Orchestration'],
    coachingMethodologies: ['Hands-on Labs', 'Architecture Reviews', 'Certification Prep'],
    calendlyProfileLink: 'https://calendly.com/david-martinez',
    avatarUrl: 'https://i.pravatar.cc/300?img=8',
    rating: 4.85,
  },
  {
    name: 'Jennifer Lee',
    email: 'jennifer.lee@mentor.com',
    title: 'Engineering Manager',
    topics: ['Leadership', 'Team Management', 'Technical Strategy', 'Hiring'],
    language: ['English', 'Korean'],
    location: 'Seattle, WA',
    availableIn: TMentorClass.online,
    sessionPrice: 100,
    currentJobTitle: 'Engineering Manager',
    companyName: 'Microsoft',
    yearsOfExperience: 15,
    bio: 'Former IC turned manager helping engineers transition into leadership roles. I specialize in building high-performing teams and developing engineering leaders.',
    careerStage: ['Senior', 'Staff', 'Engineering Manager'],
    focusArea: ['Engineering Leadership', 'Team Building', 'Career Development'],
    industry: ['Technology', 'Enterprise Software'],
    coreValues: ['Empathy', 'Growth Mindset', 'Transparency'],
    specialties: ['Performance Management', 'Technical Hiring', '1:1 Coaching'],
    coachingMethodologies: ['Leadership Coaching', 'Career Transition Planning', 'Team Building Workshops'],
    calendlyProfileLink: 'https://calendly.com/jennifer-lee',
    avatarUrl: 'https://i.pravatar.cc/300?img=9',
    rating: 4.92,
  },
  {
    name: 'Robert Taylor',
    email: 'robert.taylor@mentor.com',
    title: 'Mobile Development Expert',
    topics: ['React Native', 'iOS', 'Android', 'Flutter'],
    language: ['English', 'German'],
    location: 'Berlin, Germany',
    availableIn: TMentorClass.both,
    sessionPrice: 70,
    currentJobTitle: 'Lead Mobile Developer',
    companyName: 'Airbnb',
    yearsOfExperience: 9,
    bio: 'Building mobile apps for over 9 years. I help developers master cross-platform frameworks and build production-ready mobile applications.',
    careerStage: ['Junior', 'Mid-Level', 'Senior'],
    focusArea: ['Mobile Development', 'Cross-Platform', 'App Architecture'],
    industry: ['Travel', 'Healthtech', 'Fintech'],
    coreValues: ['Quality', 'User Experience', 'Clean Code'],
    specialties: ['React Native', 'iOS Swift', 'Mobile Architecture'],
    coachingMethodologies: ['Code Reviews', 'Project mentorship', 'Technical Interviews'],
    calendlyProfileLink: 'https://calendly.com/robert-taylor',
    avatarUrl: 'https://i.pravatar.cc/300?img=11',
    rating: 4.78,
  },
  {
    name: 'Amanda Brown',
    email: 'amanda.brown@mentor.com',
    title: 'Senior Product Manager',
    topics: ['Product Strategy', 'Roadmapping', 'User Stories', 'Agile'],
    language: ['English'],
    location: 'Boston, MA',
    availableIn: TMentorClass.online,
    sessionPrice: 80,
    currentJobTitle: 'Senior Product Manager',
    companyName: 'Slack',
    yearsOfExperience: 7,
    bio: 'Product enthusiast with a track record of launching successful products. I help aspiring PMs break into the field and excel in their roles.',
    careerStage: ['Associate', 'Junior PM', 'Senior PM'],
    focusArea: ['Product Management', 'Strategy', 'Execution'],
    industry: ['SaaS', 'Communication', 'Enterprise'],
    coreValues: ['Customer Focus', 'Data-Driven', 'Collaboration'],
    specialties: ['B2B Products', 'Growth Metrics', 'Stakeholder Management'],
    coachingMethodologies: ['Mock Interviews', 'Product Case Studies', 'Career Guidance'],
    calendlyProfileLink: 'https://calendly.com/amanda-brown',
    avatarUrl: 'https://i.pravatar.cc/300?img=10',
    rating: 4.88,
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@mentor.com',
    title: 'Cybersecurity Consultant',
    topics: ['Security', 'Penetration Testing', 'Risk Assessment', 'Compliance'],
    language: ['English', 'Japanese'],
    location: 'Tokyo, Japan',
    availableIn: TMentorClass.online,
    sessionPrice: 95,
    currentJobTitle: 'Security Consultant',
    companyName: 'IBM',
    yearsOfExperience: 13,
    bio: 'Cybersecurity veteran helping professionals build secure systems and advance in the security field. Expert in ethical hacking and security architecture.',
    careerStage: ['Junior', 'Mid-Level', 'Senior'],
    focusArea: ['Cybersecurity', 'Risk Management', 'Compliance'],
    industry: ['Finance', 'Healthcare', 'Government'],
    coreValues: ['Integrity', 'Continuous Learning', 'Security First'],
    specialties: ['Pen Testing', 'Security Architecture', 'CISM Prep'],
    coachingMethodologies: ['Lab Sessions', 'Certification Guidance', 'Career Path Planning'],
    calendlyProfileLink: 'https://calendly.com/james-wilson',
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    rating: 4.75,
  },
];

const reviewTemplates = [
  { review: 'Excellent mentor! Very knowledgeable and patient. Helped me understand complex concepts easily.', rating: 5 },
  { review: 'Great session! The mentor provided practical insights that I could immediately apply to my work.', rating: 5 },
  { review: 'Very helpful guidance on career progression. The mentor\'s experience really shows in their advice.', rating: 4 },
  { review: 'Outstanding technical coaching. The mentor helped me debug an issue I had been stuck on for days.', rating: 5 },
  { review: 'Excellent communication skills and very approachable. Made me feel comfortable asking any questions.', rating: 5 },
  { review: 'Great mentorship on system design. The mentor helped me structure my approach for interviews.', rating: 4 },
  { review: 'Very knowledgeable in the field. Provided valuable industry insights and networking tips.', rating: 5 },
  { review: 'Helped me improve my portfolio significantly. The feedback was constructive and actionable.', rating: 5 },
  { review: 'Excellent coaching on leadership skills. The mentor shared practical frameworks that work.', rating: 4 },
  { review: 'Very thorough and detail-oriented. Helped me prepare thoroughly for my technical interviews.', rating: 5 },
];

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

const cleanExistingData = async () => {
  console.log('Cleaning existing mentor data...');
  
  const mentorUsers = await User.find({ role: 'mentor' }).select('_id').lean();
  const mentorUserIds = mentorUsers.map(u => u._id);

  await MentorReview.deleteMany({ mentorId: { $in: mentorUserIds } });
  console.log('Deleted mentor reviews');

  await MentorProfile.deleteMany({ userId: { $in: mentorUserIds } });
  console.log('Deleted mentor profiles');

  await User.deleteMany({ role: 'mentor' });
  console.log('Deleted mentor users');
};

const seedMentors = async () => {
  try {
    let studentUsers = await User.find({ role: 'student' }).select('_id').lean();
    
    if (studentUsers.length < 10) {
      console.log('Creating student users for reviews...');
      for (let i = 0; i < 20; i++) {
        const userProfile = await UserProfile.create({
          gender: 'male',
          acceptTOC: true,
          dob: '1995-01-15T00:00:00Z',
        });
        const wallet = await Wallet.create({ amount: 0 });
        const user = await User.create({
          name: `Student ${i + 1}`,
          email: `student${i + 1}@example.com`,
          password: hashedPassword,
          role: 'student',
          isEmailVerified: true,
          isDeleted: false,
          isResetPassword: false,
          failedLoginAttempts: 0,
          deletedAt: null,
          profileId: userProfile._id,
          walletId: wallet._id,
        });
        await Wallet.findByIdAndUpdate(wallet._id, { userId: user._id });
      }
      studentUsers = await User.find({ role: 'student' }).select('_id').lean();
    }

    for (const mentorData of mentorsData) {
      const userProfile = await UserProfile.create({
        gender: 'male',
        acceptTOC: true,
        dob: '1990-01-15T00:00:00Z',
      });

      const wallet = await Wallet.create({
        amount: 0,
      });

      const user = await User.create({
        name: mentorData.name,
        email: mentorData.email,
        password: hashedPassword,
        role: 'mentor',
        isEmailVerified: true,
        isDeleted: false,
        isResetPassword: false,
        failedLoginAttempts: 0,
        deletedAt: null,
        profileId: userProfile._id,
        walletId: wallet._id,
      });

      await Wallet.findByIdAndUpdate(wallet._id, { userId: user._id });

      const mentorProfile = await MentorProfile.create({
        userId: user._id,
        title: mentorData.title,
        topics: mentorData.topics,
        language: mentorData.language,
        location: mentorData.location,
        availableIn: mentorData.availableIn,
        sessionPrice: mentorData.sessionPrice,
        currentJobTitle: mentorData.currentJobTitle,
        companyName: mentorData.companyName,
        yearsOfExperience: mentorData.yearsOfExperience,
        bio: mentorData.bio,
        careerStage: mentorData.careerStage,
        focusArea: mentorData.focusArea,
        industry: mentorData.industry,
        coreValues: mentorData.coreValues,
        specialties: mentorData.specialties,
        coachingMethodologies: mentorData.coachingMethodologies,
        calendlyProfileLink: mentorData.calendlyProfileLink,
        avatarUrl: mentorData.avatarUrl,
        rating: mentorData.rating,
        profileInfoFillUpCount: 5,
        haveAdminApproval: THaveAdminApproval.approved,
        isLive: true,
        isDeleted: false,
      });

      const numReviews = Math.floor(Math.random() * 4) + 3;
      const shuffledReviews = [...reviewTemplates].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numReviews; i++) {
        const randomIndex = Math.floor(Math.random() * studentUsers.length);
        const randomStudent = studentUsers[randomIndex];
        
        if (randomStudent) {
          const reviewData = shuffledReviews[i % shuffledReviews.length]!;
          await MentorReview.create({
            userId: randomStudent._id,
            mentorId: user._id,
            review: reviewData.review,
            rating: reviewData.rating,
            isDeleted: false,
          });
        }
      }

      console.log(`Created mentor: ${mentorData.name} with reviews`);
    }

    console.log('All mentors seeded successfully!');
  } catch (err) {
    console.error('Error seeding mentors:', err);
  }
};

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    await cleanExistingData();
    await seedMentors();
    console.log('--------------> Mentor seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};

seedDatabase();