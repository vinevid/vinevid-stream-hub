import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const WelcomeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show welcome dialog after a short delay when component mounts
    const hasSeenWelcome = localStorage.getItem('vinevid-welcome-shown');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Show after 2 seconds to allow splash screen to finish
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('vinevid-welcome-shown', 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-primary">
            Welcome to Vinevid.com!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            We're thrilled to have you here and grateful that you've chosen our platform for your video downloading needs. Your trust means everything to us, and we're committed to providing you with the best possible experience.
          </p>
          <p>
            If you find value in what we offer, we'd be honored if you'd share Vinevid.com with friends, family, and colleagues. Your recommendations help us grow our community and continue delivering the quality service you deserve.
          </p>
          <p className="font-medium text-foreground">
            Thank you for being part of our journey – let's achieve great things together!
          </p>
        </div>
        <div className="flex justify-center mt-6">
          <Button onClick={handleClose} className="px-8">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};