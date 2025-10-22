import { resolve } from 'path';
import * as pg from 'pg';

/**
 * Default connection string - the demo docker one
 * @constant
 */
export const defaultConnectionString =
  'postgresql://postgres:password123-@localhost:5432/postgres';

/**
 * Default Schema Name
 * @constant
 */
export const defaultSchemaName = 'test_cache_01';

/**
 * Default Role Name
 * @constant
 */
export const defaultRoleName = 'queue_role';

/**
 * @enum
 * CacheErrorCode
 */
export enum CacheErrorCode {
  Unknown,
  BadKey,
  NotFound,
  BadField,
  QueryExecution
}

/**
 * @class
 * Custom Error: Cache Error
 */
export class CacheError extends Error {
  public readonly CacheErrorCode: CacheErrorCode = CacheErrorCode.Unknown;
  /**
   * CTOR
   * @constructor
   * @param message {string}
   * @param CacheErrorCode {CacheErrorCode} - Custom Error Code
   */
  constructor(message: string, CacheErrorCode: CacheErrorCode) {
    super(message);
    this.name = 'CustomValidationError'; // Set the name for identification
    this.CacheErrorCode = CacheErrorCode;
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

/**
 * Postgres as Cache - NodeJs Wrapper
 * @class
 */
export class PAC {
  /**
   * @field
   * Connection String - To Postgres SQL Server
   */
  private connectionString: string;
  /**
   * @field
   * Schema Name
   */
  private schemaName: string;
  /**
   * @field
   * Role Name (unused)
   */
  private roleName: string;
  /**
   * @field
   * PG Client Config
   */
  private client_config: pg.ClientConfig;

  /**
   * CTOR
   * @constructor
   * @param connectionString
   * @param schema
   * @param rolename
   */
  constructor(
    connectionString: string = defaultConnectionString,
    schemaname: string = defaultSchemaName,
    rolename: string = defaultRoleName
  ) {
    this.connectionString = connectionString;
    this.schemaName = schemaname;
    this.roleName = rolename;

    this.client_config = {
      connectionString: connectionString
    };
  }

  /**
   * True if is falsy or just whitespace
   * @name #isBlank
   * @function
   * @param {String} str
   * @returns {Boolean} isNullOrWhitespace
   */
  static isBlank(text: any) {
    return !text || /^\s*$/.test(text);
  }

  /**
   * quoteIt - puts Postgres single-quotes around a string
   * @function
   * @param text
   * @returns
   */
  static quoteIt(text: string): string {
    if (text === null) {
      text = '';
    }
    text = text.trim();
    if (!text.startsWith("'") || !text.endsWith("'")) {
      text = "'" + text + "'";
    }
    return text;
  }

  /**
   * doQuery in SQL, out QueryResult<any>
   * @async
   * @function
   * @param sql {string}
   * @returns {pg.QueryResult<any>}
   */
  async doQuery(sql: string): Promise<pg.QueryResult<any>> {
    let result: any = null;
    console.log(`SQL: ${sql}`);
    let client = new pg.Client(this.client_config);
    try {
      await client.connect();
      result = await client.query(sql);
    } catch (e) {
      console.log(e);
      throw new CacheError(
        `doQuery(${sql}), Error: ${e}`,
        CacheErrorCode.QueryExecution
      );
    } finally {
      await client.end();
    }
    return result;
  }

  /**
   * Test to see if a result has rows
   * @param result {pg.QueryResult<any>}
   * @returns {boolean}
   */
  static has_rows(result: pg.QueryResult<any>) {
    return result !== null && result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Cache a value with a name
   * @param cache_key {string}
   * @param cache_value {string}
   */
  async cache_set(cache_key: string, cache_value: string): Promise<void> {
    if (PAC.isBlank(cache_key)) {
      throw new CacheError('Key must not be empty', CacheErrorCode.BadKey);
    }
    if (PAC.isBlank(cache_value)) {
      cache_value = '';
    }
    const sql = `CALL ${this.schemaName}.cache_set(${PAC.quoteIt(cache_key)}, ${PAC.quoteIt(cache_value)});`;
    await this.doQuery(sql);
  }

  /**
   * Get a value given a key
   * @param cache_key {string}
   * @returns {string}
   */
  async cache_get(cache_key: string): Promise<string> {
    if (PAC.isBlank(cache_key)) {
      throw new CacheError('Key must not be empty', CacheErrorCode.BadKey);
    }
    let cache_value: string = '';
    const sql = `select c.value as item_value into cache_value, cache_value from ${this.schemaName}.cache where c.key = ${PAC.quoteIt(cache_key)};`;
    const result = await this.doQuery(sql);
    if (PAC.has_rows(result)) {
      cache_value = result.rows[0].item_value;
    }
    return cache_value;
  }

  /**
   * Reset Cache
   */
  async cache_reset(): Promise<void> {
    const sql: string = `CALL ${this.schemaName}.reset_cache();`;
    await this.doQuery(sql);
  }

  /**
   * Cache has keys?
   * @returns {boolean}
   */
  async has_keys(): Promise<boolean> {
    const sql: string = `select count(1) as ct from ${this.schemaName}.cache;`;
    const result = await this.doQuery(sql);
    return PAC.has_rows(result);
  }

  /**
   * Test if cache exist
   * @returns {boolean}
   */
  async cache_exists(): Promise<boolean> {
    const sql = `SELECT c.relname AS object_name, CASE c.relkind WHEN 'r' THEN 'TABLE' WHEN 'v' THEN 'VIEW' WHEN 'm' THEN 'MATERIALIZED_VIEW' WHEN 'S' THEN 'SEQUENCE' ELSE 'OTHER_RELATION' END AS object_type FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = '${this.schemaName}' AND c.relkind IN ('r', 'v', 'm', 'S') ORDER BY object_type, object_name;`;
    const result = await this.doQuery(sql);
    return PAC.has_rows(result);
  }
}
