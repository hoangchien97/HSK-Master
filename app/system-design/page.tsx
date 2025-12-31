import { Button } from "../components/shared";

export default function SystemDesignPage() {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="border-b border-gray-200 bg-surface-light p-6">
        <div className="mx-auto max-w-7xl">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">Design Language</span>
          <h1 className="text-text-main text-4xl lg:text-5xl font-black leading-tight tracking-tight mt-2">
            HSK Master Design System
          </h1>
          <p className="text-text-muted text-lg font-normal max-w-2xl leading-relaxed mt-4">
            Visual guidelines and core components for the Chinese Learning Platform.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 lg:p-12 space-y-16">
        {/* 1. Color Palette */}
        <section className="flex flex-col gap-6" id="colors">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-main text-2xl font-bold">1. Color Palette</h2>
            <p className="text-text-muted">Core colors used to establish brand identity and hierarchy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Primary Red */}
            <div className="flex flex-col gap-3 group">
              <div className="h-32 rounded-xl bg-primary shadow-sm flex items-end p-4 group-hover:shadow-md transition-shadow">
                <span className="bg-white/90 text-primary text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">Primary</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-text-main">Imperial Red</span>
                <span className="text-text-muted text-sm font-mono uppercase">#ec131e</span>
                <span className="text-text-muted text-xs">Action, Brand, Highlight</span>
              </div>
            </div>

            {/* Gradient */}
            <div className="flex flex-col gap-3 group">
              <div className="h-32 rounded-xl bg-gradient-to-br from-yellow-400 to-primary shadow-sm flex items-end p-4 group-hover:shadow-md transition-shadow">
                <span className="bg-white/90 text-primary text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">Gradient</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-text-main">Sunrise Gradient</span>
                <span className="text-text-muted text-sm font-mono">from-yellow-400 to-red-600</span>
                <span className="text-text-muted text-xs">Premium, Success</span>
              </div>
            </div>

            {/* Background Light */}
            <div className="flex flex-col gap-3 group">
              <div className="h-32 rounded-xl bg-background-light border border-gray-200 shadow-sm flex items-end p-4">
                <span className="bg-white/90 text-text-main text-xs font-bold px-2 py-1 rounded">Background</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-text-main">Light Background</span>
                <span className="text-text-muted text-sm font-mono uppercase">#f8f6f6</span>
              </div>
            </div>

            {/* Surface Light */}
            <div className="flex flex-col gap-3 group">
              <div className="h-32 rounded-xl bg-surface-light border border-gray-200 shadow-sm flex items-end p-4">
                <span className="bg-gray-900/90 text-white text-xs font-bold px-2 py-1 rounded">Surface</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-text-main">White Surface</span>
                <span className="text-text-muted text-sm font-mono uppercase">#ffffff</span>
              </div>
            </div>
          </div>

          {/* Color Scales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-main">Primary Scale</h3>
            <div className="grid grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex flex-col gap-2">
                  <div className={`h-16 rounded-lg bg-primary-${shade} shadow-sm`}></div>
                  <span className="text-xs text-center text-text-muted">{shade}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-text-main">Secondary Scale</h3>
            <div className="grid grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex flex-col gap-2">
                  <div className={`h-16 rounded-lg bg-secondary-${shade} shadow-sm`}></div>
                  <span className="text-xs text-center text-text-muted">{shade}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-text-main">Accent Scale</h3>
            <div className="grid grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex flex-col gap-2">
                  <div className={`h-16 rounded-lg bg-accent-${shade} shadow-sm`}></div>
                  <span className="text-xs text-center text-text-muted">{shade}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Typography */}
        <section className="flex flex-col gap-6" id="typography">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-main text-2xl font-bold">2. Typography</h2>
            <p className="text-text-muted">Type scale using Inter for English and Noto Sans SC for Chinese.</p>
          </div>
          <div className="bg-surface-light rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
            {/* H1 */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-text-muted text-sm font-mono">H1 / Bold / 36px</div>
              <div className="col-span-9">
                <h1 className="text-4xl font-bold text-text-main">
                  Learning Chinese Made Simple
                  <br />
                  <span className="text-primary font-normal">让学习中文变得简单</span>
                </h1>
              </div>
            </div>

            {/* H2 */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-text-muted text-sm font-mono">H2 / Bold / 30px</div>
              <div className="col-span-9">
                <h2 className="text-3xl font-bold text-text-main">
                  Course Structure & Modules
                  <br />
                  <span className="text-text-muted text-2xl font-normal">课程结构与模块</span>
                </h2>
              </div>
            </div>

            {/* H3 */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-text-muted text-sm font-mono">H3 / Medium / 24px</div>
              <div className="col-span-9">
                <h3 className="text-2xl font-medium text-text-main">
                  Vocabulary Practice <span className="text-text-muted">词汇练习</span>
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-text-muted text-sm font-mono">Body / Regular / 16px</div>
              <div className="col-span-9">
                <p className="text-base text-text-muted leading-relaxed max-w-2xl">
                  Our platform uses an immersive approach to help you master Mandarin Chinese.
                  <br />
                  我们的平台采用沉浸式方法帮助您掌握普通话。
                </p>
              </div>
            </div>

            {/* Font Sizes */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-text-muted text-sm font-mono">Font Sizes</div>
              <div className="col-span-9 space-y-2">
                <p className="text-2xs">2xs - Extra Extra Small (10px)</p>
                <p className="text-xs">xs - Extra Small (12px)</p>
                <p className="text-sm">sm - Small (14px)</p>
                <p className="text-base">base - Base (16px)</p>
                <p className="text-lg">lg - Large (18px)</p>
                <p className="text-xl">xl - Extra Large (20px)</p>
                <p className="text-2xl">2xl - 2X Large (24px)</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section className="flex flex-col gap-6" id="buttons">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-main text-2xl font-bold">3. Buttons</h2>
            <p className="text-text-muted">Interactive elements with clear states for hover, active, and disabled.</p>
          </div>
          <div className="bg-surface-light p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Primary */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Primary</span>
                <div className="flex flex-col gap-3 items-start">
                  <Button variant="primary" icon={<span className="material-symbols-outlined text-[20px]">arrow_forward</span>}>
                    Start Learning
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                </div>
              </div>

              {/* Secondary */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Secondary</span>
                <div className="flex flex-col gap-3 items-start">
                  <Button variant="secondary">
                    View Courses
                  </Button>
                  <Button variant="secondary" disabled>
                    Unavailable
                  </Button>
                </div>
              </div>

              {/* Ghost */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Ghost</span>
                <div className="flex flex-col gap-3 items-start">
                  <Button variant="ghost" icon={<span className="material-symbols-outlined text-[20px]">play_circle</span>} iconPosition="left">
                    Watch Demo
                  </Button>
                  <Button variant="ghost" size="sm">
                    Small Ghost
                  </Button>
                </div>
              </div>

              {/* Gradient */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Gradient & Sizes</span>
                <div className="flex flex-col gap-3 items-start">
                  <Button variant="gradient">
                    Premium
                  </Button>
                  <Button variant="primary" size="sm">
                    Small
                  </Button>
                  <Button variant="primary" size="lg">
                    Large
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Icons */}
        <section className="flex flex-col gap-6" id="icons">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-main text-2xl font-bold">4. Iconography</h2>
            <p className="text-text-muted">Material Symbols for navigation and actions.</p>
          </div>

          {/* Usage Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <h3 className="text-blue-900 font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              How to use Material Symbols
            </h3>
            <div className="text-sm text-blue-800 space-y-2 font-mono bg-white p-4 rounded border border-blue-100">
              <p className="text-gray-700 font-sans mb-2">1. Add the font to your layout.tsx:</p>
              <code className="block text-xs bg-gray-50 p-2 rounded border">
                {`<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />`}
              </code>

              <p className="text-gray-700 font-sans mb-2 mt-4">2. Use the icon name in a span:</p>
              <code className="block text-xs bg-gray-50 p-2 rounded border">
                {`<span className="material-symbols-outlined">icon_name</span>`}
              </code>

              <p className="text-gray-700 font-sans mb-2 mt-4">3. Browse all icons at:</p>
              <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-blue-600 hover:text-blue-800 underline"
              >
                fonts.google.com/icons
              </a>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {[
              'language', 'translate', 'school', 'quiz', 'book',
              'arrow_forward', 'arrow_upward', 'mail', 'call', 'location_on',
              'play_circle', 'check_circle', 'favorite', 'star', 'menu',
              'search', 'close', 'login', 'logout', 'public'
            ].map((icon) => (
              <div key={icon} className="flex flex-col items-center justify-center p-4 bg-surface-light rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all aspect-square gap-2 group">
                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-xs text-text-muted text-center">{icon}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Cards */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-main text-2xl font-bold">5. Card Examples</h2>
            <p className="text-text-muted">Sample card components with different color schemes.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-6 transition hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary-600 text-3xl">school</span>
                <h3 className="text-xl font-bold text-primary-700">HSK 1</h3>
              </div>
              <p className="text-sm text-gray-600 font-vietnamese">
                Khóa học cho người mới bắt đầu học tiếng Trung
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">150 từ</span>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">20 bài</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-secondary-200 bg-secondary-50 p-6 transition hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-secondary-600 text-3xl">translate</span>
                <h3 className="text-xl font-bold text-secondary-700">HSK 2</h3>
              </div>
              <p className="text-sm text-gray-600 font-vietnamese">
                Giao tiếp cơ bản tiếng Trung trong cuộc sống
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full">300 từ</span>
                <span className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full">35 bài</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-accent-200 bg-accent-50 p-6 transition hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-accent-600 text-3xl">star</span>
                <h3 className="text-xl font-bold text-accent-700">HSK 3</h3>
              </div>
              <p className="text-sm text-gray-600 font-vietnamese">
                Nâng cao kỹ năng giao tiếp và hiểu biết
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-accent-100 text-accent-700 rounded-full">600 từ</span>
                <span className="text-xs px-2 py-1 bg-accent-100 text-accent-700 rounded-full">50 bài</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
