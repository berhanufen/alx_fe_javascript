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

// Initial quotes array with objects containing text and category properties
let quotes = [
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

// Track current category filter
let currentCategory = 'All';

// Function to display a random quote
function displayRandomQuote() {
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
    
    // Get a random quote from filtered quotes
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Update the DOM with the random quote
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
            displayRandomQuote();
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
        
        // Append elements to quote item
        quoteItem.appendChild(quoteText);
        quoteItem.appendChild(quoteCategory);
        
        // Append quote item to quotes list
        quotesList.appendChild(quoteItem);
    });
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
    
    // Add the new quote to the quotes array
    quotes.push(newQuote);
    
    // Clear the form inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    newCategoryInput.value = '';
    
    // Update UI
    updateCategoryButtons();
    updateCategorySelect();
    displayAllQuotes();
    
    // Show the newly added quote
    currentCategory = 'All';
    displayRandomQuote();
    
    // Show success message
    alert('Quote added successfully!');
}

// Function to initialize the application
function initializeApp() {
    // Display initial random quote
    displayRandomQuote();
    
    // Update category buttons and select
    updateCategoryButtons();
    updateCategorySelect();
    
    // Display all quotes
    displayAllQuotes();
    
    // Event listeners
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    
    showAllQuotesBtn.addEventListener('click', () => {
        currentCategory = 'All';
        updateCategoryButtons();
        displayRandomQuote();
    });
    
    addQuoteBtn.addEventListener('click', addQuote);
    
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
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally for testing
window.displayRandomQuote = displayRandomQuote;
window.addQuote = addQuote;