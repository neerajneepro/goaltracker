// ── Navbar toggle (mobile) ──
function toggleNav() {
    document.getElementById("nav-links").classList.toggle("open");
}

// ── localStorage keys ──
const LS_KEY_TASKS = 'neepro_progress_tasks';
const LS_KEY_SETTINGS = 'neepro_settings';

// ── Default settings ──
const DEFAULT_START = '2026-03-08';
const DEFAULT_DURATION = 90;

// ── Goal config (matching progress.js) ──
const dashGoals = {
    career: { total: 5, color: '#f59e0b', timeline: '90 days', cardId: 'prog-career' },
    youtube: { total: 5, color: '#ef4444', timeline: '180 days', cardId: 'prog-youtube' },
    communication: { total: 5, color: '#8b5cf6', timeline: 'ongoing', cardId: 'prog-communication' }
};

// ══════════════════════════════════════
// SETTINGS — Load / Save / Modal
// ══════════════════════════════════════

function getSettings() {
    try {
        const raw = localStorage.getItem(LS_KEY_SETTINGS);
        if (raw) {
            const s = JSON.parse(raw);
            return {
                startDate: s.startDate || DEFAULT_START,
                duration: parseInt(s.duration) || DEFAULT_DURATION
            };
        }
    } catch { }
    return { startDate: DEFAULT_START, duration: DEFAULT_DURATION };
}

function openSettings() {
    const settings = getSettings();
    document.getElementById('setting-start-date').value = settings.startDate;
    document.getElementById('setting-duration').value = settings.duration;
    updateSettingsPreview();
    document.getElementById('settings-modal').classList.add('open');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('open');
}

function saveSettings() {
    const startDate = document.getElementById('setting-start-date').value;
    const duration = parseInt(document.getElementById('setting-duration').value);

    if (!startDate) {
        document.getElementById('setting-start-date').style.borderColor = '#ef4444';
        return;
    }
    if (!duration || duration < 1) {
        document.getElementById('setting-duration').style.borderColor = '#ef4444';
        return;
    }

    // Save to localStorage + Sheets
    const settingsObj = { startDate, duration };
    localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(settingsObj));
    if (typeof syncSaveSettings === 'function') syncSaveSettings(settingsObj);

    // Refresh dashboard data
    updateDaysLeft();
    closeSettings();

    // Flash the days-left card to show it updated
    const card = document.getElementById('days-left')?.closest('.overview-card');
    if (card) {
        card.style.transition = 'background 0.3s, border-color 0.3s';
        card.style.background = 'rgba(245, 158, 11, 0.1)';
        card.style.borderColor = '#f59e0b';
        setTimeout(() => {
            card.style.background = '';
            card.style.borderColor = '';
        }, 800);
    }
}

function updateSettingsPreview() {
    const startVal = document.getElementById('setting-start-date').value;
    const durVal = parseInt(document.getElementById('setting-duration').value);
    const preview = document.getElementById('settings-preview');

    if (!startVal || !durVal || durVal < 1) {
        preview.classList.remove('visible');
        return;
    }

    const start = new Date(startVal + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + durVal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.max(0, Math.ceil((end - today) / msPerDay));
    const daysElapsed = Math.max(0, Math.ceil((today - start) / msPerDay));
    const progress = Math.min(100, Math.round((daysElapsed / durVal) * 100));

    const endStr = end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    preview.innerHTML = `
        <strong>📊 Preview</strong><br>
        End Date: <em>${endStr}</em><br>
        Days Elapsed: <em>${daysElapsed}</em> · Days Left: <em>${daysLeft}</em><br>
        Progress: <em>${progress}%</em> of ${durVal}-day plan
    `;
    preview.classList.add('visible');
}

// Live preview update on input change
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('setting-start-date');
    const durInput = document.getElementById('setting-duration');

    if (dateInput) {
        dateInput.addEventListener('input', function () {
            this.style.borderColor = '';
            updateSettingsPreview();
        });
    }
    if (durInput) {
        durInput.addEventListener('input', function () {
            this.style.borderColor = '';
            updateSettingsPreview();
        });
    }

    // Close modal on overlay click
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) closeSettings();
        });
    }
});

// Keyboard: Escape to close, Enter to save
document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('settings-modal');
    if (!modal || !modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeSettings();
    if (e.key === 'Enter') { e.preventDefault(); saveSettings(); }
});

// ══════════════════════════════════════
// TASK STATE
// ══════════════════════════════════════

function getTaskStates() {
    try {
        const raw = localStorage.getItem(LS_KEY_TASKS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

// ══════════════════════════════════════
// DAYS REMAINING (dynamic from settings)
// ══════════════════════════════════════

function updateDaysLeft() {
    const settings = getSettings();
    const start = new Date(settings.startDate + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + settings.duration);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.max(0, Math.ceil((end - today) / msPerDay));
    const daysElapsed = Math.max(0, Math.ceil((today - start) / msPerDay));

    const daysLeftEl = document.getElementById('days-left');
    const streakEl = document.getElementById('streak-count');
    const subEl = daysLeftEl?.closest('.overview-card')?.querySelector('.overview-sub');

    if (daysLeftEl) daysLeftEl.textContent = daysLeft;
    if (streakEl) streakEl.textContent = Math.min(daysElapsed, settings.duration);
    if (subEl) subEl.textContent = `of ${settings.duration}-day plan`;
}

// ══════════════════════════════════════
// GOAL PROGRESS SYNC
// ══════════════════════════════════════

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

// ══════════════════════════════════════
// CROSS-TAB & SHEETS SYNC REFRESH
// ══════════════════════════════════════
window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY_TASKS || e.key === LS_KEY_SETTINGS) {
        updateDaysLeft();
        syncDashboardProgress();
    }
});
window.addEventListener('sheets-synced', () => {
    updateDaysLeft();
    syncDashboardProgress();
});

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
updateDaysLeft();
syncDashboardProgress();

