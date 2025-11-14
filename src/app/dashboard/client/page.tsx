"use client";

import AddClient from "@/components/Clients/AddClient/AddClient";
import ClientsTable from "@/components/Clients/ClientTable/ClientTable";

import { Modal, Button } from "@mantine/core";
import { useState } from "react";

export default function ClientsPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold text-center">ALL CLIENTS</h1>
      <ClientsTable />
    </div>
  );
}
