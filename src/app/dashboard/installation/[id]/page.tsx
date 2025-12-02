"use client";

import InstallationEditor from "@/components/Installation/InstallationEditor/InstallationEditor";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Center, Loader } from "@mantine/core";
import ReadOnlyInstallationEditor from "@/components/Installation/ReadOnlyInstallationEditor/ReadOnlyInstallationEditor";

export default function InstallationEditorPage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
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
    return <InstallationEditor jobId={jobId} />;
  }

  return <ReadOnlyInstallationEditor jobId={jobId} />;
}
