"use client";
import { useActions, useUIState } from "ai/rsc";
/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react";
import { BrowserView, MobileView } from "react-device-detect";

import { ExplanationType } from "@/components/explanation/observable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isGuardianEnrolled } from "@/sdk/auth0/mgmt";

import { checkEnrollment as checkNewsletterSubscription } from "../actions/newsletter";
import { ClientMessage } from "../types";
import { PromptUserContainer } from "./prompt-user-container";

type ProfileCardProps = {
  readOnly?: boolean;
  profile: {
    fullName: string;
    username: string;
    email: string;
    employment: string;
    imageUrl: string;
    enrolledForAsyncAuth: boolean;
    subscribedToNewsletter: boolean;
  };
};

export const ProfileCard = ({ profile, readOnly }: ProfileCardProps) => {
  const [showSubscribeNewsletter, setShowSubscribeNewsletter] = useState(!readOnly && !profile.subscribedToNewsletter);
  // console.dir([readOnly, profile.subscribedToNewsletter]);
  const [showAsyncAuthEnrollment, setShowAsyncAuthEnrollment] = useState(!readOnly && !profile.enrolledForAsyncAuth);

  const { continueConversation } = useActions();
  const [, setMessages] = useUIState();

  useEffect(() => {
    if (readOnly) {
      return;
    }
    isGuardianEnrolled().then((isEnrolled) => {
      setShowAsyncAuthEnrollment(!isEnrolled);
    });
    checkNewsletterSubscription({ symbol: "ATKO" }).then((isEnrolled?: Boolean) => {
      setShowSubscribeNewsletter(!isEnrolled);
    });
  }, [readOnly]);

  const subscribeNewsletter = () => {
    setShowSubscribeNewsletter(false);
    (async () => {
      const response = await continueConversation({
        message: `Subscribe me to the newsletter.`,
        hidden: true,
      });
      setMessages((prevMessages: ClientMessage[]) => [...prevMessages, response]);
    })();
  };

  return (
    <Card className="max-w-3xl w-full bg-white shadow-none rounded-lg overflow-hidden p-6">
      {/* Main Profile Section */}
      <div>
        <div className="flex flex-col md:flex-row gap-3">
          {/* Profile Image */}
          <div className="flex-shrink-0 w-full md:w-auto">
            {/* 212px */}
            <img src={profile.imageUrl} alt="Profile" className="w-20 h-20 md:w-52 md:h-52 rounded-lg object-cover" />
          </div>

          {/* Profile Details */}
          <div className="flex-grow flex flex-col gap-2 pt-2 pb-2">
            <div className="md:pl-3 md:pr-3">
              <h3 className="text-sm text-black font-medium">Full Name</h3>
              <p className="text-gray-500 text-sm">{profile.fullName}</p>
            </div>

            <div className="md:pl-3 md:pr-3">
              <h3 className="text-sm text-black font-medium">Username</h3>
              <p className="text-gray-500 text-sm">{profile.username}</p>
            </div>

            <div className="md:pl-3 md:pr-3">
              <h3 className="text-sm text-black font-medium">Email</h3>
              <p className="text-gray-500 text-sm">{profile.email}</p>
            </div>

            {profile.employment ? (
              <div className="md:pl-3 md:pr-3">
                <h3 className="text-sm text-black font-medium">Employment Status</h3>
                <p className="text-gray-500 text-sm">Currently employeed at {profile.employment}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {/* Newsletter Section - Full Width */}
      {showSubscribeNewsletter ? (
        <PromptUserContainer
          title="Newsletter Subscription"
          description="You are not subscribed to the newsletter. Join now to get access to analyst forecasts."
          action={{
            label: "Join",
            onClick: subscribeNewsletter,
          }}
          readOnly={readOnly}
          containerClassName="mt-6"
        />
      ) : (
        <></>
      )}

      {/* Guardian Enrollment */}
      {showAsyncAuthEnrollment ? (
        <>
          <BrowserView>
            <div className="border border-gray-300 rounded-xl items-center w-full justify-between mt-6 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 mt-2">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <h2 className="text-sm sm:text-base leading-6 font-semibold">Setup Async Authentication</h2>
                <p className="text-xs sm:text-sm leading-5 font-light text-gray-500">
                  You are not currently enrolled for asynchonous authentication. Please enroll with Auth0 Guardian so we
                  can notify you before processing an order for authorization.
                </p>
              </div>
              <div className="w-full sm:w-fit">
                <a
                  href={`/api/auth/login?returnTo=${
                    typeof window !== "undefined" ? window.location.pathname : ""
                  }&screenHint=mfa`}
                  className="w-full sm:w-fit inline-block text-center bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4"
                >
                  Enroll
                </a>
              </div>
            </div>
          </BrowserView>
          <MobileView>
            <div className="border border-gray-300 rounded-xl items-center w-full justify-between mt-6 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm leading-5 font-light text-gray-500">
                  You are not currently enrolled for asynchonous authentication
                </p>
                <p className="text-xs sm:text-sm leading-5 font-bold text-gray-500">
                  To try this feature, please open the demo on a computer.
                </p>
              </div>
            </div>
          </MobileView>
        </>
      ) : (
        <></>
      )}
    </Card>
  );
};
