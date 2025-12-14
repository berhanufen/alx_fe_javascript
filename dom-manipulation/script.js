// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const showAllQuotesBtn = document.getElementById('showAllQuotes');
const showFilteredQuotesBtn = document.getElementById('showFilteredQuotes');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const newCategoryInput = document.getElementById('newCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quotesList = document.getElementById('quotesList');
const quoteCount = document.getElementById('quoteCount');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const categoryTagsContainer = document.getElementById('categoryTags');
const filteredCount = document.getElementById('filteredCount');
const filteredNumber = document.getElementById('filteredNumber');
const totalNumber = document.getElementById('totalNumber');

// Sync DOM Elements
const syncIndicator = document.getElementById('syncIndicator');
const syncStatusText = document.getElementById('syncStatusText');
const localQuotesCount = document.getElementById('localQuotesCount');
const serverQuotesCount = document.getElementById('serverQuotesCount');
const syncConflictsCount = document.getElementById('syncConflictsCount');
const syncIntervalSelect = document.getElementById('syncInterval');
const syncNowBtn = document.getElementById('syncNow');
const forceServerUpdateBtn = document.getElementById('forceServerUpdate');
const resetToServerBtn = document.getElementById('resetToServer');
const lastSyncTime = document.getElementById('lastSyncTime');
const serverToggle = document.getElementById('serverToggle');
const serverStatus = document.getElementById('serverStatus');
const autoGenerateToggle = document.getElementById('autoGenerateToggle');
const generateServerQuotesBtn = document.getElementById('generateServerQuotes');
const conflictCountBadge = document.getElementById('conflictCountBadge');
const conflictList = document.getElementById('conflictList');
const resolveAllConflictsBtn = document.getElementById('resolveAllConflicts');
const viewAllConflictsBtn = document.getElementById('viewAllConflicts');
const syncedCount = document.getElementById('syncedCount');
const pendingCount = document.getElementById('pendingCount');
const notification = document.getElementById('notification');

// STORAGE KEYS
const LOCAL_STORAGE_KEY = 'dynamicQuoteGeneratorQuotes';
const SERVER_STORAGE_KEY = 'dynamicQuoteGeneratorServerQuotes';
const CONFLICTS_STORAGE_KEY = 'quoteSyncConflicts';
const SYNC_PREFS_KEY = 'syncPreferences';
const LAST_SYNC_KEY = 'lastSyncTimestamp';

// Initial quotes array with objects containing text and category properties
let quotes = [];

// Server quotes (simulated)
let serverQuotes = [];

// Conflicts array
let conflicts = [];

// Track current category filter
let currentCategory = 'all';

// Track current sort preference
let currentSort = 'dateAdded';

// Track if a filter is active
let isFilterActive = false;

// Sync interval reference
let syncIntervalRef = null;

// Current sync interval
let currentSyncInterval = 30000; // 30 seconds default

// Server connection status
let isServerOnline = true;

// Auto-generate server quotes
let autoGenerateServerQuotes = false;

// Track quotes with IDs for better syncing
let nextQuoteId = 1;
let nextServerQuoteId = 1000; // Server IDs start from 1000

// Function to show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = 'notification';
    
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#2ecc71';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f39c12';
            notification.classList.add('warning');
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            notification.classList.add('error');
            break;
        case 'info':
            notification.style.backgroundColor = '#3498db';
            notification.classList.add('info');
            break;
    }
    
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// ==================== SERVER SIMULATION FUNCTIONS ====================

// Simulate server response delay
function simulateServerDelay() {
    return new Promise(resolve => {
        const delay = Math.random() * 1000 + 500; // 500-1500ms delay
        setTimeout(resolve, delay);
    });
}

// Load server quotes from localStorage (simulated server)
function loadServerQuotes() {
    try {
        const savedServerQuotes = localStorage.getItem(SERVER_STORAGE_KEY);
        if (savedServerQuotes) {
            serverQuotes = JSON.parse(savedServerQuotes);
            updateServerQuotesCount();
            return true;
        } else {
            // Generate initial server quotes if none exist
            generateInitialServerQuotes();
            return false;
        }
    } catch (error) {
        console.error('Error loading server quotes:', error);
        generateInitialServerQuotes();
        return false;
    }
}

// Save server quotes to localStorage (simulated server)
function saveServerQuotes() {
    try {
        localStorage.setItem(SERVER_STORAGE_KEY, JSON.stringify(serverQuotes));
        return true;
    } catch (error) {
        console.error('Error saving server quotes:', error);
        return false;
    }
}

