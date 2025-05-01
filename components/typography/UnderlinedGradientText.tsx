import { ReactNode } from "react";

type UnderlinedGradientTextProps = {
    children: ReactNode;
  };

const UnderlinedGradientText = ({children}: UnderlinedGradientTextProps) => {
    return(
      <p
        className="text-gray-900 text-2xl font-extrabold md:text-3xl 
                  lg:text-4xl dark:text-white"
      >
        <span 
          className="relative after:content-[''] after:absolute after:left-0 
                    after:bottom-0 after:w-full after:h-[8px] 
                    after:bg-gradient-to-r after:from-cyan-400 
                    after:via-violet-500 after:to-pink-500 after:rounded-sm"
        >
        {children}
        </span>
      </p>
    )
}

export default UnderlinedGradientText