import type { Metadata } from 'next';
import { BRAND_NAME, SITE_URL } from '@/constants/brand';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Chính sách Bảo mật – ${BRAND_NAME}`,
  description: `Chính sách bảo mật của ${BRAND_NAME}. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '27 tháng 2, 2026';

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Chính sách Bảo mật
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Cập nhật lần cuối: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chào mừng bạn đến với <strong>{BRAND_NAME}</strong> (
              <Link href={SITE_URL} className="text-red-600 hover:underline">{SITE_URL}</Link>
              ). Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách
              bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu
              của bạn khi sử dụng nền tảng học tiếng Trung trực tuyến của chúng tôi.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Thông tin chúng tôi thu thập
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Chúng tôi có thể thu thập các loại thông tin sau:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, ảnh đại diện khi bạn
                đăng ký hoặc đăng nhập bằng Google.
              </li>
              <li>
                <strong>Thông tin hồ sơ:</strong> Số điện thoại, địa chỉ, ngày sinh và tiểu sử
                (nếu bạn cung cấp).
              </li>
              <li>
                <strong>Dữ liệu học tập:</strong> Tiến độ bài học, kết quả luyện tập, bài tập đã
                nộp và điểm số.
              </li>
              <li>
                <strong>Dữ liệu lịch:</strong> Khi bạn kết nối Google Calendar, chúng tôi chỉ tạo
                và quản lý sự kiện lịch học — không đọc hoặc truy cập các sự kiện khác trên lịch
                của bạn.
              </li>
              <li>
                <strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị và
                cookie phục vụ trải nghiệm người dùng.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Mục đích sử dụng thông tin
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Chúng tôi sử dụng thông tin của bạn để:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Cung cấp và duy trì dịch vụ giáo dục trực tuyến.</li>
              <li>Xác thực danh tính và quản lý tài khoản người dùng.</li>
              <li>Theo dõi tiến độ học tập và đề xuất nội dung phù hợp.</li>
              <li>
                Đồng bộ lịch học với Google Calendar (chỉ khi bạn chủ động kết nối và cấp quyền).
              </li>
              <li>Gửi thông báo về lịch học, bài tập và cập nhật quan trọng.</li>
              <li>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng.</li>
              <li>Tuân thủ các nghĩa vụ pháp lý.</li>
            </ul>
          </div>

          {/* Section 3 — Google API */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Sử dụng dữ liệu từ Google API
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Ứng dụng của chúng tôi sử dụng Google API cho hai mục đích:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Xác thực (Google Sign-In):</strong> Chúng tôi sử dụng phạm vi{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
                  openid email profile
                </code>{' '}
                để xác thực danh tính và tạo tài khoản.
              </li>
              <li>
                <strong>Google Calendar (tùy chọn):</strong> Khi bạn chủ động nhấn &ldquo;Kết nối
                Google Calendar&rdquo;, chúng tôi yêu cầu phạm vi{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
                  https://www.googleapis.com/auth/calendar.events
                </code>{' '}
                để tạo, cập nhật và xóa sự kiện lịch học trên Google Calendar của bạn. Chúng tôi{' '}
                <strong>không</strong> đọc, sửa đổi hoặc xóa bất kỳ sự kiện nào khác.
              </li>
            </ul>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tuân thủ Google API Services User Data Policy:</strong> Việc sử dụng và
                chuyển giao thông tin nhận được từ Google API đến bất kỳ ứng dụng nào khác sẽ tuân
                thủ{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Google API Services User Data Policy
                </a>
                , bao gồm các yêu cầu về Sử dụng Hạn chế (Limited Use requirements).
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Lưu trữ và bảo mật dữ liệu
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Dữ liệu được lưu trữ trên máy chủ bảo mật thông qua <strong>Supabase</strong> (PostgreSQL) với mã
                hóa trong quá trình truyền tải (TLS) và khi lưu trữ.
              </li>
              <li>
                Token xác thực Google Calendar được mã hóa bằng AES-256-GCM trước khi lưu vào cơ
                sở dữ liệu và <strong>không bao giờ</strong> được gửi đến phía trình duyệt
                (client-side).
              </li>
              <li>
                Chúng tôi sử dụng HTTPS cho mọi kết nối và JWT cho quản lý phiên đăng nhập.
              </li>
              <li>
                Chỉ những nhân viên được ủy quyền mới có quyền truy cập dữ liệu cá nhân, và chỉ
                khi cần thiết cho việc vận hành dịch vụ.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Chia sẻ thông tin
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Chúng tôi <strong>không</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn
              với bên thứ ba vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường
              hợp sau:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Nhà cung cấp dịch vụ:</strong> Google (xác thực, lịch), Supabase (cơ sở
                dữ liệu), Vercel (hosting) — chỉ trong phạm vi cần thiết để vận hành dịch vụ.
              </li>
              <li>
                <strong>Giáo viên:</strong> Giáo viên của bạn có thể xem thông tin học tập (tiến
                độ, điểm số, bài nộp) phục vụ mục đích giảng dạy.
              </li>
              <li>
                <strong>Yêu cầu pháp lý:</strong> Khi có yêu cầu từ cơ quan có thẩm quyền theo
                quy định pháp luật Việt Nam.
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Quyền của bạn
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">Bạn có quyền:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Truy cập và xem thông tin cá nhân đã cung cấp.</li>
              <li>Cập nhật hoặc chỉnh sửa thông tin hồ sơ bất kỳ lúc nào.</li>
              <li>
                Ngắt kết nối Google Calendar và xóa token liên kết tại trang Cài đặt.
              </li>
              <li>
                Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bằng cách liên hệ với chúng
                tôi.
              </li>
              <li>
                Thu hồi quyền truy cập ứng dụng từ{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline"
                >
                  Google Account Settings
                </a>
                .
              </li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Cookie
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Chúng tôi sử dụng cookie cần thiết để duy trì phiên đăng nhập và cải thiện trải
              nghiệm người dùng. Chúng tôi không sử dụng cookie quảng cáo hoặc theo dõi của bên
              thứ ba.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8. Thay đổi chính sách
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ
              được thông báo trên trang này với ngày cập nhật mới. Việc tiếp tục sử dụng dịch vụ
              sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận chính sách mới.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              9. Liên hệ
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Trung tâm tiếng Trung {BRAND_NAME}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                📧 Email:{' '}
                <a
                  href="mailto:tranhongngoc19122001@gmail.com"
                  className="text-red-600 hover:underline"
                >
                  tranhongngoc19122001@gmail.com
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                📞 Điện thoại:{' '}
                <a href="tel:0965322136" className="text-red-600 hover:underline">
                  0965 322 136
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                📍 Địa chỉ: Hà Nội, Việt Nam
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}
