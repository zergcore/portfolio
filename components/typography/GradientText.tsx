import { ReactNode, ElementType } from "react";

type GradientTextProps = {
    children: ReactNode;
    as?: ElementType;
    className?: string;
};

const GradientText = ({ children, as: Component = "span", className = "" }: GradientTextProps) => {
    return (
        <Component className={className}>
            <span 
                className="text-transparent bg-clip-text bg-gradient-to-r 
                from-cyan-600 via-violet-400 to-pink-600"
            >
                {children}
            </span>
        </Component>
    )
}

export default GradientText;