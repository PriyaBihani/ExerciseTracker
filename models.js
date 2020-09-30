const schemas = require("./schemas");
const mongoose = require("mongoose");

var Tracker = mongoose.model("Tracker", schemas.trackerSchema);

module.exports = {
  Tracker: Tracker
};
