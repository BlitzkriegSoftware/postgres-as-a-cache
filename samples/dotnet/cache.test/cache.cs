namespace cache.test.csproj;

using System;
using System.Data;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Npgsql;

#region  "Custom Exceptions"

/// <summary>
/// PEQ Client Error Codes
/// </summary>
public enum CacheErrorCode : int
{
    Unknown = 0,
    NotFound,
    BadKey,
    QueryExecution,
}

/// <summary>
/// Custom Exception
/// </summary>
[Serializable]
[ExcludeFromCodeCoverage]
public class CacheException : Exception
{
    public CacheErrorCode ErrorCode = CacheErrorCode.Unknown;

    public CacheException()
        : base() { }

    public CacheException(string message)
        : base(message) { }

    public CacheException(string message, Exception innerException)
        : base(message, innerException) { }

    public CacheException(string message, CacheErrorCode errorCode)
        : base(message)
    {
        ErrorCode = errorCode;
    }

    public CacheException(string message, CacheErrorCode errorCode, Exception innerException)
        : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}

#endregion

/// <summary>
/// Cache Items returned by DeCache()
/// </summary>
public class CacheItem
{
    /// <summary>
    /// Message Id (PK)
    /// </summary>
    public string Cache_Key { get; set; } = string.Empty;

    /// <summary>
    /// Message Payload
    /// </summary>
    public string Cache_Value
    { get; set; } = string.Empty;

    /// <summary>
    /// CTOR
    /// </summary>
    /// <param name="cache_key">(sic)</param>
    /// <param name="expires">(sic)</param>
    /// <param name="cache_value">(sic)</param>
    public CacheItem(string cache_key, string cache_value)
    {
        this.Cache_Key = cache_key;
        this.Cache_Value = cache_value;
    }
}

/// <summary>
/// Postgres Enterprise Cache (client)
/// </summary>
public class PAC
{
    #region  "Constants"

    /// <summary>
    /// Default: Postgres Connection String (local docker)
    /// </summary>
    public const string DefaultConnectionString =
        "postgresql://postgres:password123-@localhost:5432/postgres";

    /// <summary>
    /// Default: Schema Name (for testing)
    /// </summary>
    public const string DefaultSchemaName = "test_cache_01";

    /// <summary>
    /// Default: Role Name
    /// (Unused)
    /// </summary>
    public const string DefaultRoleName = "cache_role";

    /// <summary>
    /// Quote Character in Postgres
    /// </summary>
    public const string PostgresQuote = "'";

    #endregion

    #region "Fields"

    private string connectionString = string.Empty;
    private string schemaName = string.Empty;
    private string roleName = string.Empty;
    private ILogger? logger;

    #endregion

    #region "CTOR"

    /// <summary>
    /// CTOR: Empty not allowd
    /// </summary>
    private PAC() { }

    /// <summary>
    /// CTOR
    /// </summary>
    /// <param name="connectionString">(required) Postgres Connection String</param>
    /// <param name="schemaName">(required) Schema Name</param>
    /// <param name="roleName">(optional) (not used) (future) Role Name</param>
    public PAC(ILogger logger, string connectionString, string schemaName, string roleName)
    {
        this.logger = logger;
        this.schemaName = schemaName;
        this.roleName = roleName;

        if (NpgsqlConnectionStringParser.IsPostgresFormat(connectionString))
        {
            var parser = NpgsqlConnectionStringParser.Parse(connectionString);
            parser.Pooling = false;
            connectionString = parser.ToNpgsqlConnectionString();
        }

        this.connectionString = connectionString ?? string.Empty;
    }

    #endregion

    #region "Helpers"

    /// <summary>
    /// Force Quotes around Postgres Strings
    /// </summary>
    /// <param name="text">string to quote</param>
    /// <returns>Quoted string</returns>
    public static string QuoteIt(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            text = string.Empty;
        text = text.Trim();
        if (!text.StartsWith(PostgresQuote))
            text = PostgresQuote + text;
        if (!text.EndsWith(PostgresQuote))
            text = text + PostgresQuote;
        return text;
    }

    /// <summary>
    /// Has Rows
    /// </summary>
    /// <param name="dt">DataTable</param>
    /// <returns>True if so</returns>
    public static bool HasRows(DataTable dt)
    {
        return (dt != null) && (dt.Rows != null) && (dt.Rows.Count > 0);
    }

    #endregion

    #region "doQuery"

    /// <summary>
    /// doQuery(sql)
    /// </summary>
    /// <param name="sql">SQL Statement</param>
    /// <returns>Data Table</returns>
    public DataTable DoQuery(string sql)
    {
        var dataTable = new DataTable();

        var logMessage = $"DoQuery({sql})";
        Debug.WriteLine(logMessage);

        try
        {
            using var dataSource = NpgsqlDataSource.Create(this.connectionString);
            using var connection = dataSource.OpenConnection();
            // using var transaction = connection.BeginTransaction();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.CommandType = CommandType.Text;
            using var adapter = new NpgsqlDataAdapter(command);
            adapter.Fill(dataTable);
            logger?.LogInformation(logMessage);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"{logMessage}, ex: {ex}");
            logger?.LogError(ex, logMessage);
            throw new CacheException(logMessage, CacheErrorCode.QueryExecution, ex);
        }
        return dataTable;
    }
    #endregion

    /// <summary>
    /// Store a key, value
    /// </summary>
    /// <param name="cache_key">(sic)</param>
    /// <param name="cache_value">(sic)</param>
    public void Cache_Set(string cache_key, string cache_value)
    {
        string sql = $"CALL {this.schemaName}.cache_set({PAC.QuoteIt(cache_key)}, {PAC.QuoteIt(cache_value)});";
        _ = DoQuery(sql);
    }

    /// <summary>
    /// Get a value given key
    /// </summary>
    /// <param name="cache_key">(sic)</param>
    /// <returns>value</returns>
    public string Cache_Get(string cache_key)
    {
        string cache_value = string.Empty;
        string sql = $"select c.value as item_value into cache_value, cache_value from {this.schemaName}.cache where c.key = {PAC.QuoteIt(cache_key)};";
        var dt = DoQuery(sql);
        if (HasRows(dt))
        {
            cache_value = dt.Rows[0][0].ToString() ?? string.Empty;
        }
        else
        {
            throw new CacheException($"Key: ${cache_key}", CacheErrorCode.NotFound);
        }
        return cache_value;
    }

    /// <summary>
    /// Cache Exists?
    /// </summary>
    /// <returns>True if so</returns>
    public bool Exists()
    {
        string sql =
            $"SELECT c.relname AS object_name, CASE c.relkind WHEN 'r' THEN 'TABLE' WHEN 'v' THEN 'VIEW' WHEN 'm' THEN 'MATERIALIZED_VIEW' WHEN 'S' THEN 'SEQUENCE' ELSE 'OTHER_RELATION' END AS object_type FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = '{this.schemaName}' AND c.relkind IN('r', 'v', 'm', 'S') ORDER BY object_type, object_name;";
        var dt = DoQuery(sql);
        return HasRows(dt);
    }

    /// <summary>
    /// Has Messages
    /// </summary>
    /// <returns>True if so</returns>
    public bool HasKeys()
    {
        string sql = $"select count(1) as ct from {this.schemaName}.cache;";
        var dt = DoQuery(sql);
        return HasRows(dt);
    }

    /// <summary>
    /// Reset Cache
    /// <para>
    /// Empties out all Cache tables
    /// </para>
    /// </summary>
    public void Reset()
    {
        string sql = $"CALL {this.schemaName}.reset_cache();";
        _ = DoQuery(sql);
    }

}