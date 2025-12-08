"use client";

import { useDiagnostics } from "@/src/context/diagnostics-context";
import { useEmergency } from "@/src/context/emergency-context";
import { useScenario } from "@/src/context/scenario-context";
import type { DiagnosticMessage } from "@/src/models/station-graph-map";
import { useEffect, useState } from "react";

export function DiagnosticsView() {
  const { map } = useScenario();
  const { emergency } = useEmergency();
  const { hideDiagnostics } = useDiagnostics();
  const diagnostics = map?.diagnostics;
  const [visibleMessages, setVisibleMessages] = useState<DiagnosticMessage[]>(
    []
  );
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isDelaying, setIsDelaying] = useState(false);
  const [loadingDashes, setLoadingDashes] = useState("");
  const [currentMessage, setCurrentMessage] =
    useState<DiagnosticMessage | null>(null);

  // Start displaying messages one by one with delays
  useEffect(() => {
    if (!diagnostics || currentMessageIndex >= diagnostics.messages.length)
      return;

    const message = diagnostics.messages[currentMessageIndex];
    setCurrentMessage(message);
    setIsTyping(true);
    setCurrentText("");
    setCurrentCharIndex(0);
    setIsDelaying(false);
    setLoadingDashes("");

    // If it's a check message with delay, start the delay after typing
    if (message.type === "check" && message.delay) {
      const delay = message.delay;

      // Start the delay timer
      const delayTimer = setTimeout(() => {
        setIsDelaying(true);
        setLoadingDashes("");

        // Animate loading dashes
        const dashInterval = setInterval(() => {
          setLoadingDashes((prev) => {
            if (prev.length >= 30) return "";
            return prev + ".";
          });
        }, 100);

        // End the delay after the specified time
        const endDelayTimer = setTimeout(() => {
          clearInterval(dashInterval);
          setIsDelaying(false);
          // Add the completed check message with DONE
          setVisibleMessages((prev) => [
            ...prev,
            {
              ...message,
              message: `${message.message}\t${".".repeat(40)} DONE`,
            },
          ]);
          setCurrentMessageIndex((prev) => prev + 1);
        }, delay);

        return () => {
          clearTimeout(endDelayTimer);
          clearInterval(dashInterval);
        };
      }, message.message.length * 10 + 200); // Time to type + small buffer

      return () => clearTimeout(delayTimer);
    }
  }, [diagnostics, currentMessageIndex]);

  // Type out the current message character by character
  useEffect(() => {
    if (!isTyping || !currentMessage) return;

    if (currentCharIndex < currentMessage.message.length) {
      const timer = setTimeout(() => {
        setCurrentText(
          (prev) => prev + currentMessage.message[currentCharIndex]
        );
        setCurrentCharIndex((prev) => prev + 1);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      // Message is complete
      if (currentMessage.type !== "check" || !currentMessage.delay) {
        setVisibleMessages((prev) => [
          ...prev,
          { ...currentMessage, message: currentText },
        ]);
        setCurrentMessageIndex((prev) => prev + 1);
      }
      // Don't set isTyping to false for check messages with delay
      if (currentMessage.type !== "check" || !currentMessage.delay) {
        setIsTyping(false);
      }
    }
  }, [isTyping, currentCharIndex, currentMessage]);

  // Handle keyboard input to close when complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hideDiagnostics();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Render a message based on its type
  const renderMessage = (message: DiagnosticMessage, index: number) => {
    const baseClasses = "my-2";
    const typeClasses = {
      separator: "text-primary",
      check: "text-primary",
      warning: "text-red-500",
      notice: "text-primary",
      summary: "text-green-500",
    };

    return (
      <div
        key={index}
        className={`${baseClasses} ${typeClasses[message.type]}`}
      >
        {message.message}
      </div>
    );
  };

  return (
    <div
      className={`border border-primary p-4 h-[500px] md:h-[800px] relative overflow-hidden bg-black ${
        emergency.active ? "text-red-500" : "text-primary"
      }`}
    >
      <div className="font-mono text-2xl mb-6">
        {diagnostics?.title || "Diagnostics"}
      </div>

      <div className="font-mono whitespace-pre-wrap">
        {visibleMessages.map(renderMessage)}

        {/* Currently typing message or check message in loading state */}
        {(isTyping || isDelaying) && currentMessage && (
          <div
            className={`my-2 ${
              currentMessage.type === "warning"
                ? "text-red-500"
                : "text-primary"
            }`}
          >
            {currentText}
            {isDelaying && `\t${loadingDashes}`}
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
