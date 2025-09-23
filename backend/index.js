
import express from "express";

const app = express();

app.use("/", (req, res) => {
  res.send("This is the root route");
})

app.use("/hello", (req, res) => {
  res.send("Hello World!");
})

app.listen(3000);