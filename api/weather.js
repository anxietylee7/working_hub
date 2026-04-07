export default async function handler(req, res) {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=37.4017&longitude=127.1086&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Seoul&forecast_days=3";
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
