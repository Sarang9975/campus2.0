import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAvailability {
  day: string;
  times: string[];
}

export interface IParticipationHistory {
  completedCount: number;
  earlyReleaseCount: number;
  lateReleaseCount: number;
  noShowCount: number;
  benchStepInCount: number;
  streak: number;
  summaryText: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  branch: string;
  year: string;
  roles: string[];
  interests: string[];
  availability: IUserAvailability[];
  campusZone: string;
  verified: boolean;
  participationHistory: IParticipationHistory;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    avatar: { type: String, default: '' },
    branch: { type: String, required: true },
    year: { type: String, required: true },
    roles: [{ type: String }],
    interests: [{ type: String }],
    availability: [
      {
        day: { type: String },
        times: [{ type: String }],
      },
    ],
    campusZone: { type: String, default: 'Main Block' },
    verified: { type: Boolean, default: true },
    participationHistory: {
      completedCount: { type: Number, default: 0 },
      earlyReleaseCount: { type: Number, default: 0 },
      lateReleaseCount: { type: Number, default: 0 },
      noShowCount: { type: Number, default: 0 },
      benchStepInCount: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      summaryText: { type: String, default: 'Consistent contributor across campus hackathons and activities.' },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
