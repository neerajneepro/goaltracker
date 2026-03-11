/* ═══════════════════════════════════════════════════════════════════════
   NEEPRO — Google Sheets Sync Module
   
   Drop-in replacement for localStorage calls.
   Writes to BOTH localStorage (instant) AND Google Sheets (background).
   Reads from localStorage first, then syncs with Sheets on load.
   ═══════════════════════════════════════════════════════════════════════ */

// ┌─────────────────────────────────────────┐
// │  ⚠️  PASTE YOUR WEB APP URL BELOW  ⚠️   │
// └─────────────────────────────────────────┘
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbytDf0o7mvZqr2-VvhB9yyfI3nPxtLDimFXD3SIgF7NO0G6STikRtdqRwvo54sy797u/exec';

// ── Sync state ──
let sheetsSyncEnabled = APPS_SCRIPT_URL !== 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
let syncQueue = [];
let isSyncing = false;
let lastSyncStatus = 'idle'; // 'idle' | 'syncing' | 'success' | 'error'

// ═══════════════════════════════════════
//  CORE — HTTP helpers
//  All communication uses hidden iframe + form POST.
//  POST already works (proven). For reads, the Apps Script
//  returns an HTML page with a <script> that sends data
//  back via window.parent.postMessage().
// ═══════════════════════════════════════

let _sheetsCbCounter = 0;

// Map of pending read requests awaiting postMessage response
const _pendingReads = {};

// Listen for postMessage responses from iframes
window.addEventListener('message', function (event) {
    if (event.data && event.data._neeproSync && event.data._msgId) {
        const msgId = event.data._msgId;
        if (_pendingReads[msgId]) {
            _pendingReads[msgId](event.data.result);
            delete _pendingReads[msgId];
        }
    }
});

/**
 * READ data from Sheets via iframe POST + postMessage.
 * 1. POST {action, _msgId} via hidden form into iframe
 * 2. Apps Script doGet returns HTML page with embedded data
 * 3. HTML page script calls parent.postMessage() to send data back
 */
function sheetsGet(action) {
    if (!sheetsSyncEnabled) return Promise.resolve(null);

    return new Promise((resolve) => {
        const msgId = 'read_' + (++_sheetsCbCounter) + '_' + Date.now();

        // Register pending read
        _pendingReads[msgId] = resolve;

        // Create hidden iframe that loads the Apps Script URL directly
        const iframe = document.createElement('iframe');
        iframe.id = 'sheets-read-iframe-' + _sheetsCbCounter;
        iframe.style.display = 'none';
        // Set src to doGet URL with action + msgId params
        iframe.src = APPS_SCRIPT_URL + '?action=' + encodeURIComponent(action) + '&msgId=' + encodeURIComponent(msgId);
        document.body.appendChild(iframe);

        // Timeout: if no postMessage received in 15s, resolve null
        const timer = setTimeout(() => {
            if (_pendingReads[msgId]) {
                console.warn('[Sheets Sync] GET timeout for:', action);
                delete _pendingReads[msgId];
                resolve(null);
            }
            iframe.remove();
        }, 15000);

        // Wrap resolve to also cleanup on success
        const origResolve = _pendingReads[msgId];
        _pendingReads[msgId] = function (data) {
            clearTimeout(timer);
            origResolve(data);
            setTimeout(() => { iframe.remove(); }, 500);
        };
    });
}

