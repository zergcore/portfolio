import { getQaPairs } from "@/lib/adminApi";
import QaClient from "./QaClient";

export const revalidate = 0;

export default async function QaPage() {
  const pairs = await getQaPairs();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Application Q&A Knowledge Base
        </h1>
        <p className="text-(--text-secondary) mt-2">
          Manage your verified answers for common job application questions.
          These are used as context for the AI when answering Q&A forms.
        </p>
      </div>

      <QaClient initialPairs={pairs} />
    </div>
  );
}
