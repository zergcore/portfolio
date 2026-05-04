import { ReactNode, ElementType } from "react";

type UnderlinedGradientTextProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

const UnderlinedGradientText = ({
  children,
  as: Component = "span",
  className = "",
}: UnderlinedGradientTextProps) => {
  return (
    <Component
      className={`text-white font-extrabold ${className}`}
    >
      <span
        className="relative inline-block after:content-[''] after:absolute after:left-0 
                          after:bottom-0 after:w-full after:h-[4px] 
                          after:bg-gradient-to-r after:from-cyan-400 
                          after:via-violet-500 after:to-pink-500 after:rounded-sm"
      >
        {children}
      </span>
    </Component>
  );
};

export default UnderlinedGradientText;
