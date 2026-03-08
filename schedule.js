// ── Navbar toggle (mobile) ──
function toggleNav() {
    document.getElementById("nav-links").classList.toggle("open");
}

const categoryColors = {
    routine: { dot: "#94a3b8" },
    career: { dot: "#f59e0b" },
    youtube: { dot: "#ef4444" },
    communication: { dot: "#8b5cf6" },
    appearance: { dot: "#06b6d4" },
};

const schedules = {
    weekday: [
        { time: "6:00 – 6:10 AM", task: "Wake Up & Brush Teeth", icon: "🌅", category: "routine", tip: null },
        { time: "6:10 – 6:50 AM", task: "Exercise / Yoga / Walk", icon: "🏋️", category: "appearance", tip: "40 min fasted workout — best time for energy & metabolism all day." },
        { time: "6:50 – 7:15 AM", task: "Bath & Freshen Up", icon: "🚿", category: "routine", tip: null },
        { time: "7:15 – 7:45 AM", task: "Temple Visit + Morning Prayer", icon: "🛕", category: "routine", tip: "Set your intention for the day. Mental clarity before the chaos begins." },
        { time: "7:45 – 8:05 AM", task: "Get Ready for Office", icon: "👔", category: "routine", tip: "Dress sharp every day — presentation starts with how you carry yourself." },
        { time: "8:05 – 8:15 AM", task: "1st Meal (Breakfast)", icon: "🍽️", category: "routine", tip: null },
        { time: "8:15 – 9:15 AM", task: "Commute → AML Study (Audio)", icon: "🚌", category: "career", tip: "ACAMS podcasts, AML audiobooks, or Financial Crime YouTube lectures." },
        { time: "9:15 – 5:45 PM", task: "Office Hours", icon: "🏦", category: "routine", tip: "LUNCH BREAK HACK: 15 min for LinkedIn updates / AML job applications / networking." },
        { time: "5:45 – 6:45 PM", task: "Commute → Communication Skills", icon: "🚌", category: "communication", tip: "TED Talks, public speaking podcasts, or narrate your thoughts aloud." },
        { time: "6:45 – 7:30 PM", task: "Buffer — Unwind & Decompress", icon: "🛋️", category: "routine", tip: "Change clothes, have tea, rest fully. Zero obligations. You earned it." },
        { time: "7:30 – 8:30 PM", task: "AML Deep Study Block", icon: "📚", category: "career", tip: "ACAMS material, FATF guidelines, KYC/CFT frameworks, AML case studies." },
        { time: "8:30 – 9:00 PM", task: "YouTube Channel Work", icon: "🎥", category: "youtube", tip: "Script, film, or edit. Niche idea: AML explainers — your expertise is your edge!" },
        { time: "9:00 – 9:30 PM", task: "Last Meal (Dinner)", icon: "🍛", category: "routine", tip: null },
        { time: "9:30 – 10:00 PM", task: "Communication Practice", icon: "🎤", category: "communication", tip: "Record yourself for 5 min. Read 10 pages. Mirror practice for presentations." },
        { time: "10:00 – 10:20 PM", task: "Grooming + Skincare Routine", icon: "✨", category: "appearance", tip: "Consistent night routine for skin, hair & overall appearance improvement." },
        { time: "10:20 – 10:30 PM", task: "Plan Tomorrow / Journal", icon: "📝", category: "routine", tip: "3 wins of today + 3 priorities for tomorrow." },
        { time: "10:30 – 11:00 PM", task: "Wind Down / Relax", icon: "🌙", category: "routine", tip: "No screens. Light reading or calm music." },
        { time: "11:00 PM", task: "Sleep", icon: "😴", category: "routine", tip: null },
    ],
    worksat: [
        { time: "6:00 – 6:10 AM", task: "Wake Up & Brush Teeth", icon: "🌅", category: "routine", tip: null },
        { time: "6:10 – 6:50 AM", task: "Exercise / Yoga / Walk", icon: "🏋️", category: "appearance", tip: "Keep the morning routine intact even on working Saturdays." },
        { time: "6:50 – 7:15 AM", task: "Bath & Freshen Up", icon: "🚿", category: "routine", tip: null },
        { time: "7:15 – 7:45 AM", task: "Temple Visit + Morning Prayer", icon: "🛕", category: "routine", tip: null },
        { time: "7:45 – 8:05 AM", task: "Get Ready for Office", icon: "👔", category: "routine", tip: null },
        { time: "8:05 – 8:15 AM", task: "Breakfast", icon: "🍽️", category: "routine", tip: null },
        { time: "8:15 – 9:15 AM", task: "Commute → AML Study (Audio)", icon: "🚌", category: "career", tip: "Use every commute minute — Saturday commute counts too." },
        { time: "9:15 – 5:45 PM", task: "Office Hours", icon: "🏦", category: "routine", tip: "LUNCH BREAK: Send 2–3 job applications or connect with AML professionals on LinkedIn." },
        { time: "5:45 – 6:45 PM", task: "Commute → Relax / Podcast", icon: "🚌", category: "routine", tip: "You worked a full week — Saturday return commute is rest time, not study." },
        { time: "6:45 – 7:30 PM", task: "Extended Buffer — Full Relax", icon: "🛋️", category: "routine", tip: "Longer wind-down. It's the weekend — recharge properly." },
        { time: "7:30 – 8:30 PM", task: "YouTube Deep Work (Filming/Editing)", icon: "🎥", category: "youtube", tip: "Batch film 2 videos or do a full editing session. More time = better content." },
        { time: "8:30 – 9:00 PM", task: "AML Mock Interview Prep", icon: "🎯", category: "career", tip: "Practice AML interview questions. Record your answers. Review and improve." },
        { time: "9:00 – 9:30 PM", task: "Dinner", icon: "🍛", category: "routine", tip: null },
        { time: "9:30 – 10:15 PM", task: "Free Time / Family / Entertainment", icon: "🎉", category: "routine", tip: "Completely guilt-free. Watch something, call family, go out. You need balance." },
        { time: "10:15 – 10:30 PM", task: "Journal + Plan Weekend", icon: "📝", category: "routine", tip: "Quick plan for your free Sunday — what is the #1 goal task to do?" },
        { time: "10:30 – 11:00 PM", task: "Wind Down", icon: "🌙", category: "routine", tip: null },
        { time: "11:00 PM", task: "Sleep", icon: "😴", category: "routine", tip: null },
    ],
    freeday: [
        { time: "6:30 – 6:40 AM", task: "Wake Up (Slight Sleep-in)", icon: "🌅", category: "routine", tip: "Small reward — 30 min extra sleep. Do not overdo it or you will feel groggy." },
        { time: "6:40 – 6:50 AM", task: "Brush Teeth", icon: "🪥", category: "routine", tip: null },
        { time: "6:50 – 7:40 AM", task: "Extended Exercise / Outdoor Run", icon: "🏃", category: "appearance", tip: "50 min — longer session on free days. Run outdoors, gym, or full yoga flow." },
        { time: "7:40 – 8:10 AM", task: "Bath & Thorough Grooming", icon: "🚿", category: "appearance", tip: "Take time for haircare, skincare, full grooming routine. Invest in your appearance." },
        { time: "8:10 – 8:40 AM", task: "Temple Visit + Slow Morning", icon: "🛕", category: "routine", tip: "No rush today. Be fully present." },
        { time: "8:40 – 9:15 AM", task: "Leisurely Breakfast", icon: "🍽️", category: "routine", tip: "Eat well. Try a new healthy recipe. Proper fuel for a big day." },
        { time: "9:15 – 11:15 AM", task: "AML Power Study Block (2 hrs)", icon: "📚", category: "career", tip: "Most valuable block of your week. No commute, no distractions. ACAMS chapters, practice tests, deep case study dives." },
        { time: "11:15 – 11:30 AM", task: "Short Break", icon: "☕", category: "routine", tip: null },
        { time: "11:30 AM – 1:30 PM", task: "YouTube Deep Work (2 hrs)", icon: "🎥", category: "youtube", tip: "Film 1–2 videos, batch edit, plan next week's content. This is your content factory." },
        { time: "1:30 – 2:30 PM", task: "Lunch + Full Rest", icon: "🍛", category: "routine", tip: "Proper meal + rest or short nap. Recharge for the afternoon." },
        { time: "2:30 – 3:30 PM", task: "Personal Development (Book/Course)", icon: "📖", category: "communication", tip: "Communication or leadership books, online courses, or skill-building content." },
        { time: "3:30 – 4:30 PM", task: "Wardrobe / Grooming Errands", icon: "🛍️", category: "appearance", tip: "Shop for office clothes, grooming products. Get a haircut. Invest in your look." },
        { time: "4:30 – 5:30 PM", task: "Free Time — Hobby / Family / Friends", icon: "🎉", category: "routine", tip: "Complete freedom. Go out, socialise, entertain. Mental health is part of the plan." },
        { time: "5:30 – 6:30 PM", task: "Resume, LinkedIn & Job Applications", icon: "💼", category: "career", tip: "Apply to 5–10 AML roles. Update LinkedIn. Connect with recruiters and AML professionals." },
        { time: "6:30 – 7:00 PM", task: "Presentation Practice (Recorded)", icon: "🎤", category: "communication", tip: "Record a 5–10 min video of yourself presenting. Watch it back. Improve one thing each week." },
        { time: "7:00 – 8:00 PM", task: "Leisure / Family / Relaxation", icon: "🌿", category: "routine", tip: "Wind down the evening. Fully off." },
        { time: "8:00 – 9:00 PM", task: "Dinner + Social Time", icon: "🍛", category: "routine", tip: null },
        { time: "9:00 – 10:00 PM", task: "Weekly Review + Next Week Planning", icon: "📝", category: "routine", tip: "Review your 3 goals: What progressed? What is lagging? Set the #1 priority for next week." },
        { time: "10:00 – 10:30 PM", task: "Wind Down / Grooming", icon: "🌙", category: "appearance", tip: null },
        { time: "10:30 – 11:00 PM", task: "Relax + Light Reading", icon: "📕", category: "routine", tip: null },
        { time: "11:00 PM", task: "Sleep", icon: "😴", category: "routine", tip: null },
    ],
};

