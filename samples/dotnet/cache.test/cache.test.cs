using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Xunit.Abstractions;

namespace cache.test.csproj;

[ExcludeFromCodeCoverage]
public class Queue_Test
{
    #region "Privates"
    Random dice = new Random();
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
            int str_len = 7;
            int str_ct = dice.Next(str_len, str_len * 3);
            string cache_key = RandomString(str_ct);
            keys.Add(cache_key);
            str_len = 11;
            str_ct = dice.Next(str_len, str_len * 4);
            string cache_value = RandomString(str_ct);
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

}
