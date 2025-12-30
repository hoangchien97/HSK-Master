export default function Footer() {
  return (
    <footer className="mt-auto border-t border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="text-center text-sm text-gray-600 font-vietnamese">
          <p className="mb-2">
            © {new Date().getFullYear()} Trung tâm tiếng Trung ABC · Hà Nội
          </p>
          <p className="text-xs text-gray-500">
            Chuyên đào tạo tiếng Trung HSK 1-6 | 📞 0909 000 999
          </p>
        </div>
      </div>
    </footer>
  );
}
