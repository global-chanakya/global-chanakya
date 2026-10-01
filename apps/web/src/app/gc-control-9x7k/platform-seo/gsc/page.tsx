import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GscDashboardClient from "./GscDashboardClient";

export const metadata = {
  title: "GSC SEO Intelligence | Admin",
};

export default async function GscIntelligenceAdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  return <GscDashboardClient />;
}
