const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  company: { type: String },
  industry: { type: String },
  website: { type: String },
  address: { type: String },
  notes: { type: String },
}, { timestamps: true }); 

module.exports = mongoose.model('Client', clientSchema);  