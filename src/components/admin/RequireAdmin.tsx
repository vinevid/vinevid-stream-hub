import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const checkAuthAndRole = async (session: any) => {
      if (!mounted) return;
      
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
      
      if (!mounted) return;
      
      setAllowed(!!isAdmin);
      if (!isAdmin) {
        navigate("/admin/login", { replace: true });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkAuthAndRole(session);
      } else if (event === 'SIGNED_OUT') {
        setAllowed(false);
        navigate("/admin/login", { replace: true });
      }
    });

    // Check current session
    const initCheck = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await checkAuthAndRole(session);
    };
    
    initCheck();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (allowed === null) return null;
  if (!allowed) return null;
  return <>{children}</>;
};
