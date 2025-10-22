DO $$

DECLARE 
    cron_vacuum_default varchar :=  '45 4 * * *';

BEGIN
    -- bonus, do a nightly vacuum
    PERFORM cron.schedule('nightly-vacuum', cron_vacuum_default, 'VACUUM');

    -- list of jobs
    -- select jobid, jobname, schedule, command from cron.job;

    -- job execution history
    -- select * from cron.job_run_details order by start_time desc;

END $$ LANGUAGE plpgsql;
