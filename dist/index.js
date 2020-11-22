#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var faunadb_1 = __importDefault(require("faunadb"));
var setupMigrations_1 = __importDefault(require("./setupMigrations"));
exports.setupMigrations = setupMigrations_1.default;
var createMigration_1 = __importDefault(require("./createMigration"));
exports.createMigration = createMigration_1.default;
var migrate_1 = __importDefault(require("./migrate"));
exports.migrate = migrate_1.default;
var rollback_1 = __importDefault(require("./rollback"));
exports.rollback = rollback_1.default;
commander_1.default.version("0.0.1").description("Fauna migrate tool")
    .option('--domain <value>', 'Domain')
    .option('--port <value>', 'Port')
    .option('--scheme <value>', 'Scheme')
    .option('--migrationFolder <value>', 'Migrations folder')
    .option('--secretEnvVariableName <value>', 'Env variable name for FaunaDB Secret');
commander_1.default.parse(process.argv);
var MIGRATION_FOLDER = commander_1.default.migrationFolder || "./migrations";
exports.MIGRATION_FOLDER = MIGRATION_FOLDER;
var faunaDbConfig = {
    secret: String(process.env[commander_1.default.secretEnvVariableName || 'FAUNADB_SECRET'])
};
if (commander_1.default.domain)
    faunaDbConfig.domain = commander_1.default.domain;
if (commander_1.default.port)
    faunaDbConfig.port = commander_1.default.port;
if (commander_1.default.scheme)
    faunaDbConfig.scheme = commander_1.default.scheme;
console.log(faunaDbConfig, commander_1.default.migrationFolder, commander_1.default.secretEnvVariableName);
var client = new faunadb_1.default.Client(faunaDbConfig);
commander_1.default
    .command("setup")
    .description("Setup migrations")
    .action(function () { return setupMigrations_1.default(client); });
commander_1.default
    .command("create <migrationName>")
    .description("Create a migration file")
    .action(function (migrationName) {
    return createMigration_1.default(migrationName, MIGRATION_FOLDER);
});
commander_1.default
    .command("migrate")
    .description("Run migrations")
    .action(function () { return migrate_1.default(MIGRATION_FOLDER, client); });
commander_1.default
    .command("rollback")
    .description("Run rollback")
    .action(function () { return rollback_1.default(MIGRATION_FOLDER, client); });
