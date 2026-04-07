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
const PALETTE = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
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

// ─── Weather ───
const WEATHER_ICONS = {
  "맑음": "☀️", "대체로 맑음": "🌤️", "구름조금": "⛅", "구름 조금": "⛅",
  "흐림": "☁️", "안개": "🌫️", "비": "🌧️", "소나기": "🌦️",
  "눈": "🌨️", "폭설": "❄️", "뇌우": "⛈️",
};
const getWIcon = (code) => WEATHER_ICONS[code] || "🌡️";

function WeatherWidget() {
  const [w, setW] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/weather");
      const data = await r.json();
      if (data.temp !== undefined) { setW(data); setTs(new Date()); }
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 600000); return () => clearInterval(t); }, [load]);

  if (!w) return <div style={S.weatherCard}><span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{loading ? "날씨 불러오는 중..." : "날씨 정보 없음"}</span></div>;
  return (
    <div style={S.weatherCard}>
      <div style={S.weatherTop}>
        <div style={S.weatherMain}>
          <span style={{ fontSize: 36, lineHeight: 1 }}>{getWIcon(w.weather_code)}</span>
          <div>
            <div style={S.weatherTemp}>{w.temp}°</div>
            <div style={S.weatherLabel}>{w.weather_code}</div>
          </div>
        </div>
        <div style={S.weatherMeta}>
          <div style={S.wmi}><span style={{ opacity: 0.6 }}>체감</span><span>{w.apparent_temp}°</span></div>
          <div style={S.wmi}><span style={{ opacity: 0.6 }}>습도</span><span>{w.humidity}%</span></div>
          <div style={S.wmi}><span style={{ opacity: 0.6 }}>바람</span><span>{w.wind_speed}km/h</span></div>
        </div>
      </div>
      {w.forecast && <div style={S.weatherForecast}>
        {w.forecast.map((f, i) => (
          <div key={i} style={S.forecastDay}>
            <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>{f.day}</span>
            <span style={{ fontSize: 18 }}>{getWIcon(f.code)}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{f.max}° / {f.min}°</span>
          </div>
        ))}
      </div>}
      <div style={S.weatherFooter}><span>📍 판교 삼평동</span><span>{ts ? `${ts.getHours()}:${String(ts.getMinutes()).padStart(2,"0")} 업데이트`:""}</span></div>
    </div>
  );
}

// ─── AI News Feed ───
const NEWS_TABS = [
  { id: "ai", label: "AI 기술" },
  { id: "llm", label: "LLM" },
  { id: "industry", label: "산업 동향" },
];

