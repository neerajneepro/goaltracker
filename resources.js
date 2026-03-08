/* ══════════════════════════════════════════════
   Resources Page — JavaScript
   CRUD links · Filter · Search · Persist
   ══════════════════════════════════════════════ */

// ── State ──
let activeFilter = 'all';
let currentEditTarget = null; // { linksContainer, linkRow: null|Element }
let currentBookEdit = null;   // { container, bookItem: null|Element }

// ══════════════════════════════════════
// Mobile nav toggle
// ══════════════════════════════════════
function toggleNav() {
    document.getElementById('nav-links').classList.toggle('open');
}

// ══════════════════════════════════════
// LINK CRUD — Core helpers
// ══════════════════════════════════════

/** Derive a localStorage key from a resource card's title */
function getCardKey(card) {
    const el = card.querySelector('.card-title');
    return el ? 'res_' + el.textContent.trim() : null;
}

/** Save all links of a card to localStorage */
function saveCardLinks(card) {
    const key = getCardKey(card);
    if (!key) return;

    const container = card.querySelector('.card-links');
    if (!container) return;

    const links = [];
    container.querySelectorAll('.link-row').forEach(row => {
        const a = row.querySelector('.card-link');
        if (a) {
            links.push({
                icon: a.querySelector('.link-icon-text')?.textContent || '🔗',
                label: a.querySelector('.link-label-text')?.textContent || '',
                url: a.href || '#'
            });
        }
    });

    localStorage.setItem(key, JSON.stringify(links));
}

/** Create a .link-row element with edit/delete buttons */
function createLinkRow(icon, label, url) {
    const row = document.createElement('div');
    row.className = 'link-row';

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'card-link';
    a.innerHTML = `<span class="link-icon-text">${icon}</span> <span class="link-label-text">${label}</span>`;

    const editBtn = document.createElement('button');
    editBtn.className = 'link-edit-btn';
    editBtn.title = 'Edit';
    editBtn.textContent = '✏️';
    editBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openEditModal(row);
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'link-del-btn';
    delBtn.title = 'Delete';
    delBtn.textContent = '🗑️';
    delBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        deleteLink(row);
    };

    row.appendChild(a);
    row.appendChild(editBtn);
    row.appendChild(delBtn);
    return row;
}

/** Create and append an "➕ Add link" button to a .card-links container */
function appendAddButton(container) {
    const btn = document.createElement('button');
    btn.className = 'add-link-btn';
    btn.innerHTML = '➕ Add link';
    btn.onclick = function (e) {
        e.preventDefault();
        openAddModal(container);
    };
    container.appendChild(btn);
}

// ══════════════════════════════════════
// LINK CRUD — Init & Persist
// ══════════════════════════════════════

/** On page load: wrap every existing <a.card-link> inside a .link-row
 *  and inject edit/delete buttons + "add link" button */
function initLinkRows() {
    document.querySelectorAll('.card-links').forEach(container => {
        const existing = Array.from(container.querySelectorAll(':scope > a.card-link'));

        existing.forEach(a => {
            // Extract the icon (first <span>) and label text
            const iconSpan = a.querySelector('span');
            const icon = iconSpan ? iconSpan.textContent.trim() : '🔗';
            const label = a.textContent.replace(icon, '').trim();

            // Restructure the anchor with explicit icon/label spans
            a.innerHTML = `<span class="link-icon-text">${icon}</span> <span class="link-label-text">${label}</span>`;

            // Wrap in a .link-row
            const row = document.createElement('div');
            row.className = 'link-row';
            container.insertBefore(row, a);
            row.appendChild(a);

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'link-edit-btn';
            editBtn.title = 'Edit';
            editBtn.textContent = '✏️';
            editBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                openEditModal(row);
            };
            row.appendChild(editBtn);

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'link-del-btn';
            delBtn.title = 'Delete';
            delBtn.textContent = '🗑️';
            delBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                deleteLink(row);
            };
            row.appendChild(delBtn);
        });

        // "Add link" button at the end
        appendAddButton(container);
    });
}

