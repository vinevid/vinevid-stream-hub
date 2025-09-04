import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const fetchAdminConfig = async () => {
  const { data, error } = await supabase
    .from("admin_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

const AdminConfig = () => {
  const { data: config, refetch } = useQuery({ 
    queryKey: ["admin-config"], 
    queryFn: fetchAdminConfig 
  });
  
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");

  useState(() => {
    if (config) {
      setAllowedEmails(config.allowed_emails || []);
    }
  });

  const saveConfig = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("admin_config")
        .upsert({ 
          id: 1, 
          allowed_emails: allowedEmails 
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      toast.success("Admin configuration saved");
    },
    onError: () => {
      toast.error("Failed to save admin configuration");
    }
  });

  const addEmail = () => {
    const email = newEmail.trim();
    if (email && !allowedEmails.includes(email)) {
      setAllowedEmails([...allowedEmails, email]);
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setAllowedEmails(allowedEmails.filter(e => e !== email));
  };

  return (
    <>
      <Helmet>
        <title>Admin Configuration | VineVid</title>
        <meta name="description" content="Secure admin configuration settings" />
        <link rel="canonical" href={`${location.origin}/admin/config`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Admin Configuration</h1>
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Allowed Admin Emails</label>
              <p className="text-xs text-muted-foreground mb-3">
                Only users with these email addresses can be promoted to admin
              </p>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="admin@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                />
                <Button onClick={addEmail} variant="outline">Add</Button>
              </div>
              <div className="space-y-2">
                {allowedEmails.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{email}</span>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => removeEmail(email)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {allowedEmails.length === 0 && (
                  <p className="text-sm text-muted-foreground">No admin emails configured</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={() => saveConfig.mutate()} disabled={saveConfig.isPending}>
            {saveConfig.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminConfig;