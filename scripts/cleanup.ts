import "dotenv/config";
import { cleanup } from "../src/lib/service";
import { db } from "../src/lib/db";
cleanup()
  .then(console.log)
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
