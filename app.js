const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

const tasks = ["Buy Food", "Cook Food", "Eat Food"];
const workTasks = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  const day = date.getDate();

  res.render("list", {
    listTitle: day,
    tasks: tasks
  });
});

app.post("/", function(req, res) {
  if (req.body.list === "Work") {
    workTasks.push(req.body.newTask);
    res.redirect("/work");
  } else {
    tasks.push(req.body.newTask);
    res.redirect("/");
  }
})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    tasks: workTasks
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000.");
})
