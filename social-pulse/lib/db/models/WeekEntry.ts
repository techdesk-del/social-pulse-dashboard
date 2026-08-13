import mongoose, { Schema, Document, Model } from 'mongoose';
import type { LinkedInData, InstagramData, FacebookData } from '../../types';

export interface IWeekEntry extends Document {
  userId: mongoose.Types.ObjectId;
  weekId: string; // "YYYY-MM-DD"
  linkedin: LinkedInData;
  instagram: InstagramData;
  facebook: FacebookData;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInSchema = new Schema<LinkedInData>(
  {
    impressions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    newFollowers: { type: Number, default: 0 },
    reactions: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    reposts: { type: Number, default: 0 },
  },
  { _id: false }
);

const InstagramSchema = new Schema<InstagramData>(
  {
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    profileVisits: { type: Number, default: 0 },
    follows: { type: Number, default: 0 },
    contentInteractions: { type: Number, default: 0 },
    linkClicks: { type: Number, default: 0 },
  },
  { _id: false }
);

const FacebookSchema = new Schema<FacebookData>(
  {
    viewers: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    profileVisits: { type: Number, default: 0 },
    follows: { type: Number, default: 0 },
    contentInteractions: { type: Number, default: 0 },
    linkClicks: { type: Number, default: 0 },
  },
  { _id: false }
);

const WeekEntrySchema = new Schema<IWeekEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekId: { type: String, required: true },
    linkedin: { type: LinkedInSchema, default: () => ({}) },
    instagram: { type: InstagramSchema, default: () => ({}) },
    facebook: { type: FacebookSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Compound unique index so each user can only have 1 entry per weekId
WeekEntrySchema.index({ userId: 1, weekId: 1 }, { unique: true });

const WeekEntry: Model<IWeekEntry> =
  mongoose.models.WeekEntry || mongoose.model<IWeekEntry>('WeekEntry', WeekEntrySchema);

export default WeekEntry;
