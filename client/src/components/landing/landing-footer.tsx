import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t-2 border-accent-cta/70 bg-[#083f67] py-12 text-white">
      <div className="mx-auto grid max-w-[1110px] gap-8 px-5 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Link className="text-2xl font-black text-white" href="/">
            TrainTickets
          </Link>
          <p className="mt-3 text-sm leading-6 text-sky-100/75">
            Nền tảng đặt vé xe và vé tàu trực tuyến, tập trung vào trải nghiệm tìm chuyến rõ ràng và thanh toán an toàn.
          </p>
        </div>
        {["Về TrainTickets", "Hỗ trợ", "Dịch vụ"].map((title) => (
          <div className="flex flex-col gap-3 text-sm" key={title}>
            <h3 className="font-black text-white">{title}</h3>
            <Link className="text-sky-100/75 transition hover:text-accent-cta" href="/tim-chuyen">
              Trung tâm trợ giúp
            </Link>
            <Link className="text-sky-100/75 transition hover:text-accent-cta" href="/tim-chuyen">
              Chính sách hoàn huỷ
            </Link>
            <Link className="text-sky-100/75 transition hover:text-accent-cta" href="/tim-chuyen">
              Liên hệ
            </Link>
          </div>
        ))}
      </div>
    </footer>
  );
}
