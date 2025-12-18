"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Home, List, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const DesktopSidebarToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
    setIsOpen(false); // Close sidebar after navigation
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:flex"> {/* Only visible on desktop */}
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-[250px] sm:w-[280px]">
        <SheetHeader className="text-left">
          <SheetTitle>Quick Links</SheetTitle>
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
        {/* ThemeToggle and Logout are already in AppLayout header for desktop, so not duplicated here */}
      </SheetContent>
    </Sheet>
  );
};

export default DesktopSidebarToggle;