const tabLabels = {
    weekday: "🏦 Mon – Fri — Hour by Hour",
    worksat: "📅 Working Saturday — Hour by Hour",
    freeday: "🌿 Free Weekend — Hour by Hour",
};

const statsData = {
    weekday: [
        { label: "AML Study", time: "1.5 hrs", color: "#f59e0b", sub: "incl. commute" },
        { label: "YouTube Work", time: "30 min", color: "#ef4444", sub: "daily consistency" },
        { label: "Comm & Appearance", time: "1 hr", color: "#8b5cf6", sub: "exercise + practice" },
        { label: "Commute Repurposed", time: "2 hrs", color: "#06b6d4", sub: "zero waste" },
    ],
    worksat: [
        { label: "AML Study", time: "1.5 hrs", color: "#f59e0b", sub: "commute + mock prep" },
        { label: "YouTube Work", time: "1 hr", color: "#ef4444", sub: "deep batch session" },
        { label: "Free Time", time: "1 hr", color: "#06b6d4", sub: "family & rest" },
        { label: "Buffer Time", time: "45 min", color: "#8b5cf6", sub: "full decompression" },
    ],
    freeday: [
        { label: "AML Study", time: "4 hrs", color: "#f59e0b", sub: "peak focus block" },
        { label: "YouTube Work", time: "2 hrs", color: "#ef4444", sub: "batch content day" },
        { label: "Personal Dev", time: "2 hrs", color: "#8b5cf6", sub: "books + practice" },
        { label: "Free Time", time: "2+ hrs", color: "#06b6d4", sub: "guilt-free balance" },
    ],
};

