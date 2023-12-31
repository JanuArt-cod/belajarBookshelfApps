const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved_book';
const STORAGE_KEY = 'MY_BOOKSHELF';
const isCheckComplete = document.getElementById('inputBookIsComplete');
const hiddenSearch = document.querySelector('.search-section');
const hiddenDropdown = document.querySelector('.dropdown');
const hiddenFinished = document.querySelector('#finished');
const hiddenNotFinished = document.querySelector('#notFinished');

function createElement(tag, textContent = null, attributes = {}) {
  const element = document.createElement(tag);

  if (textContent) {
    element.innerText = textContent;
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return element;
}

function createButton(id, iconClass, clickHandler) {
  const button = createElement('button', null, { id });
  const icon = createElement('i', null, { class: `fa ${iconClass}` });
  button.append(icon);
  button.addEventListener('click', clickHandler);
  return button;
}


function makeBook(bookObject) {
  const { id, title, author, year, page, language, genre, cover, isComplete } = bookObject;

  const bookTitle = createElement('h3', title);
  const bookAuthor = createElement('p', `Penulis: ${author}`);
  const bookYear = createElement('p', `Tahun: ${year}`);
  const bookPage = createElement('p', `Halaman: ${page}`);
  const bookLanguage = createElement('p', `Bahasa: ${language}`);
  const bookGenre = createElement('p', `Genre: ${genre}`);

  const bookDetail = createElement('div', null, { class: 'book-detail' });
  bookDetail.append(bookTitle, bookAuthor, bookYear, bookPage, bookLanguage, bookGenre);

  const linkCover = createElement('img', null, { src: cover });

  const bookCover = createElement('div', null, { class: 'book-cover' });
  bookCover.append(linkCover);

  const container = createElement('article', null, { class: 'book-item', id: `book-${id}` });
  container.append(bookCover, bookDetail);

  if (isComplete) {
    const undoButton = createButton('undo', 'fa-undo', () => undoBookFromComplete(id));
    const deleteButton = createButton('delete', 'fa-trash', () => removeBookFromBookshelf(id));
    const editButton = createButton('edit', 'fa-pencil', () => editBookFromBookshelf(id));

    const actionButtonParent = createElement('div', null, { class: 'action' });
    actionButtonParent.append(undoButton, deleteButton, editButton);

    container.append(actionButtonParent);
  } else {
    const checkButton = createButton('check', 'fa-check', () => addBookToComplete(id));
    const deleteButton = createButton('delete', 'fa-trash', () => removeBookFromBookshelf(id));
    const editButton = createButton('edit', 'fa-pencil', () => editBookFromBookshelf(id));

    const actionButtonParent = createElement('div', null, { class: 'action' });
    actionButtonParent.append(checkButton, deleteButton, editButton);

    container.append(actionButtonParent);
  }

  return container;
}
function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget && !bookTarget.isComplete) {
    bookTarget.isComplete = true;
    updateVisibility();
  }
}


function findBook(bookId) {
  return books.find(bookItem => bookItem.id === bookId) || null;
}

function updateVisibility() {
  const incompleteBooks = books.filter(item => !item.isComplete);

  hiddenFinished.hidden = incompleteBooks.length !== books.length;
  hiddenNotFinished.hidden = incompleteBooks.length !== 1;

  renderAndSaveData();
}

function renderAndSaveData() {
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}



