-- cache_set (or update)

CREATE OR REPLACE PROCEDURE {schema}.cache_set(
    IN cache_key varchar(255),
    IN cache_value text,
    IN key_expires timestamptz DEFAULT 'infinity'::timestamptz 
)
LANGUAGE 'plpgsql'
AS $BODY$

BEGIN

    IF cache_key IS NULL or length(cache_key) < 1 THEN
        RAISE EXCEPTION 'Key can not be empty';
    END IF;

    IF cache_value is NULL or length(cache_value) < 1 THEN
        cache_value := '';
    END IF;

    IF key_expires is NULL THEN
        key_expires := 'infinity'::timestamptz;
    END IF;

    RAISE NOTICE '%, %, %', cache_key, cache_value, key_expires;

    INSERT INTO {schema}.cache (key, value, expires) 
        VALUES (cache_key, cache_value, key_expires) 
    ON CONFLICT (key) DO 
        UPDATE SET value = cache_value, expires = key_expires;

END;
$BODY$;

ALTER PROCEDURE {schema}.cache_set(varchar, text, timestamptz)
    OWNER TO postgres;