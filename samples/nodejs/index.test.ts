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

async function demonstrateWait() {
  console.log('Starting operation.');
  await sleep(3); // Wait for 3 milliseconds
  console.log('Operation continued after 3 milliseconds.');
}

/**
 * Sleep for N Milliseconds
 * @param ms {number}
 * @returns {nothing}
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('cacheExists', async () => {
  const flag = await cache.cache_exists();
  expect(flag).toBeTrue();
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
    await cache.cache_set(cache_key, cache_value);
    console.log(`${i}: ${cache_key}=${cache_value}`);
  }

  const flag = await cache.has_keys();
  expect(flag).toBeTrue();

  keys.forEach(async (cache_key) => {
    let cache_value = await cache.cache_get(cache_key);
    expect(cache_value).toBeTruthy();
  });
});

test('expires', async () => {
  let i_len = 7;
  let i_ct = getRandomInt(i_len, i_len * 3);
  let cache_key = getRandomString(i_ct);
  i_len = 14;
  i_ct = getRandomInt(i_len, i_len * 4);
  let cache_value = getRandomString(i_ct);

  const currentTimeAsMs = Date.now();
  const adjustedTimeAsMs = currentTimeAsMs + 1;
  const expires = new Date(adjustedTimeAsMs);

  await cache.cache_set(cache_key, cache_value, expires);

  await sleep(5);

  const val2 = await cache.cache_get(cache_key);

  expect(PAC.isBlank(val2)).toBeTrue();
});
