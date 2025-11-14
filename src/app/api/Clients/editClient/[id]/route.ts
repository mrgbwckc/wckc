import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/utils/supabase/server";
import { ClientSchema } from "@/zod/client.schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    console.log("PATCH request received for client ID:", id);
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerClient();
    const clientId = id;
    const json = await req.json();
    const input = ClientSchema.parse(json);

    const { data: updatedClient, error: dbError } = await supabase
      .from("client")
      .update(input)
      .eq("id", clientId)
      .select()
      .single();

    if (dbError) {
      console.error("Supabase update error:", dbError);
      return NextResponse.json(
        { message: "Database error", error: dbError.message },
        { status: 500 }
      );
    }

    if (!updatedClient) {
      return NextResponse.json(
        { message: "Client not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid input", issues: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating client:", error);
    return NextResponse.json(
      { message: "Failed to update client", error: error.message },
      { status: 500 }
    );
  }
}
