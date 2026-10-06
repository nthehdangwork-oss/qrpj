import "dotenv/config";
import { db } from "../src/lib/db";
import { catalog } from "../src/lib/catalog";
async function main() {
  for (const item of catalog)
    await db.template.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  console.log(`Seeded ${catalog.length} templates.`);
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
