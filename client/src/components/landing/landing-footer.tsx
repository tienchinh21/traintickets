import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-white py-12">
      <div className="mx-auto grid max-w-[1110px] gap-8 px-5 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Link className="text-xl font-bold text-primary" href="/">
            TrainTickets
          </Link>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Nền tảng đặt vé xe và vé tàu trực tuyến, tập trung vào trải nghiệm tìm chuyến rõ ràng và thanh toán an toàn.
          </p>
        </div>
        {["Về TrainTickets", "Hỗ trợ", "Dịch vụ"].map((title) => (
          <div className="flex flex-col gap-3 text-sm" key={title}>
            <h3 className="font-semibold">{title}</h3>
            <Link className="text-slate-500" href="/search">
              Trung tâm trợ giúp
            </Link>
            <Link className="text-slate-500" href="/search">
              Chính sách hoàn huỷ
            </Link>
            <Link className="text-slate-500" href="/search">
              Liên hệ
            </Link>
          </div>
        ))}
      </div>
    </footer>
  );
}
