const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
"b2xVn2": "http://www.lighthouselabs.ca",
"9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => { // define our route, which is /urls
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars); // since we're using the Express convention of using a views directory, we don't have to tell express where to find the file
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const tempVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", tempVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  res.status(200).send("ok!");         // Respond with 'Ok' (we will replace this)
  urlDatabase.shortURL = req.body // saving the long url at short url key
});

function generateRandomString() {
 let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randString = '';

  for (let i = 0; i < 6; i++ ) {
    randString += string[Math.floor(Math.random()* string.length)];
  }
  return randString;
 }

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});