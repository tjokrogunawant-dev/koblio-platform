-- Make auth0_id optional so accounts can be created without Auth0
ALTER TABLE "users" ALTER COLUMN "auth0_id" DROP NOT NULL;
