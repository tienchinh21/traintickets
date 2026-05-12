import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { articles, infoBlocks, reviews, routeLinks } from "./data";
import { Reveal } from "./reveal";

export function InfoSections() {
  const NewsIcon = infoBlocks.newsIcon;
  const BusinessIcon = infoBlocks.businessIcon;
  const ReviewIcon = infoBlocks.reviewIcon;

  return (
    <>
      <Reveal>
        <section className="border-y border-sky-100 bg-[#f8fcff] py-16">
          <div className="mx-auto grid max-w-[1110px] gap-8 px-5 md:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)]">
                  <NewsIcon className="size-5" />
                </span>
                <div>
                  <h2 className="text-[24px] font-black tracking-normal text-[#172033]">TrainTickets có gì mới?</h2>
                  <p className="text-sm text-slate-500">Tin tức và kinh nghiệm di chuyển</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {articles.map((article) => (
                  <Link className="group flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white p-4 text-sm font-bold text-[#172033] shadow-[0_10px_24px_rgba(8,63,103,0.08)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_32px_rgba(8,63,103,0.13)]" href="/tim-chuyen" key={article}>
                    <span>{article}</span>
                    <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
            <Card className="overflow-hidden border-sky-100 bg-[#f0f7ff] shadow-[0_18px_40px_rgba(8,63,103,0.12)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-cta text-[#083f67] shadow-[0_10px_22px_rgba(250,204,21,0.24)]">
                    <BusinessIcon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-black text-[#172033]">Dành cho doanh nghiệp</h3>
                    <p className="text-sm text-slate-500">Quản lý vé tập trung cho nhân viên và đoàn khách.</p>
                  </div>
                </div>
                <Button className="mt-6 w-full rounded-xl border-primary/20 bg-white font-black text-primary hover:bg-primary hover:text-white" variant="outline">
                  Tìm hiểu thêm
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-[1110px] px-5 py-16">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Tìm nhanh</p>
              <h2 className="mt-2 text-[24px] font-black tracking-normal text-[#172033]">Đặt vé xe, vé tàu trực tuyến</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {routeLinks.map((route) => (
              <Link className="group flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-md" href="/tim-chuyen" key={route}>
                <span className="min-w-0 truncate">{route}</span>
                <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-y border-sky-100 bg-[#f8fcff] py-16">
          <div className="mx-auto max-w-[1110px] px-5">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)]">
                <ReviewIcon className="size-5" />
              </span>
              <div>
                <h2 className="text-[24px] font-black tracking-normal text-[#172033]">Khách hàng nói gì?</h2>
                <p className="text-sm text-slate-500">Một vài phản hồi từ người dùng đã đặt vé</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {reviews.map((review) => (
                <Card className="border-sky-100 bg-white shadow-[0_14px_34px_rgba(8,63,103,0.1)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(8,63,103,0.15)]" key={review.name}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex text-amber-400">★★★★★</div>
                      <Quote className="size-5 text-primary/35" />
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{review.text}</p>
                    <p className="mt-5 font-black text-[#172033]">{review.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
