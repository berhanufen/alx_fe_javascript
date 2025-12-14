// ====================================
// DYNAMIC QUOTE GENERATOR (FINAL FIXED VERSION)
// ====================================

// --------------------
// STATE & STORAGE
// --------------------
let quotes = [];
let currentCategory = 'all';
let recentQuotes = [];
let quoteIdCounter = 1;
let lastSessionQuote = null;

const STORAGE_KEYS = {
    QUOTES: 'dynamicQuoteGenerator_quotes',
    SESSION_PREFS: 'dynamicQuoteGenerator_sessionPrefs',
    LAST_QUOTE: 'dynamicQuoteGenerator_lastQuote'
};

// --------------------
// DOM ELEMENTS
// --------------------
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteSection = document.getElementById('addQuoteSection');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const quoteForm = document.getElementById('quoteForm');
const quotesList = document.getElementById('quotesList');
const statsDisplay = document.getElementById('statsDisplay');

// --------------------
// INIT
// --------------------
document.addEventListener('DOMContentLoaded', () => {
    loadQuotesFromStorage();
    loadSessionPreferences();
    showQuoteFromSessionOrRandom();
    generateCategoryButtons();
    updateStatistics();
    setupEventListeners();
});

// ====================================
// STORAGE
// ====================================
function saveQuotesToStorage() {
    localStorage.setItem(
        STORAGE_KEYS.QUOTES,
        JSON.stringify({ quotes, quoteIdCounter })
    );
}

function loadQuotesFromStorage() {
    const data = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (data) {
        const parsed = JSON.parse(data);
        quotes = parsed.quotes || [];
        quoteIdCounter = parsed.quoteIdCounter || quotes.length + 1;
    }

    if (quotes.length === 0) loadDefaultQuotes();
}

