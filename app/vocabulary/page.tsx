import { prisma } from "@/lib/prisma";

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q || "";

  const vocab = await prisma.vocabulary.findMany({
    where: {
      OR: [{ word: { contains: q } }, { meaning: { contains: q } }],
    },
  });

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Từ vựng tiếng Trung</h1>

      <form className="my-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm từ..."
          className="border p-2"
        />
      </form>

      <ul className="space-y-2">
        {vocab.map((v) => (
          <li key={v.id}>
            <strong>{v.word}</strong> ({v.pinyin}) – {v.meaning}
          </li>
        ))}
      </ul>
    </main>
  );
}
