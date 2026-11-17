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

    // Book-cover requests also use Open Library's public covers catalog.
    if (/غلاف|book\s*cover|cover of/i.test(query)) {
      const bookTitle = query
        .replace(/^(?:please\s+)?(?:show|find|display)\s+(?:me\s+)?/i, "")
        .replace(/^(?:اعرض(?:\s+لي)?|أرني|ورني)\s*/i, "")
        .replace(/^(?:a\s+)?(?:صورة|صور|صوره|غلاف|image|photo|picture|cover)\s*(?:(?:غلاف|book\s+cover)\s*)?(?:كتاب\s*)?/i, "")
        .replace(/\s+(?:book\s+)?cover$/i, "")
        .replace(/\s+غلاف(?:\s+الكتاب)?$/i, "")
        .trim()
        .slice(0, 100);
      if (bookTitle.length >= 2) {
        try {
          const bookParams = new URLSearchParams({
            title: bookTitle,
            fields: "key,title,cover_i,author_name",
            limit: "6",
          });
          const bookResponse = await fetch(`https://openlibrary.org/search.json?${bookParams.toString()}`, {
            headers: { "User-Agent": "HUMANITY-ONE/1.0 (humanityone.contact@gmail.com)" },
            signal: AbortSignal.timeout(8_000),
            next: { revalidate: 3600 },
          });
          if (bookResponse.ok) {
            const bookData = await bookResponse.json();
            const covers = (bookData?.docs || []).flatMap((book: any) => {
              if (!Number.isInteger(book.cover_i) || typeof book.key !== "string" || !/^\/works\/[A-Za-z0-9]+$/.test(book.key)) return [];
              return [{
                title: plainText(book.title, 120),
                imageUrl: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg?default=false`,
                sourceUrl: `https://openlibrary.org${book.key}`,
                license: "Open Library",
                artist: Array.isArray(book.author_name) ? plainText(book.author_name[0], 80) : "",
              }];
            });
            images.unshift(...covers);
          }
        } catch {
          // Open Library is an optional book-cover source.
        }
      }
    }

    return NextResponse.json({ images: images.slice(0, 8) }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ images: [], error: "تعذر البحث عن الصور حاليًا." }, { status: 502 });
  }
}
