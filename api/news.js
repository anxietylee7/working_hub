const CATEGORY_PROMPTS = {
  "AI 기술": `오늘 날짜 기준으로 최신 "AI 기술" 관련 뉴스를 웹에서 검색해서 6개를 알려줘.

이 카테고리에 해당하는 뉴스만 포함해:
- AI 새로운 논문, 연구 결과 발표
- 새로운 AI 모델 출시 (예: 이미지 생성, 음성 합성, 멀티모달 등)
- AI 학습 기법, 아키텍처 혁신
- AI 벤치마크, 성능 비교
- AI 오픈소스 프로젝트 공개

이 카테고리에 해당하지 않는 뉴스는 제외해:
- ChatGPT, Claude, Gemini 등 LLM 서비스 업데이트 (→ LLM 서비스 카테고리)
- AI 투자, 인수합병, 규제 관련 뉴스`,

  "LLM 서비스": `오늘 날짜 기준으로 최신 "LLM 서비스" 관련 뉴스를 웹에서 검색해서 6개를 알려줘.

이 카테고리에 해당하는 뉴스만 포함해:
- ChatGPT, Claude, Gemini, Llama 등 LLM 서비스 업데이트/신기능
- LLM API 변경, 가격 정책, 새 모델 버전 출시
- LLM 기반 제품/서비스 출시 (예: AI 코딩 도구, AI 어시스턴트)
- LLM 성능 비교, 사용 후기
- 프롬프트 엔지니어링, RAG 등 LLM 활용 기법

이 카테고리에 해당하지 않는 뉴스는 제외해:
- 순수 AI 연구/논문 (→ AI 기술 카테고리)
- AI 투자, 인수합병, 규제 관련 뉴스`,
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not configured" });

  try {
    const body = req.body || {};
    const tab = body.tab || "AI 기술";
    const categoryPrompt = CATEGORY_PROMPTS[tab] || CATEGORY_PROMPTS["AI 기술"];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: categoryPrompt + "\n\n반드시 아래 JSON 형식만 응답해. 다른 텍스트 없이 JSON 배열만:\n[{\"rank\":1,\"title\":\"뉴스 제목\",\"summary\":\"1줄 요약 (30자 이내)\",\"source\":\"출처명\",\"url\":\"기사URL\",\"date\":\"YYYY.MM.DD\"}]\n\n규칙:\n- 오늘 또는 최근 1주일 내 뉴스만\n- 한국어 뉴스 우선, 없으면 영어 뉴스도 가능\n- URL은 실제 존재하는 기사 링크\n- 6개 뉴스가 서로 겹치지 않도록\n- JSON 외 다른 텍스트 절대 포함하지 마",
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
