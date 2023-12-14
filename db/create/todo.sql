CREATE TABLE users (
    id integer PRIMARY KEY AUTOINCREMENT,
    username text NOT NULL,
    password_hash text NOT NULL,
    creation_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    completion_status integer DEFAULT 0 NOT NULL,
    creation_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, list_id),
    FOREIGN KEY (list_id) REFERENCES lists(id)
);