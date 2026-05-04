import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Container({ children, className = "", id }: ContainerProps) {
  return (
    <div id={id} className={`w-full max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