/** On page load: if localStorage has saved links for a card,
 *  rebuild that card's links from the saved data */
function loadSavedLinks() {
    document.querySelectorAll('.resource-card').forEach(card => {
        const key = getCardKey(card);
        if (!key) return;

        const saved = localStorage.getItem(key);
        if (!saved) return;

        try {
            const links = JSON.parse(saved);
            const container = card.querySelector('.card-links');
            if (!container) return;

            // Clear everything (including previously injected buttons)
            container.innerHTML = '';

            // Rebuild rows from saved data
            links.forEach(link => {
                const row = createLinkRow(link.icon, link.label, link.url);
                container.appendChild(row);
            });

            // Re-add the "Add link" button
            appendAddButton(container);
        } catch (e) {
            console.error('Failed to load saved links for', key, e);
        }
    });
}

// ══════════════════════════════════════
// LINK CRUD — Modal
// ══════════════════════════════════════

function openAddModal(linksContainer) {
    currentEditTarget = { linksContainer, linkRow: null };
    document.getElementById('modal-title-text').textContent = '➕ Add Link';
    document.getElementById('link-label-input').value = '';
    document.getElementById('link-url-input').value = '';
    document.getElementById('link-icon-input').value = '🔗';
    resetInputBorders();
    document.getElementById('link-modal').classList.add('open');
    setTimeout(() => document.getElementById('link-label-input').focus(), 100);
}

function openEditModal(linkRow) {
    const a = linkRow.querySelector('.card-link');
    const icon = linkRow.querySelector('.link-icon-text')?.textContent || '🔗';
    const label = linkRow.querySelector('.link-label-text')?.textContent || '';
    const url = a?.href || '';

    const linksContainer = linkRow.parentElement;
    currentEditTarget = { linksContainer, linkRow };

    document.getElementById('modal-title-text').textContent = '✏️ Edit Link';
    document.getElementById('link-label-input').value = label;
    document.getElementById('link-url-input').value = url;
    document.getElementById('link-icon-input').value = icon;
    resetInputBorders();
    document.getElementById('link-modal').classList.add('open');
    setTimeout(() => document.getElementById('link-label-input').focus(), 100);
}

function closeLinkModal() {
    document.getElementById('link-modal').classList.remove('open');
    currentEditTarget = null;
}

function submitLink() {
    const label = document.getElementById('link-label-input').value.trim();
    const url = document.getElementById('link-url-input').value.trim();
    const icon = document.getElementById('link-icon-input').value.trim() || '🔗';

    let valid = true;
    if (!label) {
        document.getElementById('link-label-input').style.borderColor = '#ef4444';
        valid = false;
    }
    if (!url) {
        document.getElementById('link-url-input').style.borderColor = '#ef4444';
        valid = false;
    }
    if (!valid) return;
    if (!currentEditTarget) return;

    const { linksContainer, linkRow } = currentEditTarget;

    if (linkRow) {
        // ── Editing existing link ──
        const a = linkRow.querySelector('.card-link');
        a.href = url;
        a.querySelector('.link-icon-text').textContent = icon;
        a.querySelector('.link-label-text').textContent = label;

        // Flash animation
        linkRow.style.transition = 'background 0.3s';
        linkRow.style.background = 'rgba(56, 189, 248, 0.08)';
        setTimeout(() => { linkRow.style.background = ''; }, 600);
    } else {
        // ── Adding new link ──
        const newRow = createLinkRow(icon, label, url);
        const addBtn = linksContainer.querySelector('.add-link-btn');
        linksContainer.insertBefore(newRow, addBtn);

        // Entrance animation
        newRow.style.opacity = '0';
        newRow.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
            newRow.style.transition = 'opacity 0.3s, transform 0.3s';
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
        });
    }

    // Persist
    const card = linksContainer.closest('.resource-card');
    if (card) saveCardLinks(card);

    closeLinkModal();
}

