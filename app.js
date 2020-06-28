const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const taskSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  tasks: [taskSchema]
})

const Task = mongoose.model('Task', taskSchema);
const List = mongoose.model('List', listSchema);

const task1 = new Task({
  name: "Welcome to your todolist!"
});

const task2 = new Task({
  name: "Hit the + button to add a new task."
});

const task3 = new Task({
  name: "<-- Hit this to delete a task."
});

const defaultTasks = [task1, task2, task3];

app.get("/", function(req, res) {
  Task.find({}, function(err, tasks) {
    if (err) {
      console.log("Error occured while finding tasks: " + err);
    } else {
      if (tasks.length === 0) {
        Task.insertMany(defaultTasks, function(err) {
          if (err) {
            console.log("Error occured while inserting default tasks into the database: " + err);
          }
        });

        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          tasks: tasks
        });
      }
    }
  });
});

app.get("/:customListTitle", function(req, res){
  const customListTitle = _.capitalize(req.params.customListTitle);

  List.findOne({name: customListTitle}, function(err, foundList) {
    if (err) {
      console.log("Error occured while finding the list " + customListTitle + ": " + err);
    }
    else {
      if (!foundList) { // Create a new list
        const list = new List({
          name: customListTitle,
          tasks: defaultTasks
        });

        list.save();
        res.redirect("/" + customListTitle);
      } else { // Show the existing list
        res.render("list", {
          listTitle: customListTitle,
          tasks: foundList.tasks
        });
      }
    }
  })
});

app.post("/", function(req, res) {
  const newTask = new Task({
    name: req.body.newTask
  });

  const listTitle = req.body.list;
  if (listTitle === "Today") {
    newTask.save();
    res.redirect("/");
  } else {
    List.findOne({name: listTitle}, function(err, foundList) {
      if (err) {
        console.log("Error occured while find the list " + listTitle + ": " + err);
      } else {
        foundList.tasks.push(newTask);
        foundList.save();
        res.redirect("/" + listTitle);
      }
    })
  }
});

app.post("/delete", function(req, res) {
  const finishedTaskId = req.body.finishedTask;
  const listTitle = req.body.listTitle;

  if (listTitle === "Today") {
    Task.findByIdAndRemove(finishedTaskId, function(err) {
      if (err) {
        console.log("Error occuring while deleting the task (id: " + finishedTaskId + ") from the Task collection: " + err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listTitle}, {$pull: {tasks: {_id: finishedTaskId}}}, function(err, foundList){
      if (err) {
        console.log("Error occuring while deleting the task (id: " + finishedTaskId + ") from the List collection: " + err)
      } else {
        res.redirect("/" + listTitle);
      }
    });
  }



});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
