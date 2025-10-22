select routine_type, routine_name from information_schema.routines 
where specific_schema = 'test_cache_01'
order by routine_name
;