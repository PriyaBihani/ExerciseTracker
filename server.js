const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const models = require("./models");

const cors = require("cors");

const mongoose = require("mongoose");

const controller = require("./controller");

mongoose.connect(process.env.MLAB_URI || "mongodb://localhost/exercise-track");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post(
  "/api/exercise/new-user",
  function (req, res, next) {
    const username = req.body.username;
    if (username === "") {
      return res.send("`username` is required.");
    } else next();
  },
  function (req, res) {
    const username = req.body.username;
    var promise = controller.checkUsername(username);
    promise
      .then(function (data) {
        if (data.status) return controller.saveNewUser(username);
        else return controller.throw_promise_error("username already taken");
      })
      .then(function (data) {
        return res.json({ username: data.username, _id: data._id });
      })
      .catch(function (reason) {
        return res.send(reason);
      });
  }
);

app.post(
  "/api/exercise/add",
  function (req, res, next) {
    var params = req.body;
    var notFound = [];
    if (params.userId === "") {
      notFound.push("`userId`");
    }
    if (params.description === "") {
      notFound.push("`description`");
    }
    if (params.duration === "") {
      notFound.push("`duration`");
    }
    if (params.date === "") {
      req.body.date = new Date();
    }

    if (notFound.length > 0) return res.send(notFound.toString() + " required");
    else next();
  },
  function (req, res) {
    var exercise = {
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date,
    };
    var promise = controller.saveExercise(req.body.userId, exercise);
    promise
      .then(function (data) {
        return res.json(
          Object.assign({ username: data.username, _id: data._id }, exercise)
        );
      })
      .catch(function (reason) {
        return res.send(reason);
      });
  }
);

app.get("/api/exercise/log", function (req, res) {
  var promise = controller.getUserDetails(req.query.userId);
  promise
    .then(function (data) {
      return res.json(
        controller.formatOutput(
          data,
          req.query.limit,
          req.query.to,
          req.query.from
        )
      );
    })
    .catch(function (reason) {
      return res.json(reason);
    });
});

app.get("/api/exercise/users", async (req, res) => {
  const users = await models.Tracker.find({}).select("_id username");
  res.json(users);
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res.status(errCode).type("txt").send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
