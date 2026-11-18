const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
    },
    hours: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { _id: false }
);

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Partner name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Partner type is required (e.g., SCA, Bank, DIC)'],
      trim: true,
    },
    branch: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Partner address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    contact: {
      type: contactSchema,
      default: () => ({}),
    },
    role: {
      type: String,
      required: false,
      trim: true,
    },
    query: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Partner', partnerSchema);
