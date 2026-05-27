import Container from "./Container";

export function SectionSkeleton() {
    return (
        <Container className="py-12 flex flex-col gap-6 animate-pulse">
            <div className="h-8 w-48 rounded-md bg-white/5" />
            <div className="h-64 w-full rounded-xl bg-white/5" />
        </Container>
    );
}