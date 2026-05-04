"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(
    "Hi Zaidibeth, I'm reaching out from your portfolio!",
  );

  useEffect(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        const city = timeZone.split("/").pop()?.replace("_", " ");
        if (city) {
          setMessage(
            `Hi Zaidibeth, I'm reaching out from your portfolio (from ${city})!`,
          );
        }
      }
    } catch (error) {
      console.warn(
        "Could not detect user timezone for WhatsApp message:",
        error,
      );
      setMessage("Hi Zaidibeth, I'm reaching out from your portfolio!");
    }

    // Delay showing the FAB slightly so it doesn't distract immediately on load
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "584245092375";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
      >
        {/* Pulse ring animation behind the icon */}
        <span className="absolute inset-0 rounded-full border-2 border-green-500 animate-[pulse-ring_2s_ease-out_infinite]" />

        <FaWhatsapp size={32} className="relative z-10" />

        <span className="absolute right-full mr-4 bg-[var(--bg-overlay)] text-[var(--text-primary)] text-sm font-medium px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[var(--border-subtle)] shadow-md">
          Let&apos;s talk!
        </span>
      </a>
    </div>
  );
}
