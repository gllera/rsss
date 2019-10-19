-- Up

CREATE TABLE feed
(
    feed_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id   INTEGER REFERENCES source ON DELETE CASCADE,
    guid        VARCHAR NOT NULL UNIQUE,
    url         VARCHAR NOT NULL,
    title       VARCHAR NOT NULL,
    content     TEXT NOT NULL,
    date        DATETIME NOT NULL,
    seen        INT NOT NULL DEFAULT 0,
    star        INT NOT NULL DEFAULT 0
);

CREATE TABLE source
(
    source_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    url         VARCHAR NOT NULL UNIQUE,
    title       VARCHAR,
    description VARCHAR,
    siteUrl     VARCHAR,
    lang        VARCHAR
);

-- Down
DROP TABLE feed;
DROP TABLE source;