let activeTab = "weekday";
let activeGoal = null;

function toggleGoal(id) {
    const card = document.getElementById("goal-" + id);
    const toggle = document.getElementById("toggle-" + id);
    if (activeGoal === id) {
        card.classList.remove("active");
        card.style.borderColor = "#1e3a5f";
        toggle.textContent = "▼ View action plan";
        activeGoal = null;
    } else {
        if (activeGoal) {
            const prev = document.getElementById("goal-" + activeGoal);
            prev.classList.remove("active");
            prev.style.borderColor = "#1e3a5f";
            document.getElementById("toggle-" + activeGoal).textContent = "▼ View action plan";
        }
        card.classList.add("active");
        const colors = { career: "#f59e0b", youtube: "#ef4444", communication: "#8b5cf6" };
        card.style.borderColor = colors[id];
        toggle.textContent = "▲ Hide actions";
        activeGoal = id;
    }
}

// ── Shared localStorage key (same as progress.js) ──
const LS_KEY_TASKS = 'neepro_progress_tasks';

// Goal UL id → goalId mapping
const ulToGoalId = {
    'actions-career': 'career',
    'actions-youtube': 'youtube',
    'actions-communication': 'communication'
};

function getTaskStates() {
    try {
        const raw = localStorage.getItem(LS_KEY_TASKS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveTaskStates(states) {
    localStorage.setItem(LS_KEY_TASKS, JSON.stringify(states));
}

// ── Toggle Individual Task Complete (synced with Progress page) ──
function toggleTask(checkbox) {
    const textSpan = checkbox.parentElement.querySelector('.task-text');
    const li = checkbox.closest('li');

    if (checkbox.checked) {
        textSpan.classList.add('done');
        // Smoothly hide completed task
        li.style.transition = 'all 0.3s ease';
        li.style.opacity = '0';
        li.style.transform = 'translateX(20px)';
        setTimeout(() => li.style.display = 'none', 300);
    } else {
        textSpan.classList.remove('done');
    }

    // find which goal and task index this belongs to
    const ul = li.closest('ul');
    if (!ul) return;

    const goalId = ulToGoalId[ul.id];
    if (!goalId) return;

    const lis = Array.from(ul.querySelectorAll(':scope > li'));
    const idx = lis.indexOf(li);
    if (idx === -1) return;

    // save to shared localStorage
    const states = getTaskStates();
    states[`${goalId}_${idx}`] = checkbox.checked;
    saveTaskStates(states);
}

// ── Load saved task states on page load ──
function loadTaskStates() {
    const states = getTaskStates();

    Object.keys(ulToGoalId).forEach(ulId => {
        const ul = document.getElementById(ulId);
        if (!ul) return;
        const goalId = ulToGoalId[ulId];
        const lis = Array.from(ul.querySelectorAll(':scope > li'));

        lis.forEach((li, idx) => {
            const key = `${goalId}_${idx}`;
            if (states[key]) {
                const checkbox = li.querySelector('input[type="checkbox"]');
                const textSpan = li.querySelector('.task-text');
                if (checkbox) {
                    checkbox.checked = true;
                    if (textSpan) textSpan.classList.add('done');
                    li.style.display = 'none';
                }
            }
        });
    });
}

// ── Edit Individual Task ──
function editTask(btn) {
    const li = btn.closest('li');
    const textSpan = li.querySelector('.task-text');

    // If already editing, bail
    if (li.querySelector('.task-edit-input')) return;

    const currentText = textSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'task-edit-input';

    // Save on Enter or blur
    function save() {
        const newText = input.value.trim();
        textSpan.textContent = newText || currentText; // fallback to old if empty
        textSpan.style.display = '';
        input.remove();
    }
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') {
            textSpan.style.display = '';
            input.remove();
        }
    });
    input.addEventListener('blur', save);

    textSpan.style.display = 'none';
    textSpan.parentElement.insertBefore(input, textSpan.nextSibling);
    input.focus();
    input.select();
}