function deleteLink(linkRow) {
    const label = linkRow.querySelector('.link-label-text')?.textContent || 'this link';
    if (!confirm(`Delete "${label}"?`)) return;

    const linksContainer = linkRow.parentElement;
    const card = linksContainer.closest('.resource-card');

    // Slide-out animation
    linkRow.style.transition = 'opacity 0.25s, transform 0.25s';
    linkRow.style.opacity = '0';
    linkRow.style.transform = 'translateX(-20px)';

    setTimeout(() => {
        linkRow.remove();
        if (card) saveCardLinks(card);
    }, 250);
}

function resetInputBorders() {
    document.getElementById('link-label-input').style.borderColor = '';
    document.getElementById('link-url-input').style.borderColor = '';
}

// ── Modal keyboard & click handlers ──
document.addEventListener('click', function (e) {
    if (e.target === document.getElementById('link-modal')) closeLinkModal();
    if (e.target === document.getElementById('book-modal')) closeBookModal();
});

document.addEventListener('keydown', function (e) {
    const linkModal = document.getElementById('link-modal');
    const bookModal = document.getElementById('book-modal');

    if (linkModal.classList.contains('open')) {
        if (e.key === 'Escape') closeLinkModal();
        if (e.key === 'Enter') { e.preventDefault(); submitLink(); }
        return;
    }
    if (bookModal.classList.contains('open')) {
        if (e.key === 'Escape') closeBookModal();
        if (e.key === 'Enter') { e.preventDefault(); submitBook(); }
        return;
    }
});

// Reset red border on input
document.addEventListener('DOMContentLoaded', () => {
    ['link-label-input', 'link-url-input', 'book-title-input', 'book-author-input'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', function () {
            this.style.borderColor = '';
        });
    });
});

// ══════════════════════════════════════
// BOOK CRUD
// ══════════════════════════════════════

/** Save all books of a card to localStorage */
function saveCardBooks(card) {
    const key = getCardKey(card);
    if (!key) return;

    const container = card.querySelector('.card-links-list');
    if (!container) return;

    const books = [];
    container.querySelectorAll('.book-item').forEach(item => {
        books.push({
            title: item.querySelector('.book-title')?.textContent || '',
            author: item.querySelector('.book-author')?.textContent || ''
        });
    });

    localStorage.setItem(key + '_books', JSON.stringify(books));
}

