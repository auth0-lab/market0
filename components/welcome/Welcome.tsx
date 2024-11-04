import Link from "next/link";
import React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { IconAuth0, Market0Icon } from "../icons";

const MainContent = () => (
  <div className="flex flex-col items-center space-y-6">
    {/* App Logo */}
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center">
        <Market0Icon />
      </div>
      <span
        className="text-2xl font-semibold bg-text-gradient bg-clip-text"
        style={{ WebkitTextFillColor: "transparent" }}
      >
        Market0
      </span>
    </div>

    {/* Welcome Text */}
    <div className="text-center space-y-4">
      <h1 className="text-lg text-gray-500 font-normal">
        Explore the Future of Authentication with
        <br />
        Market0 Demo App.
      </h1>

      <p className="text-sm text-black">
        Market0 is a demo application by{" "}
        <a href="https://auth0.ai" className="text-blue-600 hover:underline">
          auth0.ai
        </a>
        ,
        <br />
        designed to showcase how Gen AI can drive
        <br />
        advanced authentication and authorization flows.
      </p>

      <p className="text-sm text-black">Please log in to access the demo and explore real-world use cases.</p>
    </div>

    {/* Login Button */}
    <Link
      className={`${buttonVariants({
        variant: "outline",
      })} w-full bg-black text-white hover:bg-gray-800 hover:text-white`}
      href="/api/auth/login"
    >
      Log In to Start Demo
    </Link>
  </div>
);
const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Header Logo */}
      <div className="fixed top-8 left-8 hidden md:block">
        <Link href="https://auth0.com" rel="noopener" target="_blank">
          <IconAuth0 className="inline-flex" />
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Desktop Card Wrapper */}
        <Card className="w-full max-w-md bg-[#FAFAFD] shadow-none hidden md:block">
          <CardContent className="pt-8 px-8 pb-8">
            <MainContent />
          </CardContent>
        </Card>

        {/* Mobile Direct Content */}
        <div className="md:hidden px-4">
          <MainContent />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
