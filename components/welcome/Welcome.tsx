import Link from "next/link";
import React from "react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { IconAuth0, WelcomeIcon } from "../icons";

const MainContent = () => (
  <div className="flex flex-col items-center space-y-6">
    <div className="text-center space-y-4">
      <p className="text-sm sm:text-xl font-light text-[#020617] leading-6 sm:leading-8">
        Market0 is a demo application by{" "}
        <a href="https://auth0.ai" className="underline">
          auth0.ai
        </a>
        , designed to showcase how Gen AI can drive advanced authentication and authorization flows.
      </p>

      <p className="text-sm sm:text-xl font-light text-[#020617] leading-6 sm:leading-8">
        Please log in to access the demo and explore real-world use cases.
      </p>
    </div>

    <Link
      className={`${buttonVariants({
        variant: "outline",
      })} w-full h-fit bg-black text-base text-white hover:bg-gray-800 hover:text-white sm:max-w-56 py-3`}
      href="/api/auth/login"
    >
      Log In to Start Demo
    </Link>
  </div>
);

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="fixed top-8 left-8 hidden md:block">
        <Link href="https://auth0.com" rel="noopener" target="_blank">
          <IconAuth0 className="inline-flex" />
        </Link>
      </div>

      <div className="w-full max-w-80 sm:max-w-lg">
        <div className="flex flex-col items-center gap-0 sm:gap-6">
          <div className="rounded-lg flex items-center justify-center w-48 sm:w-fit h-fit">
            <WelcomeIcon />
          </div>

          <h1 className="text-xl sm:text-3xl text-[#64748B] font-light text-center leading-7 sm:leading-10 w-full">
            Explore the Future of Authentication with Market0 Demo App
          </h1>
        </div>
      </div>
      <Card className="w-full bg-[#FAFAFD] shadow-none mt-10 max-w-80 sm:max-w-2xl mx-auto">
        <CardContent className="p-6 sm:p-16">
          <MainContent />
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
