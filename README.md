# online-offline-indicator
Online , Offline indicator of user's status for chat application

# Problem Statement

Imagine you are building a chat application in which a user can chat with any other user, provided they are both connected. For a user to initiate the chat, it is always helpful if we show who all are online.

In this assignment, let's design a system that indicates who all are online at the moment. The micro-problem statement is as simple as answering the question - Given a user, return if he/she is online or not.

![Designing Online Offline Indicator](https://user-images.githubusercontent.com/4745789/138017480-1f7c30ce-50f2-4a50-99b5-1cf7f0778caa.png)

# Functional Requirements

1. System should allow to create users on behalf of themself.
2. User can search any other user and see their instant status (online or offline).
3. User should subscribe for another user's status event before getting the real status of that user.
4. User can see any other user's status within 10 secs of the another user become online.
5. User should see the last seen time of another user , if that user is currently offline.
6. User have a ability to update offline/online status mannually.


# Non-Functional Requirements

1. System should be very highly available and response latency should be as low as possible.
2. System should be scale for 5M active users at any given moment.
3. Data in systems should be durable, no matter happends in the system.
4. System should support automatic scale up or down based on the current load or active users.

# Capacity Planning

Initiatally we are considering we are accomadate 10M users in the System. Where 5M users currently active at any given moment.

For storing user information , we have planned to store it in releational database like PostgresSQL. 
For User table following details going to be store :: 

| Column        | Data Type     | Size in Bytes     |
| ------------- | ------------- | ----------------- |
| user_id       | int           | 4                 |
| user_name     | varchar(255)  | 255               | 
| status        | int           | 4                 |
| last_seen     | long          | 8                 |
| created_date  | long          | 8                 |
| last_u_date   | long          | 8                 |
```
From the above User table , for each user record , we are using 287 or ~300 bytes. So, for 10M users = 300 * 10 * 10^6 = 3*10^9 = 3GB.
```
As there is no requirement of storing user's status history, we just consider or store the last online timestamp of a user in postgres database.

For storing user's subscribtion details (i.e For deciding which user follow other users for the presence activity), planned to store in Postgres as well. 
For User's association below details ::
| Column        | Data Type     | Size in Bytes     |
| ------------- | ------------- | ----------------- |
| user_id       | int           | 4                 |
| user_id_t     | varchar(255)  | 4                 | 

Taking consideration each user have 1K subscribers/followers , so 
```
each record takes 8 bytes ,
for each user -> 1K * 8 = 8KB and 
for 10M users = 8 KB * 10 M = 8 * 10^3 * 10^7 = 80 * 10^9 = 80 GB 
```
So, All total 83 GB amount of user data we are going to store in Database, and single postgres cluster with multiple read replica can store this information.

We are planning to use Redis cache to store active user association tables data in cache to reduce the load in postgres system. This is yet to be analysed.

# Technology Stack
1. NodeJS
2. PostgresSQL
3. Redis (Cache and Pub/Sub System)
4. Apache Kafka and Kafka Connect

# High Level Architecture Diagram
<img width="1304" alt="image" src="https://user-images.githubusercontent.com/22850961/233852988-57cba7e5-5bfd-4768-afac-24f42f18fb54.png">

# Database schema
1. users table

| Column        | Data Type     | Size in Bytes     |
| ------------- | ------------- | ----------------- |
| user_id       | int           | 4                 |
| user_name     | varchar(255)  | 255               | 
| status        | int           | 4                 |
| last_seen     | long          | 8                 |
| created_date  | long          | 8                 |
| last_u_date   | long          | 8                 |

2. users_subscribers table

| Column        | Data Type     | Size in Bytes     |
| ------------- | ------------- | ----------------- |
| user_id       | int           | 4                 |
| user_id_t     | varchar(255)  | 4                 | 

# API Details
## userservice
| Resource URL        | Request Method     | Request Body     | Response Body     |
| ------------------- | ------------------ | ---------------- | --------------------
| /users              | POST               | {"name": "subhajit"} |  {"user_id": 1}                 | 
| /users              | GET               | NA |  {"rowCount":100, users: [ {"user_id": 1,"name": "subhajit", "presence_status": "online","last_seen" :"2023-05-07"}       ..]}             | 
| /users/{userId}              | GET               | NA |  {"user_id": 1,"name": "subhajit", "presence_status": "online","last_seen" :"2023-05-07"}                 | 
| /users/{userId}/subscibers     | POST        | {"user_id":2 |  NA                | 

## presenceservice 
### Event details
| Event Name        | Description     |
| ------------------- | ------------------ |
| loginEvent              | a client send a loginEvent to register the user is being online               |
| loginEventSuccess            | System replied to client that userlogin is success               |
| heartbeatEvent           | client has to send a heartbeatEvent to tell System that client is online              |
| presenceEvent           | System send to client about their subscribers presence status              |
| disconnectEvent           | client has to send system that its going to be offline             |



# Use cases diagram
### Flow diagram for adding users and its subscribers
<img width="943" alt="image" src="https://user-images.githubusercontent.com/22850961/236698686-4bcf406b-5b64-4213-963a-4ee9a6b224aa.png">

### Message flow of showing one user's presence status to another user.
<img width="1624" alt="image" src="https://user-images.githubusercontent.com/22850961/236697903-aaafb9f3-5913-4efa-87c9-8afea49d484b.png">


# Limitation
1. Currently support only for offline and online status. We can add for status updates for busy, sharing, meeting.


