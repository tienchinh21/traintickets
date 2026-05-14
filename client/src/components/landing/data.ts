import { Building2, CreditCard, Headphones, MessageCircle, Newspaper, ShieldCheck, Star } from "lucide-react";

export const benefits = [
  { title: "Chắc chắn có chỗ", icon: ShieldCheck },
  { title: "Hỗ trợ 24/7", icon: Headphones },
  { title: "Nhiều ưu đãi", icon: CreditCard },
  { title: "Thanh toán đa dạng", icon: Star },
];

export const routes = [
  {
    name: "Hà Nội - Sa Pa",
    price: "Từ 270.000đ",
    oldPrice: "300.000đ",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Hà Nội - Hải Phòng",
    price: "Từ 120.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Sài Gòn - Đà Lạt",
    price: "Từ 199.000đ",
    oldPrice: "349.000đ",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Sài Gòn - Vũng Tàu",
    price: "Từ 170.000đ",
    oldPrice: "",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
];

export const promoSections = [
  {
    title: "Ưu đãi nổi bật",
    subtitle: "Các chiến dịch đang chạy mạnh trong tuần này",
    items: [
      { title: "Giảm đến 20% khi đặt vé các nhà xe mới mở bán", tone: "blue", label: "NHÀ XE MỚI", value: "20%" },
      { title: "Giới thiệu bạn mới - Nhận quà khủng từ TrainTickets", tone: "sky", label: "THƯỞNG NHAU", value: "+30K" },
      { title: "Ưu đãi bất ngờ khi đặt TrainTickets", tone: "deep", label: "BẬT MÍ BÍ MẬT", value: "HOT" },
    ],
  },
  {
    title: "Ưu đãi thanh toán online",
    subtitle: "Thanh toán ví điện tử, thẻ ngân hàng và nhận giảm giá",
    items: [
      { title: "Giảm đến 50K khi thanh toán bằng ví ShopeePay", tone: "red", label: "SHOPEEPAY", value: "50K" },
      { title: "Giảm đến 25K khi thanh toán bằng ví ZaloPay", tone: "green", label: "ZALOPAY", value: "25K" },
      { title: "Giảm 20K khi thanh toán đơn từ 400K bằng ví MoMo", tone: "pink", label: "MOMOVXR", value: "20K" },
    ],
  },
  {
    title: "Ưu đãi từ đối tác khác",
    subtitle: "Đặc quyền mở rộng cho khách hàng TrainTickets",
    items: [
      { title: "Giảm 20% khi trải nghiệm dịch vụ đối tác du lịch", tone: "paper", label: "VOUCHER", value: "20%" },
      { title: "Mở tài khoản chứng khoán - an tâm bảo vệ", tone: "purple", label: "VPS", value: "88" },
      { title: "Giảm 20% tối đa 20K khi đặt phòng khách sạn", tone: "orange", label: "GO2JOY", value: "20%" },
    ],
  },
];

export const articles = [
  "Cách chọn giường nằm phù hợp cho hành trình dài",
  "Kinh nghiệm đi tàu đêm Hà Nội - Đà Nẵng",
  "Các giấy tờ cần chuẩn bị khi lên tàu",
  "Mẹo săn vé rẻ trong mùa cao điểm",
];

export const routeLinks = [
  "Xe khách Hà Nội đi Hải Phòng",
  "Xe khách Sài Gòn đi Đà Lạt",
  "Tàu hỏa Hà Nội đi Đà Nẵng",
  "Tàu hỏa Sài Gòn đi Nha Trang",
  "Xe khách Đà Nẵng đi Huế",
  "Xe khách Cần Thơ đi Sài Gòn",
  "Tàu hỏa Vinh đi Hà Nội",
  "Xe khách Nha Trang đi Đà Lạt",
];

export const reviews = [
  {
    name: "Nguyễn Hoàng Anh",
    text: "Đặt vé nhanh, xem được giờ đi và vị trí rõ ràng. Phù hợp cho chuyến công tác gấp.",
  },
  {
    name: "Mai Thanh",
    text: "Giao diện dễ dùng hơn so với mua vé truyền thống. Thanh toán xong có mã vé ngay.",
  },
  {
    name: "Trần Minh Khoa",
    text: "Tôi thích phần so sánh tuyến và giá. Dễ chọn chuyến hơn khi đi cùng gia đình.",
  },
];

export const infoBlocks = {
  newsIcon: Newspaper,
  businessIcon: Building2,
  reviewIcon: MessageCircle,
};
