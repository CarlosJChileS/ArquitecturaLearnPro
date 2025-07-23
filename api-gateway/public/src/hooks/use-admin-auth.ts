import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAdminAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const data = localStorage.getItem("admin");
      const admin = data ? JSON.parse(data) : null;
      if (!admin?.isAdminAuthenticated) {
        navigate("/admin", { replace: true });
      }
    } catch {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);
}
