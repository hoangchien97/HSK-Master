'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Select, Checkbox, Radio, Switch, Pagination, Tooltip } from "../components/landing/shared";
import LoadingSpinner from '../components/landing/shared/LoadingSpinner';
import {
  Palette,
  Type,
  Feather,
  MousePointer2,
  TextCursorInput,
  ListFilter,
  MessageSquare,
  LayoutGrid,
  Layers,
  GraduationCap,
  Menu,
  Search,
  Download,
  ChevronRight,
  ArrowRight,
  Heart,
  ShoppingCart,
  Plus,
  Settings,
  Bell,
  X,
  AlertCircle,
  Check,
  Mail,
  User,
  BookOpen
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function SystemDesignPage() {
  const [activeSection, setActiveSection] = useState<string>('colors');

  const navigationItems = {
    foundation: [
      { id: 'colors', label: 'Màu sắc', icon: Palette },
      { id: 'typography', label: 'Typography', icon: Type },
      { id: 'icons', label: 'Icons', icon: Feather },
    ],
    components: [
      { id: 'buttons', label: 'Buttons', icon: MousePointer2 },
      { id: 'forms', label: 'Forms', icon: TextCursorInput },
      { id: 'pagination', label: 'Pagination', icon: LayoutGrid },
      { id: 'tooltip', label: 'Tooltip', icon: MessageSquare },
      { id: 'loading', label: 'Loading', icon: Layers },
      { id: 'cards', label: 'Cards', icon: LayoutGrid },
      { id: 'nav', label: 'Header & Footer', icon: Layers },
    ],
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-sidebar-bg border-r border-gray-100 overflow-y-auto">
        <div className="p-8 pb-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary-500 p-2 rounded-xl text-white shadow-lg shadow-primary-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">HSK Master</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Design System v1.0</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-8">
            {/* Foundation Section */}
            <div>
              <h3 className="text-[11px] font-black text-sidebar-text/50 uppercase tracking-[0.2em] mb-4">
                Nền tảng (Foundation)
              </h3>
              <ul className="space-y-1">
                {navigationItems.foundation.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-sidebar-text hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Components Section */}
            <div>
              <h3 className="text-[11px] font-black text-sidebar-text/50 uppercase tracking-[0.2em] mb-4">
                Components
              </h3>
              <ul className="space-y-1">
                {navigationItems.components.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-sidebar-text hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-auto p-8">
          <div className="bg-gray-100 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Trạng thái hệ thống</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold">Hoạt động ổn định</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-white min-h-screen">
        {/* Top Navigation Bar */}
        <div className="px-8 lg:px-12 py-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <span>Design System</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary-600 font-bold uppercase tracking-widest">
              {navigationItems.foundation.find(item => item.id === activeSection)?.label ||
               navigationItems.components.find(item => item.id === activeSection)?.label}
            </span>
          </nav>
          <div className="hidden md:flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">
              <Search className="w-3.5 h-3.5" />
              Tìm kiếm
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold hover:bg-primary-600 shadow-md transition-all shadow-primary-100">
              <Download className="w-3.5 h-3.5" />
              Export Figma
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-20">
          {/* Hero Section */}
          <motion.section
            className="pb-12 border-b border-gray-100"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.div
              className="inline-flex items-center gap-2 text-primary-600 font-bold text-[10px] bg-primary-50 px-3 py-1 rounded-full mb-6 uppercase tracking-[0.2em]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Design Language
            </motion.div>
            <motion.h1
              className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Tài liệu <br />
              <motion.span
                className="gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                HSK Master Ultimate
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-500 max-w-3xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Hệ thống thiết kế toàn diện nhất cho HSK Master, tích hợp cấu trúc Sidebar điều hướng
              và các thành phần giao diện chi tiết cho nền tảng giáo dục tiếng Trung cao cấp.
            </motion.p>
          </motion.section>

          {/* 1. Color Palette */}
          {activeSection === 'colors' && (
            <motion.section
              className="space-y-10"
              id="colors"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <motion.div
                className="section-header-gradient"
                variants={slideInLeft}
              >
                <h2 className="text-3xl font-black tracking-tight">Bảng Màu Hệ Thống</h2>
                <p className="text-gray-500 mt-1">Dải màu 50-950 được tối ưu hóa cho độ tương phản và khả năng tiếp cận.</p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 gap-12"
                variants={staggerContainer}
              >
                {/* Primary Scale */}
                <motion.div
                  className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                  variants={staggerItem}
                >
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
                    Primary - Imperial Red (#EC131E)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-4">
                    {[
                      ['50', '#fff1f2'],
                      ['100', '#ffe4e6'],
                      ['200', '#fecdd3'],
                      ['300', '#fda4af'],
                      ['400', '#fb7185'],
                      ['500', '#ec131e'],
                      ['600', '#e11d48'],
                      ['700', '#be123c'],
                      ['800', '#9f1239'],
                      ['900', '#881337'],
                      ['950', '#4c0519']
                    ].map(([shade, hex]) => (
                      <div key={shade} className="flex flex-col gap-2">
                        <div
                          className="h-16 w-full rounded-2xl shadow-sm"
                          style={{ backgroundColor: hex }}
                        ></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-900">{shade}</p>
                          <p className="text-[9px] font-mono text-gray-400 uppercase">{hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Semantic Colors Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  variants={staggerContainer}
                >
                  {/* Success */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-success-600 uppercase tracking-widest mb-6">
                      Success - Green
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="h-12 rounded-lg bg-success-50"></div>
                      <div className="h-12 rounded-lg bg-success-200"></div>
                      <div className="h-12 rounded-lg bg-success-500"></div>
                      <div className="h-12 rounded-lg bg-success-700"></div>
                      <div className="h-12 rounded-lg bg-success-950"></div>
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-mono text-gray-400">
                      <span>50</span><span>950</span>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-warning-600 uppercase tracking-widest mb-6">
                      Warning - Amber
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="h-12 rounded-lg bg-warning-50"></div>
                      <div className="h-12 rounded-lg bg-warning-200"></div>
                      <div className="h-12 rounded-lg bg-warning-500"></div>
                      <div className="h-12 rounded-lg bg-warning-700"></div>
                      <div className="h-12 rounded-lg bg-warning-950"></div>
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-mono text-gray-400">
                      <span>50</span><span>950</span>
                    </div>
                  </div>

                  {/* Error */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-error-600 uppercase tracking-widest mb-6">
                      Error - Red
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="h-12 rounded-lg bg-error-50"></div>
                      <div className="h-12 rounded-lg bg-error-200"></div>
                      <div className="h-12 rounded-lg bg-error-500"></div>
                      <div className="h-12 rounded-lg bg-error-700"></div>
                      <div className="h-12 rounded-lg bg-error-950"></div>
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-mono text-gray-400">
                      <span>50</span><span>950</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-info-600 uppercase tracking-widest mb-6">
                      Info - Blue
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="h-12 rounded-lg bg-info-50"></div>
                      <div className="h-12 rounded-lg bg-info-200"></div>
                      <div className="h-12 rounded-lg bg-info-500"></div>
                      <div className="h-12 rounded-lg bg-info-700"></div>
                      <div className="h-12 rounded-lg bg-info-950"></div>
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-mono text-gray-400">
                      <span>50</span><span>950</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.section>
          )}

          {/* 2. Typography */}
          {activeSection === 'typography' && (
            <motion.section
              className="space-y-10"
              id="typography"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <motion.div
                className="section-header-gradient"
                variants={slideInLeft}
              >
                <h2 className="text-3xl font-black tracking-tight">Typography</h2>
                <p className="text-gray-500 mt-1">Font system using Inter for Latin text and Noto Sans SC for Chinese characters.</p>
              </motion.div>

              {/* Font Families */}
              <motion.div
                className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                variants={scaleIn}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Font Families</h3>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2 pb-6 border-b border-gray-100">
                    <p className="text-xs font-mono text-gray-400">font-display / font-body</p>
                    <p className="text-2xl font-display">Inter, Noto Sans SC, sans-serif</p>
                    <p className="text-xl font-chinese">你好世界 - Hello World - Xin chào thế giới</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-mono text-gray-400">font-vietnamese</p>
                    <p className="text-lg font-vietnamese">
                      Học tiếng Trung trở nên đơn giản với HSK Master
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-mono text-gray-400">font-chinese</p>
                    <p className="text-lg font-chinese">
                      让学习中文变得简单 - 中国汉语水平考试
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Type Scale */}
              <motion.div
                className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                variants={scaleIn}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Type Scale</h3>
                <div className="space-y-8">
                  <div className="flex items-baseline gap-6 pb-6 border-b border-gray-50">
                    <span className="text-xs font-mono text-gray-400 w-20">Display</span>
                    <h1 className="text-7xl font-black tracking-tighter">HSK Master</h1>
                  </div>
                  <div className="flex items-baseline gap-6 pb-6 border-b border-gray-50">
                    <span className="text-xs font-mono text-gray-400 w-20">H1</span>
                    <h1 className="text-5xl font-bold">学习中文</h1>
                  </div>
                  <div className="flex items-baseline gap-6 pb-6 border-b border-gray-50">
                    <span className="text-xs font-mono text-gray-400 w-20">H2</span>
                    <h2 className="text-3xl font-bold">Course Structure</h2>
                  </div>
                  <div className="flex items-baseline gap-6 pb-6 border-b border-gray-50">
                    <span className="text-xs font-mono text-gray-400 w-20">H3</span>
                    <h3 className="text-2xl font-medium">Vocabulary Practice</h3>
                  </div>
                  <div className="flex items-baseline gap-6 pb-6 border-b border-gray-50">
                    <span className="text-xs font-mono text-gray-400 w-20">Body</span>
                    <p className="text-base text-gray-600">
                      Our platform uses an immersive approach to help you master Mandarin Chinese.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-6">
                    <span className="text-xs font-mono text-gray-400 w-20">Caption</span>
                    <p className="text-sm text-gray-500">Additional information and helper text</p>
                  </div>
                </div>
              </motion.div>
            </motion.section>
          )}

          {/* 3. Icons */}
          {activeSection === 'icons' && (
            <motion.section
              className="space-y-10"
              id="icons"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <motion.div
                className="section-header-gradient"
                variants={slideInLeft}
              >
                <h2 className="text-3xl font-black tracking-tight">Iconography</h2>
                <p className="text-gray-500 mt-1">Using Lucide React icons for consistent visual language.</p>
              </motion.div>

              {/* Usage Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 space-y-4">
                <h3 className="text-blue-900 font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">ℹ️</span>
                  How to use Lucide React
                </h3>
                <div className="text-sm text-blue-800 space-y-3 bg-white p-6 rounded-xl border border-blue-100">
                  <div>
                    <p className="text-gray-700 font-semibold mb-2">1. Import the icon:</p>
                    <code className="block text-xs bg-gray-50 p-3 rounded border font-mono">
                      {`import { Heart, Star, Settings } from 'lucide-react';`}
                    </code>
                  </div>

                  <div>
                    <p className="text-gray-700 font-semibold mb-2">2. Use as a component:</p>
                    <code className="block text-xs bg-gray-50 p-3 rounded border font-mono">
                      {`<Heart className="w-5 h-5 text-primary" />`}
                    </code>
                  </div>

                  <div>
                    <p className="text-gray-700 font-semibold mb-2">3. Browse all icons:</p>
                    <a
                      href="https://lucide.dev/icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      lucide.dev/icons
                    </a>
                  </div>
                </div>
              </div>

              {/* Icon Grid */}
              <motion.div
                className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"
                variants={staggerContainer}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true }}
              >
                {[
                  { Icon: GraduationCap, name: 'GraduationCap' },
                  { Icon: Palette, name: 'Palette' },
                  { Icon: Type, name: 'Type' },
                  { Icon: Feather, name: 'Feather' },
                  { Icon: MousePointer2, name: 'MousePointer2' },
                  { Icon: TextCursorInput, name: 'TextCursorInput' },
                  { Icon: ListFilter, name: 'ListFilter' },
                  { Icon: MessageSquare, name: 'MessageSquare' },
                  { Icon: LayoutGrid, name: 'LayoutGrid' },
                  { Icon: Layers, name: 'Layers' },
                  { Icon: Menu, name: 'Menu' },
                  { Icon: Search, name: 'Search' },
                  { Icon: Download, name: 'Download' },
                  { Icon: ChevronRight, name: 'ChevronRight' },
                ].map(({ Icon, name }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all aspect-square gap-3 group cursor-pointer"
                  >
                    <Icon className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-gray-500 text-center font-medium leading-tight">
                      {name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Components Sections */}
          {['buttons', 'forms', 'pagination', 'tooltip', 'loading', 'cards', 'nav'].includes(activeSection) && (
            <>
              {activeSection === 'buttons' ? (
                <motion.section
                  className="space-y-10"
                  id="buttons"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <motion.div
                    className="section-header-gradient"
                    variants={slideInLeft}
                  >
                    <h2 className="text-3xl font-black tracking-tight">Buttons (Ma trận nút bấm)</h2>
                    <p className="text-gray-500 mt-1">Đầy đủ các trạng thái tương tác và biến thể phong cách.</p>
                  </motion.div>

                  {/* Variants Overview */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Button Variants</h3>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="gradient">Gradient</Button>
                    </div>
                  </motion.div>

                  {/* Sizes */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Sizes</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="md">Medium (Default)</Button>
                      <Button variant="primary" size="lg">Large</Button>
                    </div>
                  </motion.div>

                  {/* States Matrix */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100 overflow-x-auto">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">State Matrix</h3>
                    <table className="w-full min-w-225">
                      <thead>
                        <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                          <th className="pb-6 pr-6">Variant</th>
                          <th className="pb-6 px-4">Default</th>
                          <th className="pb-6 px-4">Hover</th>
                          <th className="pb-6 px-4">Focus</th>
                          <th className="pb-6 px-4">Active</th>
                          <th className="pb-6 px-4">Disabled</th>
                          <th className="pb-6 px-4">Loading</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {/* Primary */}
                        <tr className="group">
                          <td className="py-6 pr-6"><span className="text-xs font-black text-gray-500">Primary</span></td>
                          <td className="px-4"><Button variant="primary">Button</Button></td>
                          <td className="px-4"><div className="opacity-90 hover:opacity-100"><Button variant="primary">Hover Me</Button></div></td>
                          <td className="px-4"><Button variant="primary" className="ring-4 ring-primary-200">Focused</Button></td>
                          <td className="px-4"><Button variant="primary" className="scale-[0.98]">Pressed</Button></td>
                          <td className="px-4"><Button variant="primary" disabled>Disabled</Button></td>
                          <td className="px-4"><Button variant="primary" loading>Loading</Button></td>
                        </tr>

                        {/* Secondary */}
                        <tr className="group">
                          <td className="py-6 pr-6"><span className="text-xs font-black text-gray-500">Secondary</span></td>
                          <td className="px-4"><Button variant="secondary">Button</Button></td>
                          <td className="px-4"><div className="opacity-90 hover:opacity-100"><Button variant="secondary">Hover Me</Button></div></td>
                          <td className="px-4"><Button variant="secondary" className="ring-4 ring-primary-200">Focused</Button></td>
                          <td className="px-4"><Button variant="secondary" className="scale-[0.98]">Pressed</Button></td>
                          <td className="px-4"><Button variant="secondary" disabled>Disabled</Button></td>
                          <td className="px-4"><Button variant="secondary" loading>Loading</Button></td>
                        </tr>

                        {/* Outline */}
                        <tr className="group">
                          <td className="py-6 pr-6"><span className="text-xs font-black text-gray-500">Outline</span></td>
                          <td className="px-4"><Button variant="outline">Button</Button></td>
                          <td className="px-4"><div className="opacity-90 hover:opacity-100"><Button variant="outline">Hover Me</Button></div></td>
                          <td className="px-4"><Button variant="outline" className="ring-4 ring-primary-200">Focused</Button></td>
                          <td className="px-4"><Button variant="outline" className="scale-[0.98]">Pressed</Button></td>
                          <td className="px-4"><Button variant="outline" disabled>Disabled</Button></td>
                          <td className="px-4"><Button variant="outline" loading>Loading</Button></td>
                        </tr>

                        {/* Ghost */}
                        <tr className="group">
                          <td className="py-6 pr-6"><span className="text-xs font-black text-gray-500">Ghost</span></td>
                          <td className="px-4"><Button variant="ghost">Button</Button></td>
                          <td className="px-4"><div className="opacity-90 hover:opacity-100"><Button variant="ghost">Hover Me</Button></div></td>
                          <td className="px-4"><Button variant="ghost" className="ring-4 ring-gray-200">Focused</Button></td>
                          <td className="px-4"><Button variant="ghost" className="scale-[0.98]">Pressed</Button></td>
                          <td className="px-4"><Button variant="ghost" disabled>Disabled</Button></td>
                          <td className="px-4"><Button variant="ghost" loading>Loading</Button></td>
                        </tr>

                        {/* Gradient */}
                        <tr className="group">
                          <td className="py-6 pr-6"><span className="text-xs font-black text-gray-500">Gradient</span></td>
                          <td className="px-4"><Button variant="gradient">Premium</Button></td>
                          <td className="px-4"><div className="opacity-90 hover:opacity-100"><Button variant="gradient">Hover Me</Button></div></td>
                          <td className="px-4"><Button variant="gradient" className="ring-4 ring-yellow-200">Focused</Button></td>
                          <td className="px-4"><Button variant="gradient" className="scale-[0.98]">Pressed</Button></td>
                          <td className="px-4"><Button variant="gradient" disabled>Disabled</Button></td>
                          <td className="px-4"><Button variant="gradient" loading>Loading</Button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Content Composition */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Content Composition</h3>
                    <div className="space-y-8">
                      {/* Text Only */}
                      <div>
                        <p className="text-xs font-mono text-gray-500 mb-3">Text Only</p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="primary">Đăng ký ngay</Button>
                          <Button variant="secondary">Xem khóa học</Button>
                          <Button variant="outline">Tìm hiểu thêm</Button>
                        </div>
                      </div>

                      {/* Icon Left */}
                      <div>
                        <p className="text-xs font-mono text-gray-500 mb-3">Icon Left</p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="primary" icon={<ArrowRight className="w-5 h-5" />} iconPosition="left">
                            Bắt đầu học
                          </Button>
                          <Button variant="secondary" icon={<ShoppingCart className="w-5 h-5" />} iconPosition="left">
                            Thêm vào giỏ
                          </Button>
                          <Button variant="outline" icon={<Heart className="w-5 h-5" />} iconPosition="left">
                            Yêu thích
                          </Button>
                        </div>
                      </div>

                      {/* Icon Right */}
                      <div>
                        <p className="text-xs font-mono text-gray-500 mb-3">Icon Right</p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="primary" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                            Tiếp tục
                          </Button>
                          <Button variant="gradient" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                            Nâng cấp Premium
                          </Button>
                        </div>
                      </div>

                      {/* Icon Only */}
                      <div>
                        <p className="text-xs font-mono text-gray-500 mb-3">Icon Only (with aria-label)</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button variant="icon-only" size="sm" icon={<Plus className="w-4 h-4" />} aria-label="Add item" />
                          <Button variant="icon-only" size="md" icon={<Settings className="w-5 h-5" />} aria-label="Settings" />
                          <Button variant="icon-only" size="lg" icon={<Bell className="w-6 h-6" />} aria-label="Notifications" />
                          <Button variant="icon-only" icon={<X className="w-5 h-5" />} aria-label="Close" />
                        </div>
                      </div>

                      {/* Loading States */}
                      <div>
                        <p className="text-xs font-mono text-gray-500 mb-3">Loading States</p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="primary" loading iconPosition="left">
                            Đang xử lý...
                          </Button>
                          <Button variant="secondary" loading iconPosition="right">
                            Đang tải...
                          </Button>
                          <Button variant="gradient" loading>
                            Vui lòng đợi
                          </Button>
                          <Button variant="icon-only" loading icon={<Heart className="w-5 h-5" />} aria-label="Loading" />
                        </div>
                      </div>

                      {/* With Badge */}
                      <div>
                        <p className="text-xs font-mono text-gray-500 mb-3">With Badge/Counter</p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="primary" badge="3">
                            Thông báo
                          </Button>
                          <Button variant="secondary" badge="NEW">
                            Khóa học mới
                          </Button>
                          <Button variant="gradient" badge="99+">
                            Tin nhắn
                          </Button>
                        </div>
                      </div>

                      {/* Full Width */}
                      <div>
                        <p className="text-xs font-mono text-gray-500 mb-3">Full Width</p>
                        <Button variant="primary" fullWidth icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                          Đăng ký khóa học ngay
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Usage Code Example */}
                  <div className="bg-gray-900 p-8 rounded-3xl shadow-soft">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Usage Examples</h3>
                    <div className="space-y-4 text-sm font-mono">
                      <div className="bg-gray-800 p-4 rounded-xl">
                        <span className="text-gray-500">{`// Basic button`}</span>
                        <pre className="text-green-400 mt-1">{`<Button variant="primary">Click me</Button>`}</pre>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-xl">
                        <span className="text-gray-500">{`// With icon`}</span>
                        <pre className="text-green-400 mt-1">{`<Button variant="primary" icon={<ArrowRight />} iconPosition="right">
  Continue
</Button>`}</pre>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-xl">
                        <span className="text-gray-500">{`// Loading state`}</span>
                        <pre className="text-green-400 mt-1">{`<Button variant="primary" loading>
  Processing...
</Button>`}</pre>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-xl">
                        <span className="text-gray-500">{`// Icon only with accessibility`}</span>
                        <pre className="text-green-400 mt-1">{`<Button
  variant="icon-only"
  icon={<Settings />}
  aria-label="Settings"
/>`}</pre>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-xl">
                        <span className="text-gray-500">{`// With badge`}</span>
                        <pre className="text-green-400 mt-1">{`<Button variant="primary" badge="3">
  Notifications
</Button>`}</pre>
                      </div>
                    </div>
                  </div>
                </motion.section>
              ) : activeSection === 'forms' ? (
                <motion.section
                  className="space-y-10"
                  id="forms"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <motion.div
                    className="section-header-gradient"
                    variants={slideInLeft}
                  >
                    <h2 className="text-3xl font-black tracking-tight">Forms - Input, Select, Checkbox, Radio, Switch</h2>
                    <p className="text-gray-500 mt-1">Tất cả các component form với các trạng thái và kích thước khác nhau.</p>
                  </motion.div>

                  {/* Input States */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Input Component - All States</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Default */}
                      <Input
                        label="Tên đăng nhập (Default)"
                        placeholder="Nhập tên đăng nhập..."
                        helperText="Văn bản hỗ trợ cho người dùng."
                      />

                      {/* With Icon */}
                      <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        icon={<Mail className="w-5 h-5" />}
                      />

                      {/* Error State */}
                      <Input
                        label="Mật khẩu (Error State)"
                        type="password"
                        defaultValue="123"
                        error="Mật khẩu phải có ít nhất 8 ký tự"
                      />

                      {/* Disabled */}
                      <Input
                        label="Mã giới thiệu (Disabled)"
                        placeholder="Không khả dụng"
                        disabled
                      />

                      {/* Search Variant */}
                      <div className="md:col-span-2">
                        <Input
                          label="Tìm kiếm (Search Variant)"
                          variant="search"
                          placeholder="Tìm kiếm khóa học, từ vựng..."
                        />
                      </div>

                      {/* ReadOnly */}
                      <Input
                        label="ID Người dùng (ReadOnly)"
                        defaultValue="USER-2024-001"
                        readOnly
                        helperText="Trường này không thể chỉnh sửa"
                      />

                      {/* Required */}
                      <Input
                        label="Họ và tên"
                        placeholder="Nhập họ và tên..."
                        required
                        icon={<User className="w-5 h-5" />}
                      />
                    </div>
                  </motion.div>

                  {/* Input Sizes */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Input Sizes</h3>
                    <div className="space-y-6">
                      <Input
                        label="Small Input"
                        size="sm"
                        placeholder="Small size input..."
                        icon={<Search className="w-4 h-4" />}
                      />
                      <Input
                        label="Medium Input (Default)"
                        size="md"
                        placeholder="Medium size input..."
                        icon={<Search className="w-5 h-5" />}
                      />
                      <Input
                        label="Large Input"
                        size="lg"
                        placeholder="Large size input..."
                        icon={<Search className="w-6 h-6" />}
                      />
                    </div>
                  </motion.div>

                  {/* Select Sizes */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Select Sizes</h3>
                    <div className="space-y-6">
                      <Select
                        label="Small Select"
                        size="sm"
                        placeholder="Small size select..."
                        icon={<BookOpen className="w-4 h-4" />}
                        options={[
                          { value: 'hsk1', label: 'HSK Level 1' },
                          { value: 'hsk2', label: 'HSK Level 2' },
                          { value: 'hsk3', label: 'HSK Level 3' },
                        ]}
                      />
                      <Select
                        label="Medium Select (Default)"
                        size="md"
                        placeholder="Medium size select..."
                        icon={<BookOpen className="w-5 h-5" />}
                        options={[
                          { value: 'hsk1', label: 'HSK Level 1' },
                          { value: 'hsk2', label: 'HSK Level 2' },
                          { value: 'hsk3', label: 'HSK Level 3' },
                        ]}
                      />
                      <Select
                        label="Large Select"
                        size="lg"
                        placeholder="Large size select..."
                        icon={<BookOpen className="w-6 h-6" />}
                        options={[
                          { value: 'hsk1', label: 'HSK Level 1' },
                          { value: 'hsk2', label: 'HSK Level 2' },
                          { value: 'hsk3', label: 'HSK Level 3' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Select Component */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Select Component - All States</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Default */}
                      <Select
                        label="Chọn cấp độ HSK"
                        options={[
                          { value: '', label: 'Chọn cấp độ...' },
                          { value: 'hsk1', label: 'HSK Level 1' },
                          { value: 'hsk2', label: 'HSK Level 2' },
                          { value: 'hsk3', label: 'HSK Level 3' },
                          { value: 'hsk4', label: 'HSK Level 4' },
                          { value: 'hsk5', label: 'HSK Level 5' },
                          { value: 'hsk6', label: 'HSK Level 6' },
                        ]}
                        helperText="Chọn cấp độ phù hợp với trình độ của bạn"
                      />

                      {/* With Icon */}
                      <Select
                        label="Khóa học"
                        icon={<BookOpen className="w-5 h-5" />}
                        options={[
                          { value: '', label: 'Tất cả khóa học' },
                          { value: 'beginner', label: 'Sơ cấp' },
                          { value: 'intermediate', label: 'Trung cấp' },
                          { value: 'advanced', label: 'Cao cấp' },
                        ]}
                      />

                      {/* Error State */}
                      <Select
                        label="Phương thức thanh toán"
                        error="Vui lòng chọn phương thức thanh toán"
                        options={[
                          { value: '', label: 'Chọn phương thức...' },
                          { value: 'card', label: 'Thẻ tín dụng' },
                          { value: 'bank', label: 'Chuyển khoản' },
                        ]}
                      />

                      {/* Disabled */}
                      <Select
                        label="Quốc gia (Disabled)"
                        disabled
                        options={[
                          { value: 'vn', label: 'Việt Nam' },
                          { value: 'cn', label: 'Trung Quốc' },
                        ]}
                      />

                      {/* Required */}
                      <div className="md:col-span-2">
                        <Select
                          label="Lớp học"
                          required
                          size="lg"
                          options={[
                            { value: '', label: 'Chọn lớp học...' },
                            { value: 'morning', label: 'Lớp buổi sáng (8:00 - 10:00)' },
                            { value: 'afternoon', label: 'Lớp buổi chiều (14:00 - 16:00)' },
                            { value: 'evening', label: 'Lớp buổi tối (18:00 - 20:00)' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Input with Tags Demo */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Input with Tags (Custom Implementation)</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Tìm kiếm với tags</label>
                      <div className="flex flex-wrap items-center gap-2 p-3 border-2 border-primary-500 rounded-2xl bg-white">
                        <Search className="w-5 h-5 text-gray-400 ml-1" />
                        <span className="bg-primary-500 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold">
                          HSK 5
                          <button className="hover:bg-white/20 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                        <span className="bg-primary-500 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold">
                          Từ vựng
                          <button className="hover:bg-white/20 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                        <input
                          type="text"
                          placeholder="Tìm kiếm tiếp..."
                          className="flex-1 min-w-30 border-none focus:ring-0 text-sm py-1 outline-none"
                        />
                        <button className="text-xs font-bold text-error-500 px-3 py-1.5 hover:bg-error-50 rounded-xl transition-colors">
                          Xóa hết
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Component */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Checkbox Component - All States</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default */}
                        <Checkbox
                          label="Checkbox - Default"
                          description="Trạng thái mặc định chưa chọn"
                        />

                        {/* Checked */}
                        <Checkbox
                          label="Checkbox - Checked"
                          description="Trạng thái đã được chọn"
                          defaultChecked
                        />

                        {/* Error */}
                        <Checkbox
                          label="Checkbox - Error State"
                          description="Trạng thái lỗi"
                          error="Bạn phải đồng ý với điều khoản"
                        />

                        {/* Disabled */}
                        <Checkbox
                          label="Checkbox - Disabled"
                          description="Không thể tương tác"
                          disabled
                        />

                        {/* Disabled Checked */}
                        <Checkbox
                          label="Checkbox - Disabled Checked"
                          description="Đã chọn và không thể bỏ chọn"
                          disabled
                          defaultChecked
                        />
                      </div>

                      {/* Sizes */}
                      <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-4">Checkbox Sizes</p>
                        <div className="flex flex-wrap items-center gap-6">
                          <Checkbox size="sm" label="Small" />
                          <Checkbox size="md" label="Medium (Default)" />
                          <Checkbox size="lg" label="Large" />
                        </div>
                      </div>

                      {/* Multiple Selection Example */}
                      <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-4">Multiple Selection Example</p>
                        <div className="space-y-3">
                          <Checkbox
                            label="HSK 1 - Cơ bản"
                            description="150 từ vựng cơ bản"
                            defaultChecked
                          />
                          <Checkbox
                            label="HSK 2 - Sơ cấp"
                            description="300 từ vựng sơ cấp"
                            defaultChecked
                          />
                          <Checkbox
                            label="HSK 3 - Trung cấp"
                            description="600 từ vựng trung cấp"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Radio Component */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Radio Component - All States</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Radio
                          name="course-level"
                          label="Lựa chọn A - Khóa học cơ bản"
                          description="Phù hợp cho người mới bắt đầu"
                          defaultChecked
                        />
                        <Radio
                          name="course-level"
                          label="Lựa chọn B - Khóa học nâng cao"
                          description="Dành cho người có kinh nghiệm"
                        />
                        <Radio
                          name="course-level"
                          label="Lựa chọn C - Khóa học chuyên sâu"
                          description="Trình độ chuyên nghiệp"
                        />
                      </div>

                      {/* Disabled */}
                      <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-4">Disabled State</p>
                        <div className="space-y-3">
                          <Radio
                            name="disabled-radio"
                            label="Radio - Disabled"
                            description="Không thể chọn"
                            disabled
                          />
                          <Radio
                            name="disabled-radio"
                            label="Radio - Disabled Checked"
                            description="Đã chọn và không thể thay đổi"
                            disabled
                            defaultChecked
                          />
                        </div>
                      </div>

                      {/* Sizes */}
                      <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-4">Radio Sizes</p>
                        <div className="flex flex-wrap items-center gap-6">
                          <Radio name="size-demo" size="sm" label="Small" />
                          <Radio name="size-demo" size="md" label="Medium" defaultChecked />
                          <Radio name="size-demo" size="lg" label="Large" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Switch Component */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Switch Component - All States</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Checked */}
                        <Switch
                          label="Thông báo"
                          helperText="Nhận thông báo mới"
                          defaultChecked
                        />

                        {/* Default Unchecked */}
                        <Switch
                          label="Dark Mode"
                          helperText="Chế độ tối"
                        />

                        {/* Error State */}
                        <Switch
                          label="Xác thực 2 bước"
                          error="Bạn phải bật tính năng này"
                          required
                        />

                        {/* Disabled */}
                        <Switch
                          label="Beta Features"
                          helperText="Chưa khả dụng"
                          disabled
                        />

                        {/* Disabled Checked */}
                        <Switch
                          label="Auto Save"
                          helperText="Luôn được bật"
                          disabled
                          defaultChecked
                        />

                        {/* Required */}
                        <Switch
                          label="Điều khoản sử dụng"
                          helperText="Bắt buộc phải đồng ý"
                          required
                          defaultChecked
                        />
                      </div>

                      {/* Sizes */}
                      <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-4">Switch Sizes</p>
                        <div className="flex flex-wrap items-center gap-6">
                          <Switch size="sm" label="Small" defaultChecked />
                          <Switch size="md" label="Medium (Default)" defaultChecked />
                          <Switch size="lg" label="Large" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )  : activeSection === 'pagination' ? (
                <motion.section
                  className="space-y-10"
                  id="pagination"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <motion.div
                    className="section-header-gradient"
                    variants={slideInLeft}
                  >
                    <h2 className="text-3xl font-black tracking-tight">Pagination Component</h2>
                    <p className="text-gray-500 mt-1">Điều hướng phân trang với nhiều kích thước và hình dạng.</p>
                  </motion.div>

                  {/* Default Pagination */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Default Pagination</h3>
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={3}
                        totalPages={10}
                        onPageChange={(page) => console.log('Page:', page)}
                      />
                    </div>
                  </div>

                  {/* With Info */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">With Results Info</h3>
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={2}
                        totalPages={15}
                        totalItems={150}
                        currentItemsCount={10}
                        showInfo
                        onPageChange={(page) => console.log('Page:', page)}
                      />
                    </div>
                  </div>

                  {/* Size Variants */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Size Variants</h3>
                    <div className="space-y-8">
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-4">Small</p>
                        <div className="flex justify-center">
                          <Pagination
                            currentPage={2}
                            totalPages={5}
                            size="sm"
                            onPageChange={(page) => console.log('Page:', page)}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-4">Medium (Default)</p>
                        <div className="flex justify-center">
                          <Pagination
                            currentPage={3}
                            totalPages={7}
                            size="md"
                            onPageChange={(page) => console.log('Page:', page)}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-4">Large</p>
                        <div className="flex justify-center">
                          <Pagination
                            currentPage={4}
                            totalPages={6}
                            size="lg"
                            onPageChange={(page) => console.log('Page:', page)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shape Variants */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Shape Variants</h3>
                    <div className="space-y-8">
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-4">Rounded (Default)</p>
                        <div className="flex justify-center">
                          <Pagination
                            currentPage={2}
                            totalPages={5}
                            shape="rounded"
                            onPageChange={(page) => console.log('Page:', page)}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-4">Pill (Circular)</p>
                        <div className="flex justify-center">
                          <Pagination
                            currentPage={3}
                            totalPages={5}
                            shape="pill"
                            onPageChange={(page) => console.log('Page:', page)}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-4">Square</p>
                        <div className="flex justify-center">
                          <Pagination
                            currentPage={4}
                            totalPages={5}
                            shape="square"
                            onPageChange={(page) => console.log('Page:', page)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Many Pages with Ellipsis */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Many Pages (Auto Ellipsis)</h3>
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <Pagination
                          currentPage={8}
                          totalPages={20}
                          totalItems={200}
                          showInfo
                          onPageChange={(page) => console.log('Page:', page)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Pagination
                          currentPage={15}
                          totalPages={20}
                          shape="pill"
                          size="lg"
                          onPageChange={(page) => console.log('Page:', page)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Combined Example */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Combined: Large + Pill + Info</h3>
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={5}
                        totalPages={12}
                        totalItems={120}
                        currentItemsCount={10}
                        size="lg"
                        shape="pill"
                        showInfo
                        onPageChange={(page) => console.log('Page:', page)}
                      />
                    </div>
                  </div>
                </motion.section>
              ) : activeSection === 'tooltip' ? (
                <motion.section
                  className="space-y-10"
                  id="tooltip"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <motion.div
                    className="section-header-gradient"
                    variants={slideInLeft}
                  >
                    <h2 className="text-3xl font-black tracking-tight">Tooltip Component</h2>
                    <p className="text-gray-500 mt-1">Hiển thị thông tin bổ sung khi hover, hỗ trợ title màu vàng và nội dung tùy chỉnh.</p>
                  </motion.div>

                  {/* Basic Tooltip */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Basic Tooltip</h3>
                    <div className="flex flex-wrap items-center gap-8 justify-center py-8">
                      <Tooltip content="Đây là tooltip đơn giản">
                        <button className="px-4 py-2 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                          Hover me (Basic)
                        </button>
                      </Tooltip>

                      <Tooltip
                        title="Thông tin quan trọng"
                        content="Tooltip với tiêu đề màu vàng giúp làm nổi bật thông tin."
                      >
                        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
                          Hover me (With Title)
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Tooltip Placements */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Placements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
                      <div className="flex justify-center">
                        <Tooltip content="Tooltip ở trên" placement="top">
                          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                            Top
                          </button>
                        </Tooltip>
                      </div>
                      <div className="flex justify-center">
                        <Tooltip content="Tooltip ở dưới" placement="bottom">
                          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                            Bottom
                          </button>
                        </Tooltip>
                      </div>
                      <div className="flex justify-center">
                        <Tooltip content="Tooltip bên trái" placement="left">
                          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                            Left
                          </button>
                        </Tooltip>
                      </div>
                      <div className="flex justify-center">
                        <Tooltip content="Tooltip bên phải" placement="right">
                          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                            Right
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Real Use Cases */}
                  <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Real Use Cases</h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Lộ trình học:</span>
                        <Tooltip
                          title="Lộ trình HSK 3"
                          content="Bao gồm 600 từ vựng và các cấu trúc ngữ pháp trung cấp. Phù hợp cho người học đã hoàn thành HSK 2."
                        >
                          <span className="text-primary-600 border-b border-dashed border-primary-600 cursor-help font-medium">
                            HSK Level 3
                          </span>
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Giáo viên:</span>
                        <Tooltip
                          title="Thầy Wang"
                          content="10 năm kinh nghiệm giảng dạy tiếng Trung. Chuyên về HSK và giao tiếp thực tế."
                        >
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                              W
                            </div>
                            <span className="text-gray-900 font-medium">Thầy Wang</span>
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </motion.section>
              ) : activeSection === 'loading' ? (
                <motion.section
                  className="space-y-10"
                  id="loading"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <motion.div
                    className="section-header-gradient"
                    variants={slideInLeft}
                  >
                    <h2 className="text-3xl font-black tracking-tight">Loading Spinner</h2>
                    <p className="text-gray-500 mt-1">Spinner animation cho trạng thái loading, có thể tùy chỉnh size và màu sắc.</p>
                  </motion.div>

                  {/* Basic Spinner */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Basic Spinner</h3>
                    <div className="flex items-center justify-center gap-8 py-8">
                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="md" />
                        <span className="text-xs text-gray-500 font-medium">Default</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="lg" color="#EC131E" />
                        <span className="text-xs text-gray-500 font-medium">Primary</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-primary-500 p-4 rounded-xl">
                          <LoadingSpinner size="md" color="white" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">On Background</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Size Variants */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Size Variants</h3>
                    <div className="flex items-center justify-center gap-8 py-8">
                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="xs" />
                        <span className="text-xs text-gray-500 font-medium">Extra Small</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="sm" />
                        <span className="text-xs text-gray-500 font-medium">Small</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="md" />
                        <span className="text-xs text-gray-500 font-medium">Medium</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="lg" />
                        <span className="text-xs text-gray-500 font-medium">Large</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="xl" />
                        <span className="text-xs text-gray-500 font-medium">Extra Large</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Speed Variants */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Speed Variants</h3>
                    <div className="flex items-center justify-center gap-8 py-8">
                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="lg" speed={1.5} />
                        <span className="text-xs text-gray-500 font-medium">Slow (1.5s)</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="lg" speed={0.8} />
                        <span className="text-xs text-gray-500 font-medium">Normal (0.8s)</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size="lg" speed={0.4} />
                        <span className="text-xs text-gray-500 font-medium">Fast (0.4s)</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* In Button Context */}
                  <motion.div
                    className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100"
                    variants={scaleIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">In Button Context</h3>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary" loading>Loading...</Button>
                      <Button variant="secondary" loading>Processing</Button>
                      <Button variant="outline" loading size="lg">Submit</Button>
                    </div>
                  </motion.div>
                </motion.section>
              ) : (
                <motion.section
                  className="space-y-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <motion.div
                    className="section-header-gradient"
                    variants={slideInLeft}
                  >
                    <h2 className="text-3xl font-black tracking-tight">
                      {navigationItems.components.find(item => item.id === activeSection)?.label}
                    </h2>
                    <p className="text-gray-500 mt-1">Coming soon...</p>
                  </motion.div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-2xl font-black text-yellow-900 mb-2">TODO</h3>
                    <p className="text-yellow-700">
                      Component documentation will be added here
                    </p>
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
