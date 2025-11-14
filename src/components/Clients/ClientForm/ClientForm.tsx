"use client";

import { zodMantineResolver } from "@/utils/zodMantineResolver/zodMantineResolver";
import { ClientInput, ClientSchema } from "@/zod/client.schema";
import { useUser } from "@clerk/nextjs";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { use, useEffect } from "react";

export default function ClientForm() {
  const { user, isLoaded } = useUser();

  const form = useForm<ClientInput>({
    initialValues: {
      designer: "",
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      province: "",
      zip: "",
      phone1: "",
      phone2: "",
      email1: "",
      email2: "",
    },
    validate: zodMantineResolver(ClientSchema),
  });


  useEffect(() => {
    if (isLoaded && user?.username && form.values.designer === "") {
      form.setValues({ ...form.values, designer: user.username });
    }
  }, [isLoaded, user?.username]); 
  useEffect(() => {
    console.log("errors", form.errors);
  }, [form.errors]);

  const handleSubmit = async (values: ClientInput) => {
    if (!isLoaded || !user?.username) {
      showNotification({
        title: "Waiting",
        message: "User info not loaded yet. Please wait...",
        color: "yellow",
      });
      return;
    }
    console.log("submitting form");
    try {
      values.designer = user.username;
      console.log("Submitting client:", values);
      const res = await fetch("/api/Clients/addClient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create client");

      showNotification({
        title: "Success",
        message: "Client added successfully",
        color: "green",
      });
      form.reset();
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Client</h2>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="space-y-4"
        noValidate
      >
        {/* Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Client Name
            </label>
            <input
              type="text"
              {...form.getInputProps("lastName")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {form.errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {form.errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">Street</label>
          <input
            type="text"
            {...form.getInputProps("street")}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              {...form.getInputProps("city")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Province</label>
            <input
              type="text"
              {...form.getInputProps("province")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Zip</label>
            <input
              type="text"
              {...form.getInputProps("zip")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone 1</label>
            <input
              type="text"
              {...form.getInputProps("phone1")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone 2</label>
            <input
              type="text"
              {...form.getInputProps("phone2")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Emails */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email 1</label>
            <input
              type="email"
              {...form.getInputProps("email1")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {form.errors.email1 && (
              <p className="text-red-500 text-sm mt-1">{form.errors.email1}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email 2</label>
            <input
              type="email"
              {...form.getInputProps("email2")}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {form.errors.email2 && (
              <p className="text-red-500 text-sm mt-1">{form.errors.email2}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={!isLoaded}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-md transition"
          >
            Add Client
          </button>
        </div>
      </form>
    </div>
  );
}
