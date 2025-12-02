"use client";

import ReadOnlyScheduler from "@/components/Production/ReadOnlyScheduler/ReadOnlyScheduler";
import Scheduler from "@/components/Production/Scheduler/Scheduler";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Center, Loader } from "@mantine/core";

export default function EditSchedulerPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const jobId = Number(params.id);

  if (!isLoaded) {
    return (
      <Center h="100vh">
        <Loader color="violet" />
      </Center>
    );
  }

  const role = user?.publicMetadata?.role as string | undefined;

  const canEdit = role === "admin" || role === "designer";

  if (canEdit) {
    return <Scheduler jobId={jobId} />;
  }

  return <ReadOnlyScheduler jobId={jobId} />;
}
