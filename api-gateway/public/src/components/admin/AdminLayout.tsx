import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AdminSidebar />
      <main className="ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}