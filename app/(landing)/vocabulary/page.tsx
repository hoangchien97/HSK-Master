import { prisma } from "@/lib/prisma";
import { Breadcrumb, Input, Tooltip, Badge } from "../../components/shared";

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
          <Input
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm từ vựng tiếng Trung..."
            variant="search"
            size="lg"
          />
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
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-primary-300 transition-all bg-white dark:bg-surface-dark"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tooltip
                        content="Click để nghe phát âm"
                        placement="top"
                      >
                        <p className="text-3xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary-500 transition-colors">
                          {v.word}
                        </p>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">
                      {v.pinyin}
                    </p>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
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
