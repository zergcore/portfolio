import { ReactNode } from "react";
import Container from "./Container";

interface SectionProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Section({
  id,
  className = "",
  containerClassName = "",
  children,
  fullWidth = false,
}: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      {fullWidth ? (
        children
      ) : (
        <Container className={containerClassName}>{children}</Container>
      )}
    </section>
  );
}
