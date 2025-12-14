// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const showAllQuotesBtn = document.getElementById('showAllQuotes');
const showFilteredQuotesBtn = document.getElementById('showFilteredQuotes');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const newCategoryInput = document.getElementById('newCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryButtonsContainer = document.getElementById('categoryButtons');
const quotesList = document.getElementById('quotesList');
const quoteCount = document.getElementById('quoteCount');
const exportJsonBtn = document.getElementById('exportJson');
const importFileInput = document.getElementById('importFile');
const clearStorageBtn = document.getElementById('clearStorage');
const totalQuotesEl = document.getElementById('totalQuotes');
const totalCategoriesEl = document.getElementById('totalCategories');
const storageStatusEl = document.getElementById('storageStatus');
const lastViewedSection = document.getElementById('lastViewedSection');
const lastViewedQuote = document.getElementById('lastViewedQuote');
const sessionDataInput = document.getElementById('sessionData');
const notification = document.getElementById('notification');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const clearFilterBtn = document.getElementById('clearFilter');
const currentFilterInfo = document.getElementById('currentFilterInfo');
const filterSavedStatus = document.getElementById('filterSavedStatus');
const categoryTagsContainer = document.getElementById('categoryTags');
const filteredCount = document.getElementById('filteredCount');
const filteredNumber = document.getElementById('filteredNumber');
const totalNumber = document.getElementById('totalNumber');

// STORAGE KEYS
const LOCAL_STORAGE_KEY = 'dynamicQuoteGeneratorQuotes';
const SESSION_STORAGE_KEY = 'lastViewedQuote';
const FILTER_STORAGE_KEY = 'quoteFilterPreferences';

// Initial quotes array with objects containing text and category properties
let quotes = [];

// Track current category filter
let currentCategory = 'all';

// Track current sort preference
let currentSort = 'dateAdded';

// Track if a filter is active
let isFilterActive = false;

// Last displayed quote (for session storage demo)
let lastDisplayedQuote = null;

// Track quotes with IDs for better filtering
let nextQuoteId = 1;

// Function to show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? '#2ecc71' : '#e74c3c';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Function to save quotes to local storage
function saveQuotesToLocalStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
        storageStatusEl.textContent = 'Local';
        storageStatusEl.style.color = '#2ecc71';
        return true;
    } catch (error) {
        console.error('Error saving to local storage:', error);
        storageStatusEl.textContent = 'Error';
        storageStatusEl.style.color = '#e74c3c';
        return false;
    }
}

// Function to load quotes from local storage
function loadQuotesFromLocalStorage() {
    try {
        const savedQuotes = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedQuotes) {
            quotes = JSON.parse(savedQuotes);
            
            // Ensure each quote has an ID
            quotes.forEach((quote, index) => {
                if (!quote.id) {
                    quote.id = index + 1;
                }
            });
            
            // Update nextQuoteId
            if (quotes.length > 0) {
                nextQuoteId = Math.max(...quotes.map(q => q.id)) + 1;
            }
            
            storageStatusEl.textContent = 'Local';
            storageStatusEl.style.color = '#2ecc71';
            return true;
        } else {
            // Load default quotes if no saved quotes exist
            loadDefaultQuotes();
            return false;
        }
    } catch (error) {
        console.error('Error loading from local storage:', error);
        loadDefaultQuotes();
        storageStatusEl.textContent = 'Default';
        storageStatusEl.style.color = '#f39c12';
        return false;
    }
}

// Function to load default quotes
function loadDefaultQuotes() {
    quotes = [
        { id: nextQuoteId++, text: "The only way to do great work is to love what you do.", category: "Inspiration", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "Life is what happens to you while you're busy making other plans.", category: "Life", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "In the middle of difficulty lies opportunity.", category: "Wisdom", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "Be yourself; everyone else is already taken.", category: "Humor", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "The purpose of our lives is to be happy.", category: "Happiness", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "You only live once, but if you do it right, once is enough.", category: "Life", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "It does not matter how slowly you go as long as you do not stop.", category: "Perseverance", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "The journey of a thousand miles begins with one step.", category: "Wisdom", dateAdded: new Date().toISOString() },
        { id: nextQuoteId++, text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Motivation", dateAdded: new Date().toISOString() }
    ];
}

// Function to save filter preferences to local storage
function saveFilterPreferencesToLocalStorage() {
    try {
        const filterPreferences = {
            category: currentCategory,
            sort: currentSort
        };
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterPreferences));
        filterSavedStatus.textContent = 'Yes';
        filterSavedStatus.style.color = '#2ecc71';
        return true;
    } catch (error) {
        console.error('Error saving filter preferences:', error);
        filterSavedStatus.textContent = 'Error';
        filterSavedStatus.style.color = '#e74c3c';
        return false;
    }
}

