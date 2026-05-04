import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
