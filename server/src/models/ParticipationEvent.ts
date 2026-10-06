import mongoose, { Document, Schema } from 'mongoose';

export type EventType =
  | 'JOIN'
  | 'COMMIT'
  | 'RECONFIRM'
  | 'EARLY_RELEASE'
  | 'LATE_RELEASE'
  | 'NO_SHOW'
  | 'BENCH_JOIN'
  | 'BENCH_OFFER'
  | 'BENCH_ACCEPT'
  | 'CHECK_IN'
  | 'COMPLETED';

export interface IParticipationEvent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  eventType: EventType;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const ParticipationEventSchema = new Schema<IParticipationEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  eventType: {
    type: String,
    enum: [
      'JOIN',
      'COMMIT',
      'RECONFIRM',
      'EARLY_RELEASE',
      'LATE_RELEASE',
      'NO_SHOW',
      'BENCH_JOIN',
      'BENCH_OFFER',
      'BENCH_ACCEPT',
      'CHECK_IN',
      'COMPLETED',
    ],
    required: true,
  },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

export const ParticipationEvent = mongoose.model<IParticipationEvent>(
  'ParticipationEvent',
  ParticipationEventSchema
);
