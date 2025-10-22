DROP FUNCTION IF EXISTS {schema}.cache_get(character varying);

CREATE OR REPLACE FUNCTION {schema}.cache_get(
    in key varchar(255),
    OUT value text
)
RETURNS  text
LANGUAGE 'plpgsql'
COST 100
VOLATILE PARALLEL UNSAFE
AS $$

DECLARE 
    cache_value text DEFAULT '';
    row_count integer DEFAULT 0; 

BEGIN

    IF key IS NULL or length(key) < 1 THEN
        RAISE EXCEPTION 'Key can not be empty';
    END IF;

    SELECT c.value into cache_value FROM {schema}.cache as c WHERE key = key;
    GET DIAGNOSTICS row_count = ROW_COUNT;
	
	IF row_count > 0 THEN
        value = cache_value;
    END IF;

    return; 
END;
$$;

ALTER FUNCTION {schema}.cache_get(character varying)
    OWNER TO postgres;

