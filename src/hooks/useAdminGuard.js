import { useEffect, useState } from "react";
import { fetchUserData } from "../auth/auth";

export function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    async function verificar() {
      const user = await fetchUserData();
      if (!user || user.role !== "ADMIN") {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    }
    verificar();
  }, []);

  return isAdmin;
}
