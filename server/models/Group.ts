import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  members: string[];
  createdBy?: mongoose.Types.ObjectId;
  notificationEmails?: string[];
  createdAt: Date;
}

const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  members: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notificationEmails: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Group = mongoose.model<IGroup>('Group', groupSchema);