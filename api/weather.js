import https from "https";

export default function handler(req, res) {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=37.4017&longitude=127.1086&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Seoul&forecast_days=3";

  https.get(url, (response) => {
    let data = "";
    response.on("data", (chunk) => { data += chunk; });
    response.on("end", () => {
      try {
        const json = JSON.parse(data);
        res.status(200).json(json);
      } catch (e) {
        res.status(500).json({ error: "Parse error", raw: data.slice(0, 200) });
      }
    });
  }).on("error", (e) => {
    res.status(500).json({ error: e.message });
  });
}
