// Update statistics
updateStatistics();

// Remove modal
document.body.removeChild(modal);
;
    
    document.getElementById('cancelCategoryBtn').onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Close modal on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };


function addQuote(event) {
    if (event) event.preventDefault();
    
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    const author = document.getElementById('authorInput').value.trim();
    
    if (!quoteText || !category) {
        alert('Please fill in both quote text and category!');
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: quoteText,
        category: category,
        author: author || 'Anonymous',
        id: quoteIdCounter++
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    document.getElementById('authorInput').value = '';
    
    // Add to recent quotes
    addToRecentQuotes(newQuote);
    
    // Update UI
    updateRecentQuotesList();
    generateCategoryButtons();
    updateStatistics();
    
    // Show confirmation
    showNotification('Quote added successfully!');
    
    // Switch to new quote's category and display it
    filterByCategory(category);
}

function setupEventListeners() {
    // New Quote button
    newQuoteBtn.addEventListener('click', showRandomQuote);
    
    // Toggle form button
    toggleFormBtn.addEventListener('click', createAddQuoteForm);
    
    // Form submission
    quoteForm.addEventListener('submit', addQuote);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            showRandomQuote();
        }
        if (e.key === 'a' && e.ctrlKey) {
            e.preventDefault();
            createAddQuoteForm();
        }
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1001';
    notification.style.animation = 'fadeIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showRandomQuote,
        filterByCategory,
        addQuote,
        quotes
    };
}
