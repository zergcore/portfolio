"use client";

import GradientText from "@/components/typography/GradientText";
import CyclingTypingEffect from "@/components/typography/CyclingTypingEffect";
import MediaButtons from "@/components/Buttons/MediaButtons";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center w-full text-center">
        <GradientText>Zaidibeth Ramos</GradientText>
        <div className="w-full flex justify-center">
          <CyclingTypingEffect />
        </div>
        <MediaButtons />
      </main>
    </div>
  );
}
