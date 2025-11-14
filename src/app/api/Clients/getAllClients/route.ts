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

    const { searchParams } = req.nextUrl;
    const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;

    console.log(
      `Fetching clients for user: ${userId}, page: ${pageIndex}, size: ${pageSize}`
    );

    const {
      data: clients,
      error,
      count,
    } = await supabase
      .from("client")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { message: "Database error", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: clients, rowCount: count ?? 0 });
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { message: "Failed to fetch clients", error: error.message },
      { status: 500 }
    );
  }
}
