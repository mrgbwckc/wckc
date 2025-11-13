import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";
import { ClientSchema } from "@/zod/client.schema";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = ClientSchema.parse(json);
    const client = await prisma.client.create({
      data: input,
    });

    return NextResponse.json(client, { status: 201 });
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
      { message: "Failed to create client" },
      { status: 500 }
    );
  }
}