function removeBookFromBookshelf(bookId) {
  const displayPopDelete = document.querySelector('.popup-delete');
  displayPopDelete.style.display = 'flex';
  const btnDelete = document.getElementById('btnDelete');
  const btnCancel = document.getElementById('btnCancel');

  btnDelete.addEventListener('click', handleDeleteClick);
  btnCancel.addEventListener('click', handleCancelClick);

  function handleDeleteClick(event) {
    const bookTargetIndex = findBookIndex(bookId);

    displayPopDelete.style.display = 'none';
    showDeleteAlert();

    if (bookTargetIndex !== -1) {
      event.preventDefault();
      books.splice(bookTargetIndex, 1);
      updateVisibility();
    }
  }

  function handleCancelClick() {
    displayPopDelete.style.display = 'none';
  }

  function showDeleteAlert() {
    const alertInformation = document.createElement('div');
    alertInformation.classList.add('alertInfo');

    alertInformation.style.opacity = '2';
    alertInformation.style.top = '20px';
    alertInformation.style.visibility = 'visible';
    alertInformation.style.maxWidth = '200px';
    alertInformation.style.borderColor = '#0A587D';
    alertInformation.style.background = '#0A587D';
    alertInformation.style.color = '#f5f5f5';
    alertInformation.innerText = 'dihapus';
    document.body.append(alertInformation);

    setTimeout(() => {
      alertInformation.style.opacity = '0';
      alertInformation.style.top = '0px';
      alertInformation.style.visibility = 'hidden';
      alertInformation.style.borderColor = 'transparent';
      alertInformation.style.background = 'transparent';
    }, 1500);
  }
}



function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId);
}


function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (!bookTarget || !bookTarget.isComplete) return;

  hiddenNotFinished.removeAttribute('hidden');
  hiddenFinished.setAttribute('hidden', true);

  bookTarget.isComplete = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}


function editBookFromBookshelf(bookId) {
  const displayInputEdit = document.querySelector('.input-edit');
  displayInputEdit.style.display = 'flex';

  const formEditBooks = document.getElementById('editBook');
  const editTitle = document.getElementById('inputEditTitle');
  const editAuthor = document.getElementById('inputEditAuthor');
  const editYear = document.getElementById('inputEditYear');
  const editPage = document.getElementById('inputEditPage');
  const editLanguage = document.getElementById('inputEditLanguage');
  const editGenre = document.getElementById('inputEditGenre');
  const editCover = document.getElementById('inputEditCover');
  const btnCancelEdit = document.getElementById('editCancel');
  const bookTarget = findBookIndex(bookId);

  const book = books[bookTarget];

  editTitle.value = book.title;
  editAuthor.value = book.author;
  editYear.value = book.year;
  editPage.value = book.page;
  editLanguage.value = book.language;
  editGenre.value = book.genre;
  editCover.value = book.cover;

  formEditBooks.addEventListener('submit', function (event) {
    event.preventDefault();

    book.title = editTitle.value;
    book.author = editAuthor.value;
    book.year = editYear.value;
    book.page = editPage.value;
    book.language = editLanguage.value;
    book.genre = editGenre.value;
    book.cover = editCover.value.length <= 15
      ? 'image/cover_buku.png'
      : editCover.value;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    formEditBooks.reset();
    displayInputEdit.style.display = 'none';
  });

  btnCancelEdit.addEventListener('click', function () {
    displayInputEdit.style.display = 'none';
    formEditBooks.reset();
  });
}


function searchBooks() {
    const inputSearchTitle = document.getElementById('searchBook').value.toLowerCase()
    const unfinishedBookList = document.getElementById('unfinishedBook')
    const bookFinishedList = document.getElementById('bookFinishedReading')
    unfinishedBookList.innerHTML = ''
    bookFinishedList.innerHTML = ''

    if (inputSearchTitle == '') {
        document.dispatchEvent(new Event(RENDER_EVENT))
        return
    }

    for (const book of books) {
        if (book.title.toLowerCase().includes(inputSearchTitle)) {
            const bookElement = makeBook(book)
            if (book.isComplete == false) {
                unfinishedBookList.append(bookElement)
            } else {
                bookFinishedList.append(bookElement)
            }
        }
    }
}

function saveData() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


function isStorageExist() {
  const storageSupported = typeof Storage !== 'undefined';
  return storageSupported;
}


function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData) {
    const data = JSON.parse(serializedData);
    books.push(...data);
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}


const generatedId = () => +new Date()

function generatedBookObject(id, title, author, year, page, language, genre, cover, isComplete) {
    const numericYear = parseInt(year, 10);
    return { id, title, author, year: numericYear, page, language, genre, cover, isComplete };
}


