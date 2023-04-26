DROP DATABASE presencedb;
CREATE DATABASE presencedb;
\c presencedb;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name varchar(255) NOT NULL,
    presence_status int NOT NULL DEFAULT 0,
    last_seen timestamp NOT NULL DEFAULT NOW(), 
    created_stamp timestamp ,
    last_u_stamp timestamp 
);

CREATE INDEX indx_user_name on users (user_name varchar_pattern_ops);
CREATE INDEX indx_user_id_user_name on users (user_name varchar_pattern_ops,user_id);

CREATE TABLE user_subscribers (
    user_id int,
    user_id_to int,

    CONSTRAINT fk_user_id
      FOREIGN KEY(user_id) 
	  REFERENCES users(user_id),
    CONSTRAINT fk_user_id_to
      FOREIGN KEY(user_id_to) 
	  REFERENCES users(user_id),
    UNIQUE (user_id, user_id_to)
);




