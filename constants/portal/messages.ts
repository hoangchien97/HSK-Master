/**
 * Portal Toast / UI Messages
 * Centralised Vietnamese UI strings for toast notifications and messages.
 */

/* ───────── Generic ───────── */
export const MSG = {
  ERROR_GENERIC: "Có lỗi xảy ra, vui lòng thử lại",
  ERROR_LOAD: "Không thể tải dữ liệu",
  ERROR_NETWORK: "Lỗi kết nối mạng",
  SUCCESS_SAVE: "Lưu thành công!",
  SUCCESS_DELETE: "Xóa thành công!",
  SUCCESS_UPDATE: "Cập nhật thành công!",
  CONFIRM_DELETE: "Bạn có chắc chắn muốn xoá?",
  NO_DATA: "Không có dữ liệu",
} as const

/* ───────── Auth ───────── */
export const MSG_AUTH = {
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  LOGIN_FAILED: "Email hoặc mật khẩu không đúng",
  REGISTER_SUCCESS: "Đăng ký thành công!",
  REGISTER_FAILED: "Đăng ký thất bại, vui lòng thử lại",
  LOGOUT: "Đăng xuất",
  SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn",
} as const

/* ───────── Assignment ───────── */
export const MSG_ASSIGNMENT = {
  CREATED_DRAFT: "Tạo bài tập nháp thành công!",
  CREATED_PUBLISHED: "Tạo và công bố bài tập thành công!",
  UPDATED: "Cập nhật bài tập thành công!",
  DELETED: "Xoá bài tập thành công!",
  TITLE_REQUIRED: "Vui lòng nhập tiêu đề",
  CLASS_REQUIRED: "Vui lòng chọn lớp học",
} as const

/* ───────── Submission ───────── */
export const MSG_SUBMISSION = {
  SUBMITTED: "Nộp bài thành công!",
  GRADED: "Chấm điểm thành công!",
  RETURNED: "Trả bài thành công!",
  ERROR_SUBMIT: "Không thể nộp bài",
} as const

/* ───────── Class ───────── */
export const MSG_CLASS = {
  CREATED: "Tạo lớp học thành công!",
  UPDATED: "Cập nhật lớp học thành công!",
  DELETED: "Xoá lớp học thành công!",
  STUDENT_ADDED: "Thêm học viên thành công!",
  STUDENT_REMOVED: "Xoá học viên khỏi lớp thành công!",
  ERROR_LOAD: "Không thể tải danh sách lớp",
} as const

/* ───────── Schedule ───────── */
export const MSG_SCHEDULE = {
  CREATED: "Tạo lịch học thành công!",
  UPDATED: "Cập nhật lịch học thành công!",
  DELETED: "Xoá lịch học thành công!",
  ERROR_LOAD: "Không thể tải lịch học",
  ERROR_LOAD_DATA: "Không thể tải dữ liệu",
} as const

/* ───────── Attendance ───────── */
export const MSG_ATTENDANCE = {
  SAVED: "Lưu điểm danh thành công!",
  ERROR_LOAD: "Không thể tải dữ liệu điểm danh",
  ERROR_SAVE: "Lưu điểm danh thất bại",
  ERROR_LOAD_STUDENTS: "Không thể tải danh sách học viên",
} as const

/* ───────── Calendar ───────── */
export const MSG_CALENDAR = {
  CONNECTED: "Kết nối Google Calendar thành công!",
  DISCONNECTED: "Đã ngắt kết nối Google Calendar",
  SYNCED: "Đồng bộ lịch thành công!",
  ERROR_CONNECT: "Không thể kết nối Google Calendar",
  ERROR_SYNC: "Đồng bộ lịch thất bại",
} as const

/* ───────── Profile ───────── */
export const MSG_PROFILE = {
  UPDATED: "Cập nhật hồ sơ thành công!",
  AVATAR_UPDATED: "Cập nhật ảnh đại diện thành công!",
  ERROR_UPDATE: "Cập nhật hồ sơ thất bại",
} as const

/* ───────── Student ───────── */
export const MSG_STUDENT = {
  ERROR_LOAD: "Không thể tải danh sách học viên",
  UPDATED: "Cập nhật học viên thành công!",
} as const

/* ───────── Portal Header Labels ───────── */
export const HEADER_LABELS = {
  PROFILE: "Hồ sơ cá nhân",
  SETTINGS: "Cài đặt",
  HELP: "Trung tâm trợ giúp",
  NOTIFICATIONS: "Thông báo",
  MARK_ALL_READ: "Đọc tất cả",
  NO_NOTIFICATIONS: "Chưa có thông báo nào",
  NO_NEW_NOTIFICATIONS: "Chưa có thông báo mới",
  USER_MENU: "Menu người dùng",
} as const
