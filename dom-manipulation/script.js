// Quotes array with text and category properties
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" },
  { text: "Success is not final, failure is not fatal.", category: "Inspiration" }
];

// Display a random quote and update the DOM
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Alias required by instructions
function showRandomQuote() {
  displayRandomQuote();
}

// Add a new quote and update the DOM
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });

  textInput.value = "";
  categoryInput.value = "";

  displayRandomQuote();
}

// Event listener for “Show New Quote” button
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// Initial quote display
displayRandomQuote();
