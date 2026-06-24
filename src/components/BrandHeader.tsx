import Image from "next/image";
import { asset } from "@/lib/basePath";

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="flex flex-col items-center gap-3 pb-1 pt-2 text-center">
      <Image
        src={asset("/awtad-logo.png")}
        alt="أوتاد"
        width={320}
        height={198}
        priority
        sizes="(max-width: 640px) 45vw, 220px"
        className="h-24 w-auto select-none sm:h-28"
      />
      {subtitle ? (
        <p className="text-sm text-[var(--color-muted)]">{subtitle}</p>
      ) : null}
    </header>
  );
}
