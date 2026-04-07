export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not configured" });

  try {
    const body = req.body || {};
    const tab = body.tab || "AI 기술";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: "오늘 날짜 기준으로 최신 AI 관련 뉴스를 검색해서 6개를 알려줘. 카테고리: " + tab + "\n\n반드시 아래 JSON 형식만 응답해. 다른 텍스트 없이 JSON 배열만:\n[{\"rank\":1,\"title\":\"뉴스 제목\",\"summary\":\"1줄 요약\",\"source\":\"출처명\",\"url\":\"기사URL\",\"date\":\"YYYY.MM.DD\"}]\n\n규칙:\n- 오늘 또는 최근 1주일 내 뉴스만\n- 한국어 뉴스 우선\n- URL은 실제 존재하는 기사 링크\n- JSON 외 다른 텍스트 절대 포함하지 마",
      }),
    });

    const data = await response.json();

    let text = "";
    if (data.output) {
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const block of item.content) {
            if (block.type === "output_text") text += block.text;
          }
        }
      }
    }

    if (!text) {
      return res.status(500).json({ error: "No response from OpenAI", debug: JSON.stringify(data).slice(0, 500) });
    }

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(500).json({ error: "Failed to parse", debug: text.slice(0, 500) });
    }

    const news = JSON.parse(match[0]).slice(0, 6);
    return res.status(200).json({ news });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
