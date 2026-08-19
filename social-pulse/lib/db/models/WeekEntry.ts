import mongoose, { Schema, Document, Model } from 'mongoose';
import type { LinkedInData, InstagramData, FacebookData } from '../../types';

export interface IWeekEntry extends Document {
  userId?: string | mongoose.Types.ObjectId;
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
    reactions: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    reposts: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    newFollowers: { type: Number, default: 0 },
    searchAppearances: { type: Number, default: 0 },
    customButtonClick: { type: Number, default: 0 },
    newFollowers300Days: { type: Number, default: 0 },
    pageSearches: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
  },
  { _id: false }
);

const InstagramSchema = new Schema<InstagramData>(
  {
    views: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    contentInteractions: { type: Number, default: 0 },
    linkClicks: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    follows: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    profileVisits: { type: Number, default: 0 },
    reelsViews: { type: Number, default: 0 },
    postViews: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
  },
  { _id: false }
);

const FacebookSchema = new Schema<FacebookData>(
  {
    views: { type: Number, default: 0 },
    viewers: { type: Number, default: 0 },
    contentInteractions: { type: Number, default: 0 },
    linkClicks: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    follows: { type: Number, default: 0 },
    profileVisits: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
  },
  { _id: false }
);

const WeekEntrySchema = new Schema<IWeekEntry>(
  {
    userId: { type: String, required: false, default: 'default_user', index: true },
    weekId: { type: String, required: true },
    linkedin: { type: LinkedInSchema, default: () => ({}) },
    instagram: { type: InstagramSchema, default: () => ({}) },
    facebook: { type: FacebookSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Compound unique index so each user can only have 1 entry per weekId
WeekEntrySchema.index({ weekId: 1 }, { unique: true });

// Force model re-registration in HMR development mode to ensure schema updates like excludedDates are active
if (mongoose.models.WeekEntry) {
  delete mongoose.models.WeekEntry;
}

const WeekEntry: Model<IWeekEntry> =
  mongoose.models.WeekEntry || mongoose.model<IWeekEntry>('WeekEntry', WeekEntrySchema);

export default WeekEntry;
