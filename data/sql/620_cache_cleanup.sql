CREATE OR REPLACE PROCEDURE {schema}.cache_cleanup()
LANGUAGE 'plpgsql'
AS $BODY$

BEGIN

    delete from {schema}.cache
    where expires > CURRENT_TIMESTAMP;

END;
$BODY$;

ALTER PROCEDURE {schema}.cache_cleanup()
    OWNER TO postgres;