// ── Add New Task ──
function addTask(ulId, color) {
    const ul = document.getElementById(ulId);

    const li = document.createElement('li');
    li.style.borderLeft = '2px solid ' + color;

    li.innerHTML = `
    <label class="task-check">
      <input type="checkbox" onchange="toggleTask(this)">
      <span class="task-text">New task</span>
    </label>
    <button class="task-edit-btn" onclick="editTask(this)" title="Edit">✏️</button>
    <button class="task-del-btn" onclick="deleteTask(this)" title="Delete">🗑️</button>
  `;

    ul.appendChild(li);

    // Auto-enter edit mode on the new task
    const editBtn = li.querySelector('.task-edit-btn');
    editTask(editBtn);
}

// ── Delete Task ──
function deleteTask(btn) {
    const li = btn.closest('li');
    li.style.transition = 'all 0.25s ease';
    li.style.opacity = '0';
    li.style.transform = 'translateX(-20px)';
    setTimeout(() => li.remove(), 250);
}

function switchTab(tab) {
    activeTab = tab;
    ["weekday", "worksat", "freeday"].forEach(t => {
        document.getElementById("tab-" + t).classList.toggle("active", t === tab);
        const banner = document.getElementById("banner-" + t);
        banner.classList.toggle("visible", t === tab);
    });
    document.getElementById("table-label").textContent = tabLabels[tab];
    renderTable();
    renderStats();
}

function renderTable() {
    const data = schedules[activeTab];
    const table = document.getElementById("schedule-table");
    table.innerHTML = data.map((item, i) => {
        const dot = categoryColors[item.category]?.dot || "#94a3b8";
        const isGoal = item.category !== "routine";
        const tipHTML = item.tip
            ? `<div class="row-tip" style="border-left:2px solid ${dot}">💡 ${item.tip}</div>`
            : "";
        return `
      <div class="schedule-row">
        <div class="row-time">${item.time}</div>
        <div class="row-icon">${item.icon}</div>
        <div class="row-content">
          <div class="row-task-line">
            <div class="row-dot" style="background:${dot}"></div>
            <span class="row-task ${isGoal ? 'goal-task' : ''}">${item.task}</span>
          </div>
          ${tipHTML}
        </div>
      </div>`;
    }).join("");
}

function renderStats() {
    const stats = statsData[activeTab];
    const grid = document.getElementById("stats-grid");
    grid.innerHTML = stats.map(s => `
    <div class="stat-card" style="border-top:3px solid ${s.color}">
      <div class="stat-time" style="color:${s.color}">${s.time}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-sub">${s.sub}</div>
    </div>`).join("");
}

// Init
renderTable();
renderStats();
loadTaskStates();
