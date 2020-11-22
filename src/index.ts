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
  .option('--envFile <value>', 'Env file path')
  .option('--secretVar <value>', 'Env variable name for FaunaDB Secret');
program.parse(process.argv);

const secretVar = program.secretVar || 'FAUNADB_SECRET';

let envConfig: any;
if (program.envFile) {
  const envResult = require('dotenv').config({ path: program.envFile });  

  if(envResult.error) {
    throw envResult.error;
  }
  envConfig = envResult.parsed
} else {
  envConfig = process.env;
}

const MIGRATION_FOLDER = program.migrationFolder || envConfig['FAUNADB_MIGRATION_FOLDER']  || "./migrations";

const faunaDbConfig: faunadb.ClientConfig = {
  secret: envConfig[secretVar],
  domain: program.domain || envConfig['FAUNADB_DOMAIN'],
  port: program.port || envConfig['FAUNADB_PORT'],
  scheme: program.scheme || envConfig['FAUNADB_SCHEME'],
};

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
