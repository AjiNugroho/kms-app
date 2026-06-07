CREATE TABLE "child_growth" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"month" text NOT NULL,
	"weight" numeric(5, 2),
	"length" numeric(5, 2),
	"head_circumference" numeric(5, 2),
	"status" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "child_growth_child_month_unique" UNIQUE("child_id","month")
);
--> statement-breakpoint
CREATE TABLE "child_immunization" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "child_growth" ADD CONSTRAINT "child_growth_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_immunization" ADD CONSTRAINT "child_immunization_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "child_growth_child_id_idx" ON "child_growth" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "child_immunization_child_id_idx" ON "child_immunization" USING btree ("child_id");