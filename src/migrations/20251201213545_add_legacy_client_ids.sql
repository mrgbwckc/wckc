ALTER TABLE "public"."client" 
ADD COLUMN "legacy_id" text;

ALTER TABLE "public"."client" 
ADD CONSTRAINT "uq_client_legacy_id" UNIQUE ("legacy_id");

CREATE INDEX "idx_client_legacy_id" ON "public"."client" ("legacy_id");