function checkStatusBook() {
    if (isCheckComplete.checked) {
        return true
    }
    return false
}

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value
    const bookAuthor = document.getElementById('inputBookAuthor').value
    const bookYear = document.getElementById('inputBookYear').value
    const bookPage = document.getElementById('inputBookPage').value
    const bookLanguage = document.getElementById('inputBookLanguage').value
    const bookGenre = document.getElementById('inputBookGenre').value
    const bookCover = validationCover()
    function validationCover() {
        if (document.getElementById('inputBookCover').value.length <= 15) {
            return document.getElementById('inputBookCover').value.innerText = 'image/cover_buku.jpg'
        } else {
            return document.getElementById('inputBookCover').value
        }
    }
    const bookIsComplete = checkStatusBook()

    const generatedID = generatedId()
    const bookObject = generatedBookObject(
        generatedID,
        bookTitle,
        bookAuthor,
        bookYear,
        bookPage,
        bookLanguage,
        bookGenre,
        bookCover,
        bookIsComplete)

    books.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

document.getElementById('searchBook').addEventListener('keyup', function (e) {
    e.preventDefault()
    searchBooks()
})

document.getElementById('searchMyBookshelf').addEventListener('submit', function (e) {
    e.preventDefault()
    searchBooks()
})

document.querySelector('#inputChooseBook').addEventListener('change', function (e) {
    if (e.target.options[e.target.selectedIndex].value === 'Semua Buku') {
        hiddenFinished.removeAttribute('hidden')
        hiddenNotFinished.removeAttribute('hidden')
    } else if (e.target.options[e.target.selectedIndex].value === 'Selesai') {
        hiddenNotFinished.setAttribute('hidden', true)
        hiddenFinished.removeAttribute('hidden')

    } else if (e.target.options[e.target.selectedIndex].value === 'Belum Selesai') {
        hiddenFinished.setAttribute('hidden', true)
        hiddenNotFinished.removeAttribute('hidden')
    }
})

document.addEventListener(SAVED_EVENT, function () {
    console.log('Data berhasil disimpan');
})

document.getElementById('inputBookIsComplete').addEventListener('click', function () {
    const changeStatus = document.querySelector('#bookSubmit > span')
    if (isCheckComplete.checked) {
        changeStatus.innerText = 'Selesai dibaca'
    } else {
        changeStatus.innerText = 'Belum selesai dibaca'
    }
})

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('inputBookCover').addEventListener('input', function () {
        const bookCover = document.getElementById('inputBookCover').value.length
        console.log('Jumlah karakter cover ' + bookCover);
    })

    const submitForm = document.getElementById('inputBook')
    submitForm.addEventListener('submit', function (event) {
        if (isCheckComplete.checked) {
            hiddenSearch.removeAttribute('hidden')
            hiddenDropdown.removeAttribute('hidden')
            hiddenFinished.removeAttribute('hidden')
        } else {
            hiddenSearch.removeAttribute('hidden')
            hiddenDropdown.removeAttribute('hidden')
            hiddenNotFinished.removeAttribute('hidden')
        }

        event.preventDefault()
        addBook()
        submitForm.reset()
    })

    if (isStorageExist()) {
        loadDataFromStorage()
        if (books.length >= 1) {
            hiddenSearch.removeAttribute('hidden')
            hiddenDropdown.removeAttribute('hidden')
            hiddenFinished.removeAttribute('hidden')
            hiddenNotFinished.removeAttribute('hidden')
        }
    }
})

document.addEventListener(RENDER_EVENT, renderBookList);

function renderBookList() {
    console.log(books);
    renderList('unfinishedBook', false);
    renderList('bookFinishedReading', true);
}

function renderList(targetId, isComplete) {
    const bookList = document.getElementById(targetId);
    bookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);

        if (bookItem.isComplete === isComplete) {
            bookList.appendChild(bookElement);
        }
    }
}