function sheetsPost(action, data) {
    if (!sheetsSyncEnabled) return Promise.resolve(null);

    return new Promise((resolve) => {
        try {
            const msgId = 'write_' + (++_sheetsCbCounter) + '_' + Date.now();
            const payload = JSON.stringify({ action, data, _msgId: msgId });

            _pendingReads[msgId] = resolve;

            const iframeId = 'sheets-write-iframe-' + _sheetsCbCounter;
            const iframe = document.createElement('iframe');
            iframe.name = iframeId;
            iframe.id = iframeId;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = APPS_SCRIPT_URL;
            form.target = iframeId;
            form.style.display = 'none';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'payload';
            input.value = payload;
            form.appendChild(input);

            // Timeout cleanup (10s)
            const timer = setTimeout(() => {
                if (_pendingReads[msgId]) {
                    console.warn('[Sheets Sync] POST timeout for:', action);
                    delete _pendingReads[msgId];
                    resolve({ status: 'ok' }); // assume success on timeout
                }
                iframe.remove();
                form.remove();
            }, 10000);

            // Wrap resolve to cleanup resources correctly
            const origResolve = _pendingReads[msgId];
            _pendingReads[msgId] = function (resultData) {
                clearTimeout(timer);
                console.log('[Sheets Sync] POST success:', action);
                origResolve(resultData);
                setTimeout(() => { iframe.remove(); form.remove(); }, 500);
            };

            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.warn('[Sheets Sync] POST failed:', err.message);
            resolve(null);
        }
    });
}

// ═══════════════════════════════════════
//  SYNC QUEUE — Debounced background sync
// ═══════════════════════════════════════

function queueSync(action, data) {
    if (!sheetsSyncEnabled) return;

    // Replace existing action of same type in queue
    const existingIdx = syncQueue.findIndex(item => item.action === action);
    if (existingIdx > -1) {
        syncQueue[existingIdx] = { action, data };
    } else {
        syncQueue.push({ action, data });
    }

    // Debounce: process queue after 500ms of no new items
    clearTimeout(queueSync._timer);
    queueSync._timer = setTimeout(processQueue, 500);
}

async function processQueue() {
    if (isSyncing || syncQueue.length === 0) return;

    isSyncing = true;
    updateSyncIndicator('syncing');

    while (syncQueue.length > 0) {
        const item = syncQueue.shift();
        try {
            await sheetsPost(item.action, item.data);
        } catch (err) {
            console.warn('[Sheets Sync] Queue item failed:', item.action, err);
            updateSyncIndicator('error');
        }
    }

    isSyncing = false;
    updateSyncIndicator('success');

    // Reset to idle after 3 seconds
    setTimeout(() => updateSyncIndicator('idle'), 3000);
}

// ═══════════════════════════════════════
//  SYNC INDICATOR UI
// ═══════════════════════════════════════

function createSyncIndicator() {
    if (document.getElementById('sheets-sync-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'sheets-sync-indicator';
    indicator.innerHTML = `
        <span class="sync-icon">☁️</span>
        <span class="sync-text">Sheets</span>
    `;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        #sheets-sync-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            color: #94a3b8;
            z-index: 9999;
            transition: all 0.3s ease;
            cursor: default;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        #sheets-sync-indicator:hover {
            background: rgba(15, 23, 42, 0.95);
            border-color: rgba(255, 255, 255, 0.15);
        }
        #sheets-sync-indicator.syncing {
            border-color: rgba(245, 158, 11, 0.4);
            color: #f59e0b;
        }
        #sheets-sync-indicator.syncing .sync-icon {
            animation: syncPulse 1s infinite;
        }
        #sheets-sync-indicator.success {
            border-color: rgba(34, 197, 94, 0.4);
            color: #22c55e;
        }
        #sheets-sync-indicator.error {
            border-color: rgba(239, 68, 68, 0.4);
            color: #ef4444;
        }
        #sheets-sync-indicator.disabled {
            opacity: 0.4;
        }
        .sync-icon {
            font-size: 14px;
        }
        .sync-text {
            font-weight: 500;
            letter-spacing: 0.3px;
        }
        @keyframes syncPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(indicator);

    if (!sheetsSyncEnabled) {
        indicator.classList.add('disabled');
        indicator.querySelector('.sync-text').textContent = 'Not linked';
        indicator.title = 'Set APPS_SCRIPT_URL in sheets-sync.js to enable Google Sheets sync';
    } else {
        indicator.title = 'Connected to Google Sheets';
    }
}

