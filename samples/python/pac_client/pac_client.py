from datetime import datetime, timedelta
import psycopg2
import logging

logging.basicConfig(level=logging.DEBUG)

class pac_client:

    """
    Default connection string - the demo docker one
    """
    default_connection_string = 'postgresql://postgres:password123-@localhost:5432/postgres'

    """
    Default Schema Name
    """
    default_schema_name = 'test_cache_01'

    """
    Default Role Name
    """
    default_role_name = 'queue_role'

    """
    Postgres Quote Character
    """
    postgres_quote = "'"

    """
    CTOR
    """    
    def __init__(
        self, 
        connection_string = default_connection_string, 
        schema_name =default_schema_name, 
        role_name = default_role_name
    ):
        self.connection_string = connection_string
        self.schema_name = schema_name
        self.role_name = role_name

    """
    store value into cache with key with expiration
    """
    def cache_set(self, cache_key: str, cache_value: str, cache_expires: timedelta = timedelta(364885)):

        if cache_expires is None:
            cache_expires = timedelta(year = 9999)
        
        exp = datetime.now() + cache_expires;

        self.microsecond = 0
        self.tzinfo = None
        dt: str = exp.isoformat()    

        sql: str = f"CALL ${self.schema_name}.cache_set(${pac_client.quote_it(cache_key)}, ${pac_client.quote_it(cache_value)}, ${pac_client.quote_it(dt)});"
        self.do_query(sql)

    """
    Get a value from a cache given key
    """
    def cache_get(self, cache_key:str) -> str:
        cache_value: str = ''
        sql: str = f"select value from ${self.schema_name}.cache_get( ${pac_client.quote_it(cache_key)} );"
        dt = self.do_query(sql)
        if pac_client.has_rows(dt):
            cache_value = dt[0][0]
        return cache_value
    
    """
    Test to see if a queue exists
    """
    def queue_exists(self) -> bool:
        sql: str = f"SELECT c.relname AS object_name, CASE c.relkind WHEN 'r' THEN 'TABLE' WHEN 'v' THEN 'VIEW' WHEN 'm' THEN 'MATERIALIZED_VIEW' WHEN 'S' THEN 'SEQUENCE' ELSE 'OTHER_RELATION' END AS object_type FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = '{self.schema_name}' AND c.relkind IN ('r', 'v', 'm', 'S') ORDER BY object_type, object_name"
        dt = self.do_query(sql)
        return pac_client.has_rows(dt)
    
    """
    Test to see if a queue has messages
    """
    def has_keys(self) -> bool:
        sql: str = f"select count(1) as CT from {self.schema_name}.cache"
        dt = self.do_query(sql)
        return pac_client.has_rows(dt)
    
    """
    Reset a queue to empty state
    """
    def reset_queue(self):
        sql: str = f"CALL {self.schema_name}.reset_cache()"
        self.do_query(sql)

    """
    Does a query give sql returns rows
    """
    def do_query(self, sql: str) -> list[tuple[any]]:
        debug_message: str = f"SQL: {sql}"
        print(debug_message)
        logging.debug(debug_message)
        
        conn = None
        cur = None
        rows = []
        
        try:
            with psycopg2.connect(self.connection_string) as conn:
                # conn.autocommit = True
                with conn.cursor() as cur:
                    # cur.open()  
                    cur.execute(sql)
                    if not sql.lower().startswith('call'):
                        rows = cur.fetchall()

        except Exception as e:
            print(f"Error connecting to PostgreSQL: {e}")

        finally:
            if conn is not None:
                cur.close()
                conn.close()

        return rows
    
    """
    Test to see if data table has rows
    """
    @staticmethod
    def has_rows(dt: list[tuple[any]]) -> bool:
        if dt is None:
            return False
        
        if len(dt) <= 0:
            return False
        
        return True
    
    """
    Postgres quote a string
    """
    @staticmethod
    def quote_it(text: str = "", delim: str = postgres_quote) -> str:
        if not isinstance(text, str):
            text = ""
        if len(text) < 1:
            text = ""
        text = text.strip()
        if not text.startswith(delim):
            text = delim + text
        if not text.endswith(delim):
            text = text + delim
        return text
    