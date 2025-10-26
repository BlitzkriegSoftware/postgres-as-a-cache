-- Cache Table

DROP TABLE IF EXISTS {schema}.cache;

CREATE UNLOGGED TABLE IF NOT EXISTS {schema}.cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    expires TIMESTAMP WITH TIME ZONE DEFAULT 'infinity'::timestamptz
);

ALTER TABLE IF EXISTS {schema}.cache
    OWNER to postgres;