// Generate initial server quotes
function generateInitialServerQuotes() {
    serverQuotes = [
        { id: nextServerQuoteId++, text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Inspiration", lastModified: new Date().toISOString(), version: 1 },
        { id: nextServerQuoteId++, text: "The way to get started is to quit talking and begin doing.", category: "Motivation", lastModified: new Date().toISOString(), version: 1 },
        { id: nextServerQuoteId++, text: "Your time is limited, so don't waste it living someone else's life.", category: "Wisdom", lastModified: new Date().toISOString(), version: 1 },
        { id: nextServerQuoteId++, text: "If life were predictable it would cease to be life, and be without flavor.", category: "Life", lastModified: new Date().toISOString(), version: 1 },
        { id: nextServerQuoteId++, text: "If you look at what you have in life, you'll always have more.", category: "Happiness", lastModified: new Date().toISOString(), version: 1 },
        { id: nextServerQuoteId++, text: "Life is what happens when you're busy making other plans.", category: "Life", lastModified: new Date().toISOString(), version: 1 },
        { id: nextServerQuoteId++, text: "Spread love everywhere you go.", category: "Love", lastModified: new Date().toISOString(), version: 1 }
    ];
    saveServerQuotes();
}

// Generate random server quotes for simulation
function generateRandomServerQuotes(count = 3) {
    const categories = ['Wisdom', 'Motivation', 'Humor', 'Life', 'Success', 'Love', 'Inspiration'];
    const sampleQuotes = [
        "The future depends on what you do today.",
        "It is during our darkest moments that we must focus to see the light.",
        "Whoever is happy will make others happy too.",
        "You will face many defeats in life, but never let yourself be defeated.",
        "Never let the fear of striking out keep you from playing the game.",
        "The only impossible journey is the one you never begin.",
        "You must be the change you wish to see in the world."
    ];
    
    for (let i = 0; i < count; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomQuote = sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
        
        serverQuotes.push({
            id: nextServerQuoteId++,
            text: randomQuote,
            category: randomCategory,
            lastModified: new Date().toISOString(),
            version: 1
        });
    }
    
    saveServerQuotes();
    updateServerQuotesCount();
    showNotification(`Generated ${count} random server quotes`, 'info');
}

// Simulate fetching quotes from server
async function fetchFromServer() {
    if (!isServerOnline) {
        throw new Error('Server is offline');
    }
    
    await simulateServerDelay();
    
    // Return a copy of server quotes
    return JSON.parse(JSON.stringify(serverQuotes));
}

// Simulate posting quotes to server
async function postToServer(quotesToSync) {
    if (!isServerOnline) {
        throw new Error('Server is offline');
    }
    
    await simulateServerDelay();
    
    // Update server with new quotes
    quotesToSync.forEach(quote => {
        const existingIndex = serverQuotes.findIndex(q => q.id === quote.id);
        
        if (existingIndex !== -1) {
            // Update existing quote
            serverQuotes[existingIndex] = {
                ...quote,
                lastModified: new Date().toISOString(),
                version: (serverQuotes[existingIndex].version || 1) + 1
            };
        } else {
            // Add new quote
            serverQuotes.push({
                ...quote,
                id: nextServerQuoteId++,
                lastModified: new Date().toISOString(),
                version: 1
            });
        }
    });
    
    saveServerQuotes();
    return JSON.parse(JSON.stringify(serverQuotes));
}

// ==================== SYNC FUNCTIONS ====================

// Detect conflicts between local and server quotes
function detectConflicts(localQuotes, serverQuotes) {
    const conflicts = [];
    
    // Find quotes that exist in both local and server with different versions
    localQuotes.forEach(localQuote => {
        const serverQuote = serverQuotes.find(q => q.id === localQuote.id);
        
        if (serverQuote) {
            // Check if quotes are different
            if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
                conflicts.push({
                    id: localQuote.id,
                    localVersion: localQuote,
                    serverVersion: serverQuote,
                    detectedAt: new Date().toISOString()
                });
            }
        }
    });
    
    return conflicts;
}

// Save conflicts to localStorage
function saveConflicts() {
    try {
        localStorage.setItem(CONFLICTS_STORAGE_KEY, JSON.stringify(conflicts));
        updateConflictCount();
        return true;
    } catch (error) {
        console.error('Error saving conflicts:', error);
        return false;
    }
}

