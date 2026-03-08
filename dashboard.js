// ── Navbar toggle (mobile) ──
function toggleNav() {
    document.getElementById("nav-links").classList.toggle("open");
}

// ── Shared localStorage key (same as progress.js & schedule.js) ──
const LS_KEY_TASKS = 'neepro_progress_tasks';

// ── Goal config (matching progress.js) ──
const dashGoals = {
    career: { total: 5, color: '#f59e0b', timeline: '90 days', cardId: 'prog-career' },
    youtube: { total: 5, color: '#ef4444', timeline: '180 days', cardId: 'prog-youtube' },
    communication: { total: 5, color: '#8b5cf6', timeline: 'ongoing', cardId: 'prog-communication' }
};

function getTaskStates() {
    try {
        const raw = localStorage.getItem(LS_KEY_TASKS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

// ── Calculate days remaining ──
function updateDaysLeft() {
    const startDate = new Date('2026-03-08');
    const endDate = new Date('2026-06-06'); // 90 days from start
    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / msPerDay));
    const daysElapsed = Math.max(0, Math.ceil((today - startDate) / msPerDay));

    document.getElementById('days-left').textContent = daysLeft;

    // Update streak (simple: days since start, capped concept)
    document.getElementById('streak-count').textContent = Math.min(daysElapsed, 90);
}

// ── Sync goal progress cards with localStorage data ──
function syncDashboardProgress() {
    const states = getTaskStates();

    Object.keys(dashGoals).forEach(goalId => {
        const goal = dashGoals[goalId];
        let done = 0;

        for (let i = 0; i < goal.total; i++) {
            if (states[`${goalId}_${i}`]) done++;
        }

        const pct = Math.round((done / goal.total) * 100);
        const card = document.getElementById(goal.cardId);
        if (!card) return;

        // update percentage text
        const pctEl = card.querySelector('.progress-pct');
        if (pctEl) pctEl.textContent = pct + '%';

        // update progress bar fill
        const barFill = card.querySelector('.progress-bar-fill');
        if (barFill) barFill.style.width = pct + '%';

        // update detail text
        const detailEl = card.querySelector('.progress-detail');
        if (detailEl) {
            detailEl.innerHTML = `${done} of ${goal.total} tasks done · <em>${goal.timeline}</em>`;
        }
    });
}

// Init
updateDaysLeft();
syncDashboardProgress();
