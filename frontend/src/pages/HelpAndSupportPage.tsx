"use client";

import React from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";

const HelpAndSupportPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Help & Support</h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>We're here to help you with any questions or issues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <p className="text-lg text-gray-800 dark:text-gray-200">
                Email: <a href="mailto:ansaziz43@gmail.com" className="text-blue-600 hover:underline">ansaziz43@gmail.com</a>
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Feel free to reach out to us for assistance, feedback, or any inquiries regarding the AI Commercial Query Detection & Budget Impact Tool.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ (Coming Soon)</CardTitle>
            <CardDescription>Find answers to common questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              We are working on a comprehensive FAQ section to help you get the most out of our tool.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HelpAndSupportPage;