// Load conflicts from localStorage
function loadConflicts() {
    try {
        const savedConflicts = localStorage.getItem(CONFLICTS_STORAGE_KEY);
        if (savedConflicts) {
            conflicts = JSON.parse(savedConflicts);
            updateConflictCount();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading conflicts:', error);
        return false;
    }
}

// Sync local quotes with server
async function syncWithServer() {
    if (!isServerOnline) {
        updateSyncStatus('offline');
        showNotification('Cannot sync: Server is offline', 'warning');
        return;
    }
    
    updateSyncStatus('syncing');
    
    try {
        // Fetch latest quotes from server
        const serverData = await fetchFromServer();
        
        // Detect conflicts
        const newConflicts = detectConflicts(quotes, serverData);
        
        if (newConflicts.length > 0) {
            // Add new conflicts
            newConflicts.forEach(newConflict => {
                const existingConflictIndex = conflicts.findIndex(c => c.id === newConflict.id);
                if (existingConflictIndex === -1) {
                    conflicts.push(newConflict);
                }
            });
            saveConflicts();
        }
        
        // Apply server-first conflict resolution strategy
        const resolvedQuotes = resolveConflictsAutomatically(quotes, serverData);
        
        // Update local quotes with resolved data
        quotes = resolvedQuotes;
        
        // Save to local storage
        saveQuotesToLocalStorage();
        
        // Post any pending local changes to server
        const pendingChanges = quotes.filter(q => !q.lastSynced || new Date(q.lastModified) > new Date(q.lastSynced));
        
        if (pendingChanges.length > 0) {
            await postToServer(pendingChanges);
            
            // Update lastSynced timestamp for synced quotes
            quotes.forEach(quote => {
                if (pendingChanges.find(p => p.id === quote.id)) {
                    quote.lastSynced = new Date().toISOString();
                }
            });
            
            saveQuotesToLocalStorage();
        }
        
        // Update last sync time
        const now = new Date();
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        lastSyncTime.textContent = now.toLocaleTimeString();
        
        // Update UI
        populateCategories();
        displayAllQuotes();
        updateSyncStats();
        
        updateSyncStatus('online');
        showNotification(`Sync completed. ${pendingChanges.length} changes synced.`, 'success');
        
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('error');
        showNotification(`Sync failed: ${error.message}`, 'error');
    }
}

// Automatic conflict resolution (server wins by default)
function resolveConflictsAutomatically(localQuotes, serverQuotes) {
    const resolvedQuotes = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const localIndex = resolvedQuotes.findIndex(q => q.id === serverQuote.id);
        
        if (localIndex !== -1) {
            // Conflict exists, server wins
            resolvedQuotes[localIndex] = {
                ...serverQuote,
                // Keep local sync status
                lastSynced: resolvedQuotes[localIndex].lastSynced
            };
        } else {
            // New quote from server
            resolvedQuotes.push(serverQuote);
        }
    });
    
    return resolvedQuotes;
}

// Manual conflict resolution
function resolveConflict(conflictId, resolution) {
    const conflictIndex = conflicts.findIndex(c => c.id === conflictId);
    
    if (conflictIndex === -1) return;
    
    const conflict = conflicts[conflictIndex];
    
    switch(resolution) {
        case 'keep-local':
            // Update server quote to match local
            const serverIndex = serverQuotes.findIndex(q => q.id === conflictId);
            if (serverIndex !== -1) {
                serverQuotes[serverIndex] = {
                    ...conflict.localVersion,
                    lastModified: new Date().toISOString(),
                    version: (serverQuotes[serverIndex].version || 1) + 1
                };
                saveServerQuotes();
            }
            break;
            
        case 'keep-server':
            // Update local quote to match server
            const localIndex = quotes.findIndex(q => q.id === conflictId);
            if (localIndex !== -1) {
                quotes[localIndex] = conflict.serverVersion;
                saveQuotesToLocalStorage();
            }
            break;
            
        case 'merge':
            // Create merged quote (simple merge: local text, server category)
            const mergedQuote = {
                ...conflict.localVersion,
                category: conflict.serverVersion.category,
                lastModified: new Date().toISOString()
            };
            
            // Update both local and server
            const localMergeIndex = quotes.findIndex(q => q.id === conflictId);
            if (localMergeIndex !== -1) {
                quotes[localMergeIndex] = mergedQuote;
                saveQuotesToLocalStorage();
            }
            
            const serverMergeIndex = serverQuotes.findIndex(q => q.id === conflictId);
            if (serverMergeIndex !== -1) {
                serverQuotes[serverMergeIndex] = {
                    ...mergedQuote,
                    version: (serverQuotes[serverMergeIndex].version || 1) + 1
                };
                saveServerQuotes();
            }
            break;
    }
    
    // Remove conflict from list
    conflicts.splice(conflictIndex, 1);
    saveConflicts();
    
    // Update UI
    displayConflicts();
    populateCategories();
    displayAllQuotes();
    updateSyncStats();
    
    showNotification('Conflict resolved', 'success');
}

