import { ReactNode } from "react";

type TypingEffectProps = {
  children: ReactNode;
};

const TypingEffect = ({ children }: TypingEffectProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-max">
        <h2 
          className="animate-typing overflow-hidden whitespace-nowrap 
                    border-r-4 border-r-white pr-5">
          {children}
        </h2>
      </div>
    </div>
  )
}

export default TypingEffect