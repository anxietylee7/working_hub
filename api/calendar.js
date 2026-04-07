export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const ICS_URL = "https://outlook.office365.com/owa/calendar/9bb369c087514f938c3e6af3fac656a9@smilegate.com/d49b9a1bab324e7bbd6a761f6ce8f6628415992148646106780/calendar.ics";

  try {
    const r = await fetch(ICS_URL, {
      headers: { "User-Agent": "LinkHub/1.0" },
    });

    if (!r.ok) throw new Error("ICS fetch failed: " + r.status);
    const text = await r.text();

    if (!text.includes("BEGIN:VCALENDAR")) {
      return res.status(500).json({ error: "Invalid ICS data" });
    }

    // Parse ICS events
    const events = [];
    const blocks = text.split("BEGIN:VEVENT");

    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i].split("END:VEVENT")[0];
      const summary = extractICSField(block, "SUMMARY");
      const dtstart = extractICSDate(block, "DTSTART");
      const dtend = extractICSDate(block, "DTEND");
      const location = extractICSField(block, "LOCATION");

      if (summary && dtstart) {
        events.push({
          title: summary,
          start: dtstart,
          end: dtend,
          location: location || "",
        });
      }
    }

    // Filter: this week (Mon~Fri)
    const now = new Date();
    const koreaOffset = 9 * 60 * 60 * 1000;
    const koreaNow = new Date(now.getTime() + koreaOffset);

    const day = koreaNow.getUTCDay() || 7;
    const monday = new Date(koreaNow);
    monday.setUTCDate(koreaNow.getUTCDate() - day + 1);
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    const weekEvents = events
      .filter(e => {
        const d = new Date(e.start);
        return d >= monday && d <= sunday;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    // Today's events
    const todayStr = koreaNow.toISOString().split("T")[0];
    const todayEvents = weekEvents.filter(e => e.start.startsWith(todayStr));

    // Next upcoming meeting from now
    const nowISO = koreaNow.toISOString();
    const upcoming = todayEvents.find(e => e.start >= nowISO) || todayEvents[0] || null;

    return res.status(200).json({
      today: todayEvents,
      week: weekEvents,
      todayCount: todayEvents.length,
      upcoming,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function extractICSField(block, field) {
  // Handle folded lines and various formats
  const regex = new RegExp("(?:^|\\n)" + field + "(?:[;:][^\\n]*):(.*?)(?=\\n[A-Z])", "s");
  const m = block.match(regex);
  if (!m) {
    const simple = new RegExp("(?:^|\\n)" + field + "(?:[;:].*?)?:(.+)", "m");
    const s = block.match(simple);
    return s ? unfold(s[1].trim()) : "";
  }
  return unfold(m[1].trim());
}

function extractICSDate(block, field) {
  // Match DTSTART;TZID=...:20260407T100000 or DTSTART:20260407T100000Z or DTSTART;VALUE=DATE:20260407
  const patterns = [
    new RegExp("(?:^|\\n)" + field + "(?:;[^:]*)?:(\\d{8}T\\d{6}Z?)", "m"),
    new RegExp("(?:^|\\n)" + field + "(?:;[^:]*)?:(\\d{8})", "m"),
  ];

  for (const p of patterns) {
    const m = block.match(p);
    if (m) {
      const raw = m[1];
      if (raw.length === 8) {
        // All-day event
        return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T00:00:00`;
      }
      // DateTime
      const y = raw.slice(0, 4), mo = raw.slice(4, 6), d = raw.slice(6, 8);
      const h = raw.slice(9, 11), mi = raw.slice(11, 13), s = raw.slice(13, 15);
      if (raw.endsWith("Z")) {
        // UTC -> KST (+9h)
        const utc = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
        const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
        return kst.toISOString().replace("Z", "").slice(0, 19);
      }
      // Assume already local (TZID)
      return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
    }
  }
  return "";
}

function unfold(s) {
  return s.replace(/\r?\n[ \t]/g, "").replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\\/g, "");
}