// Function to load filter preferences from local storage
function loadFilterPreferencesFromLocalStorage() {
    try {
        const savedPreferences = localStorage.getItem(FILTER_STORAGE_KEY);
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            currentCategory = preferences.category || 'all';
            currentSort = preferences.sort || 'dateAdded';
            
            // Update UI elements
            categoryFilter.value = currentCategory;
            sortBy.value = currentSort;
            
            filterSavedStatus.textContent = 'Yes';
            filterSavedStatus.style.color = '#2ecc71';
            updateCurrentFilterInfo();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading filter preferences:', error);
        return false;
    }
}

// Function to update current filter info display
function updateCurrentFilterInfo() {
    if (currentCategory === 'all') {
        currentFilterInfo.textContent = 'All Categories';
    } else {
        currentFilterInfo.textContent = currentCategory;
    }
    currentFilterInfo.style.color = '#3498db';
}

// Function to save last viewed quote to session storage
function saveLastViewedQuoteToSessionStorage(quote) {
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(quote));
        sessionDataInput.value = quote.text;
        return true;
    } catch (error) {
        console.error('Error saving to session storage:', error);
        return false;
    }
}

// Function to load last viewed quote from session storage
function loadLastViewedQuoteFromSessionStorage() {
    try {
        const lastQuote = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (lastQuote) {
            const quote = JSON.parse(lastQuote);
            lastDisplayedQuote = quote;
            lastViewedQuote.textContent = `"${quote.text}" - ${quote.category}`;
            lastViewedSection.style.display = 'block';
            sessionDataInput.value = quote.text;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading from session storage:', error);
        return false;
    }
}

// Function to update storage stats
function updateStorageStats() {
    totalQuotesEl.textContent = quotes.length;
    
    // Calculate number of unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    totalCategoriesEl.textContent = categories.length;
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
    
    // Save the displayed quote to session storage
    lastDisplayedQuote = randomQuote;
    saveLastViewedQuoteToSessionStorage(randomQuote);
    loadLastViewedQuoteFromSessionStorage();
    
    // LOGIC TO UPDATE THE DOM
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.text}"</p>
        <span class="quote-category">${randomQuote.category}</span>
    `;
}

// Function to get all unique categories from quotes
function getAllCategories() {
    const categories = quotes.map(quote => quote.category);
    // Remove duplicates and sort
    return ['all', ...new Set(categories)].sort();
}

// Function to populate categories dynamically in dropdown and tags
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
            saveFilterPreferencesToLocalStorage();
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
    
    // Save filter preferences
    saveFilterPreferencesToLocalStorage();
    
    // Get sort preference
    currentSort = sortBy.value;
    
    // Update current filter info
    updateCurrentFilterInfo();
    
    // Display all quotes with filtering
    displayAllQuotes();
    
    // Update filtered count display
    updateFilteredCount();
    
    // Show notification
    if (isFilterActive) {
        showNotification(`Filtered quotes by category: ${currentCategory}`);
    } else {
        showNotification('Showing all categories');
    }
    
    // Update category tags active state
    updateCategoryTagsActiveState();
}

// Function to update category tags active state
function updateCategoryTagsActiveState() {
    const tags = document.querySelectorAll('.category-tag');
    tags.forEach(tag => {
        if (tag.textContent === currentCategory && isFilterActive) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
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
        filteredCount.classList.add('active');
    } else {
        filteredCount.classList.remove('active');
    }
}

// Function to sort quotes based on current sort preference
function sortQuotes(quotesArray) {
    const sortedQuotes = [...quotesArray];
    
    switch(currentSort) {
        case 'dateAdded':
            // Newest first
            return sortedQuotes.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
        case 'dateAddedOldest':
            // Oldest first
            return sortedQuotes.sort((a, b) => new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0));
        case 'category':
            // Category A-Z
            return sortedQuotes.sort((a, b) => a.category.localeCompare(b.category));
        case 'categoryDesc':
            // Category Z-A
            return sortedQuotes.sort((a, b) => b.category.localeCompare(a.category));
        case 'random':
            // Random order
            return sortedQuotes.sort(() => Math.random() - 0.5);
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
        quoteItem.classList.add('quote-item');
        
        // Create quote text element
        const quoteText = document.createElement('div');
        quoteText.classList.add('quote-item-text');
        quoteText.textContent = `${index + 1}. "${quote.text}"`;
        
        // Create quote category element
        const quoteCategory = document.createElement('span');
        quoteCategory.classList.add('quote-item-category');
        quoteCategory.textContent = quote.category;
        
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
            quotes.splice(quoteIndex, 1);
            saveQuotesToLocalStorage();
            populateCategories();
            displayAllQuotes();
            updateStorageStats();
            updateFilteredCount();
            showNotification('Quote deleted successfully!');
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
    
    // Create new quote object
    const newQuote = {
        id: nextQuoteId++,
        text: text,
        category: category,
        dateAdded: new Date().toISOString()
    };
    
    // LOGIC TO ADD A NEW QUOTE TO THE QUOTES ARRAY
    quotes.push(newQuote);
    
    // SAVE TO LOCAL STORAGE
    saveQuotesToLocalStorage();
    
    // Clear the form inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    newCategoryInput.value = '';
    
    // UPDATE CATEGORIES DYNAMICALLY (populateCategories function)
    populateCategories();
    
    // LOGIC TO UPDATE THE DOM
    displayAllQuotes();
    updateStorageStats();
    updateFilteredCount();
    
    // Show the newly added quote
    currentCategory = 'all';
    isFilterActive = false;
    categoryFilter.value = 'all';
    updateCurrentFilterInfo();
    updateCategoryTagsActiveState();
    showRandomQuote();
    
    // Show success message
    showNotification('Quote added successfully!');
}

// Function to export quotes to JSON file
function exportToJsonFile() {
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    // Create JSON string
    const jsonString = JSON.stringify(quotes, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes_${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Quotes exported successfully!');
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('Please select a valid JSON file.');
        event.target.value = '';
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate imported data structure
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
            // Validate each quote object and assign IDs if missing
            const validQuotes = importedQuotes.filter(quote => {
                return quote && 
                       typeof quote === 'object' &&
                       typeof quote.text === 'string' && 
                       quote.text.trim() !== '' &&
                       typeof quote.category === 'string' && 
                       quote.category.trim() !== '';
            }).map(quote => {
                // Ensure each imported quote has an ID
                if (!quote.id) {
                    quote.id = nextQuoteId++;
                }
                // Ensure each imported quote has a dateAdded
                if (!quote.dateAdded) {
                    quote.dateAdded = new Date().toISOString();
                }
                return quote;
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file');
            }
            
            // Add imported quotes to existing quotes
            quotes.push(...validQuotes);
            
            // Save to local storage
            saveQuotesToLocalStorage();
            
            // Update UI
            populateCategories();
            displayAllQuotes();
            updateStorageStats();
            updateFilteredCount();
            
            // Reset file input
            event.target.value = '';
            
            showNotification(`Successfully imported ${validQuotes.length} quotes!`);
            
        } catch (error) {
            console.error('Error importing JSON:', error);
            alert(`Error importing quotes: ${error.message}`);
            event.target.value = '';
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading file. Please try again.');
        event.target.value = '';
    };
    
    fileReader.readAsText(file);
}

// Function to clear all quotes from storage
function clearAllQuotes() {
    if (quotes.length === 0) {
        alert('No quotes to clear!');
        return;
    }
    
    if (confirm('Are you sure you want to delete ALL quotes? This action cannot be undone.')) {
        quotes = [];
        nextQuoteId = 1;
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(FILTER_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        
        // Load default quotes
        loadDefaultQuotes();
        saveQuotesToLocalStorage();
        
        // Reset filters
        currentCategory = 'all';
        currentSort = 'dateAdded';
        isFilterActive = false;
        categoryFilter.value = 'all';
        sortBy.value = 'dateAdded';
        
        // Update UI
        populateCategories();
        displayAllQuotes();
        updateStorageStats();
        updateFilteredCount();
        updateCurrentFilterInfo();
        updateCategoryTagsActiveState();
        showRandomQuote();
        
        // Hide last viewed section
        lastViewedSection.style.display = 'none';
        sessionDataInput.value = '';
        
        showNotification('All quotes cleared! Default quotes loaded.');
    }
}

// Function to clear filter
function clearFilter() {
    currentCategory = 'all';
    isFilterActive = false;
    categoryFilter.value = 'all';
    updateCurrentFilterInfo();
    updateCategoryTagsActiveState();
    displayAllQuotes();
    updateFilteredCount();
    saveFilterPreferencesToLocalStorage();
    showNotification('Filter cleared. Showing all quotes.');
}

// Function to show filtered quotes
function showFilteredQuotes() {
    if (!isFilterActive || currentCategory === 'all') {
        showNotification('No filter is active. Please select a category to filter.');
        return;
    }
    
    showRandomQuote();
}

// Function to initialize the application
function initializeApp() {
    // Load quotes from local storage
    loadQuotesFromLocalStorage();
    
    // Load filter preferences from local storage
    loadFilterPreferencesFromLocalStorage();
    
    // Load last viewed quote from session storage
    loadLastViewedQuoteFromSessionStorage();
    
    // Populate categories dynamically
    populateCategories();
    
    // Display initial random quote
    showRandomQuote();
    
    // Display all quotes
    displayAllQuotes();
    
    // Update storage stats
    updateStorageStats();
    
    // Update filtered count
    updateFilteredCount();
    
    // EVENT LISTENERS
    newQuoteBtn.addEventListener('click', showRandomQuote);
    
    showAllQuotesBtn.addEventListener('click', () => {
        currentCategory = 'all';
        isFilterActive = false;
        categoryFilter.value = 'all';
        updateCurrentFilterInfo();
        updateCategoryTagsActiveState();
        displayAllQuotes();
        updateFilteredCount();
        showNotification('Showing all quotes');
    });
    
    showFilteredQuotesBtn.addEventListener('click', showFilteredQuotes);
    
    addQuoteBtn.addEventListener('click', addQuote);
    
    // Filter event listeners
    categoryFilter.addEventListener('change', filterQuotes);
    sortBy.addEventListener('change', filterQuotes);
    clearFilterBtn.addEventListener('click', clearFilter);
    
    // Storage event listeners
    exportJsonBtn.addEventListener('click', exportToJsonFile);
    importFileInput.addEventListener('change', importFromJsonFile);
    clearStorageBtn.addEventListener('click', clearAllQuotes);
    
    // Allow adding quote with Enter key in textarea
    newQuoteText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addQuote();
        }
    });
    
    // Allow adding quote with Enter key in new category input
    newCategoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addQuote();
        }
    });
    
    // When user selects a category from dropdown, clear new category input
    newQuoteCategory.addEventListener('change', () => {
        newCategoryInput.value = '';
    });
    
    // When user types in new category input, clear dropdown selection
    newCategoryInput.addEventListener('input', () => {
        if (newCategoryInput.value.trim()) {
            newQuoteCategory.value = '';
        }
    });
    
    // Show welcome notification
    setTimeout(() => {
        if (currentCategory !== 'all') {
            showNotification(`Filter restored: Showing ${currentCategory} quotes`);
        } else {
            showNotification('Welcome! Your filter preferences are saved automatically.');
        }
    }, 1000);
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally for testing
window.showRandomQuote = showRandomQuote;
window.addQuote = addQuote;
window.filterQuotes = filterQuotes;
window.populateCategories = populateCategories;
window.exportToJsonFile = exportToJsonFile;
window.importFromJsonFile = importFromJsonFile;