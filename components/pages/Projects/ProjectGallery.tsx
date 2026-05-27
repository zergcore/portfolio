import Image from "next/image";
import { ServerTranslation } from "@/lib/i18n/navigation";

export default function ProjectGallery({ gallery, title, t }: { gallery: string[]; title: string; t: ServerTranslation }) {
    return (
        <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {t("gallery")}
            </h2>
            <div
                className={`grid gap-4 ${gallery.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                    }`}
            >
                {gallery.map((src, i) => (
                    <div
                        key={i}
                        className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
                    >
                        <Image
                            src={src}
                            alt={`${title} interface preview ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}