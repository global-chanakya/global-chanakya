import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "My Profile | Global Chanakya",
  description: "View your saved reports, reading history, and engagement analytics.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-24 pb-16">
      <div className="container mx-auto max-w-6xl px-6">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">User Dashboard</h1>
          <p className="text-[var(--secondary)] mt-2">Manage your saved reports, reading history, and engagement analytics.</p>
        </header>

        <ProfileClient />
      </div>
    </div>
  );
}
