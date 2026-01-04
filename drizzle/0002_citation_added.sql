CREATE TABLE "citations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"url" text NOT NULL,
	"domain" text NOT NULL,
	"title" text,
	"citation_type" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "citations" ADD CONSTRAINT "citations_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;