#!/usr/bin/env node

import program from "commander";
import faunadb from "faunadb";
import minimist from 'minimist';
import setupMigrations from "./setupMigrations";
import createMigration from "./createMigration";
import migrate from "./migrate";
import rollback from "./rollback";

const args = minimist(process.argv.slice(2));

const MIGRATION_FOLDER = args['migration_folder'] ?? "./migrations";

console.log(process.argv);

const faunaDbConfig: faunadb.ClientConfig = {
  secret: String(process.env[args['secret_env_variable_name'] ?? 'FAUNADB_SECRET'])
};

if (args['domain']) faunaDbConfig['domain'] = args['domain'];
if (args['port']) faunaDbConfig['port'] = args['port'];
if (args['scheme']) faunaDbConfig['scheme'] = args['scheme'];

const client = new faunadb.Client(faunaDbConfig);

export {
  setupMigrations,
  createMigration,
  migrate,
  rollback,
  MIGRATION_FOLDER
};

program.version("0.0.1").description("Fauna migrate tool");

program
  .command("setup")
  .description("Setup migrations")
  .action(() => setupMigrations(client));

program
  .command("create <migrationName>")
  .description("Create a migration file")
  .action((migrationName: string) =>
    createMigration(migrationName, MIGRATION_FOLDER)
  );

program
  .command("migrate")
  .description("Run migrations")
  .action(() => migrate(MIGRATION_FOLDER, client));

program
  .command("rollback")
  .description("Run rollback")
  .action(() => rollback(MIGRATION_FOLDER, client));

program.parse(process.argv);
