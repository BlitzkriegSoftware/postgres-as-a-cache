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
    keys = []
    for i in range(test_count):
        cache_key = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        keys.append(cache_key)
        cache_value = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
        pac_client.cache_set(cache_key, cache_value)
    
    for i in range(test_count):
        cache_key = keys[i]
        cache_value = pac_client.cache_get(cache_key)
