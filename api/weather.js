export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // wttr.in - 무료, 키 불필요, JSON 지원
    const r = await fetch("https://wttr.in/Pangyo,South+Korea?format=j1", {
      headers: { "User-Agent": "LinkHub/1.0", "Accept": "application/json" },
    });

    const text = await r.text();

    // JSON인지 확인
    if (text.startsWith("<!") || text.startsWith("<html")) {
      return res.status(500).json({ error: "wttr.in returned HTML" });
    }

    const data = JSON.parse(text);
    const current = data.current_condition?.[0];
    const forecast = data.weather;

    if (!current) {
      return res.status(500).json({ error: "No current weather data" });
    }

    // 날씨 코드 → 한글
    const code = parseInt(current.weatherCode);
    const weatherLabel = getWeatherLabel(code);

    const result = {
      temp: parseInt(current.temp_C),
      apparent_temp: parseInt(current.FeelsLikeC),
      humidity: parseInt(current.humidity),
      wind_speed: parseInt(current.windspeedKmph),
      weather_code: weatherLabel,
      forecast: (forecast || []).slice(0, 3).map((d, i) => ({
        day: i === 0 ? "오늘" : i === 1 ? "내일" : "모레",
        max: parseInt(d.maxtempC),
        min: parseInt(d.mintempC),
        code: getWeatherLabel(parseInt(d.hourly?.[4]?.weatherCode || "0")),
      })),
    };

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function getWeatherLabel(code) {
  if (code === 113) return "맑음";
  if (code === 116) return "대체로 맑음";
  if (code === 119 || code === 122) return "흐림";
  if (code === 143 || code === 248 || code === 260) return "안개";
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(code)) return "비";
  if ([179, 182, 185, 227, 230, 320, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(code)) return "눈";
  if ([200, 386, 389, 392, 395].includes(code)) return "뇌우";
  if (code === 281 || code === 284) return "소나기";
  return "흐림";
}
