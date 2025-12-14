// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const showAllQuotesBtn = document.getElementById('showAllQuotes');
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

// STORAGE KEYS
const LOCAL_STORAGE_KEY = 'dynamicQuoteGeneratorQuotes';
const SESSION_STORAGE_KEY = 'lastViewedQuote';

// Initial quotes array with objects containing text and category properties
let quotes = [];

// Track current category filter
let currentCategory = 'All';

// Last displayed quote (for session storage demo)
let lastDisplayedQuote = null;

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
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
        { text: "In the middle of difficulty lies opportunity.", category: "Wisdom" },
        { text: "Be yourself; everyone else is already taken.", category: "Humor" },
        { text: "The purpose of our lives is to be happy.", category: "Happiness" },
        { text: "You only live once, but if you do it right, once is enough.", category: "Life" },
        { text: "It does not matter how slowly you go as long as you do not stop.", category: "Perseverance" },
        { text: "The journey of a thousand miles begins with one step.", category: "Wisdom" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Motivation" }
    ];
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
    // Filter quotes by current category if not 'All'
    let filteredQuotes = quotes;
    if (currentCategory !== 'All') {
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
    return ['All', ...new Set(categories)].sort();
}

// Function to create and update category buttons
function updateCategoryButtons() {
    const categories = getAllCategories();
    
    // Clear existing buttons
    categoryButtonsContainer.innerHTML = '';
    
    // Create a button for each category
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.classList.add('category-btn');
        
        // Add 'active' class to current category
        if (category === currentCategory) {
            button.classList.add('active');
        }
        
        // Add click event listener
        button.addEventListener('click', () => {
            // Update current category
            currentCategory = category;
            
            // Update active button
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Display a random quote from the selected category
            showRandomQuote();
        });
        
        categoryButtonsContainer.appendChild(button);
    });
}

// Function to update category select dropdown
function updateCategorySelect() {
    const categories = getAllCategories().filter(cat => cat !== 'All');
    
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

// Function to display all quotes in the list
function displayAllQuotes() {
    // Clear the quotes list
    quotesList.innerHTML = '';
    
    // Update quote count
    quoteCount.textContent = quotes.length;
    
    // Check if there are no quotes
    if (quotes.length === 0) {
        quotesList.innerHTML = '<p class="quote-item">No quotes added yet. Add your first quote!</p>';
        return;
    }
    
    // Create a list item for each quote
    quotes.forEach((quote, index) => {
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
            deleteQuote(index);
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
function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes.splice(index, 1);
        saveQuotesToLocalStorage();
        updateCategoryButtons();
        updateCategorySelect();
        displayAllQuotes();
        updateStorageStats();
        showNotification('Quote deleted successfully!');
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
        text: text,
        category: category
    };
    
    // LOGIC TO ADD A NEW QUOTE TO THE QUOTES ARRAY
    quotes.push(newQuote);
    
    // SAVE TO LOCAL STORAGE
    saveQuotesToLocalStorage();
    
    // Clear the form inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    newCategoryInput.value = '';
    
    // LOGIC TO UPDATE THE DOM
    updateCategoryButtons();
    updateCategorySelect();
    displayAllQuotes();
    updateStorageStats();
    
    // Show the newly added quote
    currentCategory = 'All';
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
            
            // Validate each quote object
            const validQuotes = importedQuotes.filter(quote => {
                return quote && 
                       typeof quote === 'object' &&
                       typeof quote.text === 'string' && 
                       quote.text.trim() !== '' &&
                       typeof quote.category === 'string' && 
                       quote.category.trim() !== '';
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file');
            }
            
            // Add imported quotes to existing quotes
            quotes.push(...validQuotes);
            
            // Save to local storage
            saveQuotesToLocalStorage();
            
            // Update UI
            updateCategoryButtons();
            updateCategorySelect();
            displayAllQuotes();
            updateStorageStats();
            
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
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        
        // Load default quotes
        loadDefaultQuotes();
        saveQuotesToLocalStorage();
        
        // Update UI
        updateCategoryButtons();
        updateCategorySelect();
        displayAllQuotes();
        updateStorageStats();
        showRandomQuote();
        
        // Hide last viewed section
        lastViewedSection.style.display = 'none';
        sessionDataInput.value = '';
        
        showNotification('All quotes cleared! Default quotes loaded.');
    }
}

// Function to create the add quote form dynamically
function createAddQuoteForm() {
    // This function creates the form elements dynamically
    // In our implementation, the form is already in the HTML
    console.log("Add quote form is available in the HTML structure");
}

// Function to initialize the application
function initializeApp() {
    // Load quotes from local storage
    loadQuotesFromLocalStorage();
    
    // Load last viewed quote from session storage
    loadLastViewedQuoteFromSessionStorage();
    
    // Display initial random quote
    showRandomQuote();
    
    // Update category buttons and select
    updateCategoryButtons();
    updateCategorySelect();
    
    // Display all quotes
    displayAllQuotes();
    
    // Update storage stats
    updateStorageStats();
    
    // EVENT LISTENER ON THE "SHOW NEW QUOTE" BUTTON
    newQuoteBtn.addEventListener('click', showRandomQuote);
    
    showAllQuotesBtn.addEventListener('click', () => {
        currentCategory = 'All';
        updateCategoryButtons();
        showRandomQuote();
    });
    
    addQuoteBtn.addEventListener('click', addQuote);
    
    // Export JSON button event listener
    exportJsonBtn.addEventListener('click', exportToJsonFile);
    
    // Import JSON file input event listener
    importFileInput.addEventListener('change', importFromJsonFile);
    
    // Clear storage button event listener
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
    
    // Create the add quote form
    createAddQuoteForm();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome! Quotes are saved automatically to your browser.');
    }, 1000);
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally for testing
window.showRandomQuote = showRandomQuote;
window.addQuote = addQuote;
window.exportToJsonFile = exportToJsonFile;
window.importFromJsonFile = importFromJsonFile;