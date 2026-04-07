import { apiFetch } from "./api-base.js";

const MODULE_META = [
  { key: "technical", label: "Technical", colorClass: "module-bar--technical" },
  { key: "hr", label: "HR", colorClass: "module-bar--hr" },
  { key: "resume", label: "Resume", colorClass: "module-bar--resume" },
  { key: "career", label: "Career", colorClass: "module-bar--career" }
];

const BADGES = [
  {
    id: "first-session",
    name: "First Session",
    description: "Completed your first practice session",
    unlocked: stats => stats.totalSessions >= 1
  },
  {
    id: "triple-streak",
    name: "3-Day Streak",
    description: "Practiced on 3 consecutive days",
    unlocked: stats => stats.maxStreak >= 3
  },
  {
    id: "ten-sessions",
    name: "10 Sessions",
    description: "Reached double-digit interview practice",
    unlocked: stats => stats.totalSessions >= 10
  },
  {
    id: "technical-strong",
    name: "Technical 80+",
    description: "Technical readiness crossed 80",
    unlocked: stats => Number(stats.summary?.technical || 0) >= 80
  },
  {
    id: "all-rounder",
    name: "All-Rounder",
    description: "Average readiness crossed 75",
    unlocked: stats => stats.readinessScore >= 75
  }
];

