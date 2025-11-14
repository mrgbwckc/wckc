import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerClient();

    const { data: clients, error } = await supabase
      .from("client")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { message: "Database error", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(clients);
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { message: "Failed to fetch clients", error: error.message },
      { status: 500 }
    );
  }
}
