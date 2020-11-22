import { Migration } from "..";
import { asyncForEach } from "./utils";
import { Client, query as q } from "faunadb";

type ExecuteMigrationsConfig = {
  client: Client;
  queryBuilder: typeof q;
  migrationId?: string;
};

const checkinCompletedMigrations = async (
  completedMigrations: Migration[],
  operation: "down" | "up" = "up",
  client: Client
): Promise<void> => {
  if (operation === "up" && completedMigrations.length != 0) {
    await client.query(
      q.Create(q.Collection("Migration"), {
        data: {
          migrations: completedMigrations.map(migration => migration.label)
        }
      })
    );
  }
}

const executeMigrations = async (
  migrations: Migration[],
  operation: "down" | "up" = "up",
  { client, queryBuilder, migrationId }: ExecuteMigrationsConfig
): Promise<Migration[]> =>
  new Promise(async (resolve, reject) => {
    let completedMigrations: Migration[] = [];
    let currentMigration: Migration | null = null;

    try {
      await asyncForEach(migrations, async (migration: Migration) => {
        currentMigration = migration;
        await client.query(migration[operation](queryBuilder));
        completedMigrations.push(migration);
      });

      checkinCompletedMigrations(completedMigrations, operation, client);

      if (operation === "down" && migrationId) {
        await client.query(
          q.Delete(q.Ref(q.Collection("Migration"), migrationId))
        );
      }

      resolve(completedMigrations);
    } catch (error) {
      console.error(error);
      checkinCompletedMigrations(completedMigrations, operation, client);

      reject({
        ...error,
        migration: currentMigration
      });
    }
  });

export default executeMigrations;
