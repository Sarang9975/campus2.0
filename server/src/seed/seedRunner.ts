import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { Notification } from '../models/Notification.js';
import { Message } from '../models/Message.js';
import { ParticipationEvent } from '../models/ParticipationEvent.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('[seed] Cleaning existing collections...');
  await User.deleteMany({});
  await Plan.deleteMany({});
  await Notification.deleteMany({});
  await Message.deleteMany({});
  await ParticipationEvent.deleteMany({});

  const defaultPassword = await bcrypt.hash('campus2026', 10);

  console.log('[seed] Creating realistic MANIT campus students...');
  const users = await User.create([
    {
      name: 'Aarav Mehta',
      email: 'aarav.mehta@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      branch: 'Computer Science & Engineering',
      year: '2nd Year',
      roles: ['Fullstack Dev', 'Team Lead'],
      interests: ['Hackathons', 'Football', 'Web3'],
      availability: [
        { day: 'Saturday', times: ['10:00 AM', '02:00 PM', '06:00 PM'] },
        { day: 'Sunday', times: ['11:00 AM', '04:00 PM'] },
      ],
      campusZone: 'Hostel 8 (Aryabhatta)',
      verified: true,
      participationHistory: {
        completedCount: 6,
        earlyReleaseCount: 1,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 2,
        streak: 4,
        summaryText: 'Dead-reliable team lead across 6 hackathons and tech sprints.',
      },
    },
    {
      name: 'Riya Sharma',
      email: 'riya.sharma@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      branch: 'Architecture & Planning',
      year: '3rd Year',
      roles: ['UI Designer', 'Figma Prototyper', 'Design Systems'],
      interests: ['Hackathons', 'Design Critique', 'Badminton'],
      availability: [
        { day: 'Saturday', times: ['10:00 AM', '01:00 PM'] },
        { day: 'Wednesday', times: ['05:00 PM'] },
      ],
      campusZone: 'Main Block Studios',
      verified: true,
      participationHistory: {
        completedCount: 5,
        earlyReleaseCount: 2,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 1,
        streak: 3,
        summaryText: 'High quality UI contributions with courteous early notice whenever schedules collide.',
      },
    },
    {
      name: 'Kabir Verma',
      email: 'kabir.verma@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      roles: ['UI Designer', 'Frontend Engineer', 'Tailwind Wizard'],
      interests: ['Hackathons', 'Competitive Coding', 'Football'],
      availability: [
        { day: 'Saturday', times: ['10:00 AM', '02:00 PM', '07:00 PM'] },
        { day: 'Sunday', times: ['09:00 AM', '03:00 PM'] },
      ],
      campusZone: 'Hostel 7',
      verified: true,
      participationHistory: {
        completedCount: 8,
        earlyReleaseCount: 0,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 4,
        streak: 6,
        summaryText: 'Top-tier bench backup with 4 clutch step-ins and perfect show-up record.',
      },
    },
    {
      name: 'Aditya Roy',
      email: 'aditya.roy@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      branch: 'Mechanical Engineering',
      year: '3rd Year',
      roles: ['Midfielder', 'Football Captain'],
      interests: ['Sports', 'Football', 'Strength Training'],
      availability: [
        { day: 'Friday', times: ['05:30 PM'] },
        { day: 'Sunday', times: ['06:00 AM', '05:00 PM'] },
      ],
      campusZone: 'SAC Sports Complex',
      verified: true,
      participationHistory: {
        completedCount: 14,
        earlyReleaseCount: 1,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 5,
        streak: 9,
        summaryText: 'Campus football anchor. Organizes weekly turf sessions with 90%+ show-up rate.',
      },
    },
    {
      name: 'Meera Nair',
      email: 'meera.nair@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      branch: 'Electronics & Communication',
      year: '2nd Year',
      roles: ['Badminton Singles', 'Badminton Doubles'],
      interests: ['Sports', 'Badminton', 'Robotics'],
      availability: [
        { day: 'Tuesday', times: ['06:00 PM'] },
        { day: 'Thursday', times: ['06:00 PM'] },
        { day: 'Saturday', times: ['07:00 AM', '05:00 PM'] },
      ],
      campusZone: 'Indoor Badminton Hall',
      verified: true,
      participationHistory: {
        completedCount: 7,
        earlyReleaseCount: 0,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 2,
        streak: 5,
        summaryText: 'Reliable court partner, always arrives 10 minutes ahead of booking.',
      },
    },
    {
      name: 'Tanvi Deshmukh',
      email: 'tanvi.d@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
      branch: 'Electrical Engineering',
      year: '2nd Year',
      roles: ['ML Engineer', 'Python Dev'],
      interests: ['Hackathons', 'AI Research', 'Chess'],
      availability: [
        { day: 'Saturday', times: ['10:00 AM', '04:00 PM'] },
        { day: 'Sunday', times: ['10:00 AM'] },
      ],
      campusZone: 'Main Block · CS Wing',
      verified: true,
      participationHistory: {
        completedCount: 4,
        earlyReleaseCount: 0,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 1,
        streak: 3,
        summaryText: 'Consistent hackathon collaborator with clean sprint delivery.',
      },
    },
    {
      name: 'Siddharth Rao',
      email: 'siddharth.r@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
      branch: 'Computer Science & Engineering',
      year: '4th Year',
      roles: ['Backend Engineer', 'DevOps'],
      interests: ['Hackathons', 'Cloud', 'System Design'],
      availability: [
        { day: 'Saturday', times: ['10:00 AM', '08:00 PM'] },
      ],
      campusZone: 'Library Reading Room',
      verified: true,
      participationHistory: {
        completedCount: 9,
        earlyReleaseCount: 1,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 3,
        streak: 5,
        summaryText: 'Senior backend architect. Known for stepping up when teams need production infra.',
      },
    },
    {
      name: 'Ananya Joshi',
      email: 'ananya.j@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      branch: 'Architecture & Planning',
      year: '2nd Year',
      roles: ['Photographer', 'Street Walk Lead'],
      interests: ['Creative', 'Photography', 'Heritage Walks'],
      availability: [
        { day: 'Sunday', times: ['06:30 AM', '09:00 AM'] },
      ],
      campusZone: 'Architecture Quad',
      verified: true,
      participationHistory: {
        completedCount: 6,
        earlyReleaseCount: 0,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 0,
        streak: 6,
        summaryText: 'Dedicated visual storyteller. Never missed a golden-hour campus walk.',
      },
    },
    {
      name: 'Rohan Saxena',
      email: 'rohan.s@manit.ac.in',
      password: defaultPassword,
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80',
      branch: 'Information Technology',
      year: '3rd Year',
      roles: ['UI Designer', 'Figma Pro'],
      interests: ['Hackathons', 'Product Design'],
      availability: [
        { day: 'Saturday', times: ['10:00 AM', '03:00 PM'] },
      ],
      campusZone: 'Hostel 9',
      verified: true,
      participationHistory: {
        completedCount: 3,
        earlyReleaseCount: 0,
        lateReleaseCount: 0,
        noShowCount: 0,
        benchStepInCount: 1,
        streak: 2,
        summaryText: 'Enthusiastic bench backup with rapid acceptance turnarounds.',
      },
    },
  ]);

  const [aarav, riya, kabir, aditya, meera, tanvi, siddharth, ananya, rohan] = users;

  console.log('[seed] Seeding primary signature plan: Aarav\'s Hackathon...');
  const hackathonPlan = await Plan.create({
    creatorId: aarav._id,
    activity: 'Smart India Hackathon · Finals Sprint',
    category: 'competitions',
    role: 'UI Designer',
    description: 'We need 1 skilled UI designer for our problem statement prototype (Disaster Relief Drone Coordination). Working in Figma + Tailwind tokens.',
    date: 'Saturday · 10 Oct',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    location: 'Main Block · Room 302 (Lab 4)',
    campusZone: 'Main Block',
    requiredSpots: 4,
    members: [
      {
        userId: aarav._id,
        role: 'Team Lead / Fullstack',
        committedAt: new Date(Date.now() - 3 * 86400000),
        reconfirmed: true,
        reconfirmedAt: new Date(Date.now() - 86400000),
      },
      {
        userId: tanvi._id,
        role: 'ML & Drone Telemetry',
        committedAt: new Date(Date.now() - 2 * 86400000),
        reconfirmed: true,
        reconfirmedAt: new Date(Date.now() - 86400000),
      },
      {
        userId: siddharth._id,
        role: 'Cloud Backend',
        committedAt: new Date(Date.now() - 2 * 86400000),
        reconfirmed: true,
        reconfirmedAt: new Date(Date.now() - 86400000),
      },
      {
        userId: riya._id,
        role: 'UI Designer',
        committedAt: new Date(Date.now() - 86400000),
        reconfirmed: false, // Awaiting reconfirmation for the demo story!
      },
    ],
    bench: [
      {
        userId: kabir._id,
        role: 'UI Designer',
        joinedAt: new Date(Date.now() - 2 * 86400000),
        status: 'waiting',
      },
      {
        userId: rohan._id,
        role: 'UI Designer',
        joinedAt: new Date(Date.now() - 86400000),
        status: 'waiting',
      },
    ],
    status: 'CONFIRMED',
    healthStatus: 'WATCH',
    healthReason: '1 member awaiting reconfirmation. Protected by 2 verified Bench backups.',
    reconfirmationDeadline: new Date(Date.now() + 18 * 3600000),
    checkInCode: '4921',
    checkIns: [],
  });

  console.log('[seed] Seeding sports plans, creative walks, and completed activities...');
  const footballPlan = await Plan.create({
    creatorId: aditya._id,
    activity: '5-a-Side Floodlight Football',
    category: 'sports',
    role: 'Central Midfielder / Goalkeeper',
    description: 'Weekly Friday evening turf match under floodlights. High pace, clean passing, friendly intensity.',
    date: 'Friday · 09 Oct',
    startTime: '05:30 PM',
    endTime: '07:00 PM',
    location: 'SAC Sports Complex · Turf Ground 1',
    campusZone: 'SAC Sports Complex',
    requiredSpots: 5,
    members: [
      {
        userId: aditya._id,
        role: 'Organizer / Striker',
        committedAt: new Date(Date.now() - 86400000),
        reconfirmed: true,
        reconfirmedAt: new Date(),
      },
      {
        userId: aarav._id,
        role: 'Defender',
        committedAt: new Date(Date.now() - 86400000),
        reconfirmed: true,
        reconfirmedAt: new Date(),
      },
      {
        userId: kabir._id,
        role: 'Winger',
        committedAt: new Date(Date.now() - 43200000),
        reconfirmed: true,
        reconfirmedAt: new Date(),
      },
    ],
    bench: [
      {
        userId: rohan._id,
        role: 'Midfielder',
        joinedAt: new Date(Date.now() - 20000000),
        status: 'waiting',
      },
    ],
    status: 'FILLING',
    healthStatus: 'WATCH',
    healthReason: '3/5 spots committed. 2 open slots. 1 Bench backup waiting.',
    reconfirmationDeadline: new Date(Date.now() + 24 * 3600000),
    checkInCode: '7721',
    checkIns: [],
  });

  const badmintonPlan = await Plan.create({
    creatorId: meera._id,
    activity: 'Badminton Doubles Match',
    category: 'sports',
    role: 'Doubles Partner (Intermediate+)',
    description: 'Booked Court 2 for 90 minutes. Looking for an energetic doubles partner who enjoys fast rallies.',
    date: 'Saturday · 10 Oct',
    startTime: '07:00 AM',
    endTime: '08:30 AM',
    location: 'Indoor Sports Hall · Court 2',
    campusZone: 'Indoor Badminton Hall',
    requiredSpots: 2,
    members: [
      {
        userId: meera._id,
        role: 'Player 1',
        committedAt: new Date(),
        reconfirmed: true,
        reconfirmedAt: new Date(),
      },
    ],
    bench: [
      {
        userId: riya._id,
        role: 'Player 2',
        joinedAt: new Date(),
        status: 'waiting',
      },
    ],
    status: 'FILLING',
    healthStatus: 'WATCH',
    healthReason: '1 spot committed. 1 spot open. 1 backup on the bench.',
    reconfirmationDeadline: new Date(Date.now() + 30 * 3600000),
    checkInCode: '3190',
    checkIns: [],
  });

  const photoWalkPlan = await Plan.create({
    creatorId: ananya._id,
    activity: 'Campus Golden-Hour Photography Walk',
    category: 'creative',
    role: '35mm / Mirrorless Enthusiast',
    description: 'Exploring morning light patterns around old brick archways of Architecture block and Upper Lake periphery.',
    date: 'Sunday · 11 Oct',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    location: 'Architecture Quad & Nescafe Point',
    campusZone: 'Architecture Quad',
    requiredSpots: 3,
    members: [
      {
        userId: ananya._id,
        role: 'Walk Lead',
        committedAt: new Date(),
        reconfirmed: true,
      },
      {
        userId: riya._id,
        role: 'Visual Designer',
        committedAt: new Date(),
        reconfirmed: true,
      },
    ],
    bench: [],
    status: 'FILLING',
    healthStatus: 'WATCH',
    healthReason: '2/3 committed. Open spots available.',
    reconfirmationDeadline: new Date(Date.now() + 48 * 3600000),
    checkInCode: '8842',
    checkIns: [],
  });

  // A plan that already completed in-person (North Star event!)
  const completedPlan = await Plan.create({
    creatorId: aarav._id,
    activity: 'Web3 Buidl Hackathon · Sprint 1',
    category: 'competitions',
    role: 'Solidity Dev',
    description: 'Smart contract rapid test and demo prep for regional track.',
    date: 'Last Saturday',
    startTime: '11:00 AM',
    endTime: '04:00 PM',
    location: 'Main Block · Incubation Center',
    campusZone: 'Main Block',
    requiredSpots: 3,
    members: [
      {
        userId: aarav._id,
        role: 'Lead',
        committedAt: new Date(Date.now() - 7 * 86400000),
        reconfirmed: true,
      },
      {
        userId: kabir._id,
        role: 'Frontend',
        committedAt: new Date(Date.now() - 7 * 86400000),
        reconfirmed: true,
      },
      {
        userId: siddharth._id,
        role: 'Infra',
        committedAt: new Date(Date.now() - 7 * 86400000),
        reconfirmed: true,
      },
    ],
    bench: [],
    status: 'HAPPENED',
    healthStatus: 'HIGH',
    healthReason: '✅ IT HAPPENED! All 3 members checked in and submitted prototype.',
    reconfirmationDeadline: new Date(Date.now() - 6 * 86400000),
    checkInCode: '1099',
    checkIns: [
      { userId: aarav._id, checkedInAt: new Date(Date.now() - 6 * 86400000) },
      { userId: kabir._id, checkedInAt: new Date(Date.now() - 6 * 86400000) },
      { userId: siddharth._id, checkedInAt: new Date(Date.now() - 6 * 86400000) },
    ],
    completedAt: new Date(Date.now() - 6 * 86400000),
    repeatCrewCreated: false,
  });

  // Seed sample plan chat messages
  console.log('[seed] Seeding plan-scoped coordination messages...');
  await Message.create([
    {
      planId: hackathonPlan._id,
      senderId: aarav._id,
      text: 'Hey everyone, please ensure you have Figma and node 20+ set up. We are meeting directly at Room 302.',
    },
    {
      planId: hackathonPlan._id,
      senderId: tanvi._id,
      text: 'Got the drone telemetry sample dataset prepared. Excited for Saturday!',
    },
    {
      planId: footballPlan._id,
      senderId: aditya._id,
      text: 'Bring both white and dark jerseys so we can split cleanly on the turf.',
    },
  ]);

  // Seed sample notifications
  console.log('[seed] Seeding notifications...');
  await Notification.create([
    {
      userId: aarav._id,
      type: 'RECONFIRM_REQUIRED',
      planId: hackathonPlan._id,
      title: 'Reconfirmation Window Open',
      message: 'Saturday hackathon plan is 36 hours out. 1 teammate still to reconfirm.',
      read: false,
      actionUrl: `/plans/${hackathonPlan._id}`,
    },
    {
      userId: kabir._id,
      type: 'BENCH_OFFER',
      planId: hackathonPlan._id,
      title: 'You are on the Bench',
      message: 'You are priority #1 on the Bench for Smart India Hackathon. Ready to step in if a slot opens.',
      read: false,
      actionUrl: `/plans/${hackathonPlan._id}`,
    },
  ]);

  // Seed participation events
  await ParticipationEvent.create([
    {
      userId: aarav._id,
      planId: completedPlan._id,
      eventType: 'CHECK_IN',
    },
    {
      userId: kabir._id,
      planId: completedPlan._id,
      eventType: 'CHECK_IN',
    },
    {
      userId: kabir._id,
      planId: completedPlan._id,
      eventType: 'BENCH_ACCEPT',
      metadata: { note: 'Clutch step-in for regional track' },
    },
  ]);

  console.log('[seed] Database seeded successfully with 9 users and 5 realistic plans!');
  return {
    usersCount: users.length,
    plansCount: 5,
    primaryPlanId: hackathonPlan._id.toString(),
  };
}
