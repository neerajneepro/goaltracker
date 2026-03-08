// ═══════════════════════════════════════════════════════════
//  PROGRESS PAGE — Neepro 90-Day Transformation
// ═══════════════════════════════════════════════════════════

// ── CONSTANTS ──
const START_DATE = new Date('2026-03-08');
const TOTAL_PLAN_DAYS = 90;
const LS_KEY_TASKS = 'neepro_progress_tasks';
const LS_KEY_LOGS = 'neepro_progress_logs';

// ── GOAL DATA (with individual day targets) ──
const goalData = {
    career: {
        name: 'AML Job Switch',
        icon: '🏦',
        color: '#f59e0b',
        totalDays: 90,
        timelineLabel: '90 days',
        description: 'Transition into an AML/Compliance role with ACAMS certification and targeted job applications.',
        tasks: [
            'Get ACAMS CAMS certification',
            'Update resume with AML-specific keywords',
            'Apply to 3–5 AML roles/week on LinkedIn',
            'Connect with AML professionals on LinkedIn daily',
            'Prepare for behavioral & technical interviews'
        ]
    },
    youtube: {
        name: 'YouTube Channel',
        icon: '🎥',
        color: '#ef4444',
        totalDays: 180,
        timelineLabel: '180 days',
        description: 'Build a YouTube channel focusing on AML/Financial Fraud/Career Finance content with weekly uploads.',
        tasks: [
            'Niche: AML / Financial Fraud / Career Finance',
            'Post 1 video/week consistently',
            'Learn basic editing (CapCut / DaVinci Resolve)',
            'Focus on SEO titles & thumbnails',
            'Build to 100 subscribers in first 2 months'
        ]
    },
    communication: {
        name: 'Communication & Appearance',
        icon: '🎤',
        color: '#8b5cf6',
        totalDays: 0, // ongoing — no fixed end
        timelineLabel: 'ongoing',
        description: 'Improve public speaking, personal branding, and physical fitness as an ongoing habit.',
        tasks: [
            'Read 1 book/month on communication or leadership',
            'Record & review yourself speaking weekly',
            'Exercise 6x/week for physical transformation',
            'Dress intentionally — invest in office wardrobe',
            'Join Toastmasters or a practice group if possible'
        ]
    }
};

// ── STATE ──
let taskStates = loadFromLS(LS_KEY_TASKS) || {};
let logEntries = loadFromLS(LS_KEY_LOGS) || [];
let activeGoalOverview = null;

