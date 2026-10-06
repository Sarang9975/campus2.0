import mongoose, { Document, Schema } from 'mongoose';

export type PlanStatus =
  | 'OPEN'
  | 'MATCHING'
  | 'FILLING'
  | 'CONFIRMED'
  | 'AT_RISK'
  | 'RECOVERING'
  | 'HAPPENED'
  | 'REPEAT';

export type PlanHealthStatus = 'HIGH' | 'WATCH' | 'AT_RISK';

export interface IPlanMember {
  userId: mongoose.Types.ObjectId;
  role: string;
  committedAt: Date;
  reconfirmed: boolean;
  reconfirmedAt?: Date;
}

export interface IPlanBench {
  userId: mongoose.Types.ObjectId;
  role: string;
  joinedAt: Date;
  offeredAt?: Date;
  status: 'waiting' | 'offered' | 'accepted' | 'declined' | 'expired';
}

export interface IPlanCheckIn {
  userId: mongoose.Types.ObjectId;
  checkedInAt: Date;
}

export interface IPlan extends Document {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  activity: string;
  category: 'competitions' | 'sports' | 'clubs' | 'creative' | 'study';
  role: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  campusZone: string;
  requiredSpots: number;
  members: IPlanMember[];
  bench: IPlanBench[];
  status: PlanStatus;
  healthStatus: PlanHealthStatus;
  healthReason: string;
  reconfirmationDeadline: Date;
  checkInCode: string;
  checkIns: IPlanCheckIn[];
  completedAt?: Date;
  repeatCrewCreated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: String, required: true },
    category: {
      type: String,
      enum: ['competitions', 'sports', 'clubs', 'creative', 'study'],
      default: 'competitions',
    },
    role: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, default: '' },
    location: { type: String, required: true },
    campusZone: { type: String, default: 'Main Block' },
    requiredSpots: { type: Number, required: true, default: 1 },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, required: true },
        committedAt: { type: Date, default: Date.now },
        reconfirmed: { type: Boolean, default: false },
        reconfirmedAt: { type: Date },
      },
    ],
    bench: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
        offeredAt: { type: Date },
        status: {
          type: String,
          enum: ['waiting', 'offered', 'accepted', 'declined', 'expired'],
          default: 'waiting',
        },
      },
    ],
    status: {
      type: String,
      enum: ['OPEN', 'MATCHING', 'FILLING', 'CONFIRMED', 'AT_RISK', 'RECOVERING', 'HAPPENED', 'REPEAT'],
      default: 'OPEN',
    },
    healthStatus: {
      type: String,
      enum: ['HIGH', 'WATCH', 'AT_RISK'],
      default: 'HIGH',
    },
    healthReason: { type: String, default: 'Initial spots filling smoothly.' },
    reconfirmationDeadline: { type: Date, required: true },
    checkInCode: { type: String, default: '4921' },
    checkIns: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        checkedInAt: { type: Date, default: Date.now },
      },
    ],
    completedAt: { type: Date },
    repeatCrewCreated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
