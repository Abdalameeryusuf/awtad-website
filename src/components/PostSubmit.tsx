import { BrandHeader } from "./BrandHeader";

export default function PostSubmit({ message }: { message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-8">
      <BrandHeader />
      <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-ok)]/15">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-ok)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        {message.split("\n").map((line, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-lg font-bold text-white"
                : "mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </main>
  );
}
