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

From the above User table , for each user record , we are using 287 or ~300 bytes. So, for 10M users = 300 * 10 * 10^6 = 3*10^9 = 3GB.
We can store 3GB amount of data in postgres.
As there is no requirement of storing user's status history, we just consider or store the last online timestamp of a user in postgres database.

For storing user's subscribtion details (i.e For deciding which user follow other users for the presence activity), 



