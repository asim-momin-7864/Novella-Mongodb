CREATE TYPE "gener" AS ENUM('Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Science Fiction', 'Fantasy', 'Romance', 'Historical Fiction', 'Horror', 'Biography', 'Autobiography', 'Memoir', 'Self-Help', 'Health', 'Guide', 'Travel', 'Childrens', 'Religion', 'Spirituality', 'Science', 'History', 'Math', 'Anthology', 'Poetry', 'Encyclopedias', 'Dictionaries', 'Comics', 'Art', 'Cookbooks', 'Diaries', 'Journals', 'Action and Adventure', 'Graphic Novel');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"author" text NOT NULL,
	"gener" "gener" NOT NULL,
	"pages" smallint NOT NULL,
	"cover_url" text NOT NULL,
	"cover_public_id" text NOT NULL,
	"file_url" text NOT NULL,
	"file_public_id" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;