function loadDefaultQuotes() {
    quotes = [
        { id: 1, text: "The only way to do great work is to love what you do.", category: "Motivation", author: "Steve Jobs" },
        { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life", author: "John Lennon" },
        { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration", author: "Eleanor Roosevelt" },
        { id: 4, text: "It is during our darkest moments that we must focus to see the light.", category: "Wisdom", author: "Aristotle" },
        { id: 5, text: "Whoever is happy will make others happy too.", category: "Happiness", author: "Anne Frank" }
    ];
    quoteIdCounter = quotes.length + 1;
    saveQuotesToStorage();
}

function saveSessionPreferences() {
    sessionStorage.setItem(
        STORAGE_KEYS.SESSION_PREFS,
        JSON.stringify({ currentCategory, recentQuotes })
    );
}

function loadSessionPreferences() {
    const data = sessionStorage.getItem(STORAGE_KEYS.SESSION_PREFS);
    if (data) {
        const parsed = JSON.parse(data);
        currentCategory = parsed.currentCategory || 'all';
        recentQuotes = parsed.recentQuotes || [];
    }

    const lastQuote = sessionStorage.getItem(STORAGE_KEYS.LAST_QUOTE);
    if (lastQuote) lastSessionQuote = JSON.parse(lastQuote);
}

// ====================================
// QUOTE DISPLAY
// ====================================
function showQuoteFromSessionOrRandom() {
    if (lastSessionQuote) {
        displayQuote(lastSessionQuote);
    } else {
        showRandomQuote();
    }
}

function showRandomQuote() {
    const filtered = currentCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === currentCategory);

    if (filtered.length === 0) {
        quoteDisplay.textContent = 'No quotes available.';
        return;
    }

    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    lastSessionQuote = quote;

    sessionStorage.setItem(
        STORAGE_KEYS.LAST_QUOTE,
        JSON.stringify(quote)
    );

    addToRecentQuotes(quote);
    displayQuote(quote);
    updateRecentQuotesList();
    saveSessionPreferences();
}

function displayQuote(quote) {
    quoteDisplay.innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">— ${quote.author || 'Unknown'}</div>
        <span class="quote-category">${quote.category}</span>
    `;
}

// ====================================
// CATEGORY
// ====================================
function generateCategoryButtons() {
    categoryFilter.innerHTML = '';
    const categories = ['all', ...new Set(quotes.map(q => q.category))];

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.className = cat === currentCategory ? 'active' : '';
        btn.onclick = () => filterByCategory(cat);
        categoryFilter.appendChild(btn);
    });
}

function filterByCategory(category) {
    currentCategory = category;
    generateCategoryButtons();
    showRandomQuote();
}

// ====================================
// RECENT QUOTES
// ====================================
function addToRecentQuotes(quote) {
    recentQuotes.unshift(quote);
    recentQuotes = recentQuotes.slice(0, 5);
}

function updateRecentQuotesList() {
    quotesList.innerHTML = '<h4>Recent Quotes</h4>';
    recentQuotes.forEach(q => {
        const div = document.createElement('div');
        div.textContent = `"${q.text}" — ${q.author}`;
        quotesList.appendChild(div);
    });
}

// ====================================
// STATS
// ====================================
function updateStatistics() {
    statsDisplay.innerHTML = `
        <p>Total Quotes: ${quotes.length}</p>
        <p>Categories: ${new Set(quotes.map(q => q.category)).size}</p>
        <p>Recent Quotes: ${recentQuotes.length}</p>
    `;
}

// ====================================
// ADD QUOTE
// ====================================
function addQuote(e) {
    e.preventDefault();

    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    const author = document.getElementById('authorInput').value.trim() || 'Anonymous';

    if (!text || !category) return alert('Fill all required fields');

    const quote = {
        id: quoteIdCounter++,
        text,
        category,
        author
    };

    quotes.push(quote);
    saveQuotesToStorage();
    generateCategoryButtons();
    updateStatistics();
    filterByCategory(category);

    quoteForm.reset();
}

// ====================================
// EVENTS
// ====================================
function setupEventListeners() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    toggleFormBtn.addEventListener('click', () =>
        addQuoteSection.classList.toggle('active')
    );
    quoteForm.addEventListener('submit', addQuote);
    document
    .getElementById('importQuotesInput')
    .addEventListener('change', importFromJsonFile);

}
function exportToJsonFile() {
    const dataStr = JSON.stringify({ quotes, quoteIdCounter }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes-backup.json';
    a.click();

    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const parsed = JSON.parse(e.target.result);

            if (!Array.isArray(parsed.quotes)) {
                alert('Invalid JSON format');
                return;
            }

            quotes = parsed.quotes;
            quoteIdCounter = parsed.quoteIdCounter || quotes.length + 1;

            saveQuotesToStorage();
            generateCategoryButtons();
            updateStatistics();
            showRandomQuote();

            alert('Quotes imported successfully!');
        } catch (err) {
            alert('Error importing file');
        }
    };

    reader.readAsText(file);
}
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');

    // Clear existing options except "All"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Extract unique categories
    const categories = [...new Set(quotes.map(q => q.category))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
    }
}
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;

    // Save selected filter
    localStorage.setItem('selectedCategory', selectedCategory);

    const filteredQuotes =
        selectedCategory === 'all'
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);

    displayFilteredQuotes(filteredQuotes);
}
function displayFilteredQuotes(filteredQuotes) {
    quoteDisplay.innerHTML = '';

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = 'No quotes available for this category.';
        return;
    }

    filteredQuotes.forEach(quote => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>"${quote.text}"</p>
            <small>— ${quote.author}</small>
        `;
        quoteDisplay.appendChild(div);
    });
}
function addQuote(e) {
    e.preventDefault();

    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    const author = document.getElementById('authorInput').value.trim() || 'Anonymous';

    if (!text || !category) {
        alert('Please fill in all required fields');
        return;
    }

    const newQuote = {
        id: quoteIdCounter++,
        text,
        category,
        author
    };

    quotes.push(newQuote);

    // Save updated quotes
    localStorage.setItem('quotes', JSON.stringify(quotes));

    // Update categories dynamically
    populateCategories();

    // Reapply current filter
    filterQuotes();

    quoteForm.reset();
}
document.addEventListener('DOMContentLoaded', () => {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }

    populateCategories();
    filterQuotes();
});
async function fetchServerQuotes() {
    try {
        const response = await fetch(SERVER_URL);
        const data = await response.json();

        // Simulate server quotes format
        const serverQuotes = data.map(item => ({
            id: item.id,
            text: item.title,
            category: item.body.split('|')[0] || 'General', // Simulate category
            author: item.body.split('|')[1] || 'Server'
        }));

        return serverQuotes;
    } catch (error) {
        console.error('Error fetching server quotes:', error);
        return [];
    }
}
async function syncWithServer() {
    const serverQuotes = await fetchServerQuotes();

    if (serverQuotes.length === 0) return;

    let conflictsResolved = false;

    // Merge server data into local quotes
    serverQuotes.forEach(serverQuote => {
        const localIndex = quotes.findIndex(q => q.id === serverQuote.id);

        if (localIndex === -1) {
            // New quote from server, add it
            quotes.push(serverQuote);
            conflictsResolved = true;
        } else {
            // Conflict detected (same id, different content)
            const localQuote = quotes[localIndex];
            if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
                // Server takes precedence
                quotes[localIndex] = serverQuote;
                conflictsResolved = true;
            }
        }
    });

    if (conflictsResolved) {
        saveQuotesToStorage();
        populateCategories();
        filterQuotes();
        showNotification('Quotes updated from server with conflicts resolved.');
    }
}
// Sync every 60 seconds
setInterval(syncWithServer, 60000);
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';

    document.body.appendChild(notification);
    setTimeout(() => notification.style.opacity = '1', 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 4000);
}
function manualResolveConflict(localQuote, serverQuote) {
    // Example: Ask user which version to keep
    const userChoice = confirm(
        `Conflict detected for quote ID ${localQuote.id}.\n` +
        `Local: "${localQuote.text}"\nServer: "${serverQuote.text}"\n\nKeep server version?`
    );

    if (userChoice) {
        const index = quotes.findIndex(q => q.id === localQuote.id);
        quotes[index] = serverQuote;
        saveQuotesToStorage();
        populateCategories();
        filterQuotes();
        showNotification('Conflict resolved: server version kept.');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadQuotesFromStorage();
    loadSessionPreferences();
    populateCategories();
    filterQuotes();

    // Initial server sync
    syncWithServer();

    // Periodic sync every 60 seconds
    setInterval(syncWithServer, 60000);
});