function updateSyncIndicator(status) {
    lastSyncStatus = status;
    const el = document.getElementById('sheets-sync-indicator');
    if (!el) return;

    el.classList.remove('syncing', 'success', 'error', 'disabled');

    switch (status) {
        case 'syncing':
            el.classList.add('syncing');
            el.querySelector('.sync-icon').textContent = '🔄';
            el.querySelector('.sync-text').textContent = 'Syncing...';
            el.title = 'Saving to Google Sheets...';
            break;
        case 'success':
            el.classList.add('success');
            el.querySelector('.sync-icon').textContent = '✅';
            el.querySelector('.sync-text').textContent = 'Synced';
            el.title = 'Data saved to Google Sheets';
            break;
        case 'error':
            el.classList.add('error');
            el.querySelector('.sync-icon').textContent = '⚠️';
            el.querySelector('.sync-text').textContent = 'Sync failed';
            el.title = 'Failed to save to Google Sheets. Data is saved locally.';
            break;
        default:
            el.querySelector('.sync-icon').textContent = '☁️';
            el.querySelector('.sync-text').textContent = 'Sheets';
            el.title = 'Connected to Google Sheets';
    }
}

// ═══════════════════════════════════════
//  PUBLIC API — Drop-in replacements
// ═══════════════════════════════════════

/**
 * Save task states — writes to localStorage immediately + queues Sheets sync
 * @param {Object} taskStates - { "career_0": true, "youtube_1": false, ... }
 */
function syncSaveTaskStates(taskStates) {
    // Instant local save
    localStorage.setItem('neepro_progress_tasks', JSON.stringify(taskStates));
    // Background Sheets sync
    queueSync('saveTasks', taskStates);
}

/**
 * Save a new log entry — writes to localStorage immediately + queues Sheets sync
 * @param {Array} logEntries - Full log entries array
 * @param {Object} newEntry - The new entry just added (for individual sync)
 */
