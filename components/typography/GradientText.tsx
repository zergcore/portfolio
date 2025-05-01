import { ReactNode } from "react";

type GradientTextProps = {
    children: ReactNode;
};

const GradientText = ({ children }: GradientTextProps) => {
    return (
        <h1 
            className="text-gray-900 text-4xl font-extrabold md:text-5xl 
                        lg:text-6xl"
        >
            <span 
                className="text-transparent bg-clip-text bg-gradient-to-r 
                from-cyan-600 via-violet-400 to-pink-600"
            >
                {children}
            </span>
        </h1>
    )
}

export default GradientText