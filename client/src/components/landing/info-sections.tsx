import Link from "next/link";

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
        <section className="border-y bg-[#f8fafc] py-14">
          <div className="mx-auto grid max-w-[1110px] gap-8 px-5 md:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <NewsIcon className="size-5" />
                </span>
                <div>
                  <h2 className="text-[20px] font-semibold tracking-normal">TrainTickets có gì mới?</h2>
                  <p className="text-sm text-slate-500">Tin tức và kinh nghiệm di chuyển</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {articles.map((article) => (
                  <Link className="rounded-lg border bg-white p-4 text-sm font-medium hover:border-primary" href="/search" key={article}>
                    {article}
                  </Link>
                ))}
              </div>
            </div>
            <Card className="bg-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <BusinessIcon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">Dành cho doanh nghiệp</h3>
                    <p className="text-sm text-slate-500">Quản lý vé tập trung cho nhân viên và đoàn khách.</p>
                  </div>
                </div>
                <Button className="mt-5 w-full" variant="outline">
                  Tìm hiểu thêm
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-[1110px] px-5 py-14">
          <h2 className="text-[20px] font-semibold tracking-normal">Đặt vé xe, vé tàu trực tuyến</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {routeLinks.map((route) => (
              <Link className="rounded-lg border bg-white px-4 py-3 text-sm text-slate-600 hover:border-primary hover:text-primary" href="/search" key={route}>
                {route}
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-y bg-[#f8fafc] py-14">
          <div className="mx-auto max-w-[1110px] px-5">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <ReviewIcon className="size-5" />
              </span>
              <div>
                <h2 className="text-[20px] font-semibold tracking-normal">Khách hàng nói gì?</h2>
                <p className="text-sm text-slate-500">Một vài phản hồi từ người dùng đã đặt vé</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {reviews.map((review) => (
                <Card className="bg-white" key={review.name}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex text-amber-400">★★★★★</div>
                    <p className="text-sm leading-6 text-slate-600">{review.text}</p>
                    <p className="mt-4 font-semibold">{review.name}</p>
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
