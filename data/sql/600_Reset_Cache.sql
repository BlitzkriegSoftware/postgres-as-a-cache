
DROP PROCEDURE IF EXISTS {schema}.reset_cache();

CREATE OR REPLACE PROCEDURE {schema}.reset_cache()
LANGUAGE 'plpgsql'
AS $BODY$

BEGIN

    truncate table {schema}.cache;
    
	-- IF EXISTS (select pg_current_xact_id_if_assigned()) THEN
	-- 	COMMIT;
	-- END IF;

END;
$BODY$;

ALTER PROCEDURE {schema}.reset_cache()
    OWNER TO postgres;
