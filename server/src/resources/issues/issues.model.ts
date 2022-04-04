import { Schema } from 'mongoose';

export const IssuesModel = new Schema({
  title: { type: String, required: true },
  priority: {
    type: String,
    required: true,
    enum: [
      'high',
      'mid',
      'low'
    ]
  },
  label: {
    type: [{
      type: String,
      required: false,
      enum: [
        'electrical',
        'mechanical',
        'landscape',
        'plumbing'
      ]
    }],
    required: false,
    default: []
  },
  archived: { type: Boolean, required: false, default: false }
});
