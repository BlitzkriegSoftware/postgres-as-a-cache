using System.Diagnostics.CodeAnalysis;
using System.Text;
using Microsoft.Extensions.Logging;

namespace cache.test.csproj;

[ExcludeFromCodeCoverage]
public class Queue_Test
{
    #region "Privates"

    private static int milliseconds = DateTimeOffset.UtcNow.Millisecond;

    Random dice = new Random(milliseconds);
    string validChars = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.";
    private readonly ITestOutputHelper _testOutputHelper;
    #endregion

    #region "Helpers"
    private string RandomString(int length)
    {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++)
        {
            int index = dice.Next(0, validChars.Length - 1);
            sb.Append(validChars.Substring(i, 1));
        }
        return sb.ToString();
    }

    private string RandomKey()
    {
        int str_len = 7;
        int str_ct = dice.Next(str_len, str_len * 3);
        string cache_key = RandomString(str_ct);
        return cache_key;
    }

    private string RandomValue()
    {
        int str_len = 11;
        int str_ct = dice.Next(str_len, str_len * 4);
        string cache_value = RandomString(str_ct);
        return cache_value;
    }

    #endregion

    /// <summary>
    /// CTOR
    /// <para>
    /// Clear Queue Tables before every test
    /// </para>
    /// </summary>
    public Queue_Test(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;

        var cache = MakeClient();
        cache.Reset();
    }

    /// <summary>
    /// Make Client w. Console Logger
    /// </summary>
    /// <returns>PAC Client</returns>
    PAC MakeClient()
    {
        ILogger logger = LogFactoryHelper.CreateLogger<Queue_Test>();
        PAC queue = new PAC(
            logger,
            PAC.DefaultConnectionString,
            PAC.DefaultSchemaName,
            PAC.DefaultRoleName
        );
        return queue;
    }

    [Fact]
    public void Simulate_UoW()
    {
        const int test_count = 20;

        PAC cache = MakeClient();

        Assert.True(cache.Exists());

        // Remember some keys
        List<string> keys = new();

        // Queue up some messages
        for (int i = 0; i < test_count; i++)
        {
            string cache_key = RandomKey();
            keys.Add(cache_key);
            string cache_value = RandomValue();
            cache.Cache_Set(cache_key, cache_value);
        }

        Assert.True(cache.HasKeys());

        for (int i = 0; i < test_count; i++)
        {
            try
            {
                string cache_key = keys[i];
                string cache_value = cache.Cache_Get(cache_key);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }

    [Fact]
    public void Test_Expiration()
    {
        PAC cache = MakeClient();
        Assert.True(cache.Exists());

        // UC: Key Expires
        string cache_key = RandomKey();
        string cache_value = RandomValue();
        DateTime expires = DateTime.Now.AddMilliseconds(1);
        cache.Cache_Set(cache_key, cache_value, expires);
        Thread.Sleep(30);
        string val2 = cache.Cache_Get(cache_key);
        Assert.True(string.IsNullOrWhiteSpace(val2));
    }
}
