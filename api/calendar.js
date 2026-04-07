export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const ICS_URL = "https://outlook.office365.com/owa/calendar/9bb369c087514f938c3e6af3fac656a9@smilegate.com/d49b9a1bab324e7bbd6a761f6ce8f6628415992148646106780/calendar.ics";

  try {
    const r = await fetch(ICS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkHub/1.0)" },
    });

    if (!r.ok) throw new Error("ICS fetch failed: " + r.status);
    let text = await r.text();

    if (!text.includes("BEGIN:VCALENDAR")) {
      return res.status(500).json({ error: "Invalid ICS data", preview: text.slice(0, 200) });
    }

    // Unfold: lines starting with space/tab are continuation of previous line
    text = text.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const events = [];
    const veventBlocks = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

    for (const block of veventBlocks) {
      const summary = getField(block, "SUMMARY");
      const dtstart = getDateField(block, "DTSTART");
      const dtend = getDateField(block, "DTEND");
      const location = getField(block, "LOCATION");

      if (summary && dtstart) {
        events.push({
          title: cleanText(summary),
          start: dtstart,
          end: dtend || dtstart,
          location: cleanText(location),
        });
      }
    }

    // KST 기준 이번 주 월~일
    const nowKST = toKST(new Date());
    const dayOfWeek = nowKST.getDay() || 7;
    
    const mondayKST = new Date(nowKST);
    mondayKST.setDate(nowKST.getDate() - dayOfWeek + 1);
    const mondayStr = dateStr(mondayKST);
    
    const sundayKST = new Date(mondayKST);
    sundayKST.setDate(mondayKST.getDate() + 6);
    const sundayStr = dateStr(sundayKST);

    const todayStr = dateStr(nowKST);

    const weekEvents = events
      .filter(e => {
        const d = e.start.slice(0, 10);
        return d >= mondayStr && d <= sundayStr;
      })
      .sort((a, b) => a.start.localeCompare(b.start));

    const todayEvents = weekEvents.filter(e => e.start.startsWith(todayStr));

    const nowTimeStr = `${todayStr}T${pad2(nowKST.getHours())}:${pad2(nowKST.getMinutes())}:00`;
    const upcoming = todayEvents.find(e => e.start >= nowTimeStr) || todayEvents[0] || null;

    return res.status(200).json({
      today: todayEvents,
      week: weekEvents,
      todayCount: todayEvents.length,
      upcoming,
      debug: { mondayStr, sundayStr, todayStr, totalParsed: events.length, weekFiltered: weekEvents.length, veventCount: veventBlocks.length }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function toKST(d) {
  return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}

function dateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getField(block, field) {
  // Match FIELD;params:value or FIELD:value
  const regex = new RegExp("^" + field + "(?:;[^:]*)?:(.+)$", "m");
  const m = block.match(regex);
  return m ? m[1].trim() : "";
}

function getDateField(block, field) {
  // Match various date formats
  const regex = new RegExp("^" + field + "(?:;[^:]*)?:(\\d{8}(?:T\\d{6}Z?)?)\\s*$", "m");
  const m = block.match(regex);
  if (!m) return "";

  const raw = m[1];

  // Date only (all-day event)
  if (raw.length === 8) {
    return `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T00:00:00`;
  }

  const y = raw.slice(0,4), mo = raw.slice(4,6), d = raw.slice(6,8);
  const h = raw.slice(9,11), mi = raw.slice(11,13), s = raw.slice(13,15);

  // UTC time -> convert to KST
  if (raw.endsWith("Z")) {
    const utc = new Date(Date.UTC(+y, +mo-1, +d, +h, +mi, +s));
    const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
    return `${kst.getFullYear()}-${pad2(kst.getMonth()+1)}-${pad2(kst.getDate())}T${pad2(kst.getHours())}:${pad2(kst.getMinutes())}:${pad2(kst.getSeconds())}`;
  }

  // Already local time (TZID specified)
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function cleanText(s) {
  if (!s) return "";
  return s.replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}
