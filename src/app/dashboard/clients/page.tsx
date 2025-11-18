"use client";

import AddClient from "@/components/Clients/AddClient/AddClient";
import ClientsTable from "@/components/Clients/ClientTable/ClientTable";

import { Modal, Button } from "@mantine/core";
import { useState } from "react";

export default function ClientsPage() {
  return <ClientsTable />;
}
