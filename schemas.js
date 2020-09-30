const mongoose = require("mongoose");

const exercise = {
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now }
};

const trackerSchema = new mongoose.Schema({
  username: String,
  exercises: [exercise]
});

module.exports = {
  trackerSchema: trackerSchema
};
