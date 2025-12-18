"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, Home, List, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { showSuccess } from "@/utils/toast";

const MobileSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showSuccess("Logged out successfully");
    navigate('/login');
    setIsOpen(false); // Close sidebar on logout
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
    setIsOpen(false); // Close sidebar after navigation
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-[250px] sm:w-[280px]">
        <SheetHeader className="text-left">
          <SheetTitle>Budget Impact Tool</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col flex-1 py-4 space-y-2">
          <Button variant="ghost" className="justify-start" onClick={() => handleLinkClick('/dashboard')}> {/* Updated to /dashboard */}
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => handleLinkClick('/my-scripts')}>
            <List className="mr-2 h-4 w-4" />
            My Scripts
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => handleLinkClick('/settings')}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => handleLinkClick('/help-and-support')}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between mt-auto p-2">
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;