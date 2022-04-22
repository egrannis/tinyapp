const express = require("express");
const app = express();
const PORT = 3001; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['spring', 'summer', 'autumn']
}));
const bcrypt = require('bcryptjs');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purpleswag",
 
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const findUserByEmail = (email, database) => {
  const givenEmail = email;
  for (let userKey in database) {
    if (database[userKey].email === givenEmail) {
      return database[userKey];
    }
  }
  return false;
};

const generateRandomString = () => {
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randString = '';
 
  for (let i = 0; i < 6; i++) {
    randString += string[Math.floor(Math.random() * string.length)];
  }
  return randString;
};

const urlsForUser = (id) => {
  const userURLS = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLS;
};

app.get("/urls", (request, response) => { // view my URLs page that shows everything (Main page)
  if (!users[request.session.userId]) { // if users database at that userid doesn't exist
    const templateVars = {
      message: "Hi there! You can only view the 'My URLs' page if you are logged in. Please register or log in to create and view URLs.",
      statusCode: 401,
      user: false
    };
    return response.render("urls_error", templateVars);
  }
  const userId = request.session.userId;
  const templateVars = {
    urls: urlsForUser(userId), // users can only see the shortURLs for their specific userid
    user: users[userId]
  };
  response.render("urls_index", templateVars); // since we're using the Express convention of using a views directory, we don't have to tell express where to find the file
});

app.get("/urls/new", (request, response) => { // view "Create new URL"
  const userId = request.session.userId;
  if (!users[userId]) {// if users database at userid doesn't exist, then it'll respond
    return response.status(403).redirect('/login');
  }
  const templateVars = {
    user: users[userId]
  };
  response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => { // view when I want to edit my URL, or after I've created a new URL
  const shortURL = request.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      message: "Sorry, that shortURL id does not exist!",
      statusCode: 401,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== request.session.userId) {
    const templateVars = {
      message: "Hi there! You can only edit URLs if you created them. Please register or log in.",
      statusCode: 401,
      user: false
    };
    return response.render("urls_error", templateVars);
  }
  const userId = request.session.userId;
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[userId]
  };
  response.render("urls_show", templateVars);
});

app.get("/register", (request, response) => { // view register page
  const userId = request.session.userId;
  const templateVars = {
    user: users[userId]
  };
  response.render("urls_register", templateVars);
});

app.get("/login", (request, response) => { // view login page
  const userId = request.session.userId;
  const templateVars = {
    user: users[userId]
  };
  response.render("urls_login", templateVars);
});

app.get("/u/:shortURL", (request, response) => { // The created shortURL link that redirects to longURL
  if (!urlDatabase[request.params.shortURL]) {
    return response.send('Sorry, that shortURL id does not exist!');
  }
  const longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});

app.get("/", (request, response) => { // homepage
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => { // json object urlDatabase
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const shortURL = request.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      message: "Sorry, that shortURL id does not exist!",
      statusCode: 401,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== request.session.userId) {
    const templateVars = {
      message: "Hi there! You can only delete URLs if you created them. Please register or log in to make your own URLs.",
      statusCode: 401,
      user: false
    };
    return response.render('urls_error', templateVars); // 9:08 pm april 21 cahnged render to redirect
  }
  delete(urlDatabase[shortURL]);
  response.redirect('/urls');
});

app.post('/login', (request, response) => {
  const user = findUserByEmail(request.body.email, users);
  if (!user) {
    const templateVars = {
      message: "Hello, it looks like your email isn't linked with an account. Please try registering instead!",
      statusCode: 403,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (!bcrypt.compareSync(request.body.password, user.password)) {
    const templateVars = {
      message: "Hello, it looks like your password is incorrect. Please try logging in again!",
      statusCode: 403,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  request.session.userId = user.id;
  response.redirect('/urls');
});

app.post('/logout', (request, response) => {
  request.session = null; //response.clearCookie('userId')
  response.redirect('/urls');
});

app.post('/register', (request, response) => {
  const userId = generateRandomString();
  const {email, password} = request.body; // Destructuring - js smart to know that email and password fall into request.body object
  if (email === '' || password === '') {
    const templateVars = {
      message:'You can\'t enter an empty string as an email or password!',
      statusCode: 400,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  if (findUserByEmail(email, users)) {
    const templateVars = {
      message:'Your account already exists. Please log in instead!',
      statusCode: 400,
      user: false
    };
    return response.render('urls_error', templateVars);
  }
  const hashedPass = bcrypt.hashSync(request.body.password, 10);
  const user = {id: userId, email: request.body.email, password: hashedPass };
  users[userId] = user; // at key of userID, the value is an object.
  request.session.userId = userId;
  response.redirect('/urls');
});

app.post('/urls', (request, response) => { //Creating new URL
  const userId = request.session.userId;
  if (!users[userId]) {
    return response.status(403).redirect('/login');
  }
  let shortURL = generateRandomString(); // generating randomstring and storing in shortURL variable
  urlDatabase[shortURL] = { longURL: request.body.longURL, userID: userId };
  response.redirect(`/urls/${shortURL}`); // redirecting to shortURL page
});

app.post('/urls/:shortURL', (request, response) => { //editing the longURL value
  const shortURL = request.params.shortURL;// took existing short URL, and changing the long URL value at the same short URL value
  if (urlDatabase[shortURL].userID !== request.session.userId) { //checking if the userid for that short URL matches that of the person requesting
    const templateVars = {
      message: "Hi there! You can only edit URLs if you created them. Please register or log in to create your own editable URLs.",
      statusCode: 401,
      user: false
    };
    return response.render("urls_error", templateVars);
  }
  const longURL = request.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});