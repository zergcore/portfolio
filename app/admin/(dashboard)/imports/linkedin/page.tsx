import LinkedInImportClient from "./LinkedInImportClient";

export default function LinkedInImportPage() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">LinkedIn Import</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Upload your LinkedIn data-export ZIP to import positions, education, certifications, skills,
          and projects as draft records you confirm before they go live.
        </p>
      </div>

      {/* How-to instructions */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          How to get your LinkedIn export ZIP
        </h2>
        <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>
              Go to{" "}
              <strong className="text-[var(--text-primary)]">LinkedIn.com</strong> → click your
              profile picture → <strong className="text-[var(--text-primary)]">Settings &amp; Privacy</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>
              In the left sidebar, click{" "}
              <strong className="text-[var(--text-primary)]">Data privacy</strong> → then{" "}
              <strong className="text-[var(--text-primary)]">Get a copy of your data</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>
              Select{" "}
              <strong className="text-[var(--text-primary)]">
                &quot;Want something in particular?&quot;
              </strong>{" "}
              (not the full archive — that&apos;s much larger and takes days).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] text-xs font-bold flex items-center justify-center">
              4
            </span>
            <span>
              Check at minimum:{" "}
              <strong className="text-[var(--text-primary)]">
                Profile, Positions, Education, Certifications, Skills, Projects
              </strong>
              . Then click <strong className="text-[var(--text-primary)]">Request archive</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] text-xs font-bold flex items-center justify-center">
              5
            </span>
            <span>
              LinkedIn will email you a download link within{" "}
              <strong className="text-[var(--text-primary)]">10 minutes</strong> (sometimes up to
              24 h for large accounts). Download and keep the{" "}
              <strong className="text-[var(--text-primary)]">.zip</strong> file.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-violet)]/15 text-[var(--accent-violet)] text-xs font-bold flex items-center justify-center">
              6
            </span>
            <span>
              Upload it below. The ZIP is parsed in memory and{" "}
              <strong className="text-[var(--text-primary)]">deleted immediately</strong> — it is
              never stored on the server.
            </span>
          </li>
        </ol>

        <div className="mt-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-3 text-xs text-[var(--text-muted)]">
          <strong className="text-[var(--text-secondary)]">Privacy note:</strong> Only the parsed
          fields (titles, dates, company names) are stored temporarily for up to 1 hour while you
          review the preview. The raw ZIP is never saved. Row counts are the only things logged.
        </div>
      </div>

      {/* Upload + preview client component */}
      <LinkedInImportClient />
    </div>
  );
}
