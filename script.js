let library = [];

function Book(title, author, pages, status) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.status = status;
}

Book.prototype.addToLibrary = function() {
    library.push(this);
    return this;
}

Book.prototype.removeFromLibrary = function() {
    let removeBtn = document.getElementsByClassName("remove");
    [...removeBtn].forEach(btn => {
        btn.addEventListener("click", function() {
            library.splice(this.parentNode.id, 1);
            this.parentNode.remove();
        })
    })
}

Book.prototype.markAsRead = function() {
    let markAsRead = document.getElementsByClassName("mark-as-read");
    [...markAsRead].forEach(btn => {
        btn.addEventListener("click", function() {
            library[this.parentNode.id].status = "Read";
            this.parentNode.innerHTML = `${library[this.parentNode.id].title} ${library[this.parentNode.id].author} ${library[this.parentNode.id].pages} ${library[this.parentNode.id].status}<button class='remove'>Remove</button>`;
        })
    })
}

let title = document.getElementById("title");
let author = document.getElementById("author");
let pages = document.getElementById("pages");
let addBook = document.getElementById("add-book");
addBook.addEventListener("click", function() {
    let status = (document.getElementById("status").checked) ? "Read" : "Unread";

    if (title.value == "" || author.value == "" || pages.value == "") {
        toggle();
    } else {
        let book = new Book(title.value, author.value, pages.value, status);
        db.collection('library').add({
            title: book.title,
            author: book.author,
            pages: book.pages,
            status: book.status,
        })
        title.value = "", author.value = "", pages.value = "";
    }
});

function toggle() {
    let blur = document.getElementById("container");
    blur.classList.toggle('active');
    let alertBox = document.getElementById("alert-box");
    alertBox.classList.toggle('active');
};

db.collection('library').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if (change.type == 'added') renderLibrary(change.doc);
    })
})

let renderLibrary = (doc) => {
    let title = doc.data().title; 
    let author = doc.data().author;
    let pages = doc.data().pages;
    let status = doc.data().status;
    let book = new Book(title, author, pages, status);
    book.addToLibrary();

    let li = (status == "Unread") ? `<li id=${doc.id}>${title} by ${author} ${pages} pages ${status}<button class='mark-as-read'>Read</button>
    <button class='remove'>Remove</button></li>`
    : `<li id=${doc.id}>${title} by ${author} ${pages} pages ${status}<button class='remove'>Remove</button></li>`;
    document.getElementById("list").innerHTML += li;
};

let ul = document.querySelector("ul");
let li = document.getElementsByTagName("li");
ul.addEventListener("click", function(e) {
    let id = e.target.parentNode.id;
    let i = [...li].findIndex(element => element == e.target.parentNode);
    if (e.target.className == "mark-as-read") {
        library[i].status = "Read";
        db.collection('library').doc(id).update({status: "Read"});
        e.target.parentNode.innerHTML = `${library[i].title} ${library[i].author} ${library[i].pages} ${library[i].status}<button class='remove'>Remove</button>`;
    } if (e.target.className == "remove") {
        library.splice(i, 1);
        db.collection('library').doc(id).delete();
        e.target.parentNode.classList.add("fall");
        e.target.parentNode.addEventListener("transitionend", function() {
            e.target.parentNode.remove();
        });
    }
});

let filterOption = document.getElementById("filter-books");
filterOption.addEventListener("change", function(e) {
    const books = ul.childNodes;
    [...books].forEach(b => {
        let bText = b.innerHTML;
        let bookInfo = bText.slice(0, bText.indexOf("<button"));
        if (e.target.value == "all") {
            b.style.display = "block";
        } else if (e.target.value == "read") {
            (bookInfo.includes("Read")) ? b.style.display = "block" : b.style.display = "none";
        } else if (e.target.value == "unread") {
            (bookInfo.includes("Unread")) ? b.style.display = "block" : b.style.display = "none";
        }
    })
});