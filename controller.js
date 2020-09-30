const models = require("./models");

function throw_promise_error(error) {
  return new Promise(function(resolve, reject) {
    reject(error);
  });
}

function saveNewUser(username) {
  return new Promise(function(resolve, reject) {
    var user = new models.Tracker({ username: username });
    user.save(function(err, doc) {
      if (err) reject(err);
      else resolve(doc);
    });
  });
}

function checkUsername(username) {
  return new Promise(function(resolve, reject) {
    models.Tracker.findOne({ username: username }, function(err, doc) {
      if (err) reject(err);
      else if (doc === null) resolve({ status: true });
      else resolve({ status: false });
    });
  });
}

function saveExercise(userId, exercise) {
  return new Promise(function(resolve, reject) {
    if (userId.length != 24) {
      reject("unknown _id");
    } else
      models.Tracker.findByIdAndUpdate(
        userId,
        { $push: { exercises: exercise } },
        { new: true },
        function(err, doc) {
          if (err) {
            reject(err.reason.message);
          } else if (doc === null) reject("unknown _id");
          else resolve(doc);
        }
      );
  });
}

function getUserDetails(userId) {
  return new Promise(function(resolve, reject) {
    var query = { _id: userId };
    models.Tracker.findOne(query, function(err, doc) {
      if (err) reject(err);
      else resolve(doc);
    });
  });
}

function formatOutput(doc, limit, to, from) {
  var output = { _id: doc._id, username: doc.username };
  var logs = doc.exercises.slice();
  var filteredLogs = [];
  //deep clone each object
  for (var i in logs) {
    var date = new Date(logs[i].date);
    var log = {
      description: logs[i].description,
      duration: logs[i].duration,
      date: date.toDateString()
    };
    if (typeof from !== "undefined") {
      output.from = from;
    }
    if (typeof to !== "undefined") {
      output.to = to;
    }
    if (
      (typeof to === "undefined" && typeof from === "undefined") ||
      (typeof to !== "undefined" &&
        new Date(to) > date &&
        typeof to === "undefined") ||
      (typeof from !== "undefined" &&
        new Date(from) < date &&
        typeof to === "undefined") ||
      (typeof from !== "undefined" &&
        new Date(from) < date &&
        typeof to !== "undefined" &&
        new Date(to) > date)
    ) {
      filteredLogs.push(log);
    }
    console.log(i);
  }
  console.log(logs);
  if (typeof limit !== "undefined") filteredLogs = filteredLogs.slice(0, limit);
  output.count = filteredLogs.length;
  output.log = filteredLogs;
  return output;
}

module.exports = {
  throw_promise_error: throw_promise_error,
  saveNewUser: saveNewUser,
  checkUsername: checkUsername,
  saveExercise: saveExercise,
  getUserDetails: getUserDetails,
  formatOutput: formatOutput
};
