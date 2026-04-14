import { useState, useEffect, useRef, useCallback } from "react";

// ─── Supabase config ───
const SUPABASE_URL = "https://pyfzeyxcwzecjzeuhehn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZnpleXhjd3plY2p6ZXVoZWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDcwMzUsImV4cCI6MjA5MTA4MzAzNX0.4nwLGVT7fufgQjr8CIhtOk6PreRyxz8BNJY8Kn2v_cU";
const hdrs = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

async function sbGet(table, query = "") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: hdrs });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbPost(table, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: hdrs, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbPatch(table, id, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: hdrs, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbDelete(table, id) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: hdrs });
  if (!r.ok) throw new Error(await r.text());
}

const uid = () => Math.random().toString(36).slice(2, 10);
const PALETTE = ["#2563eb", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
const LINK_ICONS = [
  "", "🔗", "📄", "📊", "📁", "📝", "📌", "🎯", "🚀", "💡",
  "📧", "💬", "📅", "🎨", "🛠️", "📈", "🔒", "🌐", "📱", "💻",
  "🏠", "⭐", "🔔", "📋", "🗂️", "📎", "🧩", "⚙️", "🎬", "📸",
];

const LABEL_COLORS = [
  { id: "", name: "없음", bg: "transparent", text: "#9ca3af" },
  { id: "blue", name: "파랑", bg: "#dbeafe", text: "#1e40af" },
  { id: "green", name: "초록", bg: "#dcfce7", text: "#166534" },
  { id: "purple", name: "보라", bg: "#ede9fe", text: "#5b21b6" },
  { id: "orange", name: "주황", bg: "#ffedd5", text: "#9a3412" },
  { id: "red", name: "빨강", bg: "#fee2e2", text: "#991b1b" },
  { id: "pink", name: "핑크", bg: "#fce7f3", text: "#9d174d" },
  { id: "yellow", name: "노랑", bg: "#fef9c3", text: "#854d0e" },
  { id: "teal", name: "청록", bg: "#ccfbf1", text: "#115e59" },
  { id: "gray", name: "회색", bg: "#f3f4f6", text: "#374151" },
];

// ─── Floating Remote (인트라넷 바로가기) ───
const REMOTE_BUTTONS = [
  { id: "attendance", emoji: "⏰", label: "근태 관리", url: "https://hr.smilegate.net/tlm/my-work-status", color: "#2563eb" },
  { id: "meeting", emoji: "🏢", label: "회의실 예약", url: "https://gea.smilegate.net/gea/reservation/meeting-room", color: "#10b981" },
  { id: "salary", emoji: "💰", label: "급여 조회", url: "https://www.ipayview.com/Index.asp?com_code=Q776&emp_no=H33777", color: "#f59e0b" },
  { id: "leave", emoji: "🏖️", label: "휴가 신청", url: "https://hr.smilegate.net/tlm/vacation-submit/submit", color: "#0ea5e9" },
  { id: "overtime", emoji: "🕐", label: "계획외 근무", url: "https://hr.smilegate.net/tlm/work-submit/submit/unplanned-work", color: "#ec4899" },
  { id: "welfare", emoji: "🎁", label: "복지몰", url: "https://clg.smilegate.net/userview/WELFARE_ME_POINT", color: "#8b5cf6" },
];

// ─── Dock Item (바로가기) ───
function DockItem({ emoji, label, url }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 48, height: 48, borderRadius: 12,
          background: hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
          border: hovered ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer", textDecoration: "none",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hovered ? "translateY(-6px) scale(1.1)" : "translateY(0) scale(1)",
          boxShadow: hovered ? "0 8px 24px rgba(255,255,255,0.08)" : "none",
          fontSize: 22,
        }}
      >
        {emoji}
      </a>
      <div style={{
        position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
        padding: "5px 10px", borderRadius: 6,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#fff", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
        pointerEvents: "none",
        transition: "all 0.2s ease",
        opacity: hovered ? 1 : 0,
        marginBottom: hovered ? 0 : -4,
      }}>
        {label}
        <div style={{
          position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%) rotate(45deg)",
          width: 6, height: 6, background: "rgba(0,0,0,0.75)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }} />
      </div>
    </div>
  );
}

