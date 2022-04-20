const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const response = require("express/lib/response"); // look into this
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
"b2xVn2": "http://www.lighthouselabs.ca",
"9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/urls", (request, response) => { // define our route, which is /urls
  const userId = request.cookies.userId;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
    // username: request.cookies.username
  };
  response.render("urls_index", templateVars); // since we're using the Express convention of using a views directory, we don't have to tell express where to find the file
});

app.get("/urls/new", (request, response) => {
  const userId = request.cookies.userId;
  const templateVars = {
    // username: request.cookies.username
    user: users[userId]
  }
  response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
  const userId = request.cookies.userId;
  const tempVars = { 
    shortURL: request.params.shortURL, 
    longURL: urlDatabase[request.params.shortURL],
    user: users[userId]
    // username: request.cookies.username
  };
  response.render("urls_show", tempVars);
});

app.get("/register", (request, response) => {
  const userId = request.cookies.userId;
  const templateVars = {
    user: users[userId]
    // username: request.cookies.username
  }
  response.render("urls_register", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.get("/", (request, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n")
});

function generateRandomString() {
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
   let randString = '';
 
   for (let i = 0; i < 6; i++ ) {
     randString += string[Math.floor(Math.random()* string.length)];
   }
   return randString;
  }

app.post("/urls", (request, response) => {
  console.log(request.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(); // generating randomstring and storing in shortURL variable
  urlDatabase[shortURL] = request.body.longURL; // saving the long url at short url key
  response.redirect(`/urls/${shortURL}`); // redirecting to shortURL page
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const dShortURL = request.params.shortURL;
  delete(urlDatabase[dShortURL]);
  response.redirect('/urls');
});

app.post('/login', (request, response) => {
  console.log(request.body);
  response.cookie('username', request.body.username).redirect('/urls');
});

app.post('/logout', (request, response) => {
  response.clearCookie('username').redirect('/urls');
});

app.post('/register', (request, response) => {
const userId = generateRandomString();
const user = {id: userId, email: request.body.email, password: request.body.password }
users[userId] = user; // at key of userID, the value is an object.
response.cookie('userId', userId); 
response.redirect('/urls');// after adding user, set userid cookie containing new ID
});

app.post('/urls/:id', (request, response) => {
  const shortURL = request.params.id;// took existing short URL, and changing the long URL value at the same short URL value
  console.log(shortURL);
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});