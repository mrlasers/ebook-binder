--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT
);

INSERT INTO Books (title, author) VALUES ('Dawn of the Lizards', 'Angello Wellson-Noble');

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Books;