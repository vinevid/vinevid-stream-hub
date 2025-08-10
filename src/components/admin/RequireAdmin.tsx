import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
        if (!session) {
          setAllowed(false);
          navigate("/admin/login", { replace: true });
          return;
        }
        // Try to promote if email is whitelisted
        setTimeout(async () => {
          try { await supabase.rpc("promote_if_allowed"); } catch {}
          const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
          setAllowed(!!isAdmin);
          if (!isAdmin) navigate("/admin/login", { replace: true });
        }, 0);
      });
      unsub = subscription;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAllowed(false);
        navigate("/admin/login", { replace: true });
        return;
      }
      setTimeout(async () => {
        try { await supabase.rpc("promote_if_allowed"); } catch {}
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        setAllowed(!!isAdmin);
        if (!isAdmin) navigate("/admin/login", { replace: true });
      }, 0);
    };

    init();
    return () => { unsub?.unsubscribe(); };
  }, [navigate]);

  if (allowed === null) return null;
  if (!allowed) return null;
  return <>{children}</>;
};
