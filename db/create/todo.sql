CREATE TABLE users (
    id integer PRIMARY KEY AUTOINCREMENT,
    username text NOT NULL,
    password_hash text NOT NULL,
    creation_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    permission_level integer NOT NULL DEFAULT 0, -- 0: normal user 1: admin

    CONSTRAINT unique_username UNIQUE(username)
);
CREATE TABLE lists (
    id integer PRIMARY KEY AUTOINCREMENT,
    owner_id integer NOT NULL,
    list_name text NOT NULL,
    creation_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id)
);
CREATE TABLE todos (
    id integer,
    list_id integer,
    todo_name text NOT NULL,
    completion_status integer NOT NULL DEFAULT 0,
    creation_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    visibility_level integer NOT NULL DEFAULT 1, -- 0: private, 1: public
    
    PRIMARY KEY (id, list_id),
    FOREIGN KEY (list_id) REFERENCES lists(id)
);