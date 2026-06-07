CREATE TABLE "children" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"born_date" date NOT NULL,
	"father_name" text NOT NULL,
	"mother_name" text NOT NULL,
	"address" text NOT NULL,
	"born_weight" numeric(5, 2) NOT NULL,
	"born_length" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "children_name_father_mother_unique" UNIQUE("name","father_name","mother_name")
);
