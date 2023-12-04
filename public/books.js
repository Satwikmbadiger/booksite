// public/books.js (Client-side JavaScript for fetching and displaying books)

// Function to fetch and display books
async function getBooks() {
    try {
        const response = await fetch('/books-list');
        const data = await response.json();

        if (response.ok) {
            const bookListContainer = document.getElementById('bookList');
            bookListContainer.innerHTML = '';

            data.books.forEach(book => {
                const listItem = document.createElement('li');
                listItem.textContent = `${book.title} by ${book.author} - $${book.price}`;
                bookListContainer.appendChild(listItem);
            });
        } else {
            console.error(`Error fetching books: ${data.error}`);
        }
    } catch (error) {
        console.error('Error fetching books:', error.message);
    }
}

// Call the getBooks function when the page loads
document.addEventListener('DOMContentLoaded', getBooks);
