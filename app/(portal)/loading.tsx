import { CSpinner } from "@/components/portal/common"

export default function PortalLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[40vh]">
      <CSpinner size="lg" color="primary" message="Đang tải..." />
    </div>
  );
}
