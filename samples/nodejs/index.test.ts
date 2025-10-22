'use strict';
/**
 * Requires
 */
// import { checkPort } from './checkPort';
import { test, expect, setDefaultTimeout, beforeEach } from 'bun:test';
import { getRandomInt } from './getRandomInt';
import { PAC } from './cache';
import { getRandomString } from './getRandomString';
import { $ } from 'bun';

const test_timeout = 90000;
const item_count = 25;

const cache = new PAC();

/**
 * Increase test time
 */
setDefaultTimeout(test_timeout);

/**
 * Reset Queue in between tests
 */
beforeEach(async () => {
  await cache.cache_reset();
});

test('cacheExists', async () => {
  expect(cache.cache_exists()).toBeTrue();
});

test('cacheTests', async () => {
  let keys: string[] = [];
  for (let i = 0; i < item_count; i++) {
    let i_len = 7;
    let i_ct = getRandomInt(i_len, i_len * 3);
    let cache_key = getRandomString(i_ct);
    keys.push(cache_key);
    i_len = 14;
    i_ct = getRandomInt(i_len, i_len * 4);
    let cache_value = getRandomString(i_ct);
    cache.cache_set(cache_key, cache_value);
    console.log(`{i}: {cache_key}={cache_value}`);
  }

  expect(cache.has_keys()).toBeTrue();

  keys.forEach((cache_key) => {
    let cache_value = cache.cache_get(cache_key);
    expect(cache_value).toBeTruthy();
  });
});
