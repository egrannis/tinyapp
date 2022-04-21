const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
// const response = require("express/lib/response"); // look into this
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

const findUserByEmail = (email) => {
  const givenEmail = email;
  for (let userKey in users) {
    if (users[userKey].email === givenEmail) {
      return users[userKey];
    }
  }
  return false;
};

function generateRandomString() {
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
   let randString = '';
 
   for (let i = 0; i < 6; i++ ) {
     randString += string[Math.floor(Math.random()* string.length)];
   }
   return randString;
  }

app.get("/urls", (request, response) => { // define our route, which is /urls
  const userId = request.cookies.userId;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  response.render("urls_index", templateVars); // since we're using the Express convention of using a views directory, we don't have to tell express where to find the file
});

app.get("/urls/new", (request, response) => {
  const userId = request.cookies.userId;
  const templateVars = {
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
  };
  response.render("urls_show", tempVars);
});

app.get("/register", (request, response) => {
  const userId = request.cookies.userId;
  const templateVars = {
    user: users[userId]
  }
  response.render("urls_register", templateVars);
});

app.get("/login", (request, response) => {
  const userId = request.cookies.userId;
  const templateVars = {
    user: users[userId]
  }
  response.render("urls_login", templateVars);
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

app.post("/urls", (request, response) => {
  const userId = request.cookies.userId;
  if (!userId) {// request cookie
    return response.send('Cannot shorten URL for non-users. Redirecting to login page!').redirect('login');
  }
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
  const user = findUserByEmail(request.body.email);
  if(!user) {
    return response.status(403).send('Sorry, a user with that email cannot be found.');
  }
  if(request.body.password !== user.password) {
    return response.status(403).send('Sorry, incorrect password!');
  }
  response.cookie('userId', user.id).redirect('/urls');
});

app.post('/logout', (request, response) => {
  response.clearCookie('userId').redirect('/urls');
});


app.post('/register', (request, response) => {
const userId = generateRandomString();
const {email, password} = request.body; // Destructuring - js smart to know that email and password fall into request.body object
if (email === '' || password === '') {
  return response.status(400).send('400: You can\'t enter an empty string as an email or password!');
};
if (findUserByEmail(email)) {
  return response.status(400).send('Your account already exists. Please log in instead!');
};
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