function FloatingRemote() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 6,
      position: "sticky", top: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 10, padding: "10px 6px",
        display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ fontSize: 8, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 2, textTransform: "uppercase" }}>바로가기</div>
        {REMOTE_BUTTONS.map(btn => (
          <div key={btn.id} style={{ position: "relative" }}
            onMouseEnter={() => setHovered(btn.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <a href={btn.url} target="_blank" rel="noopener noreferrer"
              className="remote-btn"
              style={{
                width: 40, height: 40, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, textDecoration: "none",
                background: hovered === btn.id ? "#f1f5f9" : "transparent",
                border: "none",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            >
              {btn.emoji}
            </a>
            {/* Tooltip */}
            {hovered === btn.id && (
              <div style={{
                position: "absolute", left: 52, top: "50%", transform: "translateY(-50%)",
                background: "#0f172a", color: "#fff",
                padding: "5px 10px", borderRadius: 6,
                fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                pointerEvents: "none", zIndex: 999,
              }}>
                {btn.label}
                <div style={{
                  position: "absolute", left: -3, top: "50%", transform: "translateY(-50%) rotate(45deg)",
                  width: 6, height: 6, background: "#0f172a",
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Side Panel with file-holder tabs ───
const NEWS_TABS = [
  { id: "llm", label: "LLM 서비스", color: "#2563eb" },
  { id: "ai", label: "AI 최신", color: "#64748b" },
];

function SidePanel() {
  const [activeTab, setActiveTab] = useState("llm");
  const [feed, setFeed] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (tabId, force = false) => {
    if (!force && feed[tabId]?.length) return;
    setLoading(true);
    setError(null);
    try {
      const tabLabel = tabId === "ai" ? "AI 최신" : "LLM 서비스";
      const r = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: tabLabel, force }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "API 오류");
      if (data.news?.length) {
        setFeed(prev => ({ ...prev, [tabId]: data.news }));
      } else {
        throw new Error("뉴스를 찾을 수 없습니다");
      }
    } catch (e) {
      setError(e.message || "뉴스를 불러올 수 없습니다");
    }
    setLoading(false);
  }, [feed]);

  useEffect(() => { fetchFeed(activeTab); }, [activeTab]);

  // Auto-refresh every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setFeed({});
      fetchFeed(activeTab, true);
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const currentFeed = feed[activeTab] || [];
  const activeTabData = NEWS_TABS.find(t => t.id === activeTab);
  const activeColor = activeTabData?.color || "#2563eb";
  const tabTitle = activeTab === "ai" ? "🤖 AI 최신 소식" : "💬 LLM 서비스 뉴스";

  return (
    <div style={{ marginTop: -20 }}>
      {/* File-holder tabs at top */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, paddingLeft: 8 }}>
        {NEWS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="file-holder-tab"
              style={{
                padding: isActive ? "8px 16px 10px" : "6px 14px 8px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderBottom: isActive ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px 10px 0 0",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: isActive ? 12 : 11, fontWeight: 700,
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "all 0.2s",
                position: "relative",
                zIndex: isActive ? 3 : 1,
                marginBottom: -1,
                opacity: isActive ? 1 : 0.7,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel body */}
      <div style={{
        background: "rgba(255,255,255,0.08)", borderRadius: "0 12px 16px 16px",
        border: "1px solid rgba(255,255,255,0.1)",
        height: 580, display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{tabTitle}</h3>
          <button onClick={() => { setFeed(prev => { const n = { ...prev }; delete n[activeTab]; return n; }); fetchFeed(activeTab, true); }}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 13, color: "#fff" }}>🔄</button>
        </div>

        {/* Feed content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
              <div style={S.spinner} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>최신 뉴스를 찾고 있어요...</span>
            </div>
          ) : error ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              <span>{error}</span>
              <button onClick={() => fetchFeed(activeTab, true)}
                style={{ background: "#06b6d4", color: "#000", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>다시 시도</button>
            </div>
          ) : currentFeed.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {currentFeed.map((item, i) => (
                <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="news-item"
                  style={{ display: "flex", gap: 10, padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    background: "#06b6d4",
                    color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</div>
                    {item.summary && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.summary}</div>}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>
                      {item.source && <span>{item.source}</span>}
                      {item.date && <span>{item.source ? " · " : ""}{item.date}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              <span>뉴스가 없습니다</span>
              <button onClick={() => fetchFeed(activeTab, true)}
                style={{ background: "#06b6d4", color: "#000", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>불러오기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Today Schedule (replaces Weather + Calendar Badge) ───
function TodaySchedule() {
  const [cal, setCal] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/calendar");
        const data = await r.json();
        if (data.today) setCal(data);
      } catch {}
    };
    load();
    const t = setInterval(load, 300000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (s) => {
    if (!s) return "";
    const t = s.split("T")[1];
    if (!t || s.endsWith("T00:00:00")) return "종일";
    return `${t.slice(0, 2)}:${t.slice(3, 5)}`;
  };

  const fmtDay = (s) => {
    if (!s) return "";
    const d = new Date(s);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
  };

  const groupByDate = (events) => {
    const groups = {};
    for (const e of events) {
      const date = e.start.split("T")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

  return (
    <>
      <div style={S.scheduleCard}>
        <div style={S.scheduleHeader} onClick={() => setShowPopup(true)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>📅</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>오늘 일정</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>{cal ? `${cal.todayCount}건` : "..."}</span>
          </div>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>상세 →</span>
        </div>

        <div style={S.scheduleList}>
          {!cal ? (
            <div style={{ padding: "16px 0", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>불러오는 중...</div>
          ) : cal.today.length === 0 ? (
            <div style={{ padding: "16px 0", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>예정된 일정 없음</div>
          ) : (
            cal.today.map((e, i) => {
              const isAllDay = e.start.endsWith("T00:00:00");
              return (
                <div key={i} style={S.scheduleItem}>
                  <div style={S.scheduleTime}>{isAllDay ? "종일" : fmtTime(e.start)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                    {e.location && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{e.location}</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showPopup && cal && (
        <div style={S.overlay} onClick={() => setShowPopup(false)}>
          <div style={S.calPopup} onClick={e => e.stopPropagation()}>
            <div style={S.taskPopupHeader}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#e2e8f0" }}>📅 이번 주 일정</h3>
              <button onClick={() => setShowPopup(false)} style={S.taskPopupClose}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 16px" }}>
              {cal.week.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 14 }}>이번 주 일정이 없습니다</div>
              ) : (
                groupByDate(cal.week).map(([date, events]) => (
                  <div key={date} style={{ marginTop: 16 }}>
                    <div style={S.calDateHeader}>
                      <span style={{ color: "#e2e8f0" }}>{fmtDay(date + "T00:00:00")}</span>
                      <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>{events.length}건</span>
                    </div>
                    {events.map((e, i) => {
                      const isAllDay = e.start.endsWith("T00:00:00");
                      return (
                        <div key={i} style={S.calEvent}>
                          <div style={S.calEventTime}>{isAllDay ? "종일" : fmtTime(e.start)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{e.title}</div>
                            {e.location && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{e.location}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Task Banner ───
function getWeekInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
  const diff = Math.floor((now - firstMonday) / (7 * 24 * 60 * 60 * 1000));
  return { year, week: diff + 1 };
}

function TaskBanner({ onOpenPopup }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { year, week } = getWeekInfo();
        const r = await fetch(`https://task-tracker-eta-lovat.vercel.app/api/tasks?week_year=${year}&week_number=${week}&include_carry=true`);
        const tasks = await r.json();
        if (Array.isArray(tasks)) {
          const done = tasks.filter(t => t.status === "done").length;
          const inProgress = tasks.filter(t => t.status === "in_progress").length;
          const waiting = tasks.filter(t => t.status === "todo" || t.status === "pending" || !t.status).length;
          setStats({ total: tasks.length, done, inProgress, waiting });
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 300000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="task-banner" style={S.taskBanner} onClick={() => onOpenPopup && onOpenPopup("task")}>
      <span style={{ fontSize: 14 }}>📋</span>
      <div style={S.taskMarquee}>
        <span style={S.taskMarqueeInner}>
          {stats ? (
            <>
              <span style={{ fontWeight: 600, color: "#e2e8f0" }}>TASK</span>
              <span style={S.taskDivider}>·</span>
              <span style={{ color: "#d97706", fontWeight: 600 }}>진행 {stats.inProgress}</span>
              <span style={S.taskDivider}>·</span>
              <span style={{ color: "#6b7280" }}>대기 {stats.waiting}</span>
              <span style={S.taskDivider}>·</span>
              <span style={{ color: "#059669", fontWeight: 600 }}>완료 {stats.done}</span>
              <span style={S.taskDivider}>·</span>
              <span style={{ color: "#94a3b8" }}>총 {stats.total}건</span>
            </>
          ) : <span style={{ color: "#94a3b8" }}>불러오는 중...</span>}
        </span>
      </div>
      <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>상세 →</span>
    </div>
  );
}

// ─── Todo Banner ───
function getWeekRange(year, week) {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { monday, friday };
}

function getCurrentWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
  const diff = Math.floor((now - firstMonday) / (7 * 24 * 60 * 60 * 1000));
  return { year, week: diff + 1 };
}

function fmtMD(d) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function TodoBanner({ isAdmin, onOpenPopup }) {
  const [todos, setTodos] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [weekYear, setWeekYear] = useState(() => getCurrentWeek().year);
  const [weekNum, setWeekNum] = useState(() => getCurrentWeek().week);

  const { monday, friday } = getWeekRange(weekYear, weekNum);
  const month = monday.getMonth() + 1;
  const monthWeek = Math.ceil((monday.getDate() + (new Date(monday.getFullYear(), monday.getMonth(), 1).getDay() || 7) - 1) / 7);
  const weekLabel = `${weekYear}년 ${month}월 ${monthWeek}주차 (${fmtMD(monday)} ~ ${fmtMD(friday)})`;

  const load = useCallback(async () => {
    try {
      const r = await sbGet("todos", `week_year=eq.${weekYear}&week_number=eq.${weekNum}&order=sort_order.asc,created_at.asc`);
      setTodos(r);
    } catch {}
  }, [weekYear, weekNum]);

  useEffect(() => { load(); }, [load]);

  const totalCount = todos.length;

  const prevWeek = () => {
    if (weekNum <= 1) { setWeekYear(y => y - 1); setWeekNum(52); }
    else setWeekNum(w => w - 1);
  };
  const nextWeek = () => {
    if (weekNum >= 52) { setWeekYear(y => y + 1); setWeekNum(1); }
    else setWeekNum(w => w + 1);
  };
  const goThisWeek = () => {
    const c = getCurrentWeek();
    setWeekYear(c.year); setWeekNum(c.week);
  };

  const addTodo = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      await sbPost("todos", { id: `todo-${uid()}`, text: newText.trim(), done: false, sort_order: todos.length, week_year: weekYear, week_number: weekNum });
      setNewText("");
      await load();
    } catch (e) { alert("추가 실패: " + e.message); }
    setSaving(false);
  };

  const deleteTodo = async (id) => {
    try { await sbDelete("todos", id); setTodos(prev => prev.filter(t => t.id !== id)); } catch {}
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await sbPatch("todos", id, { text: editText.trim() });
      setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editText.trim() } : t));
      setEditId(null);
    } catch {}
  };

  return (
    <>
      <div className="task-banner" style={{ ...S.taskBanner, marginTop: 0 }} onClick={() => onOpenPopup && onOpenPopup()}>
        <span style={{ fontSize: 14 }}>🔔</span>
        <div style={S.taskMarquee}>
          <span style={S.taskMarqueeInner}>
            <span style={{ fontWeight: 600, color: "#e2e8f0" }}>이슈</span>
            <span style={S.taskDivider}>·</span>
            {totalCount > 0 ? (
              <>
                <span style={{ color: "#e2e8f0" }}>{totalCount}건</span>
                <span style={S.taskDivider}>·</span>
                <span style={{ color: "#94a3b8" }}>{weekLabel}</span>
              </>
            ) : (
              <span style={{ color: "#94a3b8" }}>등록된 이슈 없음</span>
            )}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>상세 →</span>
      </div>
    </>
  );
}

// ─── Todo Popup Content (rendered at root level) ───
function TodoPopupContent({ isAdmin, onClose }) {
  const [todos, setTodos] = useState([]);
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [weekYear, setWeekYear] = useState(() => getCurrentWeek().year);
  const [weekNum, setWeekNum] = useState(() => getCurrentWeek().week);

  const { monday, friday } = getWeekRange(weekYear, weekNum);
  const month = monday.getMonth() + 1;
  const monthWeek = Math.ceil((monday.getDate() + (new Date(monday.getFullYear(), monday.getMonth(), 1).getDay() || 7) - 1) / 7);
  const weekLabel = `${weekYear}년 ${month}월 ${monthWeek}주차 (${fmtMD(monday)} ~ ${fmtMD(friday)})`;

  const load = useCallback(async () => {
    try {
      const r = await sbGet("todos", `week_year=eq.${weekYear}&week_number=eq.${weekNum}&order=sort_order.asc,created_at.asc`);
      setTodos(r);
    } catch {}
  }, [weekYear, weekNum]);

  useEffect(() => { load(); }, [load]);

  const totalCount = todos.length;
  const prevWeek = () => { if (weekNum <= 1) { setWeekYear(y => y - 1); setWeekNum(52); } else setWeekNum(w => w - 1); };
  const nextWeek = () => { if (weekNum >= 52) { setWeekYear(y => y + 1); setWeekNum(1); } else setWeekNum(w => w + 1); };
  const goThisWeek = () => { const c = getCurrentWeek(); setWeekYear(c.year); setWeekNum(c.week); };

  const addTodo = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      await sbPost("todos", { id: `todo-${uid()}`, text: newText.trim(), done: false, sort_order: todos.length, week_year: weekYear, week_number: weekNum });
      setNewText("");
      await load();
    } catch (e) { alert("추가 실패: " + e.message); }
    setSaving(false);
  };

  const deleteTodo = async (id) => {
    try { await sbDelete("todos", id); setTodos(prev => prev.filter(t => t.id !== id)); } catch {}
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await sbPatch("todos", id, { text: editText.trim() });
      setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editText.trim() } : t));
      setEditId(null);
    } catch {}
  };

  return (
    <>
      <div style={S.taskPopupHeader}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#fff" }}>🔔 LAM TASK 외 주요 이슈</h3>
        <button onClick={onClose} style={S.taskPopupClose}>✕</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={prevWeek} style={S.weekNavBtn}>◀</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{weekLabel}</span>
        <button onClick={nextWeek} style={S.weekNavBtn}>▶</button>
        <button onClick={goThisWeek} style={S.weekTodayBtn}>이번 주</button>
        <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>{totalCount}건</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
        {todos.map((t, i) => (
          <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
            {editId === t.id ? (
              <input value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit(t.id)} onBlur={() => saveEdit(t.id)} autoFocus style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "inherit", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
            ) : (
              <span style={{ flex: 1, fontSize: 14, color: "#e2e8f0", lineHeight: 1.5 }}>{t.text}</span>
            )}
            {isAdmin && (
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => { setEditId(t.id); setEditText(t.text); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "4px", borderRadius: 4 }}>✏️</button>
                <button onClick={() => deleteTodo(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "4px", borderRadius: 4 }}>🗑️</button>
              </div>
            )}
          </div>
        ))}
        {todos.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>이번 주 등록된 이슈가 없습니다</div>}
      </div>
      {isAdmin && (
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
          <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} placeholder="새 이슈 입력..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "inherit", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
          <button onClick={addTodo} disabled={saving} style={{ background: "#06b6d4", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>추가</button>
        </div>
      )}
    </>
  );
}

// ─── Main ───
export default function TeamLinkHub() {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem("admin") === "true");
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const [quicklinks, setQuicklinks] = useState([]);
  const [qlModal, setQlModal] = useState(null);
  const [movedLinkId, setMovedLinkId] = useState(null);
  const [sidePopup, setSidePopup] = useState(null); // "task" or null
  const formRef = useRef(null);
  const qlFormRef = useRef(null);
  const pwRef = useRef(null);

  const QL_COLORS = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
  const QL_EMOJIS = ["📝", "🧪", "✅", "📋", "🔗", "💡", "🚀", "📊", "🎯", "⚙️", "📁", "🌐"];

  const handleLogin = async () => {
    const pw = pwRef.current?.value;
    if (!pw) return;
    setLoginError("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await r.json();
      if (data.ok) {
        setIsAdmin(true);
        sessionStorage.setItem("admin", "true");
        setShowLogin(false);
      } else {
        setLoginError(data.error || "비밀번호가 틀렸습니다");
      }
    } catch {
      setLoginError("인증 서버 오류");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("admin");
  };

  const fetchAll = useCallback(async () => {
    try {
      const [cats, links, qls] = await Promise.all([
        sbGet("categories", "order=sort_order.asc,created_at.asc"),
        sbGet("links", "order=sort_order.asc,created_at.asc"),
        sbGet("quicklinks", "order=sort_order.asc,created_at.asc"),
      ]);
      const newCats = cats.map(c => ({ ...c, links: links.filter(l => l.category_id === c.id) }));
      setCategories(newCats);
      setQuicklinks(qls);
      setActiveTab(prev => {
        if (prev && newCats.find(c => c.id === prev)) return prev;
        return newCats.length > 0 ? newCats[0].id : null;
      });
    } catch (e) { console.error("Fetch error:", e); }
    setLoaded(true);
  }, []);

  useEffect(() => { fetchAll(); const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, [fetchAll]);

  const allLinks = categories.flatMap(c => c.links.map(l => ({ ...l, catName: c.name, catEmoji: c.emoji, catColor: c.color, catId: c.id })));
  const filtered = search.trim() ? (() => {
    const q = search.toLowerCase();
    return allLinks.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.catName?.toLowerCase().includes(q) ||
      l.label_text?.toLowerCase().includes(q) ||
      l.url?.toLowerCase().includes(q)
    );
  })() : null;

  const moveLink = async (catId, linkId, dir) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const idx = cat.links.findIndex(l => l.id === linkId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= cat.links.length) return;
    const reordered = [...cat.links];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, links: reordered } : c));
    setMovedLinkId(linkId);
    setTimeout(() => setMovedLinkId(null), 600);
    try {
      await Promise.all(reordered.map((l, i) => sbPatch("links", l.id, { sort_order: i })));
    } catch (e) { console.error("Reorder error:", e); await fetchAll(); }
  };

  const moveCat = async (catId, dir) => {
    const idx = categories.findIndex(c => c.id === catId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= categories.length) return;
    const reordered = [...categories];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setCategories(reordered);
    try {
      await Promise.all(reordered.map((c, i) => sbPatch("categories", c.id, { sort_order: i })));
    } catch (e) { console.error("Cat reorder error:", e); await fetchAll(); }
  };

  const handleSubmit = async () => {
    const f = formRef.current; if (!f) return;
    setSaving(true);
    try {
      if (modal.type === "link") {
        const title = f.querySelector('[name="title"]').value.trim();
        const url = f.querySelector('[name="url"]').value.trim();
        const desc = f.querySelector('[name="desc"]').value.trim();
        const iconEl = f.querySelector('[name="icon"]:checked');
        const icon = iconEl ? iconEl.value : "";
        const labelText = f.querySelector('[name="label_text"]').value.trim();
        const labelColorEl = f.querySelector('[name="label_color"]:checked');
        const labelColor = labelColorEl ? labelColorEl.value : "";
        if (!title || !url) { setSaving(false); return; }
        const fullUrl = url.startsWith("http") ? url : `https://${url}`;
        if (modal.item) {
          await sbPatch("links", modal.item.id, { title, url: fullUrl, description: desc, icon, label_text: labelText, label_color: labelColor });
        } else {
          const cat = categories.find(c => c.id === modal.catId);
          await sbPost("links", { id: `l-${uid()}`, category_id: modal.catId, title, url: fullUrl, description: desc, icon, label_text: labelText, label_color: labelColor, sort_order: cat ? cat.links.length : 0 });
        }
      } else {
        const name = f.querySelector('[name="catname"]').value.trim();
        const emoji = f.querySelector('[name="emoji"]').value.trim() || "📁";
        const colorEl = f.querySelector('[name="color"]:checked');
        const color = colorEl ? colorEl.value : PALETTE[categories.length % PALETTE.length];
        if (!name) { setSaving(false); return; }
        if (modal.item) {
          await sbPatch("categories", modal.item.id, { name, emoji, color });
        } else {
          await sbPost("categories", { id: `cat-${uid()}`, name, emoji, color, sort_order: categories.length });
        }
      }
      await fetchAll();
      setModal(null);
    } catch (e) { console.error("Save error:", e); alert("저장 실패: " + e.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      if (deleteConfirm.type === "link") await sbDelete("links", deleteConfirm.id);
      else await sbDelete("categories", deleteConfirm.id);
      await fetchAll(); setDeleteConfirm(null);
    } catch (e) { console.error("Delete error:", e); alert("삭제 실패: " + e.message); }
    setSaving(false);
  };

  const handleQlSave = async () => {
    const f = qlFormRef.current; if (!f) return;
    setSaving(true);
    try {
      const title = f.querySelector('[name="ql_title"]').value.trim();
      const url = f.querySelector('[name="ql_url"]').value.trim();
      const emoji = f.querySelector('[name="ql_emoji"]:checked')?.value || "🔗";
      const color = f.querySelector('[name="ql_color"]:checked')?.value || "#2563eb";
      const fullUrl = url && !url.startsWith("http") ? `https://${url}` : url;
      await sbPatch("quicklinks", qlModal.id, { title, url: fullUrl, emoji, color });
      await fetchAll();
      setQlModal(null);
    } catch (e) { console.error("QL save error:", e); alert("저장 실패: " + e.message); }
    setSaving(false);
  };

  const handleQlClear = async (id) => {
    setSaving(true);
    try {
      await sbPatch("quicklinks", id, { title: "", url: "", emoji: "🔗", color: "#2563eb" });
      await fetchAll();
    } catch (e) { console.error("QL clear error:", e); }
    setSaving(false);
  };

  const weekday = ["일","월","화","수","목","금","토"][now.getDay()];
  const hour = now.getHours();
  const greeting = hour < 6 ? "좋은 밤이에요" : hour < 12 ? "좋은 아침이에요" : hour < 18 ? "좋은 오후예요" : hour < 23 ? "좋은 저녁이에요" : "좋은 밤이에요";

  // 시간대별 컬러 테마
  const timeTheme = hour < 12
    ? { // 아침: 따뜻한 앰버/골드
        textGrad: "linear-gradient(to right, #fcd34d, rgba(255,255,255,0.9), #fdba74)",
        accent: "#f59e0b",
        shapes: [
          { w: 600, h: 160, rot: 12, color: "rgba(245,158,11,0.45)", x: "-8%", y: "15%" },
          { w: 500, h: 130, rot: -15, color: "rgba(251,146,60,0.35)", x: "60%", y: "65%" },
          { w: 350, h: 100, rot: -8, color: "rgba(217,119,6,0.3)", x: "5%", y: "75%" },
          { w: 220, h: 70, rot: 20, color: "rgba(252,211,77,0.3)", x: "70%", y: "10%" },
          { w: 160, h: 50, rot: -22, color: "rgba(253,186,116,0.25)", x: "25%", y: "5%" },
        ],
        bgGrad: "radial-gradient(ellipse at 30% 40%, rgba(245,158,11,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(251,146,60,0.1) 0%, transparent 50%)",
      }
    : hour < 18
    ? { // 오후: 그린/라임 + 로즈/퍼플핑크
        textGrad: "linear-gradient(to right, #86efac, rgba(255,255,255,0.9), #f9a8d4)",
        accent: "#10b981",
        shapes: [
          { w: 600, h: 160, rot: 12, color: "rgba(16,185,129,0.45)", x: "-8%", y: "15%" },
          { w: 500, h: 130, rot: -15, color: "rgba(225,29,72,0.35)", x: "60%", y: "65%" },
          { w: 350, h: 100, rot: -8, color: "rgba(168,85,247,0.3)", x: "5%", y: "75%" },
          { w: 220, h: 70, rot: 20, color: "rgba(132,204,22,0.3)", x: "70%", y: "10%" },
          { w: 160, h: 50, rot: -22, color: "rgba(244,114,182,0.25)", x: "25%", y: "5%" },
        ],
        bgGrad: "radial-gradient(ellipse at 30% 40%, rgba(16,185,129,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(225,29,72,0.1) 0%, transparent 50%)",
      }
    : { // 저녁: 딥 퍼플/시안
        textGrad: "linear-gradient(to right, #c4b5fd, rgba(255,255,255,0.9), #67e8f9)",
        accent: "#7c3aed",
        shapes: [
          { w: 600, h: 160, rot: 12, color: "rgba(124,58,237,0.45)", x: "-8%", y: "15%" },
          { w: 500, h: 130, rot: -15, color: "rgba(8,145,178,0.35)", x: "60%", y: "65%" },
          { w: 350, h: 100, rot: -8, color: "rgba(99,102,241,0.3)", x: "5%", y: "75%" },
          { w: 220, h: 70, rot: 20, color: "rgba(6,182,212,0.3)", x: "70%", y: "10%" },
          { w: 160, h: 50, rot: -22, color: "rgba(196,181,253,0.25)", x: "25%", y: "5%" },
        ],
        bgGrad: "radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(8,145,178,0.1) 0%, transparent 50%)",
      };

  if (!loaded) return (
    <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <p style={{ color: "#6b7280", fontSize: 15 }}>데이터 불러오는 중...</p>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* Animated geometric background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#0a0a12", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: timeTheme.bgGrad }} />
        {timeTheme.shapes.map((s, i) => (
          <div
            key={i}
            className="elegant-shape"
            style={{
              position: "absolute", left: s.x, top: s.y,
              animationDelay: `${0.3 + i * 0.15}s`,
              "--rot": `${s.rot}deg`,
              "--rot-from": `${s.rot - 15}deg`,
              "--float-dur": `${12 + i * 2}s`,
            }}
          >
            <div className="elegant-float" style={{ width: s.w, height: s.h, position: "relative" }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: 9999,
                background: `linear-gradient(to right, ${s.color}, transparent)`,
                backdropFilter: "blur(2px)",
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 8px 40px rgba(255,255,255,0.1)",
              }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 9999,
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25), transparent 70%)",
                }} />
              </div>
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,18,0.4) 0%, transparent 20%, transparent 80%, rgba(10,10,18,0.5) 100%)", pointerEvents: "none" }} />
      </div>

      {/* TOP: Full-width header */}
      <header className="fade-in-down" style={S.topHeader}>
        <div style={S.topHeaderInner}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={S.heroBadge}>
              <span style={{ fontSize: 12 }}>✦</span> 선행AI팀 워크스페이스
            </div>
            <h1 style={S.heroTitle}>
              <span style={{
                fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-0.03em",
                background: timeTheme.textGrad,
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>{greeting}</span>
            </h1>
          </div>
          <p style={{ ...S.heroDate, fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>
            {now.getFullYear()}.{String(now.getMonth()+1).padStart(2,"0")}.{String(now.getDate()).padStart(2,"0")} ({weekday}) {String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}
          </p>
        </div>
      </header>

      {/* BELOW: Sidebar + Content */}
      <div style={S.pageGrid}>
        {/* LEFT SIDEBAR */}
        <aside className="fade-in-left" style={S.sidebar}>
          {/* Schedule */}
          <div className="glass-card" style={S.glassCard}>
            <div style={S.glassCardLabel}>📅 오늘 일정</div>
            <TodaySchedule />
          </div>

          {/* Search */}
          <div style={S.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input style={S.searchInput} placeholder="링크 검색..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button style={S.clearBtn} onClick={() => setSearch("")}>✕</button>}
          </div>

          {/* Task */}
          <div style={S.glassBar}>
            <TaskBanner onOpenPopup={() => setSidePopup("task")} />
          </div>

          {/* Issue */}
          <div style={S.glassBar}>
            <TodoBanner isAdmin={isAdmin} onOpenPopup={() => setSidePopup("todo")} />
          </div>

          {/* Dock 바로가기 */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>바로가기</div>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 10, padding: "14px 16px",
              borderRadius: 16,
              background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {REMOTE_BUTTONS.map(btn => (
                <DockItem key={btn.id} emoji={btn.emoji} label={btn.label} url={btn.url} />
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <div style={S.contentArea}>
          {/* Stats + Admin */}
          <div style={S.statsStrip}>
            <div style={S.statItem}><span style={S.statNum}>{categories.length}</span><span style={S.statLabel}>카테고리</span></div>
            <div style={S.statDivider} />
            <div style={S.statItem}><span style={S.statNum}>{allLinks.length}</span><span style={S.statLabel}>전체 링크</span></div>
            <div style={{ flex: 1 }} />
            <button style={S.refreshBtn} onClick={fetchAll} title="새로고침">🔄</button>
            {isAdmin ? (
              <>
                <button style={S.addCatBtn} onClick={() => setModal({ type: "category" })}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> 카테고리 추가
                </button>
                <button style={S.logoutBtn} onClick={handleLogout} title="관리자 로그아웃">🔓 관리자</button>
              </>
            ) : (
              <button style={S.loginBtn} onClick={() => setShowLogin(true)} title="관리자 로그인">🔒 관리자</button>
            )}
          </div>

          {/* Categories + News side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start", marginTop: 35 }}>
            {/* Left: Categories */}
            <main style={S.mainCol}>
              {filtered !== null ? (
                <div>
                  <p style={S.searchLabel}>"{search}" 검색 결과 <strong>{filtered.length}</strong>건</p>
                  {filtered.length === 0 ? <div style={S.emptyState}>검색 결과가 없습니다</div> : (
                    <div style={S.listWrap}>{filtered.map(l => <LinkCard key={l.id} link={l} color={l.catColor} badge={`${l.catEmoji} ${l.catName}`} isAdmin={isAdmin} onEdit={() => { setSearch(""); setModal({ type: "link", catId: l.catId, item: l }); }} onDelete={() => setDeleteConfirm({ type: "link", id: l.id, title: l.title })} />)}</div>
                  )}
                </div>
              ) : (
                <>
                  <div style={S.catTabBar}>
                    <div style={S.catTabList}>
                      {categories.map((cat, idx) => {
                        const isActive = activeTab === cat.id;
                        return (
                          <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {isAdmin && idx > 0 && <button style={S.catMoveBtn} onClick={() => moveCat(cat.id, -1)} title="왼쪽으로">◀</button>}
                            <button
                              onClick={() => setActiveTab(cat.id)}
                              style={{ ...S.catPill, ...(isActive ? { background: cat.color || "#06b6d4", color: "#fff", borderColor: cat.color || "#06b6d4" } : {}) }}
                            >
                              {cat.name}
                              {isAdmin && isActive && (
                                <span style={S.catTabActions} onClick={e => e.stopPropagation()}>
                                  <button className="tab-action-pill" onClick={() => setModal({ type: "category", item: cat })} title="수정">✏️</button>
                                  <button className="tab-action-pill" onClick={() => setDeleteConfirm({ type: "category", id: cat.id, title: cat.name })} title="삭제">🗑️</button>
                                </span>
                              )}
                            </button>
                            {isAdmin && idx < categories.length - 1 && <button style={S.catMoveBtn} onClick={() => moveCat(cat.id, 1)} title="오른쪽으로">▶</button>}
                          </div>
                        );
                      })}
                      {isAdmin && <button style={S.catPillAdd} onClick={() => setModal({ type: "category" })}>+</button>}
                    </div>
                  </div>

                  <div style={S.catContentBox}>
                    {(() => {
                      const cat = categories.find(c => c.id === activeTab);
                      if (!cat) return categories.length === 0 ? (
                        <div style={S.emptyState}><div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div><p style={{ fontWeight: 600 }}>카테고리를 추가해서 시작하세요</p></div>
                      ) : null;
                      return (
                        <div style={S.catBody}>
                          {cat.links.map((l, idx) => (
                            <LinkCard key={l.id} link={l} color={cat.color}
                              isAdmin={isAdmin}
                              isMoved={movedLinkId === l.id}
                              onEdit={() => setModal({ type: "link", catId: cat.id, item: l })}
                              onDelete={() => setDeleteConfirm({ type: "link", id: l.id, title: l.title })}
                              onMoveUp={idx > 0 ? () => moveLink(cat.id, l.id, -1) : null}
                              onMoveDown={idx < cat.links.length - 1 ? () => moveLink(cat.id, l.id, 1) : null}
                            />
                          ))}
                          {cat.links.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>링크를 추가해보세요</div>}
                          {isAdmin && <button style={{ ...S.addLinkRow, borderColor: `${cat.color}33`, color: cat.color }} onClick={() => setModal({ type: "link", catId: cat.id })}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> 링크 추가
                          </button>}
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ ...S.quickLinks, marginTop: 12 }}>
                    {quicklinks.map(ql => ql.title ? (
                      <div key={ql.id} style={{ position: "relative" }}>
                        <a href={ql.url} target="_blank" rel="noopener noreferrer" className="quick-link" style={{ ...S.quickLink, borderLeft: `3px solid ${ql.color}` }}>
                          <span style={{ fontSize: 18 }}>{ql.emoji}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", flex: 1 }}>{ql.title}</span>
                          <svg style={{ flexShrink: 0, opacity: 0.3 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ql.color} strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                        </a>
                        {isAdmin && <div className="ql-actions" style={S.qlActions}>
                          <button className="ql-btn" onClick={() => setQlModal(ql)}>✏️</button>
                          <button className="ql-btn" onClick={() => handleQlClear(ql.id)}>✕</button>
                        </div>}
                      </div>
                    ) : (
                      <button key={ql.id} onClick={() => isAdmin ? setQlModal(ql) : null} style={S.quickLinkEmpty}>
                        <span style={{ fontSize: 16, opacity: 0.4 }}>+</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{isAdmin ? "바로가기 추가" : "빈 슬롯"}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </main>

            {/* Right: News */}
            <aside style={{ position: "sticky", top: 20 }}>
              <SidePanel />
            </aside>
          </div>
        </div>
      </div>

      {/* Task side popup - rendered at root level to escape stacking context */}
      {sidePopup === "task" && (
        <div style={S.sidePopupOverlay} onClick={() => setSidePopup(null)}>
          <div style={S.sidePopup} onClick={e => e.stopPropagation()}>
            <div style={S.taskPopupHeader}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#fff" }}>📋 LAM TASK 현황</h3>
              <button onClick={() => setSidePopup(null)} style={S.taskPopupClose}>✕</button>
            </div>
            <iframe
              src="https://task-tracker-eta-lovat.vercel.app/widget2"
              style={S.taskIframe}
              title="Task Widget"
            />
          </div>
        </div>
      )}

      {sidePopup === "todo" && (
        <div style={S.sidePopupOverlay} onClick={() => setSidePopup(null)}>
          <div style={S.sidePopup} onClick={e => e.stopPropagation()}>
            <TodoPopupContent isAdmin={isAdmin} onClose={() => setSidePopup(null)} />
          </div>
        </div>
      )}

      {modal && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>{modal.type === "link" ? (modal.item ? "링크 수정" : "새 링크 추가") : (modal.item ? "카테고리 수정" : "새 카테고리 추가")}</h3>
            <div ref={formRef} style={S.form}>
              {modal.type === "link" ? (
                <>
                  <label style={S.label}>아이콘
                    <div style={S.iconGrid}>
                      {LINK_ICONS.map((ic, i) => (
                        <label key={i} style={S.iconLabel}>
                          <input type="radio" name="icon" value={ic} defaultChecked={ic === (modal.item?.icon || "")} style={{ display: "none" }} />
                          <div className="icon-dot">{ic || <span style={{ fontSize: 11, color: "#9ca3af" }}>없음</span>}</div>
                        </label>
                      ))}
                    </div>
                  </label>
                  <label style={S.label}>제목 <input name="title" style={S.input} defaultValue={modal.item?.title || ""} placeholder="예: Jira Board" /></label>
                  <label style={S.label}>URL <input name="url" style={S.input} defaultValue={modal.item?.url || ""} placeholder="https://..." /></label>
                  <label style={S.label}>설명 (선택) <input name="desc" style={S.input} defaultValue={modal.item?.description || ""} placeholder="간단한 설명" /></label>
                  <label style={S.label}>컬러 라벨 (선택)
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <input name="label_text" style={{ ...S.input, flex: 1, fontSize: 13 }} defaultValue={modal.item?.label_text || ""} placeholder="예: wiki, API, 공유문서" />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {LABEL_COLORS.map(lc => (
                        <label key={lc.id} style={{ cursor: "pointer" }}>
                          <input type="radio" name="label_color" value={lc.id} defaultChecked={lc.id === (modal.item?.label_color || "")} style={{ display: "none" }} />
                          <div className="label-color-dot" style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: lc.bg, color: lc.text, border: "2px solid transparent", transition: "border 0.15s" }}>
                            {lc.name}
                          </div>
                        </label>
                      ))}
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label style={S.label}>이모지 <input name="emoji" style={S.input} defaultValue={modal.item?.emoji || ""} placeholder="📁" /></label>
                  <label style={S.label}>카테고리 이름 <input name="catname" style={S.input} defaultValue={modal.item?.name || ""} placeholder="예: 프로젝트 관리" /></label>
                  <label style={S.label}>테마 색상
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      {PALETTE.map(c => <label key={c} style={{ cursor: "pointer" }}><input type="radio" name="color" value={c} defaultChecked={c === (modal.item?.color || PALETTE[categories.length % PALETTE.length])} style={{ display: "none" }} /><div className="color-dot" style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "3px solid transparent", transition: "border 0.15s" }} /></label>)}
                    </div>
                  </label>
                </>
              )}
            </div>
            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={() => setModal(null)}>취소</button>
              <button style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>{saving ? "저장 중..." : "저장"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={S.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>삭제 확인</h3>
            <p style={{ margin: "8px 0 24px", lineHeight: 1.6 }}>
              <strong>"{deleteConfirm.title}"</strong>을(를) 삭제할까요?
              {deleteConfirm.type === "category" && <><br /><span style={{ color: "#ef4444", fontSize: 13 }}>카테고리 내 모든 링크도 함께 삭제됩니다.</span></>}
            </p>
            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={() => setDeleteConfirm(null)}>취소</button>
              <button style={{ ...S.saveBtn, background: "#ef4444", opacity: saving ? 0.6 : 1 }} onClick={handleDelete} disabled={saving}>{saving ? "삭제 중..." : "삭제"}</button>
            </div>
          </div>
        </div>
      )}

      {qlModal && (
        <div style={S.overlay} onClick={() => setQlModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>⚡ 바로가기 {qlModal.title ? "수정" : "추가"}</h3>
            <div ref={qlFormRef} style={S.form}>
              <label style={S.label}>이모지
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {QL_EMOJIS.map(em => (
                    <label key={em} style={{ cursor: "pointer" }}>
                      <input type="radio" name="ql_emoji" value={em} defaultChecked={em === (qlModal.emoji || "🔗")} style={{ display: "none" }} />
                      <div className="icon-dot" style={{ width: 32, height: 32, fontSize: 16 }}>{em}</div>
                    </label>
                  ))}
                </div>
              </label>
              <label style={S.label}>컬러
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {QL_COLORS.map(c => (
                    <label key={c} style={{ cursor: "pointer" }}>
                      <input type="radio" name="ql_color" value={c} defaultChecked={c === (qlModal.color || "#2563eb")} style={{ display: "none" }} />
                      <div className="color-dot" style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "3px solid transparent", transition: "border 0.15s" }} />
                    </label>
                  ))}
                </div>
              </label>
              <label style={S.label}>제목 <input name="ql_title" style={S.input} defaultValue={qlModal.title || ""} placeholder="예: 선행AI팀 회의록" /></label>
              <label style={S.label}>URL <input name="ql_url" style={S.input} defaultValue={qlModal.url || ""} placeholder="https://..." /></label>
            </div>
            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={() => setQlModal(null)}>취소</button>
              <button style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={handleQlSave} disabled={saving}>{saving ? "저장 중..." : "저장"}</button>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <div style={S.overlay} onClick={() => setShowLogin(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>🔒 관리자 로그인</h3>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>수정/삭제 권한을 위해 비밀번호를 입력하세요</p>
            <input ref={pwRef} type="password" style={S.input} placeholder="비밀번호 입력" onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus />
            {loginError && <p style={{ fontSize: 13, color: "#ef4444", marginTop: 8 }}>{loginError}</p>}
            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={() => setShowLogin(false)}>취소</button>
              <button style={S.saveBtn} onClick={handleLogin}>로그인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LinkCard({ link, color, badge, isAdmin, isMoved, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const domain = (() => { try { return new URL(link.url).hostname.replace("www.", ""); } catch { return ""; } })();
  const hasIcon = link.icon && link.icon.trim();
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={`link-row ${isMoved ? "link-moved" : ""}`} style={S.linkRow}>
      <div style={{ ...S.linkIcon, background: `${color}12`, color }}>
        {hasIcon ? (
          <span style={{ fontSize: 22, lineHeight: 1 }}>{link.icon}</span>
        ) : (
          <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" style={{ width: 22, height: 22, borderRadius: 4 }} onError={e => { e.target.style.display = "none"; e.target.parentElement.textContent = "🔗"; }} />
        )}
      </div>
      <div style={S.linkInfo}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {link.label_text && link.label_color && (() => {
            const lc = LABEL_COLORS.find(c => c.id === link.label_color);
            return lc ? <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: lc.bg, color: lc.text, flexShrink: 0 }}>{link.label_text}</span> : null;
          })()}
          <span style={S.linkTitle}>{link.title}</span>
        </div>
        <span style={S.linkDesc}>{link.description || domain}</span>
      </div>
      {badge && <span style={{ ...S.linkBadge, background: `${color}12`, color }}>{badge}</span>}
      {isAdmin && <div style={S.linkActions} onClick={e => e.preventDefault()}>
        {onMoveUp && <button className="link-action" onClick={onMoveUp} title="위로">▲</button>}
        {onMoveDown && <button className="link-action" onClick={onMoveDown} title="아래로">▼</button>}
        <button className="link-action" onClick={onEdit}>✏️</button>
        <button className="link-action" onClick={onDelete}>🗑️</button>
      </div>}
      <svg style={{ flexShrink: 0, opacity: 0.3 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
    </a>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* Elegant floating shapes */
  .elegant-shape {
    opacity: 0;
    transform: translateY(-120px) rotate(var(--rot-from, 0deg));
    animation: shapeEnter 2.4s cubic-bezier(0.23, 0.86, 0.39, 0.96) forwards;
    animation-delay: var(--delay, 0.3s);
  }
  @keyframes shapeEnter {
    0% { opacity: 0; transform: translateY(-120px) rotate(var(--rot-from, 0deg)); }
    50% { opacity: 1; }
    100% { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); }
  }
  .elegant-float {
    animation: shapeFloat var(--float-dur, 12s) ease-in-out infinite;
  }
  @keyframes shapeFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(15px); }
  }
  .fade-in-down { animation: fadeInDown 0.6s ease-out 0.2s both; }
  @keyframes fadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in-left { animation: fadeInLeft 0.5s ease-out 0.4s both; }
  @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }

  /* Animated mesh gradient */
  .hero-gradient {
    position: absolute; inset: 0; z-index: 1;
    background: 
      radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(6,182,212,0.1) 0%, transparent 50%);
    animation: meshMove 12s ease-in-out infinite alternate;
  }
  .hero-gradient-2 {
    position: absolute; inset: 0; z-index: 2; opacity: 0.4;
    background: 
      radial-gradient(ellipse at 60% 30%, rgba(255,255,255,0.05) 0%, transparent 40%),
      radial-gradient(ellipse at 30% 70%, rgba(6,182,212,0.08) 0%, transparent 40%);
    animation: meshMove2 16s ease-in-out infinite alternate;
  }
  @keyframes meshMove {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-20px, 10px) scale(1.05); }
    100% { transform: translate(10px, -15px) scale(1.02); }
  }
  @keyframes meshMove2 {
    0% { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(15px, -10px) rotate(2deg); }
  }

  /* Gradient text */
  .hero-title-gradient {
    background: linear-gradient(to right, #a5b4fc, rgba(255,255,255,0.9), #fda4af);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 6s ease-in-out infinite;
  }
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Glass card hover */
  .glass-card { transition: all 0.2s ease; }
  .glass-card:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.15) !important; }

  /* Shortcut chips */
  .shortcut-chip { transition: all 0.2s ease; }
  .shortcut-chip:hover { background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.2) !important; color: #fff !important; }

  /* Fade-in animation */
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .hero-gradient { animation: meshMove 12s ease-in-out infinite alternate; }

  /* Links */
  .link-row { text-decoration: none; color: inherit; transition: background 0.1s; }
  .link-row:hover { background: rgba(255,255,255,0.04) !important; }
  .link-action { background: none; border: none; cursor: pointer; font-size: 12px; padding: 3px 5px; border-radius: 4px; opacity: 0; transition: opacity 0.1s; }
  .link-row:hover .link-action { opacity: 1; }
  .link-action:hover { background: rgba(255,255,255,0.08); }

  .cat-action, .cat-action-light { background: none; border: none; cursor: pointer; font-size: 12px; padding: 3px 5px; border-radius: 4px; opacity: 0; transition: opacity 0.1s; color: rgba(255,255,255,0.5); }
  .cat-action:hover, .cat-action-light:hover { background: rgba(255,255,255,0.08); }
  .cat-card:hover .cat-action, .cat-card:hover .cat-action-light { opacity: 1; }

  .quick-link { text-decoration: none; transition: background 0.15s; }
  .quick-link:hover { background: rgba(255,255,255,0.06) !important; }

  .tab-action-pill { background: none; border: none; cursor: pointer; font-size: 10px; padding: 2px 3px; border-radius: 3px; opacity: 0.5; transition: opacity 0.1s; }
  .tab-action-pill:hover { opacity: 1; background: rgba(255,255,255,0.1); }

  input:focus { outline: none; border-color: #06b6d4 !important; box-shadow: 0 0 0 2px rgba(6,182,212,0.2) !important; }
  input[type="radio"]:checked + .color-dot { border-color: #06b6d4 !important; }
  .icon-dot {
    width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); transition: border-color 0.1s; background: rgba(255,255,255,0.05);
  }
  .icon-dot:hover { border-color: #06b6d4; background: rgba(6,182,212,0.1); }
  input[type="radio"]:checked + .icon-dot { border-color: #06b6d4; background: rgba(6,182,212,0.1); }
  input[type="radio"]:checked + .label-color-dot { border-color: #06b6d4 !important; }
  .label-color-dot:hover { opacity: 0.8; }

  .news-item { text-decoration: none; color: inherit; transition: background 0.1s; }
  .news-item:hover { background: rgba(255,255,255,0.04) !important; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes sidePopupIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes linkFlash { 0% { background: rgba(6,182,212,0.1); } 100% { background: transparent; } }
  .link-moved { animation: linkFlash 0.5s ease-out; }

  .task-banner { cursor: pointer; }
  .ql-actions { position: absolute; top: 3px; right: 3px; display: flex; gap: 2px; opacity: 0; transition: opacity 0.1s; }
  .ql-actions .ql-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer; font-size: 10px; padding: 2px 4px; color: #fff; }
  div:hover > .ql-actions { opacity: 1; }

  .file-holder-tab { outline: none; }
  .file-holder-tab:hover { opacity: 0.8; }
`;

const S = {
  root: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "transparent", minHeight: "100vh", color: "#e2e8f0", position: "relative" },

  // Hero - dark shader style
  topHeader: { position: "relative", zIndex: 1, padding: "32px 40px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", height: 200, display: "flex", alignItems: "flex-end" },
  topHeaderInner: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", gap: 40 },
  pageGrid: { display: "grid", gridTemplateColumns: "500px 1fr", position: "relative", zIndex: 1, minHeight: "calc(100vh - 200px)" },
  sidebar: { position: "sticky", top: 0, height: "calc(100vh - 200px)", overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 10, background: "rgba(0,0,0,0.45)", borderRight: "1px solid rgba(255,255,255,0.06)" },
  contentArea: { padding: "20px 28px 64px", minWidth: 0 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 24, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.8)", letterSpacing: "0.02em" },
  heroTitle: { fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", color: "#fff", margin: 0, lineHeight: 1.05 },
  heroDate: { fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)", margin: 0 },
  heroCards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", maxWidth: 700, marginTop: 8 },
  glassCard: { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" },
  glassCardLabel: { fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 },
  heroShortcuts: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-start", marginTop: 4 },
  shortcutChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "all 0.2s", cursor: "pointer" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 16px", border: "1px solid rgba(255,255,255,0.1)", width: "100%" },
  glassBar: { background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 16px", border: "1px solid rgba(255,255,255,0.1)" },
  searchInput: { border: "none", background: "transparent", fontSize: 14, flex: 1, outline: "none", fontFamily: "inherit", color: "#fff" },
  clearBtn: { background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 3 },

  // Task banners - dark glass
  taskBanner: { display: "flex", alignItems: "center", gap: 8, padding: 0, background: "transparent", border: "none", color: "#fff", cursor: "pointer" },
  taskMarquee: { flex: 1, overflow: "hidden" },
  taskMarqueeInner: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" },
  taskDivider: { color: "rgba(255,255,255,0.2)" },

  // Popups
  taskPopup: { background: "#111118", borderRadius: 16, width: "90%", maxWidth: 700, height: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" },
  taskPopupHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  taskPopupClose: { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 4 },
  taskIframe: { flex: 1, width: "100%", border: "none" },
  calPopup: { background: "#111118", borderRadius: 16, width: "90%", maxWidth: 520, height: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" },
  calDateHeader: { fontSize: 13, fontWeight: 600, color: "#fff", padding: "8px 0 4px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 },
  calEvent: { display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  calEventTime: { fontSize: 12, fontWeight: 600, color: "#06b6d4", minWidth: 44, flexShrink: 0 },
  todoPopup: { background: "#111118", borderRadius: 16, width: "90%", maxWidth: 520, height: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" },
  weekNavBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "inherit" },
  weekTodayBtn: { background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#06b6d4", fontFamily: "inherit" },

  // Schedule card (inside glass card)
  scheduleCard: { background: "transparent", borderRadius: 0, border: "none", overflow: "hidden" },
  scheduleHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0, cursor: "pointer" },
  scheduleList: { padding: "4px 0", maxHeight: 220, overflowY: "auto" },
  scheduleItem: { display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" },
  scheduleTime: { fontSize: 11, fontWeight: 600, color: "#06b6d4", minWidth: 32, flexShrink: 0, marginTop: 1 },

  // Main layout - dark
  mainCol: { minWidth: 0 },

  // Stats strip
  statsStrip: { display: "flex", alignItems: "center", gap: 20, padding: "14px 20px", background: "rgba(255,255,255,0.08)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", position: "relative", zIndex: 2 },
  statItem: { display: "flex", alignItems: "baseline", gap: 6 },
  statNum: { fontSize: 18, fontWeight: 700, color: "#fff" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 },
  statDivider: { width: 1, height: 20, background: "rgba(255,255,255,0.08)" },
  refreshBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: "#fff", transition: "background 0.15s" },
  addCatBtn: { display: "flex", alignItems: "center", gap: 6, background: "#06b6d4", color: "#000", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  searchLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12 },
  emptyState: { textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)" },
  listWrap: { background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, border: "1px solid rgba(255,255,255,0.1)" },

  // Quick links
  quickLinks: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 },
  quickLink: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(255,255,255,0.08)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" },
  quickLinkEmpty: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 14px", background: "transparent", borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "inherit", width: "100%", transition: "border-color 0.15s" },
  qlActions: { position: "absolute", top: 4, right: 4, display: "flex", gap: 2 },

  // Category tabs
  catTabBar: { marginBottom: 0, overflowX: "auto" },
  catTabList: { display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", padding: "12px 16px", background: "rgba(255,255,255,0.08)", borderRadius: "12px 12px 0 0", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none" },
  catPill: { display: "flex", alignItems: "center", gap: 4, padding: "5px 14px", background: "transparent", border: "1px solid transparent", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "rgba(255,255,255,0.5)", transition: "all 0.15s", whiteSpace: "nowrap" },
  catPillAdd: { width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "rgba(255,255,255,0.3)", transition: "all 0.15s" },
  catMoveBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "rgba(255,255,255,0.3)", padding: "2px", opacity: 0.5, transition: "opacity 0.15s" },
  catTabActions: { display: "inline-flex", gap: 2, marginLeft: 4 },

  catGrid: { display: "flex", flexDirection: "column", gap: 16 },
  catCard: { background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  catContentBox: { background: "rgba(255,255,255,0.06)", borderRadius: "0 0 12px 12px", minHeight: 400, maxHeight: 480, overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.06)" },
  catActions: { display: "flex", gap: 4 },
  catBody: { padding: 6, display: "flex", flexDirection: "column", gap: 1 },

  // Link cards
  linkRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, cursor: "pointer" },
  linkIcon: { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 },
  linkInfo: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  linkTitle: { fontWeight: 500, fontSize: 13, color: "#e2e8f0" },
  linkDesc: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  linkBadge: { fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 8px", flexShrink: 0 },
  linkActions: { display: "flex", gap: 2, flexShrink: 0 },
  addLinkRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", margin: "4px 6px 6px", borderRadius: 10, border: "1.5px dashed", background: "transparent", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", opacity: 0.4, transition: "opacity 0.15s" },

  // News panel
  newsPanel: { background: "rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" },
  newsPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px" },
  newsPanelTitle: { fontSize: 14, fontWeight: 600, color: "#1a1a2e" },
  newsRefresh: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 7px", cursor: "pointer", fontSize: 13, color: "#4a5568" },
  newsTabs: { display: "flex", gap: 4, padding: "0 16px 10px" },
  newsTab: { background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#4a5568", transition: "all 0.15s" },
  newsTabActive: { background: "#06b6d4", color: "#000" },
  newsContent: { borderTop: "1px solid rgba(255,255,255,0.04)" },
  newsLoading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 16px" },
  spinner: { width: 24, height: 24, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#06b6d4", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  newsError: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px", fontSize: 12, color: "#64748b" },
  newsList: { display: "flex", flexDirection: "column" },
  newsItem: { display: "flex", gap: 10, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" },
  newsRank: { width: 20, height: 20, borderRadius: 4, background: "#06b6d4", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 },
  newsItemContent: { flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  newsItemTitle: { fontSize: 12, fontWeight: 500, lineHeight: 1.5, color: "#1e293b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  newsItemSummary: { fontSize: 11, color: "#64748b", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" },
  newsItemMeta: { fontSize: 10, color: "#94a3b8" },

  // Modals
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(8px)" },
  slideOverlay: {},
  slidePanel: {},
  sidePopupOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 },
  sidePopup: { position: "fixed", top: 0, left: 500, width: 650, height: "100vh", background: "#111118", borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.06)", boxShadow: "8px 0 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 101, animation: "sidePopupIn 0.2s ease-out" },
  modal: { background: "#111118", borderRadius: 16, padding: "24px 28px", width: "90%", maxWidth: 440, boxShadow: "0 24px 80px rgba(0,0,0,0.5)", maxHeight: "85vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)" },
  modalTitle: { fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", display: "flex", flexDirection: "column", gap: 5 },
  input: { padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, fontFamily: "inherit", color: "#fff", background: "rgba(255,255,255,0.05)", transition: "border 0.15s" },
  iconGrid: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 },
  iconLabel: { cursor: "pointer" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 },
  cancelBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "rgba(255,255,255,0.6)" },
  saveBtn: { background: "#06b6d4", color: "#000", border: "none", borderRadius: 8, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  loginBtn: { display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "rgba(255,255,255,0.6)", transition: "all 0.15s" },
  logoutBtn: { display: "flex", alignItems: "center", gap: 4, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#06b6d4", transition: "all 0.15s" },
};
