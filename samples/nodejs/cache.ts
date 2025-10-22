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

  async cache_set(cache_key: string, cache_value: string): Promise<void> {
    if (isBlank(cache_key)) {
      throw new CacheError('Key must not be empty', CacheErrorCode.BadKey);
    }
  }

  async cache_get(cache_key: string): Promise<string> {}

  async cache_reset(): Promise<void> {}

  async has_keys(): Promise<boolean> {}

  async cache_exists(): Promise<boolean> {}
}
