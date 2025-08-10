import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_evt, session) => {
        if (!session) {
          setAllowed(false);
          navigate("/admin/login", { replace: true });
          return;
        }
        // Try to promote if email is whitelisted and check admin role
        try { 
          await supabase.rpc("promote_if_allowed"); 
        } catch (e) {
          console.log("Promotion check failed:", e);
        }
        
        const { data: isAdmin } = await supabase.rpc("has_role", { 
          _user_id: session.user.id, 
          _role: "admin" 
        });
        
        setAllowed(!!isAdmin);
        if (!isAdmin) {
          navigate("/admin/login", { replace: true });
        }
      });
      unsub = subscription;

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAllowed(false);
        navigate("/admin/login", { replace: true });
        return;
      }
      
      try { 
        await supabase.rpc("promote_if_allowed"); 
      } catch (e) {
        console.log("Promotion check failed:", e);
      }
      
      const { data: isAdmin } = await supabase.rpc("has_role", { 
        _user_id: session.user.id, 
        _role: "admin" 
      });
      
      setAllowed(!!isAdmin);
      if (!isAdmin) {
        navigate("/admin/login", { replace: true });
      }
    };

    init();
    return () => { unsub?.unsubscribe(); };
  }, [navigate]);

  if (allowed === null) return null;
  if (!allowed) return null;
  return <>{children}</>;
};