// ── LOCAL STORAGE ──
function loadFromLS(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
function saveToLS(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

// ── NAVBAR TOGGLE ──
function toggleNav() {
    document.getElementById('nav-links').classList.toggle('open');
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    updateAllProgress();
    renderChart();
    renderLogEntries();
    updateMilestones();
    setLogDate();
});

// ── LOG DATE ──
function setLogDate() {
    const today = new Date();
    const opts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('log-date').textContent = today.toLocaleDateString('en-IN', opts);
}

// ═══════════════════════════════════════
//  PROGRESS CALCULATIONS
// ═══════════════════════════════════════
function getGoalProgress(goalId) {
    const total = goalData[goalId].tasks.length;
    let done = 0;
    for (let i = 0; i < total; i++) {
        if (taskStates[`${goalId}_${i}`]) done++;
    }
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function getGoalHours(goalId) {
    let hours = 0;
    logEntries.forEach(log => {
        if (log.goal === goalId) hours += parseFloat(log.hours || 0);
    });
    return hours;
}

function getGoalLogCount(goalId) {
    return logEntries.filter(log => log.goal === goalId).length;
}

function updateAllProgress() {
    const today = new Date();
    const msPerDay = 86400000;
    const daysElapsed = Math.max(0, Math.ceil((today - START_DATE) / msPerDay));

    // overall
    let totalDone = 0, totalTasks = 0;
    Object.keys(goalData).forEach(id => {
        const p = getGoalProgress(id);
        totalDone += p.done;
        totalTasks += p.total;

        // mini ring
        const circ = 2 * Math.PI * 16;
        const offset = circ - (circ * p.pct / 100);
        const ring = document.getElementById(`mini-ring-${id}`);
        if (ring) ring.setAttribute('stroke-dashoffset', offset);
        const pctEl = document.getElementById(`mini-pct-${id}`);
        if (pctEl) pctEl.textContent = p.pct + '%';
    });

    const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

    // big ring
    const bigCirc = 2 * Math.PI * 60;
    const bigOffset = bigCirc - (bigCirc * overallPct / 100);
    document.getElementById('ring-overall').setAttribute('stroke-dashoffset', bigOffset);
    document.getElementById('overall-pct').textContent = overallPct + '%';

    // stats
    document.getElementById('stat-days-elapsed').textContent = Math.min(daysElapsed, TOTAL_PLAN_DAYS);
    document.getElementById('stat-tasks-done').textContent = totalDone;
    document.getElementById('stat-tasks-total').textContent = totalTasks;
    document.getElementById('stat-streak').textContent = Math.min(daysElapsed, TOTAL_PLAN_DAYS);

    // if overview is open, refresh it
    if (activeGoalOverview) {
        showGoalOverview(activeGoalOverview, true);
    }
}

// ═══════════════════════════════════════
//  GOAL OVERVIEW PANEL
// ═══════════════════════════════════════
function showGoalOverview(goalId, isRefresh = false) {
    const panel = document.getElementById('goal-overview-panel');
    const goal = goalData[goalId];
    const progress = getGoalProgress(goalId);
    const today = new Date();
    const msPerDay = 86400000;

    // if clicking same goal and it's already open (not a refresh), close it
    if (activeGoalOverview === goalId && !isRefresh) {
        closeGoalOverview();
        return;
    }

    activeGoalOverview = goalId;

    // highlight active row
    document.querySelectorAll('.goal-row').forEach(r => r.classList.remove('active-goal'));
    const row = document.getElementById(`goal-${goalId}-row`);
    if (row) row.classList.add('active-goal');

    // calculate time data
    const daysElapsed = Math.max(0, Math.ceil((today - START_DATE) / msPerDay));
    let daysLeft, timePct, endDate;

    if (goal.totalDays > 0) {
        endDate = new Date(START_DATE.getTime() + goal.totalDays * msPerDay);
        daysLeft = Math.max(0, Math.ceil((endDate - today) / msPerDay));
        timePct = Math.min(100, Math.round((daysElapsed / goal.totalDays) * 100));
    } else {
        // ongoing
        endDate = null;
        daysLeft = '∞';
        timePct = 0;
    }

    const hoursLogged = getGoalHours(goalId);
    const logCount = getGoalLogCount(goalId);

    // format dates
    const startStr = START_DATE.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const endStr = endDate ? endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing';

    // Build ring SVG
    const ringR = 36;
    const ringCirc = 2 * Math.PI * ringR;
    const ringOffset = ringCirc - (ringCirc * progress.pct / 100);

    // accent color with opacity
    const accentBg = goal.color + '18';

    let html = `
        <!-- OVERVIEW HEADER -->
        <div class="ov-header">
            <div class="ov-header-left">
                <span class="ov-icon">${goal.icon}</span>
                <div>
                    <div class="ov-title">${goal.name}</div>
                    <span class="ov-badge" style="background:${accentBg}; color:${goal.color}">${goal.timelineLabel}</span>
                </div>
            </div>
            <button class="ov-close-btn" onclick="closeGoalOverview()" title="Close">✕</button>
        </div>

        <!-- STATS ROW: Ring + 4 stats -->
        <div class="ov-stats-row">
            <div class="ov-ring-wrap">
                <svg class="ov-ring-svg" viewBox="0 0 80 80">
                    <circle class="ov-ring-bg" cx="40" cy="40" r="${ringR}" />
                    <circle class="ov-ring-fill" cx="40" cy="40" r="${ringR}"
                        stroke="${goal.color}" stroke-dasharray="${ringCirc.toFixed(2)}"
                        stroke-dashoffset="${ringOffset.toFixed(2)}"
                        style="filter: drop-shadow(0 0 6px ${goal.color}55)" />
                </svg>
                <div class="ov-ring-center">
                    <span class="ov-ring-pct">${progress.pct}%</span>
                    <span class="ov-ring-sub">tasks</span>
                </div>
            </div>
            <div class="ov-stats-grid">
                <div class="ov-stat-card">
                    <span class="ov-stat-icon">✅</span>
                    <div>
                        <div class="ov-stat-val">${progress.done}/${progress.total}</div>
                        <div class="ov-stat-lbl">Tasks Done</div>
                    </div>
                </div>
                <div class="ov-stat-card">
                    <span class="ov-stat-icon">⏳</span>
                    <div>
                        <div class="ov-stat-val">${daysLeft}</div>
                        <div class="ov-stat-lbl">Days Left</div>
                    </div>
                </div>
                <div class="ov-stat-card">
                    <span class="ov-stat-icon">⏱</span>
                    <div>
                        <div class="ov-stat-val">${hoursLogged.toFixed(1)}h</div>
                        <div class="ov-stat-lbl">Hours Logged</div>
                    </div>
                </div>
                <div class="ov-stat-card">
                    <span class="ov-stat-icon">📝</span>
                    <div>
                        <div class="ov-stat-val">${logCount}</div>
                        <div class="ov-stat-lbl">Log Entries</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TIME PROGRESS BAR -->
        <div class="ov-time-section">
            <div class="ov-time-header">
                <span class="ov-time-label">⏱ Time Progress</span>
                <span class="ov-time-value" style="color:${goal.color}">${goal.totalDays > 0 ? timePct + '% elapsed' : 'No deadline'}</span>
            </div>
            <div class="ov-time-bar-track">
                <div class="ov-time-bar-fill" style="width:${timePct}%; background:${goal.color}"></div>
            </div>
            <div class="ov-time-dates">
                <span>Start: ${startStr}</span>
                <span>End: ${endStr}</span>
            </div>
        </div>

        <!-- HOURS LOGGED CARD -->
        <div class="ov-hours-card">
            <span class="ov-hours-icon">🔥</span>
            <div>
                <div class="ov-hours-val">${hoursLogged.toFixed(1)} hours</div>
                <div class="ov-hours-lbl">Total time invested in ${goal.name}</div>
            </div>
        </div>

        <!-- TASK SECTIONS: Pending + Completed -->
    `;

    // separate pending and completed tasks
    const pendingTasks = [];
    const completedTasks = [];

    goal.tasks.forEach((task, i) => {
        const key = `${goalId}_${i}`;
        const done = taskStates[key] || false;
        if (done) {
            completedTasks.push({ task, i });
        } else {
            pendingTasks.push({ task, i });
        }
    });

    // ── ACTION PLAN (pending only) ──
    html += `
        <div class="ov-tasks-section">
            <div class="ov-tasks-header">📋 Action Plan — ${pendingTasks.length} Remaining</div>
            <div class="ov-tasks-list">
    `;

    if (pendingTasks.length > 0) {
        pendingTasks.forEach(({ task, i }) => {
            html += `
                <div class="ov-task-item" style="border-left-color:${goal.color}">
                    <input type="checkbox"
                        style="accent-color:${goal.color}"
                        onchange="toggleTaskFromOverview('${goalId}', ${i}, this)" />
                    <span class="ov-task-text">${task}</span>
                    <span class="ov-task-status pending">Pending</span>
                </div>
            `;
        });
    } else {
        html += `<div class="ov-empty-msg">🎉 All tasks completed! Amazing work.</div>`;
    }

    html += `
            </div>
        </div>
    `;

    // ── COMPLETED TASKS (only if any) ──
    if (completedTasks.length > 0) {
        html += `
        <div class="ov-tasks-section ov-completed-section">
            <div class="ov-tasks-header ov-completed-header">✅ Completed Tasks — ${completedTasks.length} Done</div>
            <div class="ov-tasks-list">
        `;

        completedTasks.forEach(({ task, i }) => {
            html += `
                <div class="ov-task-item done" style="border-left-color:#22c55e">
                    <input type="checkbox" checked
                        style="accent-color:#22c55e"
                        onchange="toggleTaskFromOverview('${goalId}', ${i}, this)" />
                    <span class="ov-task-text">${task}</span>
                    <span class="ov-task-status complete">Done</span>
                </div>
            `;
        });

        html += `
            </div>
        </div>
        `;
    }

    panel.innerHTML = html;
    panel.classList.add('visible');

    // smooth scroll to panel
    if (!isRefresh) {
        setTimeout(() => {
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function closeGoalOverview() {
    const panel = document.getElementById('goal-overview-panel');
    panel.classList.remove('visible');
    panel.innerHTML = '';
    activeGoalOverview = null;
    document.querySelectorAll('.goal-row').forEach(r => r.classList.remove('active-goal'));
}

function toggleTaskFromOverview(goalId, idx, checkbox) {
    const key = `${goalId}_${idx}`;
    taskStates[key] = checkbox.checked;
    saveToLS(LS_KEY_TASKS, taskStates);
    updateAllProgress();
}

// ═══════════════════════════════════════
//  BAR CHART (weekly)
// ═══════════════════════════════════════
function renderChart() {
    const chartEl = document.getElementById('bar-chart');
    const xAxis = document.getElementById('chart-x-axis');
    const numWeeks = 13;
    const colors = { career: '#f59e0b', youtube: '#ef4444', communication: '#8b5cf6' };

    const weekData = [];
    for (let w = 0; w < numWeeks; w++) {
        const weekStart = new Date(START_DATE.getTime() + w * 7 * 86400000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
        const entry = { career: 0, youtube: 0, communication: 0 };

        logEntries.forEach(log => {
            const logDate = new Date(log.date);
            if (logDate >= weekStart && logDate < weekEnd) {
                entry[log.goal] = (entry[log.goal] || 0) + parseFloat(log.hours || 1);
            }
        });
        weekData.push(entry);
    }

    const maxVal = Math.max(1, ...weekData.map(w => Math.max(w.career, w.youtube, w.communication)));

    chartEl.innerHTML = '';
    xAxis.innerHTML = '';

    weekData.forEach((week, idx) => {
        const group = document.createElement('div');
        group.className = 'bar-group';

        ['career', 'youtube', 'communication'].forEach(goalId => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            const h = (week[goalId] / maxVal) * 100;
            bar.style.height = h + '%';
            bar.style.background = colors[goalId];
            bar.setAttribute('data-val', week[goalId].toFixed(1) + 'h');
            group.appendChild(bar);
        });

        chartEl.appendChild(group);

        const label = document.createElement('div');
        label.className = 'x-label';
        label.textContent = 'W' + (idx + 1);
        xAxis.appendChild(label);
    });
}

// ═══════════════════════════════════════
//  DAILY LOG
// ═══════════════════════════════════════
function renderLogEntries() {
    const container = document.getElementById('log-entries');

    if (logEntries.length === 0) {
        container.innerHTML = '<div class="log-empty">No entries yet — start logging your wins!</div>';
        return;
    }

    const sorted = [...logEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = '';

    sorted.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        const icon = goalData[entry.goal]?.icon || '📝';
        const goalName = goalData[entry.goal]?.name || entry.goal;
        const dateStr = new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        const hoursStr = entry.hours ? entry.hours + 'h' : '';

        div.innerHTML = `
            <span class="log-entry-icon">${icon}</span>
            <div class="log-entry-body">
                <div class="log-entry-note">${escapeHtml(entry.note)}</div>
                <div class="log-entry-meta">
                    <span>${goalName}</span>
                    ${hoursStr ? `<span>${hoursStr}</span>` : ''}
                    <span>${dateStr}</span>
                </div>
            </div>
            <button class="log-entry-delete" onclick="deleteLog(${idx})" title="Delete">🗑️</button>
        `;
        container.appendChild(div);
    });
}

function openLogModal() {
    document.getElementById('log-modal').classList.add('visible');
    document.getElementById('log-note').focus();
}

function closeLogModal() {
    document.getElementById('log-modal').classList.remove('visible');
    document.getElementById('log-note').value = '';
    document.getElementById('log-hours').value = '';
}

function submitLog() {
    const goal = document.getElementById('log-goal-select').value;
    const note = document.getElementById('log-note').value.trim();
    const hours = document.getElementById('log-hours').value;

    if (!note) {
        document.getElementById('log-note').style.borderColor = '#ef4444';
        setTimeout(() => document.getElementById('log-note').style.borderColor = '', 1500);
        return;
    }

    logEntries.push({
        goal,
        note,
        hours: hours || '0',
        date: new Date().toISOString()
    });

    saveToLS(LS_KEY_LOGS, logEntries);
    renderLogEntries();
    renderChart();
    closeLogModal();

    // refresh overview if open
    if (activeGoalOverview) updateAllProgress();
}

function deleteLog(idx) {
    const sorted = [...logEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const entry = sorted[idx];
    const origIdx = logEntries.indexOf(entry);
    if (origIdx > -1) {
        logEntries.splice(origIdx, 1);
        saveToLS(LS_KEY_LOGS, logEntries);
        renderLogEntries();
        renderChart();
        if (activeGoalOverview) updateAllProgress();
    }
}

// ═══════════════════════════════════════
//  MILESTONES
// ═══════════════════════════════════════
function updateMilestones() {
    const today = new Date();
    const msPerDay = 86400000;
    const daysElapsed = Math.max(0, Math.ceil((today - START_DATE) / msPerDay));

    const milestoneDays = [1, 7, 30, 60, 90];
    const lines = document.querySelectorAll('.milestone-line');
    let lineIdx = 0;

    milestoneDays.forEach((day, i) => {
        const dot = document.getElementById(`ms-dot-${day}`);
        if (dot && daysElapsed >= day) {
            dot.classList.add('reached');
        }
        if (i < milestoneDays.length - 1 && lines[lineIdx]) {
            if (daysElapsed >= milestoneDays[i + 1]) {
                lines[lineIdx].classList.add('filled');
            } else if (daysElapsed >= day) {
                const range = milestoneDays[i + 1] - day;
                const progress = Math.min(1, (daysElapsed - day) / range);
                lines[lineIdx].classList.add('filled');
                // create a scoped style for partial fill
                const style = document.createElement('style');
                style.textContent = `.milestones-track .milestone-line:nth-child(${(i * 2) + 2}).filled::after { width: ${progress * 100}% !important; }`;
                document.head.appendChild(style);
            }
            lineIdx++;
        }
    });
}

// ═══════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
