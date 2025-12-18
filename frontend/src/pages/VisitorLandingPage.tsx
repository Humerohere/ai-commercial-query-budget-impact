"use client";

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, DollarSign, TrendingUp, Rocket } from "lucide-react";

const VisitorLandingPage: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLoggedIn) {
      // Use replace: true to prevent back button from returning to landing page
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p>Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 text-white flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <section className="text-center py-16 max-w-4xl mx-auto">
        <Rocket className="h-24 w-24 mx-auto mb-6 text-white animate-bounce-slow" />
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          Unlock Your Content's True Value
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
          Analyze your script for commercial opportunities and understand your project's financial viability *before* you start filming.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/signup">
            <Button className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-3 text-lg rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
              Get Started - It's Free!
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700 px-8 py-3 text-lg rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full max-w-5xl mx-auto py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How We Help Creators Succeed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/10 border-white/20 text-white p-6 rounded-lg shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center text-center">
              <Lightbulb className="h-12 w-12 mb-4 text-yellow-300" />
              <CardTitle className="text-2xl font-bold mb-2">De-risk Production</CardTitle>
              <CardDescription className="text-white/80">
                Gain clear insights into potential sponsorship revenue before committing significant time and resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mt-4">
                Reduce financial uncertainty and make informed decisions about your project's viability.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white p-6 rounded-lg shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center text-center">
              <DollarSign className="h-12 w-12 mb-4 text-green-300" />
              <CardTitle className="text-2xl font-bold mb-2">Maximize Monetization</CardTitle>
              <CardDescription className="text-white/80">
                Identify natural commercial opportunities within your script's narrative, enhancing earning potential.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mt-4">
                Discover new revenue streams beyond traditional AdSense, tailored to your content.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white p-6 rounded-lg shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center text-center">
              <TrendingUp className="h-12 w-12 mb-4 text-blue-300" />
              <CardTitle className="text-2xl font-bold mb-2">Strategic Planning</CardTitle>
              <CardDescription className="text-white/80">
                Leverage AI-powered insights to strategically plan your content and secure brand partnerships.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mt-4">
                Align creative vision with financial success, making your projects more sustainable.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="w-full max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Production?</h2>
        <Link to="/signup">
          <Button className="bg-white text-purple-700 hover:bg-gray-100 px-10 py-4 text-xl rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
            Start Your Free Analysis Today!
          </Button>
        </Link>
      </section>

      <footer className="mt-12 text-sm opacity-70">
        &copy; {new Date().getFullYear()} AI Commercial Query & Budget Impact Tool.
      </footer>
    </div>
  );
};

export default VisitorLandingPage;