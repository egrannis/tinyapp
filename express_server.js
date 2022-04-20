const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
// const res = require("express/lib/response"); // look into this
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());



const urlDatabase = {
"b2xVn2": "http://www.lighthouselabs.ca",
"9sm5xK": "http://www.google.com"
};

app.get("/urls", (request, response) => { // define our route, which is /urls
  const templateVars = {
    urls: urlDatabase,
    username: request.cookies.username
    //any other vars?
  };
  response.render("urls_index", templateVars); // since we're using the Express convention of using a views directory, we don't have to tell express where to find the file
});

app.get("/urls/new", (request, response) => {
  const templateVars = {
    username: request.cookies.username
  }
  response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
  const tempVars = { 
    shortURL: request.params.shortURL, 
    longURL: urlDatabase[request.params.shortURL],
    username: request.cookies.username
  };
  response.render("urls_show", tempVars);
});

app.get("/register", (request, response) => {
  const templateVars = {
    username: request.cookies.username
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
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(); // generating randomstring and storing in shortURL variable
  urlDatabase[shortURL] = req.body.longURL; // saving the long url at short url key
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

app.post('/urls/:id', (request, response) => {
  const shortURL = request.params.id;// took existing short URL, and changing the long URL value at the same short URL value
  console.log(shortURL);
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});