// Resolve all conflicts (server wins)
function resolveAllConflicts() {
    if (conflicts.length === 0) {
        showNotification('No conflicts to resolve', 'info');
        return;
    }
    
    if (!confirm(`Resolve all ${conflicts.length} conflicts? Server version will be kept.`)) {
        return;
    }
    
    conflicts.forEach(conflict => {
        const localIndex = quotes.findIndex(q => q.id === conflict.id);
        if (localIndex !== -1) {
            quotes[localIndex] = conflict.serverVersion;
        }
    });
    
    conflicts = [];
    saveConflicts();
    saveQuotesToLocalStorage();
    
    // Update UI
    displayConflicts();
    populateCategories();
    displayAllQuotes();
    updateSyncStats();
    
    showNotification(`All ${conflicts.length} conflicts resolved`, 'success');
}

// Display conflicts in UI
function displayConflicts() {
    conflictList.innerHTML = '';
    
    if (conflicts.length === 0) {
        conflictList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No conflicts detected</p>';
        conflictCountBadge.style.display = 'none';
        return;
    }
    
    conflictCountBadge.textContent = `${conflicts.length} Conflict${conflicts.length !== 1 ? 's' : ''}`;
    conflictCountBadge.style.display = 'inline-block';
    
    conflicts.forEach(conflict => {
        const conflictItem = document.createElement('div');
        conflictItem.className = 'conflict-item';
        
        conflictItem.innerHTML = `
            <div class="conflict-header">
                <div class="conflict-title">Conflict in Quote #${conflict.id}</div>
                <small>${new Date(conflict.detectedAt).toLocaleString()}</small>
            </div>
            <div style="margin-bottom: 10px;">
                <div><strong>Local Version:</strong> "${conflict.localVersion.text}" (${conflict.localVersion.category})</div>
                <div><strong>Server Version:</strong> "${conflict.serverVersion.text}" (${conflict.serverVersion.category})</div>
            </div>
            <div class="conflict-actions">
                <button class="conflict-btn keep-local" data-id="${conflict.id}" data-resolution="keep-local">Keep Local</button>
                <button class="conflict-btn keep-server" data-id="${conflict.id}" data-resolution="keep-server">Keep Server</button>
                <button class="conflict-btn merge" data-id="${conflict.id}" data-resolution="merge">Merge</button>
            </div>
        `;
        
        conflictList.appendChild(conflictItem);
    });
    
    // Add event listeners to conflict resolution buttons
    document.querySelectorAll('.conflict-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const conflictId = parseInt(e.target.dataset.id);
            const resolution = e.target.dataset.resolution;
            resolveConflict(conflictId, resolution);
        });
    });
}

// ==================== CORE FUNCTIONS (UPDATED FOR SYNC) ====================

// Function to save quotes to local storage
function saveQuotesToLocalStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
        updateLocalQuotesCount();
        updateSyncStats();
        return true;
    } catch (error) {
        console.error('Error saving to local storage:', error);
        return false;
    }
}

// Function to load quotes from local storage
function loadQuotesFromLocalStorage() {
    try {
        const savedQuotes = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedQuotes) {
            quotes = JSON.parse(savedQuotes);
            
            // Ensure each quote has required sync fields
            quotes.forEach((quote, index) => {
                if (!quote.id) {
                    quote.id = index + 1;
                }
                if (!quote.lastModified) {
                    quote.lastModified = new Date().toISOString();
                }
                if (!quote.version) {
                    quote.version = 1;
                }
            });
            
            // Update nextQuoteId
            if (quotes.length > 0) {
                nextQuoteId = Math.max(...quotes.map(q => q.id)) + 1;
            }
            
            return true;
        } else {
            // Load default quotes if no saved quotes exist
            loadDefaultQuotes();
            return false;
        }
    } catch (error) {
        console.error('Error loading from local storage:', error);
        loadDefaultQuotes();
        return false;
    }
}

