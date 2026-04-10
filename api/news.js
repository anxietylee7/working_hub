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
  // ─── AI 최신 소식: 다양한 쿼리로 최신성 확보 ───
  "AI 최신": [
    "AI 인공지능 최신 소식",
    "OpenAI Google AI 업데이트",
    "AI 모델 출시 신기술",
    "인공지능 서비스 새기능",
    "AI 스타트업 투자 소식",
  ],
  // ─── LLM 서비스: ChatGPT, Claude, Gemini 등 ───
  "LLM 서비스": [
    "ChatGPT 업데이트 새기능",
    "Claude Anthropic 소식",
    "Gemini Google AI 업데이트",
    "GPT LLM 서비스 변경",
  ],
  // ─── 하위 호환 (기존 탭 키) ───
  "AI 기술": [
    "AI 인공지능 최신 소식",
    "AI 모델 출시 신기술",
  ],
};

async function fetchRSS(query, when = "1d") {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}+when:${when}&hl=ko&gl=KR&ceid=KR:ko`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LinkHub/1.0; +https://working-hub-olive.vercel.app)",
      "Accept": "application/rss+xml, application/xml, text/xml",
    },
  });

  const text = await res.text();

  if (!text.includes("<item>")) {
    return [];
  }

  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(text)) !== null && items.length < 10) {
    const xml = match[1];
    const title = extractTag(xml, "title");
    const link = extractLink(xml);
    const pubDate = extractTag(xml, "pubDate");
    const source = extractTag(xml, "source");

    if (title && link) {
      items.push({
        title: decodeEntities(title),
        source: source ? decodeEntities(source) : "",
        url: link,
        date: pubDate ? fmtDate(pubDate) : "",
      });
    }
  }
  return items;
}

function extractTag(xml, tag) {
  const cdata = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return plain ? plain[1].trim() : "";
}

function extractLink(xml) {
  const m = xml.match(/<link\s*\/?>([^<]+)/);
  if (m) return m[1].trim();
  const m2 = xml.match(/<link[^>]*href="([^"]+)"/);
  return m2 ? m2[1] : "";
}

function decodeEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function fmtDate(s) {
  try {
    const d = new Date(s);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch { return s; }
}

async function fetchGoogleNews(queries) {
  const all = [];
  const seen = new Set();

  // 1차: 최근 1일 뉴스
  for (const q of queries) {
    try {
      const items = await fetchRSS(q, "1d");
      for (const item of items) {
        if (!seen.has(item.title)) {
          seen.add(item.title);
          all.push({ ...item, rank: all.length + 1 });
        }
        if (all.length >= 8) break;
      }
    } catch {}
    if (all.length >= 8) break;
  }

  // 2차: 1일 뉴스가 부족하면 3일로 확대
  if (all.length < 4) {
    for (const q of queries) {
      try {
        const items = await fetchRSS(q, "3d");
        for (const item of items) {
          if (!seen.has(item.title)) {
            seen.add(item.title);
            all.push({ ...item, rank: all.length + 1 });
          }
          if (all.length >= 8) break;
        }
      } catch {}
      if (all.length >= 8) break;
    }
  }

  return all.slice(0, 8);
}

async function getCache(id) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/news_cache?id=eq.${id}&select=*`, { headers: SB_HEADERS });
    const rows = await r.json();
    if (rows.length > 0) {
      const age = Date.now() - new Date(rows[0].updated_at).getTime();
      if (age < CACHE_TTL_MS) return rows[0].data;
    }
  } catch {}
  return null;
}

async function setCache(id, data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/news_cache`, {
      method: "POST",
      headers: { ...SB_HEADERS, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id, data, updated_at: new Date().toISOString() }),
    });
  } catch {}
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    const tab = body.tab || "AI 최신";
    const force = body.force || false;
    const cacheId = "news_" + tab.replace(/\s/g, "_");

    if (!force) {
      const cached = await getCache(cacheId);
      if (cached) return res.status(200).json({ news: cached, cached: true });
    }

    const queries = CATEGORY_QUERIES[tab] || CATEGORY_QUERIES["AI 최신"];
    const news = await fetchGoogleNews(queries);

    if (news.length === 0) {
      return res.status(500).json({ error: "뉴스를 찾을 수 없습니다. Google News 접근이 제한되었을 수 있습니다." });
    }

    await setCache(cacheId, news);
    return res.status(200).json({ news, cached: false });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
