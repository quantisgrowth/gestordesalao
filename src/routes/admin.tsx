import { createFileRoute } from "@tanstack/react-router";
import { PlatformShell } from "@/components/admin/PlatformShell";
export const Route = createFileRoute("/admin")({ component: PlatformShell });