function AINewsFeed() {
  const [tab, setTab] = useState("ai");
  const [news, setNews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (tabId, force = false) => {
    if (!force && news[tabId]?.length) return;
    setLoading(true);
    setError(null);
    try {
      const category = NEWS_TABS.find(t => t.id === tabId)?.label || "AI 기술";
      const r = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.detail || err.error || "API 오류");
      }
      const data = await r.json();
      setNews(prev => ({ ...prev, [tabId]: data.news || [] }));
    } catch (e) {
      console.error("News fetch error:", e);
      setError("뉴스를 불러올 수 없습니다");
    }
    setLoading(false);
  }, [news]);

  useEffect(() => { fetchNews(tab); }, [tab]);

  const refreshTab = () => fetchNews(tab, true);
  const currentNews = news[tab] || [];

  return (
    <div style={S.newsPanel}>
      <div style={S.newsPanelHeader}>
        <h3 style={S.newsPanelTitle}>🤖 AI 뉴스</h3>
        <button onClick={refreshTab} style={S.newsRefresh} title="새로고침">🔄</button>
      </div>
      <div style={S.newsTabs}>
        {NEWS_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...S.newsTab, ...(tab === t.id ? S.newsTabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={S.newsContent}>
        {loading ? (
          <div style={S.newsLoading}>
            <div style={S.spinner} />
            <span style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>AI가 최신 뉴스를 찾고 있어요...</span>
          </div>
        ) : error ? (
          <div style={S.newsError}>
            <span>{error}</span>
            <button onClick={refreshTab} style={{ ...S.newsTab, ...S.newsTabActive, marginTop: 8 }}>다시 시도</button>
          </div>
        ) : (
          <div style={S.newsList}>
            {currentNews.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="news-item" style={S.newsItem}>
                <div style={S.newsRank}>{item.rank || i + 1}</div>
                <div style={S.newsItemContent}>
                  <span style={S.newsItemTitle}>{item.title}</span>
                  <span style={S.newsItemSummary}>{item.summary}</span>
                  <span style={S.newsItemMeta}>
                    {item.source && <span>{item.source}</span>}
                    {item.date && <span style={{ opacity: 0.6 }}> · {item.date}</span>}
                  </span>
                </div>
              </a>
            ))}
            {currentNews.length === 0 && !loading && (
              <div style={S.newsError}>
                <span>뉴스가 없습니다</span>
                <button onClick={refreshTab} style={{ ...S.newsTab, ...S.newsTabActive, marginTop: 8 }}>불러오기</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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
  const formRef = useRef(null);
  const pwRef = useRef(null);

  const QUICK_LINKS = [
    { title: "선행AI팀 회의록", emoji: "📝", color: "#6366f1", url: "https://wiki.sgr.com/pages/viewpage.action?pageId=657235319" },
    { title: "AI PoC 위키 페이지", emoji: "🧪", color: "#0ea5e9", url: "https://wiki.sgr.com/pages/viewpage.action?pageId=821693544&src=contextnavpagetreemode" },
    { title: "AI QA/QC 위키 페이지", emoji: "✅", color: "#10b981", url: "https://wiki.sgr.com/pages/viewpage.action?pageId=782666936" },
  ];

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
      const [cats, links] = await Promise.all([
        sbGet("categories", "order=sort_order.asc,created_at.asc"),
        sbGet("links", "order=sort_order.asc,created_at.asc"),
      ]);
      setCategories(cats.map(c => ({ ...c, links: links.filter(l => l.category_id === c.id) })));
      if (!activeTab && cats.length > 0) setActiveTab(cats[0].id);
    } catch (e) { console.error("Fetch error:", e); }
    setLoaded(true);
  }, []);

  useEffect(() => { fetchAll(); const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, [fetchAll]);

  const allLinks = categories.flatMap(c => c.links.map(l => ({ ...l, catName: c.name, catEmoji: c.emoji, catColor: c.color, catId: c.id })));
  const filtered = search.trim() ? allLinks.filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase()) || l.catName?.toLowerCase().includes(search.toLowerCase())) : null;

  const moveLink = async (catId, linkId, dir) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const idx = cat.links.findIndex(l => l.id === linkId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= cat.links.length) return;
    const reordered = [...cat.links];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, links: reordered } : c));
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

  const weekday = ["일","월","화","수","목","금","토"][now.getDay()];
  const greeting = now.getHours() < 12 ? "좋은 아침이에요" : now.getHours() < 18 ? "좋은 오후에요" : "좋은 저녁이에요";

  if (!loaded) return (
    <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <p style={{ color: "#6b7280", fontSize: 15 }}>데이터 불러오는 중...</p>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      <header style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.heroLeft}>
            <p style={S.heroDate}>{now.getFullYear()}년 {now.getMonth()+1}월 {now.getDate()}일 ({weekday})</p>
            <h1 style={S.heroTitle}>{greeting} 👋</h1>
            <p style={S.heroSub}>선행AI팀 팀 업무에 필요한 모든 링크를 한 곳에서</p>
            <div style={{ ...S.searchBox, marginTop: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input style={S.searchInput} placeholder="링크 검색..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button style={S.clearBtn} onClick={() => setSearch("")}>✕</button>}
            </div>
          </div>
          <div style={S.heroRight}><WeatherWidget /></div>
        </div>
      </header>

      <div style={S.twoCol}>
        <main style={S.mainCol}>
          <div style={S.statsStrip}>
            <div style={S.statItem}><span style={S.statNum}>{categories.length}</span><span style={S.statLabel}>카테고리</span></div>
            <div style={S.statDivider} />
            <div style={S.statItem}><span style={S.statNum}>{allLinks.length}</span><span style={S.statLabel}>전체 링크</span></div>
            <div style={{ flex: 1 }} />
            <button style={S.refreshBtn} onClick={fetchAll} title="새로고침">🔄</button>
            {isAdmin ? (
              <>
                <button style={S.addCatBtn} onClick={() => setModal({ type: "category" })}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> 카테고리 추가
                </button>
                <button style={S.logoutBtn} onClick={handleLogout} title="관리자 로그아웃">🔓 관리자</button>
              </>
            ) : (
              <button style={S.loginBtn} onClick={() => setShowLogin(true)} title="관리자 로그인">🔒 관리자</button>
            )}
          </div>

          {filtered !== null ? (
            <div>
              <p style={S.searchLabel}>"{search}" 검색 결과 <strong>{filtered.length}</strong>건</p>
              {filtered.length === 0 ? <div style={S.emptyState}>검색 결과가 없습니다</div> : (
                <div style={S.listWrap}>{filtered.map(l => <LinkCard key={l.id} link={l} color={l.catColor} badge={`${l.catEmoji} ${l.catName}`} isAdmin={isAdmin} onEdit={() => { setSearch(""); setModal({ type: "link", catId: l.catId, item: l }); }} onDelete={() => setDeleteConfirm({ type: "link", id: l.id, title: l.title })} />)}</div>
              )}
            </div>
          ) : (
            <>
              {/* Quick Links */}
              <div style={S.quickLinks}>
                {QUICK_LINKS.map((ql, i) => (
                  <a key={i} href={ql.url} target="_blank" rel="noopener noreferrer" className="quick-link" style={{ ...S.quickLink, borderLeft: `4px solid ${ql.color}` }}>
                    <span style={{ fontSize: 20 }}>{ql.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{ql.title}</span>
                    <svg style={{ marginLeft: "auto", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ql.color} strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </a>
                ))}
              </div>

              {/* Category Tabs — pill buttons */}
              <div style={S.catTabBar}>
                <div style={S.catTabList}>
                  {categories.map((cat, idx) => {
                    const isActive = activeTab === cat.id;
                    return (
                      <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {isAdmin && idx > 0 && <button style={S.catMoveBtn} onClick={() => moveCat(cat.id, -1)} title="왼쪽으로">◀</button>}
                        <button
                          onClick={() => setActiveTab(cat.id)}
                          style={{ ...S.catPill, ...(isActive ? { background: cat.color || "#6366f1", color: "#fff", borderColor: cat.color || "#6366f1" } : {}) }}
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

              {/* Active Category Content — fixed height */}
              <div style={S.catContentBox}>
                {(() => {
                  const cat = categories.find(c => c.id === activeTab);
                  if (!cat) return categories.length === 0 ? (
                    <div style={S.emptyState}><div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div><p style={{ fontWeight: 600 }}>카테고리를 추가해서 시작하세요</p></div>
                  ) : null;
                  return (
                    <>
                      <div style={S.catBody}>
                        {cat.links.map((l, idx) => (
                          <LinkCard key={l.id} link={l} color={cat.color}
                            isAdmin={isAdmin}
                            onEdit={() => setModal({ type: "link", catId: cat.id, item: l })}
                            onDelete={() => setDeleteConfirm({ type: "link", id: l.id, title: l.title })}
                            onMoveUp={idx > 0 ? () => moveLink(cat.id, l.id, -1) : null}
                            onMoveDown={idx < cat.links.length - 1 ? () => moveLink(cat.id, l.id, 1) : null}
                          />
                        ))}
                        {cat.links.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 14 }}>링크를 추가해보세요</div>}
                        {isAdmin && <button style={{ ...S.addLinkRow, borderColor: `${cat.color}33`, color: cat.color }} onClick={() => setModal({ type: "link", catId: cat.id })}>
                          <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> 링크 추가
                        </button>}
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </main>

        <aside style={S.sideCol}>
          <AINewsFeed />
        </aside>
      </div>

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

function LinkCard({ link, color, badge, isAdmin, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const domain = (() => { try { return new URL(link.url).hostname.replace("www.", ""); } catch { return ""; } })();
  const hasIcon = link.icon && link.icon.trim();
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-row" style={S.linkRow}>
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
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .link-row { text-decoration: none; color: inherit; transition: background 0.15s, transform 0.1s; }
  .link-row:hover { background: #f8f9fb !important; transform: translateX(2px); }
  .link-action { background: none; border: none; cursor: pointer; font-size: 13px; padding: 4px 6px; border-radius: 6px; opacity: 0; transition: opacity 0.15s, background 0.15s; }
  .link-row:hover .link-action { opacity: 1; }
  .link-action:hover { background: #e5e7eb; }
  .cat-action { background: rgba(255,255,255,0.2); border: none; cursor: pointer; font-size: 13px; padding: 4px 7px; border-radius: 6px; opacity: 0; transition: opacity 0.15s, background 0.15s; }
  .cat-action:hover { background: rgba(255,255,255,0.35); }
  .cat-card:hover .cat-action { opacity: 1; }
  .cat-action-light { background: none; border: none; cursor: pointer; font-size: 13px; padding: 4px 7px; border-radius: 6px; opacity: 0; transition: opacity 0.15s, background 0.15s; color: #6b7280; }
  .cat-action-light:hover { background: #f3f4f6; }
  .cat-card:hover .cat-action-light { opacity: 1; }
  .quick-link { text-decoration: none; transition: transform 0.15s, box-shadow 0.15s; }
  .quick-link:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
  .tab-action-pill { background: none; border: none; cursor: pointer; font-size: 11px; padding: 2px 3px; border-radius: 4px; opacity: 0.7; transition: opacity 0.15s; }
  .tab-action-pill:hover { opacity: 1; background: rgba(255,255,255,0.25); }
  input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
  input[type="radio"]:checked + .color-dot { border-color: #1a1a2e !important; }
  .icon-dot {
    width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 18px; cursor: pointer; border: 2px solid #e5e7eb; transition: border-color 0.15s, background 0.15s; background: #fff;
  }
  .icon-dot:hover { border-color: #6366f1; background: #f0f0ff; }
  input[type="radio"]:checked + .icon-dot { border-color: #6366f1; background: #eef2ff; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
  input[type="radio"]:checked + .label-color-dot { border-color: #1e1b4b !important; }
  .label-color-dot:hover { opacity: 0.8; }
  .news-item { text-decoration: none; color: inherit; transition: background 0.15s; }
  .news-item:hover { background: #f8f9fb !important; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const S = {
  root: { fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f0f1f5", minHeight: "100vh", color: "#1a1a2e" },
  hero: { background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)", padding: "36px 32px 40px", color: "#fff" },
  heroInner: { maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" },
  heroLeft: {}, heroRight: { minWidth: 260 },
  heroDate: { fontSize: 13, opacity: 0.6, marginBottom: 6, fontWeight: 500 },
  heroTitle: { fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 },
  heroSub: { fontSize: 14, opacity: 0.7, fontWeight: 400 },
  searchBox: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 16px", minWidth: 240, border: "1px solid rgba(255,255,255,0.15)" },
  searchInput: { border: "none", background: "transparent", fontSize: 14, flex: 1, outline: "none", fontFamily: "inherit", color: "#fff" },
  clearBtn: { background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "#fff", fontSize: 11, padding: "2px 6px", borderRadius: 4 },
  weatherCard: { background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.12)", minWidth: 260 },
  weatherTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  weatherMain: { display: "flex", alignItems: "center", gap: 12 },
  weatherTemp: { fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" },
  weatherLabel: { fontSize: 13, opacity: 0.8, marginTop: 2, fontWeight: 500 },
  weatherMeta: { display: "flex", flexDirection: "column", gap: 4, textAlign: "right", fontSize: 13, fontWeight: 500 },
  wmi: { display: "flex", gap: 8, justifyContent: "flex-end" },
  weatherForecast: { display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.12)" },
  forecastDay: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  weatherFooter: { display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, opacity: 0.5, fontWeight: 500 },
  twoCol: { maxWidth: 1160, margin: "0 auto", padding: "0 32px 64px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" },
  mainCol: { minWidth: 0 },
  sideCol: { position: "sticky", top: 24 },
  statsStrip: { display: "flex", alignItems: "center", gap: 20, padding: "18px 24px", margin: "-20px 0 24px", background: "#fff", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", position: "relative", zIndex: 2 },
  statItem: { display: "flex", alignItems: "baseline", gap: 6 },
  statNum: { fontSize: 22, fontWeight: 800, color: "#1e1b4b" },
  statLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  statDivider: { width: 1, height: 24, background: "#e5e7eb" },
  refreshBtn: { background: "none", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 16, transition: "background 0.15s" },
  addCatBtn: { display: "flex", alignItems: "center", gap: 6, background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  searchLabel: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  emptyState: { textAlign: "center", padding: 60, color: "#9ca3af" },
  listWrap: { background: "#fff", borderRadius: 14, padding: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },

  // Quick links
  quickLinks: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 },
  quickLink: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", cursor: "pointer" },

  // Category tabs — pill buttons
  catTabBar: { marginBottom: 0, overflowX: "auto" },
  catTabList: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "16px 20px", background: "#fff", borderRadius: "16px 16px 0 0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  catPill: { display: "flex", alignItems: "center", gap: 4, padding: "7px 18px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6b7280", transition: "all 0.15s", whiteSpace: "nowrap" },
  catPillAdd: { width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1.5px dashed #d1d5db", borderRadius: "50%", fontSize: 16, cursor: "pointer", fontFamily: "inherit", color: "#9ca3af", transition: "all 0.15s" },
  catMoveBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "#9ca3af", padding: "2px", opacity: 0.5, transition: "opacity 0.15s" },
  catTabActions: { display: "inline-flex", gap: 2, marginLeft: 4 },

  catGrid: { display: "flex", flexDirection: "column", gap: 20 },
  catCard: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)" },
  catContentBox: { background: "#fff", borderRadius: "0 0 16px 16px", minHeight: 400, maxHeight: 480, overflowY: "auto", borderTop: "1px solid #f0f1f5" },
  catActions: { display: "flex", gap: 4 },
  catBody: { padding: 8, display: "flex", flexDirection: "column", gap: 2 },
  linkRow: { display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, cursor: "pointer" },
  linkIcon: { width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 },
  linkInfo: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  linkTitle: { fontWeight: 600, fontSize: 14 },
  linkDesc: { fontSize: 12, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  linkBadge: { fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "3px 10px", flexShrink: 0 },
  linkActions: { display: "flex", gap: 2, flexShrink: 0 },
  addLinkRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", margin: "4px 8px 8px", borderRadius: 12, border: "2px dashed", background: "transparent", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: 0.6, transition: "opacity 0.15s" },
  newsPanel: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)", marginTop: -20 },
  newsPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px" },
  newsPanelTitle: { fontSize: 16, fontWeight: 700 },
  newsRefresh: { background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 14 },
  newsTabs: { display: "flex", gap: 6, padding: "0 20px 12px" },
  newsTab: { background: "#f3f4f6", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6b7280", transition: "all 0.15s" },
  newsTabActive: { background: "#1e1b4b", color: "#fff" },
  newsContent: { borderTop: "1px solid #f0f1f5" },
  newsLoading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px" },
  spinner: { width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  newsError: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", fontSize: 13, color: "#6b7280" },
  newsList: { display: "flex", flexDirection: "column" },
  newsItem: { display: "flex", gap: 12, padding: "14px 20px", borderBottom: "1px solid #f5f5f5", cursor: "pointer" },
  newsRank: { width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 },
  newsItemContent: { flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  newsItemTitle: { fontSize: 13, fontWeight: 600, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  newsItemSummary: { fontSize: 12, color: "#6b7280", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" },
  newsItemMeta: { fontSize: 11, color: "#9ca3af" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  modal: { background: "#fff", borderRadius: 20, padding: "28px 32px", width: "90%", maxWidth: 440, boxShadow: "0 24px 80px rgba(0,0,0,0.18)", maxHeight: "85vh", overflowY: "auto" },
  modalTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  label: { fontSize: 13, fontWeight: 600, color: "#6b7280", display: "flex", flexDirection: "column", gap: 6 },
  input: { padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", color: "#1a1a2e", background: "#f9fafb", transition: "border 0.15s, box-shadow 0.15s" },
  iconGrid: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  iconLabel: { cursor: "pointer" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 },
  cancelBtn: { background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "#374151" },
  saveBtn: { background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 10, padding: "9px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  loginBtn: { display: "flex", alignItems: "center", gap: 4, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6b7280", transition: "all 0.15s" },
  logoutBtn: { display: "flex", alignItems: "center", gap: 4, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#4338ca", transition: "all 0.15s" },
};
