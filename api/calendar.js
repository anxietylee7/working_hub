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
      return res.status(500).json({ error: "Invalid ICS data" });
    }

    text = text.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // KST 기준 이번 주
    const nowKST = toKST(new Date());
    const dayOfWeek = nowKST.getDay() || 7;
    const mondayKST = new Date(nowKST);
    mondayKST.setDate(nowKST.getDate() - dayOfWeek + 1);
    mondayKST.setHours(0, 0, 0, 0);
    const sundayKST = new Date(mondayKST);
    sundayKST.setDate(mondayKST.getDate() + 6);
    sundayKST.setHours(23, 59, 59, 999);
    const mondayStr = ds(mondayKST);
    const sundayStr = ds(sundayKST);
    const todayStr = ds(nowKST);

    const events = [];
    const veventBlocks = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

    for (const block of veventBlocks) {
      const summary = getField(block, "SUMMARY");
      const dtstart = getDateField(block, "DTSTART");
      const dtend = getDateField(block, "DTEND");
      const location = getField(block, "LOCATION");
      const rrule = getField(block, "RRULE");
      const exdateRaw = getField(block, "EXDATE");

      if (!summary || !dtstart) continue;

      const title = cleanText(summary);
      const loc = cleanText(location);

      // 제외 날짜 파싱
      const exdates = new Set();
      if (exdateRaw) {
        const parts = exdateRaw.split(",");
        for (const p of parts) {
          const d = p.trim().replace(/\D/g, "").slice(0, 8);
          if (d.length === 8) exdates.add(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`);
        }
      }

      if (rrule && rrule.includes("FREQ=WEEKLY")) {
        // 반복 이벤트: 이번 주에 해당하는 인스턴스 생성
        const startDate = new Date(dtstart);
        const endDate = dtend ? new Date(dtend) : new Date(dtstart);
        const duration = endDate.getTime() - startDate.getTime();
        const originalDay = startDate.getDay();

        // BYDAY 파싱
        const bydayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
        const dayMap = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
        let days = bydayMatch
          ? bydayMatch[1].split(",").map(d => dayMap[d.trim()]).filter(d => d !== undefined)
          : [originalDay];

        // UNTIL 파싱
        let untilDate = null;
        const untilMatch = rrule.match(/UNTIL=(\d{8})/);
        if (untilMatch) {
          const u = untilMatch[1];
          untilDate = new Date(`${u.slice(0,4)}-${u.slice(4,6)}-${u.slice(6,8)}T23:59:59`);
        }

        // COUNT 파싱
        let count = null;
        const countMatch = rrule.match(/COUNT=(\d+)/);
        if (countMatch) count = parseInt(countMatch[1]);

        // INTERVAL
        const intervalMatch = rrule.match(/INTERVAL=(\d+)/);
        const interval = intervalMatch ? parseInt(intervalMatch[1]) : 1;

        // 이번 주 각 요일에 인스턴스 생성
        for (const targetDay of days) {
          const instanceDate = new Date(mondayKST);
          instanceDate.setDate(mondayKST.getDate() + ((targetDay === 0 ? 7 : targetDay) - 1));

          // 시작일 이전이면 스킵
          if (instanceDate < new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) continue;

          // UNTIL 이후면 스킵
          if (untilDate && instanceDate > untilDate) continue;

          // COUNT 체크 (간단한 근사: 시작일로부터 주 수 계산)
          if (count) {
            const weeksDiff = Math.floor((instanceDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000 * interval));
            if (weeksDiff >= count) continue;
          }

          // INTERVAL 체크
          if (interval > 1) {
            const weeksDiff = Math.floor((instanceDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            if (weeksDiff % interval !== 0) continue;
          }

          const instDateStr = ds(instanceDate);

          // EXDATE 체크
          if (exdates.has(instDateStr)) continue;

          // 이번 주 범위 체크
          if (instDateStr < mondayStr || instDateStr > sundayStr) continue;

          const instStart = `${instDateStr}T${dtstart.slice(11)}`;
          const instEndTime = dtend ? dtend.slice(11) : dtstart.slice(11);
          const instEnd = `${instDateStr}T${instEndTime}`;

          events.push({ title, start: instStart, end: instEnd, location: loc });
        }
      } else {
        // 단일 이벤트
        events.push({ title, start: dtstart, end: dtend || dtstart, location: loc });
      }
    }

    // 이번 주 필터링 + 정렬
    const weekEvents = events
      .filter(e => {
        const d = e.start.slice(0, 10);
        return d >= mondayStr && d <= sundayStr;
      })
      .sort((a, b) => a.start.localeCompare(b.start));

    // 중복 제거 (같은 제목 + 같은 시작시간)
    const seen = new Set();
    const uniqueWeek = weekEvents.filter(e => {
      const key = `${e.title}|${e.start}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const todayEvents = uniqueWeek.filter(e => e.start.startsWith(todayStr));
    const nowTimeStr = `${todayStr}T${pad2(nowKST.getHours())}:${pad2(nowKST.getMinutes())}:00`;
    const upcoming = todayEvents.find(e => e.start >= nowTimeStr) || todayEvents[0] || null;

    return res.status(200).json({
      today: todayEvents,
      week: uniqueWeek,
      todayCount: todayEvents.length,
      upcoming,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function toKST(d) { return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Seoul" })); }
function ds(d) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function pad2(n) { return String(n).padStart(2, "0"); }

function getField(block, field) {
  const regex = new RegExp("^" + field + "(?:;[^:]*)?:(.+)$", "m");
  const m = block.match(regex);
  return m ? m[1].trim() : "";
}

function getDateField(block, field) {
  const regex = new RegExp("^" + field + "(?:;[^:]*)?:(\\d{8}(?:T\\d{6}Z?)?)\\s*$", "m");
  const m = block.match(regex);
  if (!m) return "";
  const raw = m[1];
  if (raw.length === 8) return `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T00:00:00`;
  const y = raw.slice(0,4), mo = raw.slice(4,6), d = raw.slice(6,8);
  const h = raw.slice(9,11), mi = raw.slice(11,13), s = raw.slice(13,15);
  if (raw.endsWith("Z")) {
    const utc = new Date(Date.UTC(+y, +mo-1, +d, +h, +mi, +s));
    const kst = new Date(utc.getTime() + 9*60*60*1000);
    return `${kst.getFullYear()}-${pad2(kst.getMonth()+1)}-${pad2(kst.getDate())}T${pad2(kst.getHours())}:${pad2(kst.getMinutes())}:${pad2(kst.getSeconds())}`;
  }
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function cleanText(s) {
  if (!s) return "";
  return s.replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}
