const express = require("express");
const app = express();
require("./db/connection");
const path = require("path");
const hbs = require("hbs");
const Register = require("./model/register");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));

app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", (req, res) => {
  console.log("this is cookies token", req.cookies.jwt);
  res.render("secret");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    console.log(req.body.firstName);
    if (req.body.password === req.body.confirmPassword) {
      const registerEmployee = new Register({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        age: req.body.age,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      });

      const token = await registerEmployee.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 3000),
        httpOnly: true,
      });
      // console.log(cookies);
      const registered = await registerEmployee.save();
      res.status(201).render("login");
    } else {
      res.status(400).send("password mismatch");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = await Register.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, userEmail.password);

    const token = await userEmail.generateAuthToken();
    console.log(token);
    if (isMatch) {
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 30000),
        httpOnly: true,
      });
      res.status(201).render("index");
    } else {
      res.status(400).send("incorrect password");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`connected to port ${port}`);
});
