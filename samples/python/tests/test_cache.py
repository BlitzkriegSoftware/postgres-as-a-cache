from datetime import timedelta
from time import sleep
import pytest
import random
import string
import logging
import logging.config
import sys

sys.path.append("../pac_client/")
from pac_client import pac_client

test_count: int = 5

# Logging 
logging_config = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
            'level': 'DEBUG',
            'formatter': 'detailed',
        },
    },
    'formatters': {
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        },
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['console'],
    },
}
logging.config.dictConfig(logging_config)
logger = logging.getLogger(__name__)

def test_uow():
    whereami: str = 'ctor'
    client = pac_client.pac_client()
    assert client is not None

    keys = []
    whereami = 'set'
    for i in range(test_count):
        cache_key = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        keys.append(cache_key)
        cache_value = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
        print(f"{whereami}. {cache_key}={cache_value}")
        client.cache_set(cache_key, cache_value)

    whereami = 'get'    
    for i in range(test_count):
        cache_key = keys[i]
        cache_value = client.cache_get(cache_key)
        print(f"{whereami}. {cache_key}={cache_value}")
        
        
def test_exp():
    client = pac_client.pac_client()
    assert client is not None
    cache_key = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    cache_value = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
    client.cache_set(cache_key, cache_value, timedelta(0,0,0,1))
    sleep(1) 
    cache_value2 = client.cache_get(cache_key)
    assert cache_value != cache_value2