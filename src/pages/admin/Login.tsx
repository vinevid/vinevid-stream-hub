import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up new user
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Admin account created! Please check your email to confirm your account, then sign in.");
          setIsSignUp(false);
        }
      } else {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          toast.error(error.message);
        } else {
          // Try to promote user to admin if allowed
          const { data: promoteResult, error: promoteError } = await supabase.rpc('promote_if_allowed');
          
          if (promoteError) {
            console.warn('Admin promotion failed:', promoteError.message);
          }
          
          if (promoteResult) {
            toast.success("Signed in as admin successfully");
          } else {
            toast.error("You don't have admin access");
            await supabase.auth.signOut();
            return;
          }
          
          navigate("/admin", { replace: true });
        }
      }
    } catch (err) {
      toast.error("An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | VineVid</title>
        <meta name="description" content="Login to the VineVid admin dashboard" />
        <link rel="canonical" href={`${location.origin}/admin/login`} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isSignUp ? "Create Admin Account" : "Admin Login"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="admin@vinevid.com or test@admin.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (isSignUp ? "Creating Account..." : "Signing in...") : (isSignUp ? "Create Admin Account" : "Sign In")}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Need to create an admin account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminLogin;