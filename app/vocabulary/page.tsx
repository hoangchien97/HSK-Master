import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "../components/shared";

export const metadata = {
  title: "Từ vựng tiếng Trung | HSK Master",
  description: "Tra cứu từ vựng tiếng Trung, học từ mới và ôn tập",
};

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q || "";

  const vocab = await prisma.vocabulary.findMany({
    where: {
      OR: [
        { word: { contains: q } },
        { meaning: { contains: q } },
      ],
    },
    take: 100,
  });

  return (
    <main className="flex-1">
      {/* Breadcrumb Section */}
      <div className="bg-gray-50 dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Từ vựng", href: "/vocabulary" },
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Từ vựng tiếng Trung
        </h1>

        <form className="mb-8">
          <div className="relative">
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm kiếm từ vựng..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {vocab.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Không tìm thấy từ vựng nào.
            </p>
          ) : (
            vocab.map((v) => (
              <div
                key={v.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {v.word}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {v.pinyin}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {v.meaning}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