function syncSaveLog(logEntries, newEntry) {
    // Add an ID if not present
    if (!newEntry.id) {
        newEntry.id = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
    // Instant local save
    localStorage.setItem('neepro_progress_logs', JSON.stringify(logEntries));
    // Background Sheets sync — save individual entry
    queueSync('saveLog', newEntry);
}

/**
 * Delete a log entry — updates localStorage + queues Sheets deletion
 * @param {Array} logEntries - Updated log entries array (after deletion)
 * @param {string} deletedId - ID of the deleted log entry
 */
function syncDeleteLog(logEntries, deletedId) {
    localStorage.setItem('neepro_progress_logs', JSON.stringify(logEntries));
    queueSync('deleteLog', { id: deletedId });
}

/**
 * Save settings — writes to localStorage immediately + queues Sheets sync
 * @param {Object} settings - { startDate: "2026-03-08", duration: 90 }
 */
function syncSaveSettings(settings) {
    localStorage.setItem('neepro_settings', JSON.stringify(settings));
    queueSync('saveSettings', settings);
}

/**
 * Save resource card links — writes to localStorage immediately + queues Sheets sync
 * @param {string} cardKey - localStorage key like "res_AML Certification"
 * @param {Array} links - Array of link objects
 */
function syncSaveResourceLinks(cardKey, links) {
    localStorage.setItem(cardKey, JSON.stringify(links));
    queueSync('saveResources', { cardKey, type: 'links', data: links });
}

/**
 * Save resource card books — writes to localStorage immediately + queues Sheets sync
 * @param {string} cardKey - localStorage key like "res_AML Certification"
 * @param {Array} books - Array of book objects
 */
function syncSaveResourceBooks(cardKey, books) {
    localStorage.setItem(cardKey + '_books', JSON.stringify(books));
    queueSync('saveResources', { cardKey, type: 'books', data: books });
}

// ═══════════════════════════════════════
//  INITIAL SYNC — Pull from Sheets on load
// ═══════════════════════════════════════

/**
 * Pull all data from Google Sheets and merge with localStorage.
 * Sheets data takes priority (it's the "source of truth").
 * Call this once on page load.
 */
async function initialSyncFromSheets() {
    if (!sheetsSyncEnabled) {
        console.log('[Sheets Sync] Not enabled. Using localStorage only.');
        return false;
    }

    updateSyncIndicator('syncing');

    try {
        const remote = await sheetsGet('getAll');
        if (!remote || remote.error) {
            console.warn('[Sheets Sync] Initial sync failed:', remote?.error || 'No response');
            updateSyncIndicator('error');
            setTimeout(() => updateSyncIndicator('idle'), 3000);
            return false;
        }

        // ── Merge Tasks ──
        if (remote.tasks && Object.keys(remote.tasks).length > 0) {
            localStorage.setItem('neepro_progress_tasks', JSON.stringify(remote.tasks));
            console.log('[Sheets Sync] Tasks loaded from Sheets:', Object.keys(remote.tasks).length, 'entries');
        }

        // ── Merge Logs ──
        if (remote.logs && remote.logs.length > 0) {
            localStorage.setItem('neepro_progress_logs', JSON.stringify(remote.logs));
            console.log('[Sheets Sync] Logs loaded from Sheets:', remote.logs.length, 'entries');
        }

        // ── Merge Settings ──
        if (remote.settings && Object.keys(remote.settings).length > 0) {
            localStorage.setItem('neepro_settings', JSON.stringify(remote.settings));
            console.log('[Sheets Sync] Settings loaded from Sheets');
        }

        // ── Merge Resources ──
        if (remote.resources) {
            Object.keys(remote.resources).forEach(key => {
                localStorage.setItem(key, JSON.stringify(remote.resources[key]));
            });
            console.log('[Sheets Sync] Resources loaded from Sheets:', Object.keys(remote.resources).length, 'cards');
        }

        updateSyncIndicator('success');
        setTimeout(() => updateSyncIndicator('idle'), 3000);
        console.log('[Sheets Sync] ✅ Initial sync complete!');
        return true;

    } catch (err) {
        console.warn('[Sheets Sync] Initial sync error:', err.message);
        updateSyncIndicator('error');
        setTimeout(() => updateSyncIndicator('idle'), 3000);
        return false;
    }
}

/**
 * Push all current localStorage data UP to Sheets.
 * Useful for first-time migration from localStorage → Sheets.
 */
async function pushAllToSheets() {
    if (!sheetsSyncEnabled) {
        alert('Sheets sync is not enabled. Set APPS_SCRIPT_URL first.');
        return;
    }

    updateSyncIndicator('syncing');

    try {
        // Gather all data from localStorage
        const allData = {};

        // Tasks
        try {
            const tasks = localStorage.getItem('neepro_progress_tasks');
            if (tasks) allData.tasks = JSON.parse(tasks);
        } catch { }

        // Logs
        try {
            const logs = localStorage.getItem('neepro_progress_logs');
            if (logs) allData.logs = JSON.parse(logs);
        } catch { }

        // Settings
        try {
            const settings = localStorage.getItem('neepro_settings');
            if (settings) allData.settings = JSON.parse(settings);
        } catch { }

        const result = await sheetsPost('saveAll', allData);

        if (result && !result.error) {
            updateSyncIndicator('success');
            console.log('[Sheets Sync] ✅ All data pushed to Sheets!', result);
            setTimeout(() => updateSyncIndicator('idle'), 3000);
        } else {
            throw new Error(result?.error || 'Unknown error');
        }
    } catch (err) {
        console.error('[Sheets Sync] Push failed:', err.message);
        updateSyncIndicator('error');
        setTimeout(() => updateSyncIndicator('idle'), 3000);
    }
}

// ═══════════════════════════════════════
//  AUTO-INIT
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    createSyncIndicator();
    // Initial sync: pull from Sheets in background
    initialSyncFromSheets().then(synced => {
        if (synced) {
            // Reload the page data after sync (dispatch custom event)
            window.dispatchEvent(new CustomEvent('sheets-synced'));
        }
    });
});
