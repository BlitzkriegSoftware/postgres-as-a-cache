DO $$

DECLARE 
    -- Every night at 4:45am
    cron_vacuum_default varchar :=  '45 4 * * *';
    -- Every 15 minutes
    cron_cleanup_default varchar := '*/15 * * * *';

BEGIN
    -- bonus, do a nightly vacuum
    PERFORM cron.schedule('nightly-vacuum', cron_vacuum_default, 'VACUUM ANALYZE {schema}.cache;');

    -- delete expired keys
    PERFORM cron.schedule('cache_cleanup', cron_cleanup_default, 'call {schema}.cache_cleanup();');

    -- list of jobs
    -- select jobid, jobname, schedule, command from cron.job;

    -- job execution history
    -- select * from cron.job_run_details order by start_time desc;

END $$ LANGUAGE plpgsql;