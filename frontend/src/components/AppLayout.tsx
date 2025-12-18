"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { showSuccess } from "@/utils/toast";
import DesktopSidebarToggle from "./DesktopSidebarToggle"; // Import the new DesktopSidebarToggle
import MobileSidebar from "./MobileSidebar";
import RightSidebar from "./RightSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSavedScripts } from "@/hooks/useSavedScripts"; // Import the new hook

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { allScripts, refreshScripts } = useSavedScripts(); // Use the new hook

  const handleLogout = () => {
    logout();
    showSuccess("Logged out successfully");
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="w-full p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md shadow-lg">
        <div className="flex items-center space-x-2">
          {isMobile ? <MobileSidebar /> : <DesktopSidebarToggle />} {/* Use DesktopSidebarToggle for desktop */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budget Impact Tool
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {!isMobile && <ThemeToggle />}
          {!isMobile && (
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-row items-start p-4 gap-4"> {/* Removed justify-center */}
        <div className="flex-grow w-full">
          {children}
        </div>
        {!isMobile && <RightSidebar allScripts={allScripts} refreshScripts={refreshScripts} />} {/* Pass allScripts and refreshScripts */}
      </main>
      <footer className="w-full bg-white dark:bg-gray-800 shadow-md py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} AI Commercial Query & Budget Impact Tool. All rights reserved.
      </footer>
    </div>
  );
};

export default AppLayout;