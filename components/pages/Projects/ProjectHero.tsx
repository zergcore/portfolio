import Image from "next/image";

export default function ProjectHero({ imageUrl, title }: { imageUrl: string; title: string }) {
    return (
        <div className="relative h-64 w-full overflow-hidden bg-[var(--bg-elevated)] md:h-96">
            <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover opacity-40 mix-blend-luminosity"
                priority
                sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent" />
        </div>
    );
}