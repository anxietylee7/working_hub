export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not configured" });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: `판교 삼평동의 현재 날씨를 검색해서 알려줘.

반드시 아래 JSON 형식만 응답해. 다른 텍스트 없이 JSON만:
{"temp":현재기온숫자,"apparent_temp":체감온도숫자,"humidity":습도숫자,"wind_speed":풍속숫자km/h,"weather_code":"맑음/흐림/구름조금/비/눈/안개 중 하나","forecast":[{"day":"오늘","max":최고기온,"min":최저기온,"code":"날씨"},{"day":"내일","max":최고기온,"min":최저기온,"code":"날씨"},{"day":"모레","max":최고기온,"min":최저기온,"code":"날씨"}]}

규칙:
- 기온은 섭씨 정수
- 풍속은 km/h 정수
- JSON 외 다른 텍스트 절대 포함하지 마`,
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
      return res.status(500).json({ error: "No response" });
    }

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: "Parse failed", debug: text.slice(0, 300) });
    }

    const weather = JSON.parse(match[0]);
    return res.status(200).json(weather);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
