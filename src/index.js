const express = require("express");
const app = express();
const dotenv = require('dotenv');
const userService = require('./services/user-service')

dotenv.config();

const port = process.env.PORT;
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.post("/users", userService.createUser)
app.get("/users", userService.getUsers)
app.get("/users/:user_id", userService.getUserById)

app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});