create sequence "public"."client_id_seq";


  create table "public"."client" (
    "id" integer not null default nextval('public.client_id_seq'::regclass),
    "designer" text,
    "firstName" text,
    "lastName" text not null,
    "street" text,
    "city" text,
    "province" text,
    "zip" text,
    "phone1" text,
    "phone2" text,
    "email1" text,
    "email2" text,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null
      );


alter sequence "public"."client_id_seq" owned by "public"."client"."id";

CREATE UNIQUE INDEX client_pkey ON public.client USING btree (id);

alter table "public"."client" add constraint "client_pkey" PRIMARY KEY using index "client_pkey";

grant delete on table "public"."client" to "anon";

grant insert on table "public"."client" to "anon";

grant references on table "public"."client" to "anon";

grant select on table "public"."client" to "anon";

grant trigger on table "public"."client" to "anon";

grant truncate on table "public"."client" to "anon";

grant update on table "public"."client" to "anon";

grant delete on table "public"."client" to "authenticated";

grant insert on table "public"."client" to "authenticated";

grant references on table "public"."client" to "authenticated";

grant select on table "public"."client" to "authenticated";

grant trigger on table "public"."client" to "authenticated";

grant truncate on table "public"."client" to "authenticated";

grant update on table "public"."client" to "authenticated";

grant delete on table "public"."client" to "service_role";

grant insert on table "public"."client" to "service_role";

grant references on table "public"."client" to "service_role";

grant select on table "public"."client" to "service_role";

grant trigger on table "public"."client" to "service_role";

grant truncate on table "public"."client" to "service_role";

grant update on table "public"."client" to "service_role";