function clamp(value) {
  const safe = Number(value || 0);
  return Math.max(0, Math.min(100, Math.round(safe)));
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTime(iso) {
  if (!iso) return "Unknown time";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getSessionScore(session) {
  const feedback = session?.feedback || {};
  const values = [
    feedback.confidence,
    feedback.vocabulary,
    feedback.technical,
    feedback.communication
  ]
    .map(item => Number(item))
    .filter(item => Number.isFinite(item));

  if (!values.length) return 0;
  return clamp(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function buildModuleBar(label, value, colorClass) {
  const wrap = document.createElement("div");
  wrap.className = "module-bar";

  const header = document.createElement("div");
  header.className = "module-bar__header";
  header.innerHTML = `<span>${label}</span><strong>${clamp(value)}</strong>`;

  const track = document.createElement("div");
  track.className = "module-bar__track";

  const fill = document.createElement("div");
  fill.className = `module-bar__fill ${colorClass}`;
  fill.style.width = `${clamp(value)}%`;
  track.appendChild(fill);

  wrap.appendChild(header);
  wrap.appendChild(track);
  return wrap;
}

function average(values) {
  if (!values.length) return 0;
  return clamp(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function toDateKey(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
}

function computeStreaks(dayKeys) {
  const sorted = [...dayKeys].sort();
  if (!sorted.length) {
    return { currentStreak: 0, maxStreak: 0 };
  }

  let maxStreak = 1;
  let streak = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00`);
    const curr = new Date(`${sorted[i]}T00:00:00`);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) {
      streak += 1;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }

  let currentStreak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dayKeys.has(toDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak, maxStreak };
}

function groupByDay(sessions) {
  const counts = new Map();
  sessions.forEach(session => {
    const date = new Date(session.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = toDateKey(date);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

function computeConsistencyStats(sessions, summary) {
  const scores = sessions.map(getSessionScore);
  const totalSessions = sessions.length;
  const avgScore = average(scores);
  const bestScore = scores.length ? Math.max(...scores) : 0;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const lastWeekCount = sessions.filter(session => new Date(session.createdAt) >= weekAgo).length;

  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  const domainCounts = new Map();
  sessions.forEach(session => {
    const difficulty = String(session?.difficulty || "medium").toLowerCase();
    if (difficultyCounts[difficulty] !== undefined) {
      difficultyCounts[difficulty] += 1;
    } else {
      difficultyCounts.medium += 1;
    }

    const domain = String(session?.domain || session?.type || "general").trim();
    domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
  });

  const byDay = groupByDay(sessions);
  const dayKeys = new Set(byDay.keys());
  const { currentStreak, maxStreak } = computeStreaks(dayKeys);
  const activeDays = dayKeys.size;

  const moduleValues = MODULE_META.map(item => Number(summary?.[item.key] || 0));
  const readinessScore = average([...scores, ...moduleValues.filter(Number.isFinite)]);

  return {
    totalSessions,
    avgScore,
    bestScore,
    lastWeekCount,
    difficultyCounts,
    domainCounts,
    byDay,
    activeDays,
    currentStreak,
    maxStreak,
    readinessScore,
    summary
  };
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderHeaderStats(stats) {
  const readiness = clamp(stats.readinessScore);
  const ring = document.getElementById("readiness-ring");
  if (ring) ring.style.setProperty("--progress", String(readiness));
  setText("readiness-score", String(readiness));
  setText("progress-caption", `${stats.totalSessions} sessions completed`);
  setText("difficulty-easy", String(stats.difficultyCounts.easy));
  setText("difficulty-medium", String(stats.difficultyCounts.medium));
  setText("difficulty-hard", String(stats.difficultyCounts.hard));
  setText("mini-active-days", String(stats.activeDays));
  setText("mini-current-streak", String(stats.currentStreak));
  setText("stat-total-sessions", String(stats.totalSessions));
  setText("stat-average-score", String(stats.avgScore));
  setText("stat-best-score", String(stats.bestScore));
  setText("stat-last-week", String(stats.lastWeekCount));
  setText("heatmap-active-days", String(stats.activeDays));
  setText("heatmap-total-sessions", String(stats.totalSessions));
  setText("heatmap-max-streak", String(stats.maxStreak));
  setText("heatmap-current-streak", String(stats.currentStreak));

  const tier =
    readiness >= 80
      ? "Interview Ready"
      : readiness >= 60
        ? "Building Momentum"
        : stats.totalSessions
          ? "In Practice Mode"
          : "Getting Started";
  setText("consistency-tier", tier);

  const focusPill = document.getElementById("progress-focus-pill");
  if (focusPill) {
    focusPill.textContent =
      stats.currentStreak > 0
        ? `${stats.currentStreak}-day streak active`
        : "Start a streak";
  }
}

function renderModuleSummary(summary) {
  const wrap = document.getElementById("profile-module-bars");
  if (!wrap) return;
  wrap.innerHTML = "";
  MODULE_META.forEach(item => {
    wrap.appendChild(buildModuleBar(item.label, summary?.[item.key], item.colorClass));
  });
}

function renderDomainTags(domainCounts) {
  const wrap = document.getElementById("profile-domain-tags");
  if (!wrap) return;
  wrap.innerHTML = "";

  const sorted = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!sorted.length) {
    wrap.innerHTML = `<span class="feature-chip">No practice history yet</span>`;
    return;
  }

  sorted.forEach(([domain, count]) => {
    const tag = document.createElement("span");
    tag.className = "feature-chip";
    tag.textContent = `${domain} ${count}`;
    wrap.appendChild(tag);
  });
}

function getBadgeState(stats) {
  return BADGES.map(badge => ({
    ...badge,
    earned: badge.unlocked(stats)
  }));
}

function renderBadges(stats) {
  const badgeState = getBadgeState(stats);
  const earned = badgeState.filter(item => item.earned);
  const next = badgeState.find(item => !item.earned);
  setText("badge-count", String(earned.length));

  const wrap = document.getElementById("badge-list");
  if (wrap) {
    wrap.innerHTML = "";
    earned.slice(0, 4).forEach(badge => {
      const card = document.createElement("div");
      card.className = "badge-pill badge-pill--earned";
      card.innerHTML = `<strong>${escapeHtml(badge.name)}</strong><span>${escapeHtml(badge.description)}</span>`;
      wrap.appendChild(card);
    });
    if (!earned.length) {
      wrap.innerHTML = `<div class="badge-pill"><strong>No badges yet</strong><span>Complete sessions to unlock milestones.</span></div>`;
    }
  }

  setText("next-badge-name", next ? next.name : "All badges unlocked");
  setText(
    "next-badge-hint",
    next ? next.description : "You have unlocked every current profile milestone."
  );
}

function heatLevel(count) {
  if (count >= 4) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}

function renderHeatmap(byDay) {
  const grid = document.getElementById("consistency-heatmap");
  const months = document.getElementById("heatmap-months");
  if (!grid || !months) return;

  grid.innerHTML = "";
  months.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - 363);

  const monthMarkers = [];
  for (let week = 0; week < 52; week += 1) {
    const column = document.createElement("div");
    column.className = "heatmap-week";

    for (let day = 0; day < 7; day += 1) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + week * 7 + day);
      if (cellDate > today) continue;

      const key = toDateKey(cellDate);
      const count = byDay.get(key) || 0;
      const cell = document.createElement("div");
      cell.className = `heatmap-cell heatmap-cell--${heatLevel(count)}`;
      cell.title = `${count} practice session${count === 1 ? "" : "s"} on ${cellDate.toLocaleDateString()}`;
      column.appendChild(cell);

      if (day === 0 && (week === 0 || cellDate.getMonth() !== new Date(start.getFullYear(), start.getMonth(), start.getDate() + (week - 1) * 7).getMonth())) {
        monthMarkers.push({
          week,
          label: cellDate.toLocaleString([], { month: "short" })
        });
      }
    }

    grid.appendChild(column);
  }

  for (let i = 0; i < 12; i += 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    const span = document.createElement("span");
    span.textContent = date.toLocaleString([], { month: "short" });
    months.appendChild(span);
  }
}

function renderRecentActivity(sessions) {
  const wrap = document.getElementById("recent-activity-list");
  if (!wrap) return;
  wrap.innerHTML = "";

  if (!sessions.length) {
    wrap.innerHTML = `
      <div class="spotlight-empty">
        <h3>No activity yet</h3>
        <p>Start a technical or HR round to populate your profile history.</p>
      </div>
    `;
    return;
  }

  sessions.slice(0, 8).forEach(session => {
    const score = getSessionScore(session);
    const item = document.createElement("article");
    item.className = "activity-item";
    item.innerHTML = `
      <div class="activity-item__left">
        <strong>${escapeHtml(String(session.type || "Interview"))}</strong>
        <span>${escapeHtml(String(session.domain || "general"))} • ${escapeHtml(String(session.difficulty || "medium"))}</span>
      </div>
      <div class="activity-item__right">
        <span>${formatDateTime(session.createdAt)}</span>
        <strong>${score}</strong>
      </div>
    `;
    wrap.appendChild(item);
  });
}

function applyUserIdentity(sessions) {
  const userName = sessions[0]?.userName || "User";
  setText("profile-hero-name", userName);
  const handle = `@${String(userName).trim().toLowerCase().replace(/\s+/g, "_")}`;
  setText("profile-handle", handle);
}

async function loadProfileDashboard() {
  try {
    const [sessionRes, profileRes] = await Promise.all([
      apiFetch("/api/interview/sessions?limit=365"),
      apiFetch("/api/interview/profile-summary")
    ]);

    const [sessionData, profileData] = await Promise.all([
      sessionRes.json(),
      profileRes.json()
    ]);

    if (!sessionRes.ok) {
      throw new Error(sessionData?.details || sessionData?.error || "Failed to load session history");
    }
    if (!profileRes.ok) {
      throw new Error(profileData?.details || profileData?.error || "Failed to load profile summary");
    }

    const sessions = Array.isArray(sessionData?.sessions) ? sessionData.sessions : [];
    const summary = profileData?.summary || {};
    const stats = computeConsistencyStats(sessions, summary);

    applyUserIdentity(sessions);
    renderHeaderStats(stats);
    renderModuleSummary(summary);
    renderDomainTags(stats.domainCounts);
    renderBadges(stats);
    renderHeatmap(stats.byDay);
    renderRecentActivity(sessions);
  } catch (error) {
    const wrap = document.getElementById("recent-activity-list");
    if (wrap) {
      wrap.innerHTML = `
        <div class="spotlight-empty">
          <h3>Profile dashboard unavailable</h3>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }
}

loadProfileDashboard();
