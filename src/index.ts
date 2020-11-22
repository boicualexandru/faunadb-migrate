#!/usr/bin/env node

import program from "commander";
import faunadb from "faunadb";
import setupMigrations from "./setupMigrations";
import createMigration from "./createMigration";
import migrate from "./migrate";
import rollback from "./rollback";

program.version("0.0.1").description("Fauna migrate tool")
  .option('--domain <value>', 'Domain')
  .option('--port <value>', 'Port')
  .option('--scheme <value>', 'Scheme')
  .option('--migrationFolder <value>', 'Migrations folder')
  .option('--secretEnvVariableName <value>', 'Env variable name for FaunaDB Secret');
program.parse(process.argv);
  
const MIGRATION_FOLDER = program.migrationFolder || "./migrations";

const faunaDbConfig: faunadb.ClientConfig = {
  secret: String(process.env[program.secretEnvVariableName || 'FAUNADB_SECRET'])
};

if (program.domain) faunaDbConfig.domain = program.domain;
if (program.port) faunaDbConfig.port = program.port;
if (program.scheme) faunaDbConfig.scheme = program.scheme;

console.log(faunaDbConfig, program.migrationFolder, program.secretEnvVariableName, process.env);

const client = new faunadb.Client(faunaDbConfig);

export {
  setupMigrations,
  createMigration,
  migrate,
  rollback,
  MIGRATION_FOLDER
};

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
