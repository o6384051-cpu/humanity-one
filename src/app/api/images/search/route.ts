import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

function plainText(value: unknown, max = 180): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim().slice(0, max);
}

export async function GET(req: NextRequest) {
  const limit = await rateLimit(req, "ai-image-search", 12, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const query = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
  if (query.length < 2) {
    return NextResponse.json({ images: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: query,
      gsrnamespace: "6",
      gsrlimit: "8",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "640",
    });
    const upstream = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
      headers: { "User-Agent": "HUMANITY-ONE/1.0 (humanityone.contact@gmail.com)" },
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 300 },
    });
    if (!upstream.ok) {
      return NextResponse.json({ images: [], error: "تعذر الوصول إلى مكتبة الصور الآن." }, { status: 502 });
    }

    const data = await upstream.json();
    const pages = Object.values(data?.query?.pages || {}) as any[];
    const images = pages.flatMap((page) => {
      const info = page?.imageinfo?.[0];
      const imageUrl = info?.thumburl || info?.url;
      const sourceUrl = info?.descriptionurl;
      if (
        typeof imageUrl !== "string" || !imageUrl.startsWith("https://upload.wikimedia.org/") ||
        typeof sourceUrl !== "string" || !sourceUrl.startsWith("https://commons.wikimedia.org/")
      ) return [];
      const metadata = info?.extmetadata || {};
      return [{
        title: plainText(page.title?.replace(/^File:/, ""), 120),
        imageUrl,
        sourceUrl,
        license: plainText(metadata.LicenseShortName?.value, 60),
        artist: plainText(metadata.Artist?.value, 100),
      }];
    });

    return NextResponse.json({ images }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ images: [], error: "تعذر البحث عن الصور حاليًا." }, { status: 502 });
  }
}
