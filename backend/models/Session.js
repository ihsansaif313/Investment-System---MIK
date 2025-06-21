import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const sessionSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    required: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  isTemporary: {
    type: Boolean,
    default: false,
    description: 'Indicates if this is a temporary session for password setup'
  },
}, {
  timestamps: true,
});

const Session = model('Session', sessionSchema);

export default Session;
