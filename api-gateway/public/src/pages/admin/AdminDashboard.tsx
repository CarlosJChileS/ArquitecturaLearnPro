import { AdminLayout } from "@/components/admin/AdminLayout";
import useAdminAuth from "@/hooks/use-admin-auth";
import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { DataTable } from "@/components/admin/DataTable";

import { Users, BookOpen } from "lucide-react";
import { getCourses, getSubscriptions, deleteCourse } from "@/api";

const columns = [
  { key: "title", label: "Curso" },
  { key: "description", label: "Descripción" },
  { key: "plan", label: "Plan" },
  { key: "actions", label: "Acciones", type: "actions" as const },
];

export default function AdminDashboard() {
  useAdminAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {});
    getSubscriptions().then(setSubscriptions).catch(() => {});
  }, []);

  const handleDelete = async (course: any) => {
    try {
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch {
      // ignore error
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard title="Cursos" value={courses.length} icon={BookOpen} />
          <StatsCard title="Suscripciones" value={subscriptions.length} icon={Users} />
        </div>

        <DataTable
          title="Cursos"
          data={courses}
          columns={columns}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}
