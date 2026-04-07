const SUPABASE_URL = "https://pyfzeyxcwzecjzeuhehn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZnpleXhjd3plY2p6ZXVoZWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDcwMzUsImV4cCI6MjA5MTA4MzAzNX0.4nwLGVT7fufgQjr8CIhtOk6PreRyxz8BNJY8Kn2v_cU";
const SB_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간

const CATEGORY_QUERIES = {
  "AI 기술": "AI+인공지능+딥러닝+모델+논문+연구",
  "LLM 서비스": "ChatGPT+Claude+Gemini+LLM+GPT",
};

// Google News RSS에서 뉴스 가져오기
async function fetchGoogleNews(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=ko&gl=KR&ceid=KR:ko`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Google News fetch failed: " + res.status);
  const xml = await res.text();

  // XML 파싱 (간단한 정규식 기반)
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 6) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const source = extractTag(itemXml, "source");

    if (title && link) {
      items.push({
        rank: items.length + 1,
        title: decodeHtmlEntities(title),
        summary: "",
        source: source ? decodeHtmlEntities(source) : "",
        url: link,
        date: pubDate ? formatDate(pubDate) : "",
      });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  // CDATA 처리
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`);
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const m = xml.match(regex);
  return m ? m[1].trim() : "";
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

// Supabase 캐시 읽기
async function getCache(cacheId) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/news_cache?id=eq.${cacheId}&select=*`,
      { headers: SB_HEADERS }
    );
    const rows = await res.json();
    if (rows.length > 0) {
      const row = rows[0];
      const age = Date.now() - new Date(row.updated_at).getTime();
      if (age < CACHE_TTL_MS) {
        return row.data;
      }
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
}

// Supabase 캐시 쓰기 (upsert)
async function setCache(cacheId, data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/news_cache`, {
      method: "POST",
      headers: { ...SB_HEADERS, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        id: cacheId,
        data: data,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error("Cache write error:", e);
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    const tab = body.tab || "AI 기술";
    const force = body.force || false;
    const cacheId = "news_" + tab.replace(/\s/g, "_");

    // 1. 캐시 확인 (force가 아닌 경우)
    if (!force) {
      const cached = await getCache(cacheId);
      if (cached) {
        return res.status(200).json({ news: cached, cached: true });
      }
    }

    // 2. Google News RSS에서 가져오기
    const query = CATEGORY_QUERIES[tab] || CATEGORY_QUERIES["AI 기술"];
    const news = await fetchGoogleNews(query);

    if (news.length === 0) {
      return res.status(500).json({ error: "뉴스를 찾을 수 없습니다" });
    }

    // 3. 캐시 저장
    await setCache(cacheId, news);

    return res.status(200).json({ news, cached: false });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
