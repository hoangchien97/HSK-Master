Thực ra tôi muốn build lấy CTable, sx có chức năng như StudentTable

- loading ( có props - tuy nhiên chưa cần dùng )
- Support pass các props truyền vào sao cho dynamic đc Table nhất
Ví dụ: header: cũng truyền được columns, support align ( left, center, right), className, style, v.v...
- Support selection ( có props - tuy nhiên chưa cần dùng )

{/* ── Footer: Pagination + Page size ── */}

- Pagination căn giữa, page size bên phải
- Support isShowPagination hay k ?
- Support truyển vào total -> Hiển thị total ở top ( bên ngoài ) table góc bên trái
- Support truyền vào ReactNode actions ( bên ngoài ) góc bên phải, đối diện total
- Support truyền vào để cho phép table có checkbox selection ( tuy nhiên chưa cần dùng )
- Table support scroll ngang
- Table support sort useAsyncList ( import {useAsyncList} from "@react-stately/data" - sort này có cần server k ? ưu tiên k cần)


- Ở table ta nên định nghĩa các interface params, interface response trả về
ví dụ:
IGetStudentParams {
  page: number;
  pageSize: number;
  level: string; // enum ...
  name: string; // sort full Name
}

IGetStudentResponse {
  items: IStudent[]; // items/data
  total: number;
}

IStudent {
  id: string;
  fullName: string;
  email: string;
  ...
}

- Follow design pattern hiện tại của project
-> ĐỊnh nghĩa interface,enums cần thiết sử dụng các interface cho các file liên quan ( api, component, hook, ...)

ví dụ: interface cho portal common, portal students, portal courses, ...

ví dụ: common interface

IGetPaginationParams {
  page: number;
  pageSize: number;
}
-> IGetStudentParams extends IGetPaginationParams {
  level: string;
  name: string;
  ...
}

students interface

Xong tiếp đến các constants, enums của các màn thì có những file riêng


Ở component Table, có thể tái sử dụng các component trên với :
const [students, setStudents] = useState<IGetStudentResponse>({
  items: [],
  total: 0
});

const [params, setParams] = useState<IGetStudentParams>({
  page: 1,
  pageSize: 10,
  level: "",
  name: ""
});

- Quy tắc màn: Call api lỗi - Hiển thị toast lỗi
- Call api thực hiện delete/update/create thành công - Hiển thị toast success


- Màn hình quản lý học viên
+ Support filter theo lớp học nữa ( Hiển thị label, đẩy classId lên )

I. Áp dụng CTable cho các màn, follow đúng
1. Update lại CTable để support các props cần thiết
2. Ở StudentTable sử dụng CTable với các props cần thiết, sử dụng useEffect để call api lấy data khi params thay đổi
- Ở StudentTable có thể có các filter ( ví dụ: level, name, ... ) để setParams
3. Hiển thị data lấy đc lên table
4. Handle pagination, page size change để setParams
5. Actions: có support thêm 1 button "Thêm học viên"
6. Hiển thị total items lấy đc từ api
7. Change được pagination, page size ( ví dụ: 10, 20, 50, 100 )
8. Filter thì url cũng set params tương ứng ( research sử dụng useSearchParams cho các màn quản lý )
-> Sau khi hoàn thành màn students, áp dụng sang các màn còn lại
- Quản lý lớp học, Quản lý học viên, Lịch giảng dạy, Điểm danh, ...
II. Kiểm tra tối ưu
Tiếp đến, kiểm tra network, api của các màn đều bị call thừa?
k biết lý do local k để Suspense hay lý do nào khác, và deploy sẽ hết hay không ?
- Nếu có thể tối ưu để tránh call thừa thì tối ưu luôn

III. Mock data cho lớp học >= 20 lớp học để test pagination, page size, scroll ngang

IV. tại sao vẫn còn folder lib cùng cấp với app
-> Move nó vào trong app cho tôi
- Và phân chia lại. ví dụ: useBreadcrumb -> app/hooks/...
lib/breadcrumb.ts -> nó có phải là utils k ? vì hàm

