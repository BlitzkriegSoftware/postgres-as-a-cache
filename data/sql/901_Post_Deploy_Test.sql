-- Test post queue deployment
-- DO NOT RUN ON A LIVE QUEUE
-- 
CREATE OR REPLACE PROCEDURE {schema}.post_deploy_test(
    -- 0 clear no data, 1 at begining, 2 at begining and end of test
    test_flag integer DEFAULT 2,
    -- How many iterations
    test_iterations integer DEFAULT 100   
)
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE
    loop_count INTEGER DEFAULT 0;
    test_iteration_default INTEGER := 100;
    test_result INTEGER DEFAULT 0; -- 0 Pass, 1 Fail
    test_result_text varchar(128);

BEGIN
    -- clean start
    IF test_flag > 0 THEN
        call {schema}.reset_cache();
        RAISE NOTICE 'reset_cache';
    END IF;

    IF test_iterations < 0 THEN
        test_iterations := test_iteration_default;
    END IF;

    --
    -- The PRODUCER
    loop_count := 0;
    loop
        exit when loop_count >= test_iterations;
        loop_count := loop_count + 1;
        call {schema}.cache_set(key, value);
    end loop;

    -- The CONSUMER
    test_iterations_consumer := test_iterations * 2 / 3;
    
    loop_count := 0;
    loop
        exit when loop_count >= test_iterations_consumer;
        loop_count := loop_count + 1;

        select c.key, c.value into key, value from {schema}.cache as c SKIP (loop_count);

        RAISE NOTICE '[%] cache_get. key: % = %', loop_count, key, value;

    END LOOP;

    -- Reset is desirable
    IF test_flag > 1 THEN
        call {schema}.reset_cache();
        RAISE NOTICE 'reset_cache';
    END IF;

    --
    -- Test Results
    IF test_result = 0 THEN
        test_result_text := 'pass';
    ELSE
        test_result_text := 'fail';
    END IF;

	RAISE NOTICE 'test result: %, Failed Tests: %', test_result_text, test_bad;

END;
$BODY$;
