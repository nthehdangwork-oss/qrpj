import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";
const directory = path.resolve(".local-postgres");
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: "guithuong",
  password: "localdev",
  port: 54329,
  persistent: true,
  initdbFlags: ["--encoding=UTF8"],
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: console.error,
});
if (!existsSync(path.join(directory, "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient("postgres", "127.0.0.1");
await client.connect();
for (const name of ["guithuong_utf8", "guithuong_test_utf8"]) {
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname=$1",
    [name],
  );
  if (!result.rowCount)
    await client.query(
      `CREATE DATABASE "${name}" ENCODING 'UTF8' TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C'`,
    );
}
await client.end();
console.log("PostgreSQL local ready on 127.0.0.1:54329. Press Ctrl+C to stop.");
setInterval(() => {}, 60000);
