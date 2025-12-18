"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const SettingsPage: React.FC = () => {
  const { user, deleteAccount, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      showSuccess("Account successfully deleted.");
      navigate('/signup'); // Redirect to signup after deletion
    } catch (error: any) {
      showError(error.message || "Failed to delete account.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} readOnly className="mt-1" />
            </div>
            {/* Add more profile fields here if needed, e.g., name, if they were part of the user object */}
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Customize the application's appearance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>App Theme</Label>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Account Management */}
        <Card className="border-red-200 dark:border-red-700">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Account Management</CardTitle>
            <CardDescription>Danger zone: manage your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and all associated data from this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    Continue Deletion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;