"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function PopupClosePage() {
  const [isClosing, setIsClosing] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleClose = () => {
    if (typeof window !== "undefined") {
      try {
        window.close();
      } catch (err) {
        console.error(err);
        setIsClosing(false);
      }
    }
  };

  useEffect(() => {
    // Attempt to close the window on load
    handleClose();
  }, [handleClose]); // Added handleClose to dependencies

  return isClosing ? (
    <></>
  ) : (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p className="mb-4 text-lg">You can now close this window.</p>
        <Button onClick={handleClose}>Close</Button>
      </div>
    </div>
  );
}
