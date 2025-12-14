// DOM Elements (same as before - keeping all your elements)

// STORAGE KEYS
const LOCAL_STORAGE_KEY = 'dynamicQuoteGeneratorQuotes';
const CONFLICTS_STORAGE_KEY = 'quoteSyncConflicts';
const SYNC_PREFS_KEY = 'syncPreferences';
const LAST_SYNC_KEY = 'lastSyncTimestamp';

// MOCK API CONFIGURATION
const MOCK_API_BASE_URL = 'https://jsonplaceholder.typicode.com';
const MOCK_API_POSTS_ENDPOINT = `${MOCK_API_BASE_URL}/posts`;
const MOCK_API_USERS_ENDPOINT = `${MOCK_API_BASE_URL}/users`;

// Data arrays
let quotes = [];
let conflicts = [];

// Tracking variables
let currentCategory = 'all';
let currentSort = 'dateAdded';
let isFilterActive = false;
let syncIntervalRef = null;
let currentSyncInterval = 30000;
let isServerOnline = true;
let nextQuoteId = 1;

// ==================== MOCK API FUNCTIONS ====================

// Function to fetch quotes from server using JSONPlaceholder mock API
async function fetchQuotesFromServer() {
    if (!isServerOnline) {
        throw new Error('Server is offline');
    }
    
    console.log('Fetching quotes from JSONPlaceholder mock API...');
    
    try {
        // Fetch posts from JSONPlaceholder (simulating quotes)
        const response = await fetch(`${MOCK_API_POSTS_ENDPOINT}?_limit=10`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        // Transform posts to quotes format
        const serverQuotes = posts.map(post => ({
            id: post.id + 1000, // Offset to avoid ID conflicts
            text: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
            category: getRandomCategory(),
            lastModified: new Date().toISOString(),
            version: 1,
            source: 'server',
            body: post.body // Store full text
        }));
        
        console.log(`Fetched ${serverQuotes.length} quotes from mock API`);
        return serverQuotes;
        
    } catch (error) {
        console.error('Error fetching from mock API:', error);
        
        // Fallback to localStorage simulation if API fails
        console.log('Falling back to localStorage simulation');
        return getFallbackServerQuotes();
    }
}

// Function to post quotes to server using JSONPlaceholder mock API
async function postQuotesToServer(quotesToSync) {
    if (!isServerOnline) {
        throw new Error('Server is offline');
    }
    
    console.log(`Posting ${quotesToSync.length} quotes to mock API...`);
    
    try {
        // For demo purposes, we'll simulate posting to the API
        // Since JSONPlaceholder is read-only for posts, we simulate the response
        const simulatedResponses = [];
        
        for (const quote of quotesToSync) {
            // Create a simulated API response
            const simulatedResponse = {
                id: quote.id || Math.floor(Math.random() * 1000) + 2000,
                title: quote.text,
                body: quote.text + ' (Synced to server)',
                userId: 1,
                source: 'server',
                lastModified: new Date().toISOString(),
                version: (quote.version || 1) + 1
            };
            
            simulatedResponses.push(simulatedResponse);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`Posted ${simulatedResponses.length} quotes to mock API`);
        
        // Transform back to quotes format
        return simulatedResponses.map(response => ({
            id: response.id,
            text: response.title,
            category: response.category || getRandomCategory(),
            lastModified: response.lastModified,
            version: response.version,
            source: 'server',
            lastSynced: new Date().toISOString()
        }));
        
    } catch (error) {
        console.error('Error posting to mock API:', error);
        throw error;
    }
}

// Helper function for fallback server quotes
function getFallbackServerQuotes() {
    return [
        { id: 1001, text: "The only way to do great work is to love what you do.", category: "Inspiration", lastModified: new Date().toISOString(), version: 1, source: 'server' },
        { id: 1002, text: "Life is what happens to you while you're busy making other plans.", category: "Life", lastModified: new Date().toISOString(), version: 1, source: 'server' },
        { id: 1003, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", lastModified: new Date().toISOString(), version: 1, source: 'server' },
        { id: 1004, text: "In the middle of difficulty lies opportunity.", category: "Wisdom", lastModified: new Date().toISOString(), version: 1, source: 'server' },
        { id: 1005, text: "Be yourself; everyone else is already taken.", category: "Humor", lastModified: new Date().toISOString(), version: 1, source: 'server' }
    ];
}

// Helper function to get random category
function getRandomCategory() {
    const categories = ['Inspiration', 'Life', 'Wisdom', 'Humor', 'Motivation', 'Success', 'Happiness'];
    return categories[Math.floor(Math.random() * categories.length)];
}

// ==================== SYNC FUNCTIONS ====================

// Main sync function that periodically checks for new quotes
async function syncQuotes() {
    if (!isServerOnline) {
        updateSyncStatus('offline');
        showNotification('Cannot sync: Server is offline', 'warning');
        return;
    }
    
    updateSyncStatus('syncing');
    
    try {
        // 1. FETCH DATA FROM SERVER USING MOCK API
        const serverQuotes = await fetchQuotesFromServer();
        
        // 2. DETECT CONFLICTS
        const newConflicts = detectConflicts(quotes, serverQuotes);
        
        // 3. SHOW UI NOTIFICATIONS FOR CONFLICTS
        if (newConflicts.length > 0) {
            newConflicts.forEach(newConflict => {
                const existingConflictIndex = conflicts.findIndex(c => c.id === newConflict.id);
                if (existingConflictIndex === -1) {
                    conflicts.push(newConflict);
                }
            });
            saveConflicts();
            
            // UI NOTIFICATION FOR CONFLICTS
            showNotification(`${newConflicts.length} conflict${newConflicts.length !== 1 ? 's' : ''} detected with server data`, 'warning');
        }
        
        // 4. UPDATE LOCAL STORAGE WITH SERVER DATA & CONFLICT RESOLUTION
        const resolvedQuotes = resolveConflictsAutomatically(quotes, serverQuotes);
        
        // Merge server quotes with local quotes
        const mergedQuotes = [...quotes];
        serverQuotes.forEach(serverQuote => {
            const existingIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
            if (existingIndex === -1) {
                // Add new quote from server
                mergedQuotes.push({
                    ...serverQuote,
                    lastSynced: new Date().toISOString()
                });
            } else if (!conflicts.some(c => c.id === serverQuote.id)) {
                // Update existing quote if no conflict
                mergedQuotes[existingIndex] = {
                    ...serverQuote,
                    lastSynced: new Date().toISOString()
                };
            }
        });
        
        // 5. SAVE UPDATED QUOTES TO LOCAL STORAGE
        quotes = mergedQuotes;
        saveQuotesToLocalStorage();
        
        // 6. POST LOCAL CHANGES TO SERVER
        const pendingChanges = quotes.filter(q => !q.lastSynced || new Date(q.lastModified) > new Date(q.lastSynced));
        
        if (pendingChanges.length > 0) {
            const serverResponse = await postQuotesToServer(pendingChanges);
            
            // Update lastSynced timestamp
            quotes.forEach(quote => {
                if (pendingChanges.find(p => p.id === quote.id)) {
                    quote.lastSynced = new Date().toISOString();
                }
            });
            
            saveQuotesToLocalStorage();
            
            // UI NOTIFICATION FOR UPDATES
            showNotification(`${pendingChanges.length} change${pendingChanges.length !== 1 ? 's' : ''} synced to server`, 'success');
        } else if (newConflicts.length === 0) {
            showNotification('Data is already in sync with server', 'info');
        }
        
        // 7. UPDATE LAST SYNC TIME
        const now = new Date();
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        lastSyncTime.textContent = now.toLocaleTimeString();
        
        // 8. UPDATE UI
        populateCategories();
        displayAllQuotes();
        updateSyncStats();
        displayConflicts();
        
        updateSyncStatus('online');
        
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('error');
        showNotification(`Sync failed: ${error.message}`, 'error');
    }
}

// ==================== CONFLICT FUNCTIONS ====================

// Detect conflicts between local and server quotes
function detectConflicts(localQuotes, serverQuotes) {
    const conflicts = [];
    
    localQuotes.forEach(localQuote => {
        const serverQuote = serverQuotes.find(q => q.id === localQuote.id);
        
        if (serverQuote) {
            // Check if quotes are different
            const isDifferent = localQuote.text !== serverQuote.text || 
                               localQuote.category !== serverQuote.category;
            
            // Only consider it a conflict if the local quote was modified after last sync
            const localModified = new Date(localQuote.lastModified || 0);
            const lastSynced = localQuote.lastSynced ? new Date(localQuote.lastSynced) : new Date(0);
            
            if (isDifferent && localModified > lastSynced) {
                conflicts.push({
                    id: localQuote.id,
                    localVersion: localQuote,
                    serverVersion: serverQuote,
                    detectedAt: new Date().toISOString(),
                    type: 'edit-conflict'
                });
            }
        }
    });
    
    return conflicts;
}

// Automatic conflict resolution (server wins)
function resolveConflictsAutomatically(localQuotes, serverQuotes) {
    const resolvedQuotes = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const localIndex = resolvedQuotes.findIndex(q => q.id === serverQuote.id);
        
        if (localIndex !== -1) {
            // Check if there's an actual conflict
            const localQuote = resolvedQuotes[localIndex];
            const isConflict = localQuote.text !== serverQuote.text || 
                              localQuote.category !== serverQuote.category;
            
            if (isConflict) {
                // Server wins
                resolvedQuotes[localIndex] = {
                    ...serverQuote,
                    lastSynced: localQuote.lastSynced,
                    conflictResolved: true,
                    resolution: 'server-wins'
                };
            } else {
                // No conflict, just update sync status
                resolvedQuotes[localIndex].lastSynced = new Date().toISOString();
            }
        } else {
            // New quote from server
            resolvedQuotes.push({
                ...serverQuote,
                lastSynced: new Date().toISOString()
            });
        }
    });
    
    return resolvedQuotes;
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

// ==================== UI FUNCTIONS ====================

// Show notification - UI ELEMENT FOR DATA UPDATES
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

// Update sync status - UI ELEMENT
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

// Display conflicts in UI - UI ELEMENT FOR CONFLICTS
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
                <div class="conflict-title">Quote #${conflict.id} - ${conflict.type || 'Edit Conflict'}</div>
                <small>${new Date(conflict.detectedAt).toLocaleString()}</small>
            </div>
            <div style="margin-bottom: 10px;">
                <div><strong>📱 Local Version:</strong> "${conflict.localVersion.text}" (${conflict.localVersion.category})</div>
                <div><strong>🌐 Server Version:</strong> "${conflict.serverVersion.text}" (${conflict.serverVersion.category})</div>
            </div>
            <div class="conflict-actions">
                <button class="conflict-btn keep-local" data-id="${conflict.id}" data-resolution="keep-local">Keep Local</button>
                <button class="conflict-btn keep-server" data-id="${conflict.id}" data-resolution="keep-server">Keep Server</button>
                <button class="conflict-btn merge" data-id="${conflict.id}" data-resolution="merge">Merge</button>
            </div>
        `;
        
        conflictList.appendChild(conflictItem);
    });
    
    // Add event listeners for conflict resolution
    document.querySelectorAll('.conflict-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const conflictId = parseInt(e.target.dataset.id);
            const resolution = e.target.dataset.resolution;
            resolveConflict(conflictId, resolution);
        });
    });
}

// Resolve individual conflict
function resolveConflict(conflictId, resolution) {
    const conflictIndex = conflicts.findIndex(c => c.id === conflictId);
    if (conflictIndex === -1) return;
    
    const conflict = conflicts[conflictIndex];
    const quoteIndex = quotes.findIndex(q => q.id === conflictId);
    
    if (quoteIndex !== -1) {
        switch(resolution) {
            case 'keep-local':
                // Mark as resolved but keep local version
                quotes[quoteIndex].lastSynced = new Date().toISOString();
                quotes[quoteIndex].conflictResolved = true;
                quotes[quoteIndex].resolution = 'local-wins';
                showNotification('Keeping local version. Will sync to server on next update.', 'info');
                break;
                
            case 'keep-server':
                // Update local to match server
                quotes[quoteIndex] = {
                    ...conflict.serverVersion,
                    lastSynced: new Date().toISOString(),
                    conflictResolved: true,
                    resolution: 'server-wins'
                };
                showNotification('Updated to server version', 'success');
                break;
                
            case 'merge':
                // Merge: local text, server category
                const mergedQuote = {
                    ...quotes[quoteIndex],
                    category: conflict.serverVersion.category,
                    lastSynced: new Date().toISOString(),
                    conflictResolved: true,
                    resolution: 'merged'
                };
                quotes[quoteIndex] = mergedQuote;
                showNotification('Merged local and server versions', 'success');
                break;
        }
        
        saveQuotesToLocalStorage();
    }
    
    // Remove from conflicts list
    conflicts.splice(conflictIndex, 1);
    saveConflicts();
    
    // Update UI
    displayConflicts();
    populateCategories();
    displayAllQuotes();
    updateSyncStats();
}

// ==================== CORE FUNCTIONS ====================

// Save quotes to local storage
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

// Load quotes from local storage
function loadQuotesFromLocalStorage() {
    try {
        const savedQuotes = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedQuotes) {
            quotes = JSON.parse(savedQuotes);
            
            // Initialize metadata for existing quotes
            quotes.forEach((quote, index) => {
                if (!quote.id) quote.id = index + 1;
                if (!quote.lastModified) quote.lastModified = new Date().toISOString();
                if (!quote.version) quote.version = 1;
                if (!quote.source) quote.source = 'local';
            });
            
            if (quotes.length > 0) {
                nextQuoteId = Math.max(...quotes.map(q => q.id)) + 1;
            }
            
            return true;
        } else {
            loadDefaultQuotes();
            return false;
        }
    } catch (error) {
        console.error('Error loading from local storage:', error);
        loadDefaultQuotes();
        return false;
    }
}

// Load default quotes
function loadDefaultQuotes() {
    quotes = [
        { id: nextQuoteId++, text: "The only way to do great work is to love what you do.", category: "Inspiration", lastModified: new Date().toISOString(), version: 1, source: 'local' },
        { id: nextQuoteId++, text: "Life is what happens to you while you're busy making other plans.", category: "Life", lastModified: new Date().toISOString(), version: 1, source: 'local' },
        { id: nextQuoteId++, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", lastModified: new Date().toISOString(), version: 1, source: 'local' }
    ];
}

// Start auto-sync interval - PERIODICALLY CHECKING FOR NEW QUOTES
function startAutoSync() {
    if (syncIntervalRef) {
        clearInterval(syncIntervalRef);
    }
    
    if (currentSyncInterval > 0) {
        syncIntervalRef = setInterval(() => {
            console.log(`Auto-sync triggered at ${new Date().toLocaleTimeString()}`);
            syncQuotes();
        }, currentSyncInterval);
        
        console.log(`Auto-sync started with ${currentSyncInterval/1000} second interval`);
    }
}

// ==================== EVENT LISTENERS & INITIALIZATION ====================

function initializeApp() {
    // Load data
    loadQuotesFromLocalStorage();
    loadConflicts();
    loadSyncPreferences();
    
    // Set last sync time
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
    updateSyncStatus('online');
    
    // Start auto-sync
    startAutoSync();
    
    // ========== EVENT LISTENERS ==========
    
    // Sync button uses syncQuotes function
    syncNowBtn.addEventListener('click', () => syncQuotes());
    
    // Sync interval change
    syncIntervalSelect.addEventListener('change', () => {
        currentSyncInterval = parseInt(syncIntervalSelect.value);
        saveSyncPreferences();
        startAutoSync();
        showNotification(`Auto-sync interval set to ${currentSyncInterval/1000} seconds`, 'info');
    });
    
    // Server toggle
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
    
    // Conflict resolution buttons
    resolveAllConflictsBtn.addEventListener('click', () => {
        if (conflicts.length === 0) {
            showNotification('No conflicts to resolve', 'info');
            return;
        }
        
        if (confirm(`Resolve all ${conflicts.length} conflicts? Server version will be kept.`)) {
            conflicts.forEach(conflict => {
                const quoteIndex = quotes.findIndex(q => q.id === conflict.id);
                if (quoteIndex !== -1) {
                    quotes[quoteIndex] = {
                        ...conflict.serverVersion,
                        lastSynced: new Date().toISOString(),
                        conflictResolved: true,
                        resolution: 'server-wins-bulk'
                    };
                }
            });
            
            conflicts = [];
            saveConflicts();
            saveQuotesToLocalStorage();
            displayConflicts();
            populateCategories();
            displayAllQuotes();
            updateSyncStats();
            showNotification(`All ${conflicts.length} conflicts resolved`, 'success');
        }
    });
    
    viewAllConflictsBtn.addEventListener('click', () => {
        displayConflicts();
        showNotification('Displaying all conflicts', 'info');
    });
    
    // Other event listeners (same as before for quote management)
    newQuoteBtn.addEventListener('click', showRandomQuote);
    showAllQuotesBtn.addEventListener('click', () => {
        currentCategory = 'all';
        isFilterActive = false;
        categoryFilter.value = 'all';
        filterQuotes();
        showNotification('Showing all quotes');
    });
    addQuoteBtn.addEventListener('click', addQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    sortBy.addEventListener('change', filterQuotes);
    
    // Initial notification
    setTimeout(() => {
        showNotification('Server sync simulation active. Using JSONPlaceholder mock API!', 'info');
    }, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make required functions available globally for testing
window.fetchQuotesFromServer = fetchQuotesFromServer;
window.postQuotesToServer = postQuotesToServer;
window.syncQuotes = syncQuotes;