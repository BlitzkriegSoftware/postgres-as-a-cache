-- cache_set (or update)

CREATE OR REPLACE PROCEDURE {schema}.cache_set(
    IN cache_key varchar(255),
    IN cache_value text
)
LANGUAGE 'plpgsql'
AS $BODY$

BEGIN

    IF cache_key IS NULL or length(cache_key) < 1 THEN
        RAISE EXCEPTION 'Key can not be empty';
    END IF;

    if cache_value is NULL or length(cache_value) < 1 THEN
        cache_value := '';
    END IF;

    INSERT INTO {schema}.cache (key, value) 
        VALUES (cache_key, cache_value) 
    ON CONFLICT (key) DO 
        UPDATE SET value = cache_value;

END;
$BODY$;

ALTER PROCEDURE {schema}.cache_set(varchar, text)
    OWNER TO postgres;