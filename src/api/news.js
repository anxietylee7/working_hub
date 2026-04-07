export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not configured" });

  const { category = "AI 기술" } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        web_search_options: {
          search_context_size: "medium",
        },
        messages: [
          {
            role: "system",
            content: `You are a news curator for an AI research team. Return ONLY a JSON array with no other text, no markdown fences. Each item: {"rank":number,"title":"string","summary":"1줄 요약","source":"출처명","url":"URL","date":"YYYY-MM-DD"}`
          },
          {
            role: "user",
            content: `오늘 날짜 기준 최신 "${category}" 관련 뉴스 6개를 찾아서 JSON 배열로 반환해줘. 한국어 뉴스 우선, 없으면 영어도 가능.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", errText);
      return res.status(response.status).json({ error: "OpenAI API error", detail: errText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const cleaned = content.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      const news = JSON.parse(match[0]).slice(0, 6);
      return res.status(200).json({ news });
    }

    return res.status(200).json({ news: [], raw: content });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: e.message });
  }
}
