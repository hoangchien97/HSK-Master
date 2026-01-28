import { Info, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactInfo() {
  const contactItems = [
    {
      icon: MapPin,
      title: "Địa chỉ văn phòng",
      content: (
        <>
          Số 4 Xóm Cầu Lão, Xã Ô Diên
          <br />
          Huyện Đan Phượng, Thành Phố Hà Nội
          <br />
          Việt Nam
        </>
      ),
    },
    {
      icon: Phone,
      title: "Hotline tư vấn",
      content: (
        <>
          <a href="tel:0965322136" className="hover:text-primary transition-colors font-semibold">
            0965 322 136
          </a>{" "}
          <span className="text-xs">(Zalo/WeChat)</span>
        </>
      ),
    },
    {
      icon: Mail,
      title: "Email hỗ trợ",
      content: (
        <a
          href="mailto:tranhongngoc19122001@gmail.com"
          className="hover:text-primary transition-colors break-all"
        >
          tranhongngoc19122001@gmail.com
        </a>
      ),
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      content: (
        <>
          Thứ 2 - Chủ nhật: 8:00 - 21:00
          <br />
          <span className="text-xs">(Cả ngày lễ và Tết)</span>
        </>
      ),
    },
  ];

  return (
    <div className="rounded-2xl bg-surface-light dark:bg-surface-dark p-6 md:p-8 shadow-sm border border-border-light dark:border-border-dark">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Info className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
        Thông tin liên hệ
      </h3>
      <ul className="space-y-5 md:space-y-6">
        {contactItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <li key={index} className="flex items-start gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-1">
                  {item.title}
                </p>
                <p className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {item.content}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
