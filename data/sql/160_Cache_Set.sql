-- cache_set (or update)

CREATE OR REPLACE PROCEDURE {schema}.cache_set(
    IN key varchar(255),
    IN value text
)
LANGUAGE 'plpgsql'
AS $BODY$

BEGIN

    IF key IS NULL or length(key) < 1 THEN
        RAISE EXCEPTION 'Key can not be empty';
    END IF;

    if value is NULL or length(value) < 1 THEN
        value := '';
    END IF;

    INSERT INTO cache (key, value) 
        VALUES (key, value) 
    ON CONFLICT (key) DO 
        UPDATE SET value = value;

END;
$BODY$;

ALTER PROCEDURE {schema}.cache_set(varchar, text)
    OWNER TO postgres;