const express = require("express");
const app = express();
const dotenv = require('dotenv');
const redisUserCache = require('./dao/redis-user-cache')
const userService = require('./services/user-service')(redisUserCache)
const userSubscriberService = require('./services/user-subscriber-service')(redisUserCache)


dotenv.config();

const port = process.env.PORT;
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


app.post("/users", userService.createUser)
app.get("/users", userService.getUsers)
app.get("/users/:user_id", userService.getUserById)
app.post("/users/:user_id/subscribers", userSubscriberService.createUserSubscriber)
app.get("/users/:user_id/subscribers", userSubscriberService.getUserSubscribers)



app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});