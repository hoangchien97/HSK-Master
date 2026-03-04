import type { Metadata } from 'next';
import { BRAND_NAME, SITE_URL } from '@/constants/brand';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Điều khoản Sử dụng – ${BRAND_NAME}`,
  description: `Điều khoản sử dụng dịch vụ của ${BRAND_NAME}. Vui lòng đọc kỹ trước khi sử dụng nền tảng học tiếng Trung trực tuyến.`,
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsOfServicePage() {
  const lastUpdated = '27 tháng 2, 2026';

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Điều khoản Sử dụng
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
              ). Bằng việc truy cập và sử dụng nền tảng, bạn đồng ý tuân thủ các điều khoản và
              điều kiện dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng
              sử dụng dịch vụ.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Giới thiệu dịch vụ
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {BRAND_NAME} là nền tảng giáo dục trực tuyến chuyên đào tạo tiếng Trung Quốc, bao
              gồm các khóa học luyện thi HSK (cấp độ 1–6), giao tiếp và tiếng Trung thương mại.
              Dịch vụ bao gồm nhưng không giới hạn: hệ thống quản lý học tập (LMS), luyện từ
              vựng, bài tập, lịch học và tích hợp Google Calendar.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Tài khoản người dùng
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Bạn có thể tạo tài khoản bằng email/mật khẩu hoặc đăng nhập nhanh qua Google.
              </li>
              <li>
                Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động dưới tài khoản
                của mình.
              </li>
              <li>
                Thông tin đăng ký phải chính xác, đầy đủ và được cập nhật khi có thay đổi.
              </li>
              <li>
                Chúng tôi có quyền tạm khóa hoặc vô hiệu hóa tài khoản nếu phát hiện vi phạm
                điều khoản.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Vai trò người dùng
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Nền tảng hỗ trợ ba vai trò chính:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Học viên (Student):</strong> Tham gia lớp học, làm bài tập, luyện từ vựng,
                theo dõi tiến độ.
              </li>
              <li>
                <strong>Giáo viên (Teacher):</strong> Tạo lịch dạy, quản lý lớp, giao bài tập,
                chấm điểm và điểm danh.
              </li>
              <li>
                <strong>Quản trị viên (Admin):</strong> Quản lý toàn bộ hệ thống, người dùng và
                nội dung.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Tích hợp Google Calendar
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {BRAND_NAME} cung cấp tính năng đồng bộ lịch học với Google Calendar:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Tính năng này là <strong>tùy chọn</strong> — bạn có thể sử dụng đầy đủ nền tảng mà
                không cần kết nối Google Calendar.
              </li>
              <li>
                Khi kết nối, chúng tôi chỉ sử dụng quyền{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
                  calendar.events
                </code>{' '}
                để tạo, cập nhật và xóa sự kiện lịch học — không truy cập các sự kiện khác.
              </li>
              <li>
                {BRAND_NAME} là nguồn dữ liệu chính (source of truth). Mọi thay đổi lịch phải
                được thực hiện trên nền tảng, không phải trên Google Calendar.
              </li>
              <li>
                Bạn có thể ngắt kết nối Google Calendar bất kỳ lúc nào trong phần Cài đặt. Khi
                ngắt kết nối, token sẽ bị xóa và các sự kiện đã tạo trên Google Calendar vẫn giữ
                nguyên.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Quyền sở hữu trí tuệ
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Toàn bộ nội dung trên nền tảng (bài giảng, từ vựng, bài tập, hình ảnh, thiết kế)
                thuộc quyền sở hữu trí tuệ của {BRAND_NAME} hoặc các đối tác được ủy quyền.
              </li>
              <li>
                Bạn không được sao chép, phân phối, chỉnh sửa hoặc sử dụng nội dung cho mục đích
                thương mại mà không có sự đồng ý bằng văn bản.
              </li>
              <li>
                Nội dung bạn tạo (bài nộp, bình luận) vẫn thuộc quyền sở hữu của bạn, nhưng bạn
                cấp cho chúng tôi quyền sử dụng trong phạm vi vận hành dịch vụ.
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Quy tắc sử dụng
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Khi sử dụng dịch vụ, bạn cam kết:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Không sử dụng nền tảng cho mục đích bất hợp pháp hoặc gian lận.</li>
              <li>Không chia sẻ tài khoản hoặc mật khẩu cho người khác.</li>
              <li>
                Không cố gắng truy cập trái phép vào hệ thống, dữ liệu của người dùng khác hoặc
                cơ sở hạ tầng.
              </li>
              <li>Không tải lên nội dung vi phạm pháp luật, xúc phạm hoặc không phù hợp.</li>
              <li>
                Không sử dụng bot, script hoặc công cụ tự động để thu thập dữ liệu (scraping).
              </li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Giới hạn trách nhiệm
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Dịch vụ được cung cấp &ldquo;nguyên trạng&rdquo; (as-is). Chúng tôi không đảm bảo
                dịch vụ sẽ hoạt động liên tục, không bị gián đoạn hoặc không có lỗi.
              </li>
              <li>
                Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc
                hậu quả nào phát sinh từ việc sử dụng dịch vụ.
              </li>
              <li>
                Kết quả học tập phụ thuộc vào nỗ lực cá nhân — chúng tôi cung cấp công cụ và hỗ
                trợ nhưng không cam kết kết quả thi cụ thể.
              </li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8. Chấm dứt dịch vụ
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Bạn có thể ngừng sử dụng dịch vụ bất kỳ lúc nào.</li>
              <li>
                Chúng tôi có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản mà không cần
                thông báo trước.
              </li>
              <li>
                Sau khi tài khoản bị xóa, dữ liệu cá nhân sẽ được xóa theo chính sách bảo mật,
                trừ khi pháp luật yêu cầu lưu trữ.
              </li>
            </ul>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              9. Thay đổi điều khoản
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Chúng tôi có quyền cập nhật điều khoản này vào bất kỳ thời điểm nào. Những thay đổi
              quan trọng sẽ được thông báo qua email hoặc trên nền tảng. Việc tiếp tục sử dụng
              dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận điều
              khoản mới.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              10. Luật áp dụng
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Điều khoản này được điều chỉnh và giải thích theo pháp luật của nước Cộng hòa Xã
              hội Chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại tòa án có
              thẩm quyền tại Hà Nội, Việt Nam.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              11. Liên hệ
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng, vui lòng liên hệ:
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

        {/* Back + Privacy link */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium hover:underline"
          >
            ← Quay về trang chủ
          </Link>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/privacy"
            className="text-gray-500 hover:text-red-600 hover:underline"
          >
            Chính sách Bảo mật
          </Link>
        </div>
      </div>
    </section>
  );
}
