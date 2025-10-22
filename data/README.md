# Postgres Cache Schema

- [Postgres Cache Schema](#postgres-cache-schema)
  - [Schema](#schema)
  - [Tables](#tables)
  - [Functions and Procedures](#functions-and-procedures)
  - [Test Scripts](#test-scripts)
  - [Administrative Objects](#administrative-objects)


Here is the Schema for Postgres Cache

## Schema

Each cache is stored in its own [schema](./sql/110_Schema.sql). One schema one cache. Delete the schema delete all the cache elements. 

## Tables

A single simple table: [cache](./sql/140_Cache.sql)

## Functions and Procedures

* [Set a key + value](./sql/160_Cache_Set.sql)
* [Get a value from a key](./sql/180_Cache_Get.sql)

## Test Scripts

* [Random Integer in a Range](./sql/200_Random_Between.sql)
* [Random String](./sql/210_Random_String.sql)
* [Test Script (also a nice demo)](./sql/901_Post_Deploy_Test.sql)

## Administrative Objects

* [Setup Cron](./sql/800_Cron_Setup.sql)
* [Reset (empty) Cache](./sql/600_Reset_Cache.sql)

[^Up to main](../README.md)