import { Info, MapPin, Phone, Mail } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="rounded-2xl bg-surface-light dark:bg-surface-dark p-8 shadow-sm border border-border-light dark:border-border-dark">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Info className="w-6 h-6 text-red-600" />
        Thông tin liên hệ
      </h3>
      <ul className="space-y-6">
        <li className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              Địa chỉ văn phòng
            </p>
            <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Số 4 Xóm Cầu Lão, Xã Ô Diên
              <br />
              Huyện Đan Phượng, Thành Phố Hà Nội
              <br />
              Việt Nam
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              Hotline tư vấn
            </p>
            <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              <a
                href="tel:0965322136"
                className="hover:text-primary transition-colors"
              >
                0965 322 136
              </a>{" "}
              (8:00 - 21:00)
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              <a
                href="tel:0965322136"
                className="hover:text-primary transition-colors"
              >
                0965 322 136
              </a>{" "}
              (Zalo/WeChat)
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              Email hỗ trợ
            </p>
            <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark break-all">
              <a
                href="mailto:tranhongngoc19122001@gmail.com"
                className="hover:text-primary transition-colors"
              >
                tranhongngoc19122001@gmail.com
              </a>
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
