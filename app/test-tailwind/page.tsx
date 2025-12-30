export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-600 font-sans">
            Tailwind Config Test
          </h1>
          <p className="mt-4 text-xl text-gray-600 font-vietnamese">
            Kiểm tra cấu hình Tailwind CSS
          </p>
        </div>

        {/* Color Palette */}
        <section className="rounded-4xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            🎨 Custom Colors
          </h2>

          {/* Primary Colors */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-medium">Primary (Red)</h3>
            <div className="flex gap-2">
              <div className="h-20 w-20 rounded-lg bg-primary-100"></div>
              <div className="h-20 w-20 rounded-lg bg-primary-300"></div>
              <div className="h-20 w-20 rounded-lg bg-primary-500"></div>
              <div className="h-20 w-20 rounded-lg bg-primary-700"></div>
              <div className="h-20 w-20 rounded-lg bg-primary-900"></div>
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-medium">Secondary (Blue)</h3>
            <div className="flex gap-2">
              <div className="h-20 w-20 rounded-lg bg-secondary-100"></div>
              <div className="h-20 w-20 rounded-lg bg-secondary-300"></div>
              <div className="h-20 w-20 rounded-lg bg-secondary-500"></div>
              <div className="h-20 w-20 rounded-lg bg-secondary-700"></div>
              <div className="h-20 w-20 rounded-lg bg-secondary-900"></div>
            </div>
          </div>

          {/* Accent Colors */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-medium">Accent (Yellow)</h3>
            <div className="flex gap-2">
              <div className="h-20 w-20 rounded-lg bg-accent-100"></div>
              <div className="h-20 w-20 rounded-lg bg-accent-300"></div>
              <div className="h-20 w-20 rounded-lg bg-accent-500"></div>
              <div className="h-20 w-20 rounded-lg bg-accent-700"></div>
              <div className="h-20 w-20 rounded-lg bg-accent-900"></div>
            </div>
          </div>

          {/* Chinese Theme Colors */}
          <div>
            <h3 className="mb-2 text-lg font-medium">Chinese Theme</h3>
            <div className="flex gap-2">
              <div className="h-20 w-20 rounded-lg bg-chinese-red"></div>
              <div className="h-20 w-20 rounded-lg bg-chinese-gold"></div>
              <div className="h-20 w-20 rounded-lg bg-chinese-jade"></div>
            </div>
          </div>
        </section>

        {/* Font Sizes */}
        <section className="rounded-4xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            📏 Font Sizes
          </h2>
          <div className="space-y-2">
            <p className="text-2xs">2xs - Extra Extra Small (10px)</p>
            <p className="text-xs">xs - Extra Small (12px)</p>
            <p className="text-sm">sm - Small (14px)</p>
            <p className="text-base">base - Base (16px)</p>
            <p className="text-lg">lg - Large (18px)</p>
            <p className="text-xl">xl - Extra Large (20px)</p>
            <p className="text-2xl">2xl - 2X Large (24px)</p>
            <p className="text-3xl">3xl - 3X Large (30px)</p>
            <p className="text-4xl">4xl - 4X Large (36px)</p>
          </div>
        </section>

        {/* Font Families */}
        <section className="rounded-4xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            🔤 Font Families
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Sans (Default)</p>
              <p className="text-xl font-sans">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vietnamese</p>
              <p className="text-xl font-vietnamese">
                Xin chào! Học tiếng Trung với chúng tôi
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Chinese</p>
              <p className="text-xl font-chinese">你好！学习中文 HSK 1-6</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mono (Code)</p>
              <p className="font-mono text-xl">
                const hello = "world"; // Code font
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Demo */}
        <section className="rounded-4xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            🔘 Button Styles
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-lg bg-primary-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-600">
              Primary Button
            </button>
            <button className="rounded-lg bg-secondary-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-secondary-600">
              Secondary Button
            </button>
            <button className="rounded-lg bg-accent-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-accent-600">
              Accent Button
            </button>
            <button className="rounded-lg border-2 border-chinese-red bg-white px-6 py-3 text-base font-semibold text-chinese-red transition hover:bg-chinese-red hover:text-white">
              Chinese Red
            </button>
          </div>
        </section>

        {/* Cards Demo */}
        <section className="rounded-4xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            🎴 Card Examples
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-4 transition hover:shadow-lg">
              <h3 className="text-xl font-bold text-primary-700">HSK 1</h3>
              <p className="mt-2 text-sm text-gray-600 font-vietnamese">
                Khóa học cho người mới bắt đầu
              </p>
            </div>
            <div className="rounded-xl border-2 border-secondary-200 bg-secondary-50 p-4 transition hover:shadow-lg">
              <h3 className="text-xl font-bold text-secondary-700">HSK 2</h3>
              <p className="mt-2 text-sm text-gray-600 font-vietnamese">
                Giao tiếp cơ bản tiếng Trung
              </p>
            </div>
            <div className="rounded-xl border-2 border-accent-200 bg-accent-50 p-4 transition hover:shadow-lg">
              <h3 className="text-xl font-bold text-accent-700">HSK 3</h3>
              <p className="mt-2 text-sm text-gray-600 font-vietnamese">
                Nâng cao kỹ năng giao tiếp
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
