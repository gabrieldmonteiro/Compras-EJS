const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Compras = require("./models/Compras");
let access = false;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}
localStorage.clear();
console.log(localStorage.length);
//.ENV
dotenv.config();

//DB
mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
  console.log("Connected to db!");
  app.listen(process.env.PORT || 3000, () =>
    console.log("Server Up and running")
  );
});

//GET
app.get("/", (req, res) => {
  console.log(localStorage.getItem("access"));
  if (localStorage.getItem("access") == null) {
    res.render("../src/views/auth.ejs");
  } else {
    Compras.find({}, (err, tasks) => {
      res.render("../src/views/compras.ejs", { todoTasks: tasks });
    });
  }
});

app.use("/static", express.static("public"));
app.set("view engine", "ejs");

app.get("/compras", (req, res) => {
  if (localStorage.getItem("access")) {
    Compras.find({}, (err, tasks) => {
      res.render("../src/views/compras.ejs", { todoTasks: tasks });
    });
  } else {
    res.render("../src/views/auth.ejs");
  }
});

//POST
app.use(express.urlencoded({ extended: true }));

app.post("/compras", async (req, res) => {
  const todoTask = new Compras({
    content: req.body.content,
  });
  try {
    await todoTask.save();
    res.redirect("/compras");
  } catch (err) {
    res.redirect("/compras");
  }
});

//UPDATE
app
  .route("/edit/:id")
  .get((req, res) => {
    const id = req.params.id;
    Compras.find({}, (err, tasks) => {
      res.render("../src/views/comprasEdit.ejs", {
        todoTasks: tasks,
        idTask: id,
      });
    });
  })
  .post((req, res) => {
    const id = req.params.id;
    Compras.findByIdAndUpdate(id, { content: req.body.content }, (err) => {
      if (err) return res.send(500, err);
      res.redirect("/compras");
    });
  });

//DELETE
app.route("/remove/:id").get((req, res) => {
  const id = req.params.id;
  Compras.findByIdAndRemove(id, (err) => {
    if (err) return res.send(500, err);
    res.redirect("/compras");
  });
});

//AUTH
let pw = "";
app.post("/", (req, res) => {
  pw = req.body.txtPassword;
  if (pw === process.env.PASSWORD) {
    localStorage.setItem("access", true);
    console.log(localStorage.length);
    console.log(localStorage.getItem("access"));
    res.redirect("/compras");
  } else {
    res.redirect("/");
  }
});
