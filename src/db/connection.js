require("dotenv").config();

const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => {
    console.log("connection failed");
  });