/** Create a .book-item element with edit/delete buttons */
function createBookItem(num, title, author) {
    const item = document.createElement('div');
    item.className = 'book-item';

    const numSpan = document.createElement('span');
    numSpan.className = 'book-num';
    numSpan.textContent = String(num).padStart(2, '0');

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<div class="book-title">${title}</div><div class="book-author">${author}</div>`;

    const editBtn = document.createElement('button');
    editBtn.className = 'book-edit-btn';
    editBtn.title = 'Edit';
    editBtn.textContent = '✏️';
    editBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openEditBookModal(item);
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'book-del-btn';
    delBtn.title = 'Delete';
    delBtn.textContent = '🗑️';
    delBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        deleteBook(item);
    };

    item.appendChild(numSpan);
    item.appendChild(infoDiv);
    item.appendChild(editBtn);
    item.appendChild(delBtn);
    return item;
}

/** Renumber all book items in a container */
function renumberBooks(container) {
    container.querySelectorAll('.book-item').forEach((item, i) => {
        const num = item.querySelector('.book-num');
        if (num) num.textContent = String(i + 1).padStart(2, '0');
    });
}

/** On page load: inject edit/delete buttons into existing book items + add button */
function initBookRows() {
    document.querySelectorAll('.card-links-list').forEach(container => {
        const existing = Array.from(container.querySelectorAll('.book-item'));

        existing.forEach(item => {
            // Add edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'book-edit-btn';
            editBtn.title = 'Edit';
            editBtn.textContent = '✏️';
            editBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                openEditBookModal(item);
            };
            item.appendChild(editBtn);

            // Add delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'book-del-btn';
            delBtn.title = 'Delete';
            delBtn.textContent = '🗑️';
            delBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                deleteBook(item);
            };
            item.appendChild(delBtn);
        });

        // "Add book" button
        const addBtn = document.createElement('button');
        addBtn.className = 'add-book-btn';
        addBtn.innerHTML = '📖 Add book';
        addBtn.onclick = function (e) {
            e.preventDefault();
            openAddBookModal(container);
        };
        container.appendChild(addBtn);
    });
}

/** On page load: if localStorage has saved books, rebuild */
function loadSavedBooks() {
    document.querySelectorAll('.resource-card').forEach(card => {
        const key = getCardKey(card);
        if (!key) return;

        const saved = localStorage.getItem(key + '_books');
        if (!saved) return;

        try {
            const books = JSON.parse(saved);
            const container = card.querySelector('.card-links-list');
            if (!container) return;

            container.innerHTML = '';

            books.forEach((book, i) => {
                const item = createBookItem(i + 1, book.title, book.author);
                container.appendChild(item);
            });

            // Re-add "Add book" button
            const addBtn = document.createElement('button');
            addBtn.className = 'add-book-btn';
            addBtn.innerHTML = '📖 Add book';
            addBtn.onclick = function (e) {
                e.preventDefault();
                openAddBookModal(container);
            };
            container.appendChild(addBtn);
        } catch (e) {
            console.error('Failed to load saved books for', key, e);
        }
    });
}

// ── Book Modal ──
function openAddBookModal(container) {
    currentBookEdit = { container, bookItem: null };
    document.getElementById('book-modal-title-text').textContent = '📚 Add Book';
    document.getElementById('book-title-input').value = '';
    document.getElementById('book-author-input').value = '';
    document.getElementById('book-title-input').style.borderColor = '';
    document.getElementById('book-author-input').style.borderColor = '';
    document.getElementById('book-modal').classList.add('open');
    setTimeout(() => document.getElementById('book-title-input').focus(), 100);
}

function openEditBookModal(bookItem) {
    const title = bookItem.querySelector('.book-title')?.textContent || '';
    const author = bookItem.querySelector('.book-author')?.textContent || '';
    const container = bookItem.parentElement;

    currentBookEdit = { container, bookItem };
    document.getElementById('book-modal-title-text').textContent = '✏️ Edit Book';
    document.getElementById('book-title-input').value = title;
    document.getElementById('book-author-input').value = author;
    document.getElementById('book-title-input').style.borderColor = '';
    document.getElementById('book-author-input').style.borderColor = '';
    document.getElementById('book-modal').classList.add('open');
    setTimeout(() => document.getElementById('book-title-input').focus(), 100);
}

function closeBookModal() {
    document.getElementById('book-modal').classList.remove('open');
    currentBookEdit = null;
}

function submitBook() {
    const title = document.getElementById('book-title-input').value.trim();
    const author = document.getElementById('book-author-input').value.trim();

    let valid = true;
    if (!title) {
        document.getElementById('book-title-input').style.borderColor = '#ef4444';
        valid = false;
    }
    if (!author) {
        document.getElementById('book-author-input').style.borderColor = '#ef4444';
        valid = false;
    }
    if (!valid || !currentBookEdit) return;

    const { container, bookItem } = currentBookEdit;

    if (bookItem) {
        // ── Editing existing book ──
        bookItem.querySelector('.book-title').textContent = title;
        bookItem.querySelector('.book-author').textContent = author;

        // Flash animation
        bookItem.style.transition = 'background 0.3s';
        bookItem.style.background = 'rgba(139, 92, 246, 0.1)';
        setTimeout(() => { bookItem.style.background = ''; }, 600);
    } else {
        // ── Adding new book ──
        const count = container.querySelectorAll('.book-item').length;
        const newItem = createBookItem(count + 1, title, author);
        const addBtn = container.querySelector('.add-book-btn');
        container.insertBefore(newItem, addBtn);

        // Entrance animation
        newItem.style.opacity = '0';
        newItem.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
            newItem.style.transition = 'opacity 0.3s, transform 0.3s';
            newItem.style.opacity = '1';
            newItem.style.transform = 'translateY(0)';
        });
    }

    // Persist
    const card = container.closest('.resource-card');
    if (card) saveCardBooks(card);

    closeBookModal();
}

function deleteBook(bookItem) {
    const title = bookItem.querySelector('.book-title')?.textContent || 'this book';
    if (!confirm(`Delete ${title}?`)) return;

    const container = bookItem.parentElement;
    const card = container.closest('.resource-card');

    // Slide-out animation
    bookItem.style.transition = 'opacity 0.25s, transform 0.25s';
    bookItem.style.opacity = '0';
    bookItem.style.transform = 'translateX(-20px)';

    setTimeout(() => {
        bookItem.remove();
        renumberBooks(container);
        if (card) saveCardBooks(card);
    }, 250);
}

// ══════════════════════════════════════
// FILTER & SEARCH
// ══════════════════════════════════════

function filterResources(category) {
    activeFilter = category;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });

    document.querySelectorAll('.section-label[data-section]').forEach(label => {
        const s = label.dataset.section;
        label.classList.toggle('section-hidden', !(category === 'all' || s === category || s === 'all'));
    });

    document.querySelectorAll('.resources-grid[data-section], .tools-grid[data-section]').forEach(grid => {
        const s = grid.dataset.section;
        grid.classList.toggle('section-hidden', !(category === 'all' || s === category || s === 'all'));
    });

    document.querySelectorAll('.resource-card, .tool-card').forEach(card => {
        const c = card.dataset.category;
        card.classList.toggle('hidden', !(category === 'all' || c === category || c === 'all'));
    });

    const query = document.getElementById('search-input').value.trim();
    query ? searchResources(query) : updateNoResults();
}

function searchResources(query) {
    const q = query.toLowerCase().trim();
    const clearBtn = document.getElementById('search-clear');
    clearBtn.classList.toggle('visible', q.length > 0);

    if (!q) {
        document.querySelectorAll('.resource-card, .tool-card').forEach(card => {
            const c = card.dataset.category;
            card.classList.toggle('hidden', !(activeFilter === 'all' || c === activeFilter || c === 'all'));
        });
        updateNoResults();
        return;
    }

    document.querySelectorAll('.resource-card').forEach(card => {
        const tags = (card.dataset.tags || '').toLowerCase();
        const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.card-desc')?.textContent || '').toLowerCase();
        const c = card.dataset.category;
        const ok = (activeFilter === 'all' || c === activeFilter || c === 'all')
            && (title.includes(q) || desc.includes(q) || tags.includes(q));
        card.classList.toggle('hidden', !ok);
    });

    document.querySelectorAll('.tool-card').forEach(card => {
        const tags = (card.dataset.tags || '').toLowerCase();
        const name = (card.querySelector('.tool-name')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.tool-desc')?.textContent || '').toLowerCase();
        const c = card.dataset.category;
        const ok = (activeFilter === 'all' || c === activeFilter || c === 'all')
            && (name.includes(q) || desc.includes(q) || tags.includes(q));
        card.classList.toggle('hidden', !ok);
    });

    updateNoResults();
}

function clearSearch() {
    const input = document.getElementById('search-input');
    input.value = '';
    searchResources('');
    input.focus();
}

function updateNoResults() {
    let el = document.getElementById('no-results');
    if (!el) {
        el = document.createElement('div');
        el.className = 'no-results';
        el.id = 'no-results';
        el.innerHTML = '<span class="no-results-icon">🔍</span>No resources found matching your search.';
        document.querySelector('.content').insertBefore(el, document.querySelector('.insight'));
    }
    const total = document.querySelectorAll('.resource-card:not(.hidden)').length
        + document.querySelectorAll('.tool-card:not(.hidden)').length;
    el.classList.toggle('visible', total === 0 && !!document.getElementById('search-input').value.trim());
}

// ══════════════════════════════════════
// Entrance animations
// ══════════════════════════════════════
function animateCards() {
    const cards = document.querySelectorAll('.resource-card, .tool-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 60 * i);
    });
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initLinkRows();     // wrap existing links, inject edit/delete/add buttons
    initBookRows();     // wrap existing books, inject edit/delete/add buttons
    loadSavedLinks();   // restore persisted link changes from localStorage
    loadSavedBooks();   // restore persisted book changes from localStorage
    animateCards();      // entrance animation
});
