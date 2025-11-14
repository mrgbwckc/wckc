import { NextRequest, NextResponse } from "next/server";
import { ClientSchema } from "@/zod/client.schema";
import { createServerClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const supabase = await createServerClient();
    const json = await req.json();
    const input = ClientSchema.parse(json);

    const { data: newClient, error: dbError } = await supabase
      .from("client")
      .insert(input)
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Create Error:", dbError);
      return NextResponse.json(
        { message: "Database error", error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    console.error("Create Client Error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Invalid input",
          issues: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create client", error: error.message },
      { status: 500 }
    );
  }
}
