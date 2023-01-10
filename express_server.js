const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Original Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Users Object
const users = {

};

function generateRandomString() {
  let sixCharacterUniqueId = "";
  let characters = "abcdefghijklmnopqrstuvwxyz123456789";
  let charArr = characters.split("");
  for (let i = 0; i < 6; i++) {
    sixCharacterUniqueId += charArr[Math.round(Math.random() * charArr.length)];
  };
  return sixCharacterUniqueId;
}

//Routes 
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id; 
  const templateVars = {
    urls: urlDatabase,
    users,
    userId
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userId;
  const templateVars = {
    urls: urlDatabase,
    userId,
    users
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const userId = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    userId,
    id,
    longURL,
    users,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  //console.log(req.body)// Log the POST request body to the console
  res.redirect(`/urls/${shortUrl}`);
  //res.send("ok"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;

  const templateVars = {
    urls: urlDatabase,
    userId,
    users
  };
  res.render("login", templateVars); 
});

app.post("/login", (req, res) => {
  const email = req.body.email; 
  const password = req.body.password; 
  let user; 

  for (const userId in users) { 
    if (users[userId].email === email) { 
      user = users[userId]
      res.cookie("user_id", userId)
      res.redirect("/urls")
    }
  }
  if (!user) { 
    return res.status(403).send("email not found"); 
  }

  if (user.password !== password) { 
    return res.status(403).send("incorrect password");
  }

});

app.post("/logout", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    users,
    userId,
  };
  console.log("logging out");
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    users,
    userId,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    console.log("email/password cant be empty");
   return res.sendStatus(400);
  };

  for (const user in users) {
    if (req.body.email === users[user].email) {
     return  res.sendStatus(400);
    }
  };

  const userId = generateRandomString();

  const newUser = {
    userId,
    email: req.body.email,
    password: req.body.password,
  };
  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect("/urls");
});



//Server Listening 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 