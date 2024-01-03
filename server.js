require('dotenv').config()
const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const e = require("express");

const register = require("./controllers/register");
const signin = require("./controllers/signin");
// const profile = require("./controllers/profile");
const image = require("./controllers/image");
const detect = require("./controllers/detect");

let config;

if (process.env.ENV == 'PROD')
  config = {
    client: "pg",
    connection: {
      host: process.env.PROD_DB_HOST,
      port: 5432,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_DATABASE,
    },
  }
else {
  config = {
    client: "pg",
    connection: {
      host: process.env.DEV_DB_HOST,
      port: 5432,
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_DATABASE,
    },
  }
}

const db = knex(config)

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("success");
});

app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, db, bcrypt);
});

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

// app.get("/profile/:id", (req, res) => {
//   profile.handleProfileGet(req, res, db);
// });

app.put("/image", (req, res) => {
  image.handleImagePut(req, res, db);
});

app.post("/detect", (req, res) => detect.handleDetect(req, res, db));

app.listen(3000, () => {
  console.log("App is running on port 3000");
});