// Function to load default quotes
function loadDefaultQuotes() {
    quotes = [
        { id: nextQuoteId++, text: "The only way to do great work is to love what you do.", category: "Inspiration", lastModified: new Date().toISOString(), version: 1 },
        { id: nextQuoteId++, text: "Life is what happens to you while you're busy making other plans.", category: "Life", lastModified: new Date().toISOString(), version: 1 },
        { id: nextQuoteId++, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", lastModified: new Date().toISOString(), version: 1 },
        { id: nextQuoteId++, text: "In the middle of difficulty lies opportunity.", category: "Wisdom", lastModified: new Date().toISOString(), version: 1 },
        { id: nextQuoteId++, text: "Be yourself; everyone else is already taken.", category: "Humor", lastModified: new Date().toISOString(), version: 1 }
    ];
}

// Function to update sync status display
function updateSyncStatus(status) {
    syncIndicator.className = 'sync-indicator';
    
    switch(status) {
        case 'online':
            syncIndicator.classList.add('online');
            syncStatusText.textContent = 'Connected to server';
            syncNowBtn.disabled = false;
            syncNowBtn.classList.remove('syncing');
            break;
        case 'offline':
            syncIndicator.classList.add('offline');
            syncStatusText.textContent = 'Server offline';
            syncNowBtn.disabled = true;
            syncNowBtn.classList.remove('syncing');
            break;
        case 'syncing':
            syncIndicator.classList.add('syncing');
            syncStatusText.textContent = 'Syncing with server...';
            syncNowBtn.disabled = true;
            syncNowBtn.classList.add('syncing');
            break;
        case 'error':
            syncIndicator.classList.add('offline');
            syncStatusText.textContent = 'Sync error';
            syncNowBtn.disabled = false;
            syncNowBtn.classList.remove('syncing');
            break;
    }
}

// Function to update sync stats
function updateSyncStats() {
    updateLocalQuotesCount();
    updateServerQuotesCount();
    updateConflictCount();
    
    // Update sync counts
    const syncedQuotes = quotes.filter(q => q.lastSynced).length;
    const pendingQuotes = quotes.length - syncedQuotes;
    
    syncedCount.textContent = syncedQuotes;
    pendingCount.textContent = pendingQuotes;
}

function updateLocalQuotesCount() {
    localQuotesCount.textContent = quotes.length;
}

function updateServerQuotesCount() {
    serverQuotesCount.textContent = serverQuotes.length;
}

function updateConflictCount() {
    syncConflictsCount.textContent = conflicts.length;
}

// Function to display a random quote
function showRandomQuote() {
    // Filter quotes by current category if not 'all'
    let filteredQuotes = quotes;
    if (currentCategory !== 'all' && isFilterActive) {
        filteredQuotes = quotes.filter(quote => quote.category === currentCategory);
    }
    
    // Check if there are quotes in the filtered list
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `
            <p class="quote-text">No quotes found in the "${currentCategory}" category.</p>
            <span class="quote-category">${currentCategory}</span>
        `;
        return;
    }
    
    // LOGIC TO SELECT A RANDOM QUOTE
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // LOGIC TO UPDATE THE DOM
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.text}"</p>
        <span class="quote-category">${randomQuote.category}</span>
        ${randomQuote.lastSynced ? 
            '<small style="margin-top: 10px; color: #2ecc71;">✓ Synced</small>' : 
            '<small style="margin-top: 10px; color: #f39c12;">Pending sync</small>'
        }
    `;
}

// Function to get all unique categories from quotes
function getAllCategories() {
    const categories = quotes.map(quote => quote.category);
    // Remove duplicates and sort
    return ['all', ...new Set(categories)].sort();
}

// Function to populate categories dynamically
function populateCategories() {
    const categories = getAllCategories().filter(cat => cat !== 'all');
    
    // Clear existing options in category filter dropdown
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Clear category tags container
    categoryTagsContainer.innerHTML = '';
    
    // Add options for each category to dropdown
    categories.forEach(category => {
        // Add to filter dropdown
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        if (category === currentCategory) {
            option.selected = true;
        }
        categoryFilter.appendChild(option);
        
        // Add category tag
        const tag = document.createElement('span');
        tag.classList.add('category-tag');
        if (category === currentCategory && isFilterActive) {
            tag.classList.add('active');
        }
        tag.textContent = category;
        tag.addEventListener('click', () => {
            currentCategory = category;
            isFilterActive = true;
            filterQuotes();
        });
        categoryTagsContainer.appendChild(tag);
    });
    
    // Also update the add quote category dropdown
    updateAddQuoteCategoryDropdown();
}

// Function to update add quote category dropdown
function updateAddQuoteCategoryDropdown() {
    const categories = getAllCategories().filter(cat => cat !== 'all');
    
    // Clear existing options except the first one
    newQuoteCategory.innerHTML = '<option value="" disabled selected>Select a category</option>';
    
    // Add options for each category
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        newQuoteCategory.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    // Get selected category
    const selectedCategory = categoryFilter.value;
    currentCategory = selectedCategory;
    isFilterActive = selectedCategory !== 'all';
    
    // Get sort preference
    currentSort = sortBy.value;
    
    // Display all quotes with filtering
    displayAllQuotes();
    
    // Update filtered count display
    updateFilteredCount();
}

// Function to update filtered count display
function updateFilteredCount() {
    let filteredQuotes = quotes;
    
    if (isFilterActive && currentCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentCategory);
    }
    
    filteredNumber.textContent = filteredQuotes.length;
    totalNumber.textContent = quotes.length;
    
    if (isFilterActive && currentCategory !== 'all') {
        filteredCount.style.display = 'block';
    } else {
        filteredCount.style.display = 'none';
    }
}

// Function to sort quotes based on current sort preference
function sortQuotes(quotesArray) {
    const sortedQuotes = [...quotesArray];
    
    switch(currentSort) {
        case 'dateAdded':
            // Newest first
            return sortedQuotes.sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));
        case 'dateAddedOldest':
            // Oldest first
            return sortedQuotes.sort((a, b) => new Date(a.lastModified || 0) - new Date(b.lastModified || 0));
        case 'category':
            // Category A-Z
            return sortedQuotes.sort((a, b) => a.category.localeCompare(b.category));
        case 'categoryDesc':
            // Category Z-A
            return sortedQuotes.sort((a, b) => b.category.localeCompare(a.category));
        case 'random':
            // Random order
            return sortedQuotes.sort(() => Math.random() - 0.5);
        case 'syncStatus':
            // Sort by sync status (pending first)
            return sortedQuotes.sort((a, b) => {
                if (!a.lastSynced && b.lastSynced) return -1;
                if (a.lastSynced && !b.lastSynced) return 1;
                return 0;
            });
        default:
            return sortedQuotes;
    }
}

// Function to display all quotes in the list
function displayAllQuotes() {
    // Clear the quotes list
    quotesList.innerHTML = '';
    
    // Filter quotes if needed
    let displayedQuotes = quotes;
    if (isFilterActive && currentCategory !== 'all') {
        displayedQuotes = quotes.filter(quote => quote.category === currentCategory);
    }
    
    // Sort quotes
    displayedQuotes = sortQuotes(displayedQuotes);
    
    // Update quote count
    quoteCount.textContent = displayedQuotes.length;
    
    // Check if there are no quotes
    if (displayedQuotes.length === 0) {
        quotesList.innerHTML = '<p class="quote-item">No quotes found. Add your first quote!</p>';
        return;
    }
    
    // Create a list item for each quote
    displayedQuotes.forEach((quote, index) => {
        const quoteItem = document.createElement('div');
        quoteItem.className = 'quote-item';
        
        // Check if quote has conflicts
        const hasConflict = conflicts.some(c => c.id === quote.id);
        
        // Create quote text element
        const quoteText = document.createElement('div');
        quoteText.className = 'quote-item-text';
        quoteText.textContent = `${index + 1}. "${quote.text}"`;
        
        if (hasConflict) {
            quoteText.innerHTML += ' <span style="color: #e74c3c; font-weight: bold;">(Conflict!)</span>';
        }
        
        // Create quote category element
        const quoteCategory = document.createElement('span');
        quoteCategory.className = 'quote-item-category';
        quoteCategory.textContent = quote.category;
        
        // Create sync status indicator
        const syncStatus = document.createElement('span');
        syncStatus.style.marginLeft = '10px';
        syncStatus.style.fontSize = '0.8rem';
        syncStatus.style.padding = '2px 8px';
        syncStatus.style.borderRadius = '10px';
        
        if (quote.lastSynced) {
            syncStatus.textContent = '✓ Synced';
            syncStatus.style.backgroundColor = '#d5f4e6';
            syncStatus.style.color = '#27ae60';
        } else {
            syncStatus.textContent = 'Pending';
            syncStatus.style.backgroundColor = '#fef5e7';
            syncStatus.style.color = '#f39c12';
        }
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.padding = '5px 10px';
        deleteBtn.style.fontSize = '0.8rem';
        deleteBtn.style.backgroundColor = '#e74c3c';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.addEventListener('click', () => {
            deleteQuote(quote.id);
        });
        
        // Append elements to quote item
        quoteItem.appendChild(quoteText);
        quoteItem.appendChild(quoteCategory);
        quoteItem.appendChild(syncStatus);
        quoteItem.appendChild(deleteBtn);
        
        // Append quote item to quotes list
        quotesList.appendChild(quoteItem);
    });
}

// Function to delete a quote
function deleteQuote(quoteId) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const quoteIndex = quotes.findIndex(q => q.id === quoteId);
        if (quoteIndex !== -1) {
            // Mark for deletion (in real app, you'd flag for server deletion)
            quotes.splice(quoteIndex, 1);
            saveQuotesToLocalStorage();
            populateCategories();
            displayAllQuotes();
            updateFilteredCount();
            updateSyncStats();
            showNotification('Quote deleted. Changes will sync on next sync.', 'warning');
        }
    }
}

// Function to add a new quote
function addQuote() {
    // Get quote text and category
    const text = newQuoteText.value.trim();
    let category = newQuoteCategory.value;
    
    // Check if user wants to create a new category
    const newCategory = newCategoryInput.value.trim();
    if (newCategory) {
        category = newCategory;
    }
    
    // Validate input
    if (!text) {
        alert('Please enter a quote text.');
        return;
    }
    
    if (!category) {
        alert('Please select or enter a category.');
        return;
    }
    
    // Create new quote object with sync metadata
    const newQuote = {
        id: nextQuoteId++,
        text: text,
        category: category,
        lastModified: new Date().toISOString(),
        version: 1
        // lastSynced will be added when synced
    };
    
    // LOGIC TO ADD A NEW QUOTE TO THE QUOTES ARRAY
    quotes.push(newQuote);
    
    // SAVE TO LOCAL STORAGE
    saveQuotesToLocalStorage();
    
    // Clear the form inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    newCategoryInput.value = '';
    
    // UPDATE CATEGORIES DYNAMICALLY
    populateCategories();
    
    // LOGIC TO UPDATE THE DOM
    displayAllQuotes();
    updateFilteredCount();
    updateSyncStats();
    
    // Show the newly added quote
    currentCategory = 'all';
    isFilterActive = false;
    categoryFilter.value = 'all';
    showRandomQuote();
    
    // Show success message
    showNotification('Quote added locally. Will sync on next server sync.', 'success');
}

// Function to force update server with local data
async function forceServerUpdate() {
    if (!isServerOnline) {
        showNotification('Server is offline', 'warning');
        return;
    }
    
    updateSyncStatus('syncing');
    
    try {
        await postToServer(quotes);
        
        // Update lastSynced timestamp for all quotes
        quotes.forEach(quote => {
            quote.lastSynced = new Date().toISOString();
        });
        
        saveQuotesToLocalStorage();
        
        // Update UI
        updateSyncStats();
        displayAllQuotes();
        
        updateSyncStatus('online');
        showNotification('All local quotes pushed to server', 'success');
        
    } catch (error) {
        console.error('Force update error:', error);
        updateSyncStatus('error');
        showNotification(`Force update failed: ${error.message}`, 'error');
    }
}

// Function to reset local data to server data
async function resetToServerData() {
    if (!confirm('This will replace all local quotes with server quotes. Continue?')) {
        return;
    }
    
    if (!isServerOnline) {
        showNotification('Server is offline', 'warning');
        return;
    }
    
    updateSyncStatus('syncing');
    
    try {
        const serverData = await fetchFromServer();
        quotes = serverData.map(q => ({
            ...q,
            lastSynced: new Date().toISOString()
        }));
        
        saveQuotesToLocalStorage();
        
        // Clear conflicts
        conflicts = [];
        saveConflicts();
        
        // Update UI
        populateCategories();
        displayAllQuotes();
        updateSyncStats();
        displayConflicts();
        
        updateSyncStatus('online');
        showNotification('Local data reset to server version', 'success');
        
    } catch (error) {
        console.error('Reset error:', error);
        updateSyncStatus('error');
        showNotification(`Reset failed: ${error.message}`, 'error');
    }
}

// Function to start auto-sync interval
function startAutoSync() {
    if (syncIntervalRef) {
        clearInterval(syncIntervalRef);
    }
    
    if (currentSyncInterval > 0) {
        syncIntervalRef = setInterval(() => {
            syncWithServer();
        }, currentSyncInterval);
        
        console.log(`Auto-sync started with ${currentSyncInterval/1000} second interval`);
    }
}

// Function to load sync preferences
function loadSyncPreferences() {
    try {
        const savedPrefs = localStorage.getItem(SYNC_PREFS_KEY);
        if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            currentSyncInterval = prefs.interval || 30000;
            syncIntervalSelect.value = currentSyncInterval.toString();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading sync preferences:', error);
        return false;
    }
}

// Function to save sync preferences
function saveSyncPreferences() {
    try {
        const prefs = {
            interval: currentSyncInterval
        };
        localStorage.setItem(SYNC_PREFS_KEY, JSON.stringify(prefs));
        return true;
    } catch (error) {
        console.error('Error saving sync preferences:', error);
        return false;
    }
}

// Function to initialize the application
function initializeApp() {
    // Load local quotes
    loadQuotesFromLocalStorage();
    
    // Load server quotes (simulated)
    loadServerQuotes();
    
    // Load conflicts
    loadConflicts();
    
    // Load sync preferences
    loadSyncPreferences();
    
    // Load last sync time
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
        lastSyncTime.textContent = new Date(lastSync).toLocaleTimeString();
    }
    
    // Initialize UI
    populateCategories();
    showRandomQuote();
    displayAllQuotes();
    updateSyncStats();
    displayConflicts();
    updateFilteredCount();
    
    // Set initial sync status
    updateSyncStatus('online');
    
    // Start auto-sync
    startAutoSync();
    
    // ==================== EVENT LISTENERS ====================
    
    // Quote display buttons
    newQuoteBtn.addEventListener('click', showRandomQuote);
    
    showAllQuotesBtn.addEventListener('click', () => {
        currentCategory = 'all';
        isFilterActive = false;
        categoryFilter.value = 'all';
        filterQuotes();
        showNotification('Showing all quotes');
    });
    
    showFilteredQuotesBtn.addEventListener('click', () => {
        if (!isFilterActive || currentCategory === 'all') {
            showNotification('No filter is active. Please select a category to filter.');
            return;
        }
        showRandomQuote();
    });
    
    // Add quote button
    addQuoteBtn.addEventListener('click', addQuote);
    
    // Filter event listeners
    categoryFilter.addEventListener('change', filterQuotes);
    sortBy.addEventListener('change', filterQuotes);
    
    // Sync event listeners
    syncNowBtn.addEventListener('click', () => syncWithServer());
    forceServerUpdateBtn.addEventListener('click', forceServerUpdate);
    resetToServerBtn.addEventListener('click', resetToServerData);
    
    syncIntervalSelect.addEventListener('change', () => {
        currentSyncInterval = parseInt(syncIntervalSelect.value);
        saveSyncPreferences();
        startAutoSync();
        showNotification(`Auto-sync interval set to ${currentSyncInterval/1000} seconds`, 'info');
    });
    
    // Server simulation controls
    serverToggle.addEventListener('change', () => {
        isServerOnline = serverToggle.checked;
        serverStatus.textContent = isServerOnline ? 'Online' : 'Offline';
        updateSyncStatus(isServerOnline ? 'online' : 'offline');
        
        if (isServerOnline) {
            showNotification('Server connection restored', 'success');
        } else {
            showNotification('Server connection lost', 'warning');
        }
    });
    
    autoGenerateToggle.addEventListener('change', () => {
        autoGenerateServerQuotes = autoGenerateToggle.checked;
        if (autoGenerateServerQuotes) {
            // Set up interval to auto-generate server quotes
            setInterval(() => {
                if (isServerOnline && autoGenerateServerQuotes) {
                    generateRandomServerQuotes(1);
                }
            }, 60000); // Every minute
            showNotification('Auto-generate server quotes enabled', 'info');
        }
    });
    
    generateServerQuotesBtn.addEventListener('click', () => {
        generateRandomServerQuotes(3);
    });
    
    // Conflict resolution buttons
    resolveAllConflictsBtn.addEventListener('click', resolveAllConflicts);
    viewAllConflictsBtn.addEventListener('click', () => {
        displayConflicts();
        showNotification('Displaying all conflicts', 'info');
    });
    
    // Form input listeners
    newQuoteText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addQuote();
        }
    });
    
    newCategoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addQuote();
        }
    });
    
    newQuoteCategory.addEventListener('change', () => {
        newCategoryInput.value = '';
    });
    
    newCategoryInput.addEventListener('input', () => {
        if (newCategoryInput.value.trim()) {
            newQuoteCategory.value = '';
        }
    });
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Server sync simulation active. Try adding quotes and see them sync!', 'info');
    }, 1000);
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally for testing
window.showRandomQuote = showRandomQuote;
window.addQuote = addQuote;
window.filterQuotes = filterQuotes;
window.populateCategories = populateCategories;
window.syncWithServer = syncWithServer;
window.resolveConflict = resolveConflict;
window.generateRandomServerQuotes = generateRandomServerQuotes;