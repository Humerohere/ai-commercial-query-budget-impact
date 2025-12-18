"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, List, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LeftSidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/my-scripts", label: "My Scripts", icon: List },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help-and-support", label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <div className="hidden md:block w-64 flex-shrink-0">
      <Card className="h-full border-none shadow-none bg-transparent">
        <CardContent className="p-0 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} className="block">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary font-medium"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeftSidebar;