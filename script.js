
var lastBooks = []

// Function to be called when the button is clicked
async function handleButtonClick() {
   // URL for the API request
   
   const apiKey = getAPIKey()
   const isbnNumbers = getISBNNumbers()

   showProgress()
   updateProgress(0, isbnNumbers.length)

   const books = []
   for (let i = 0; i < isbnNumbers.length; i++) {
    const number = isbnNumbers[i];
    updateProgress(i, isbnNumbers.length)
    const bookTitle = await fetchInfoFromGoogleBooks(number, apiKey);
    if (bookTitle != null) {
        books.push(bookTitle)
    }
   }

   lastBooks = books

   
   alert('Books found: ' + books.length)
   createExcelFile(books)
   hideProgress()
}

function getISBNNumbers() {
    return document.getElementById('myTextField').value.split('\n')
}

function getAPIKey() {
    return document.getElementById('GoogleAPIKey').value;
}

async function fetchInfoFromGoogleBooks(isbnNumber, apiKey) {
    const apiUrl = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbnNumber + '&key=' + apiKey; // Example URL with the book ID

    try {
        // Making a fetch request to the API and awaiting the response
        const response = await fetch(apiUrl);
        
        // Check if the response is OK (status 200)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Await the JSON data from the response
        const data = await response.json();
        
        if (data.items == null || data.items.length == 0) {
            return null
        }
        // Parsing the JSON data
        const book = data.items[0]; // Get the first book in the response

        // Extract relevant information from the book
        const title = book.volumeInfo.title;
        const authors = book.volumeInfo.authors.join(', ');
        const publisher = book.volumeInfo.publisher;
        const description = book.volumeInfo.description;
        const pageCount = book.volumeInfo.pageCount;
        const averageRating = book.volumeInfo.averageRating;
        imageLink = book.volumeInfo.imageLinks.thumbnail;
        if(book.volumeInfo.imageLinks.medium != null) {
            imageLink = book.volumeInfo.imageLinks.medium
        } else if(book.volumeInfo.imageLinks.small != null) {
            imageLink = book.volumeInfo.imageLinks.small
        }
        const previewLink = book.volumeInfo.previewLink;

        const alternativeImg = `https://covers.openlibrary.org/b/isbn/${isbnNumber}-L.jpg`

        // Display the extracted information in an alert or update the HTML
        // alert(`Title: ${title}\nAuthors: ${authors}\nPublisher: ${publisher}\nDescription: ${description}\nPage Count: ${pageCount}\nRating: ${averageRating}\nPreview Link: ${previewLink}`);
        
        return new Book(title, authors, description, imageLink, alternativeImg); // Return the title
    } catch (error) {
        // Handle any errors that occurred during the fetch operation
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Title', 'Author', 'thumbnail
function createExcelFile(books) {
    // Create a simple data structure for the Excel file
    const data = [
        ['Title', 'Author', 'Description', 'Google image', 'open library image']
    ];

    for (const book of books) {
        const bookData = []
        bookData.push(book.title)
        bookData.push(book.author)
        bookData.push(book.description)
        bookData.push(book.imageLink)
        bookData.push(book.alternativeImg)

        data.push(bookData)
    }

    // Create a worksheet from the data
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Create a new workbook with the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1'); // Add the sheet to the workbook

    // Generate Excel file and prompt the user to download
    XLSX.writeFile(wb, 'books.xlsx');
}

function updateProgress(maxValue, startValue) {
    const progressBar = document.getElementById('progress-bar');
    
    // Set max and starting value
    progressBar.max = maxValue;
    progressBar.value = startValue;
}

function hideProgress() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.display = 'none';
}

function showProgress() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.display = 'block';
}

function showThumbnails() {
    for (const book of lastBooks) {
        const imgElement = document.createElement('img');
        imgElement.src = book.imageLink;
        imgElement.alt = book.title;
        imgElement.style.maxWidth = '200px'; // Set image size
        document.body.appendChild(imgElement);
    }
}

// Add event listener to the button to call the function when clicked
document.getElementById('myButton').addEventListener('click', handleButtonClick);
document.getElementById('showThumbnails').addEventListener('click', showThumbnails);
hideProgress()




// CLASSES

class Book {
    // Constructor to initialize properties
    constructor(title, author, description, imageLink, alternativeImg) {
        this.title = title;
        this.author = author;
        this.imageLink = imageLink;
        this.alternativeImg = alternativeImg;
        this.description = description;
    }

    // Method to display book information
    displayInfo() {
        console.log(`Title: ${this.title}`);
        console.log(`Author: ${this.author}`);
        console.log(`imageLink URL: ${this.imageLink}`);
        console.log(`description: ${this.description}`);
    }
}