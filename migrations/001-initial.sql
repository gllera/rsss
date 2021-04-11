-- Up

CREATE TABLE feed
(
    feed_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id   INTEGER REFERENCES source ON DELETE CASCADE,
    guid        VARCHAR NOT NULL UNIQUE,
    link        VARCHAR NOT NULL,
    title       VARCHAR NOT NULL,
    content     TEXT NOT NULL,
    date        DATETIME NOT NULL,
    seen        INT NOT NULL DEFAULT 0,
    star        INT NOT NULL DEFAULT 0
);

CREATE TABLE source
(
    source_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    xml_url     VARCHAR NOT NULL UNIQUE,
    html_url    VARCHAR,
    title       VARCHAR,
    tag         VARCHAR,
    lang        VARCHAR,
    tuners      VARCHAR NOT NULL DEFAULT '',
    err         VARCHAR,
    last_fetch  DATETIME NOT NULL DEFAULT 0,
    description VARCHAR
);

CREATE VIEW source_view
AS 
    SELECT 
        s.*,
        COUNT(f1.source_id) AS 'count',
        COUNT(f2.source_id) AS 'unseen',
        COUNT(f3.source_id) AS 'stars'
    FROM 
        source AS s
            LEFT JOIN feed AS f1
                ON s.source_id = f1.source_id
            LEFT JOIN feed AS f2
                ON f1.feed_id = f2.feed_id AND f2.seen = 0
            LEFT JOIN feed AS f3
                ON f1.feed_id = f3.feed_id AND f3.star = 1
    GROUP BY
        s.source_id

-- Down
DROP VIEW source_view;
DROP TABLE feed;
DROP TABLE source;