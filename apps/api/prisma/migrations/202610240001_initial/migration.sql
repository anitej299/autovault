CREATE TYPE "Role" AS ENUM ('USER','ADMIN');
CREATE TABLE "User" (
 "id" UUID PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "passwordHash" TEXT NOT NULL,
 "role" "Role" NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "Vehicle" (
 "id" UUID PRIMARY KEY, "make" VARCHAR(80) NOT NULL CHECK (length(trim("make")) > 0),
 "model" VARCHAR(100) NOT NULL CHECK (length(trim("model")) > 0), "category" VARCHAR(50) NOT NULL CHECK (length(trim("category")) > 0),
 "price" DECIMAL(14,2) NOT NULL CHECK ("price" > 0), "quantity" INTEGER NOT NULL CHECK ("quantity" >= 0),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "Purchase" (
 "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
 "vehicleId" UUID NOT NULL REFERENCES "Vehicle"("id") ON DELETE RESTRICT,
 "unitPrice" DECIMAL(14,2) NOT NULL CHECK ("unitPrice" > 0), "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
 "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Vehicle_price_id_idx" ON "Vehicle"("price","id");
CREATE INDEX "Vehicle_createdAt_id_idx" ON "Vehicle"("createdAt","id");
CREATE INDEX "Purchase_userId_purchasedAt_idx" ON "Purchase"("userId","purchasedAt");
CREATE INDEX "Purchase_vehicleId_idx" ON "Purchase"("vehicleId");
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Vehicle_make_search_idx" ON "Vehicle" USING gin ("make" gin_trgm_ops);
CREATE INDEX "Vehicle_model_search_idx" ON "Vehicle" USING gin ("model" gin_trgm_ops);
CREATE INDEX "Vehicle_category_search_idx" ON "Vehicle" USING gin ("category" gin_trgm_ops);
