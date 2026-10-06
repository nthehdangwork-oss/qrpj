CREATE TABLE "asset" ("id" TEXT NOT NULL, "ownerHash" TEXT NOT NULL, "data" BYTEA NOT NULL, "mime" TEXT NOT NULL DEFAULT 'image/webp', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "asset_pkey" PRIMARY KEY ("id"));
CREATE INDEX "asset_ownerHash_createdAt_idx" ON "asset"("ownerHash", "createdAt");
CREATE TABLE "_AssetToCard" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);
CREATE UNIQUE INDEX "_AssetToCard_AB_unique" ON "_AssetToCard"("A", "B");
CREATE INDEX "_AssetToCard_B_index" ON "_AssetToCard"("B");
ALTER TABLE "_AssetToCard" ADD CONSTRAINT "_AssetToCard_A_fkey" FOREIGN KEY ("A") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_AssetToCard" ADD CONSTRAINT "_AssetToCard_B_fkey" FOREIGN KEY ("B") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
