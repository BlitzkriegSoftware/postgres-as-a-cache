# postgres-as-a-cache

- [postgres-as-a-cache](#postgres-as-a-cache)
  - [Start Postgres and install cron \& pg\_cron](#start-postgres-and-install-cron--pg_cron)
    - [What does it do?](#what-does-it-do)
    - [Docker Postgres SQL Connection String](#docker-postgres-sql-connection-string)
  - [open a bash shell on Postgres container](#open-a-bash-shell-on-postgres-container)
  - [stop postgres](#stop-postgres)
    - [What it does](#what-it-does)
  - [Leverages](#leverages)
    - [pg\_cron](#pg_cron)
    - [Credits](#credits)
  - [Create a Cache](#create-a-cache)
    - [Prerequisites](#prerequisites)
    - [Preparation](#preparation)
  - [Make a cache](#make-a-cache)
    - [Make-cache: What does it do?](#make-cache-what-does-it-do)

* [License](./LICENSE)

Use postgres as a cache

## Start Postgres and install cron & pg_cron

```powershell
.\start-pg.ps1
```

### What does it do?

1. Creates a custom variation of **posgres** from `Dockerfile`, Adds in plugins we want (see file above), Configures plugins 

2. Starts container running, which starts base postgres

3. Reconfigures postgres + Restarts postgres, via:

```bash
./data/configure_pg.sh
```

4. Finishes up by running SQL script:

```bash
./data/pg_cron_add.sh
```

5. Postgres w. plugins ready for use


Notes:
* Horrible work arounds, if you have a better way, create an issue, or put in a PR
* It works though.

### Docker Postgres SQL Connection String

```text
postgresql://postgres:password123-@localhost:5432/postgres
```

## open a bash shell on Postgres container

```powershell
.\bash-pg.ps1
```

It opens a bash shell...with handy guidance

```text
SQL Scripts Folder: /var/lib/postgresql/data
Postgres Logs: /var/log/postgresql
Postgres Utilities Folder: /usr/lib/postgresql/16/bin
In general to run postgres commands you will have to run as the 'postgres' user
su -- postgres -c {pg_command}
root@9022c51945a7:/var/lib/postgresql/data# 
```

## stop postgres

```powershell
.\stop-pg.ps1
```

### What it does

1. Stops image
2. Does a tear down (you can customize to stop this, change start too.

## Leverages

### pg_cron

- [pg_cron](https://github.com/citusdata/pg_cron)

### Credits

I got the idea by reading this fantastic article by info@dizzy.zone you can find it https://dizzy.zone/2025/09/24/Redis-is-fast-Ill-cache-in-Postgres/

## Create a Cache

Create a handy cache with few simple methods, see [Data Schema](./data/README.md) 

### Prerequisites

Make sure you have: Powershell 7+

### Preparation

Checklist

> Prefer: the snake_case convention for postgres names, avoiding reserved words

- [ ] Decide on the DB to host your cache
- [ ] Decide on a unique schema name to host your cache artifacts, thus deleting the schema deletes the cache
- [ ] Decide if you need a custom role, and if so, pick a unique name

## Make a cache

```powershell
.\make-cache.ps1 `
    -ConnectionString "postgresql://postgres:password123-@localhost:5432/postgres" `
    -SchemaName "test_cache_01" `
    -RoleName "test-cache-role"
```

Arguments:
- `ConnectionString`: valid Postgres Connection String (sample is the docker one)
- `SchemaName`: (required) schema to put the cache into
- `RoleName`: (unused, future)

### Make-cache: What does it do?

1. Takes the schema in `sql\` that start with `##_`, starting at the minimum index of *110* inclusive
2. In each file replaces `{schema}` token with your schema name, and `{rolename}` with your role name (not used for now)
3. Copies transformed files into `temp\` folder which is emptied first
4. Execute scripts in numeric order ascending at the postgres instance and database in the connection string
5. When done, the cache is ready for use

This will create the objects in [Data Schema](./data/README.md) 
