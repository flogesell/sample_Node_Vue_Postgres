const express = require("express");
const bcrypt = require('bcrypt');
const auth = express.Router();
const db = require('../config/database');
const User = require('../models/e_user')


const jwt = require('jsonwebtoken');
const authentificate = require('../middleware/authentification.js')

const { SECRET } = process.env;

auth.use(express.json());

async function main() {
  db.authenticate().then(() => console.log("Connected to database..."))
  await db.sync()
}

// LOGIN
auth.get('/login', async function (req, res) {
  const { username, password } = req.body;
  if(username !== "" && password !== "") {
    const account = await User.findOne({ where: { email: username } });
    if (account) {
      let validPassword = await bcrypt.compare(password, account.password);
      if (validPassword) {
          // Generate an access token
          const accessToken = jwt.sign({ id: account.id }, SECRET);
          res.status(200).json({accessToken});
        } else {
          res.status(200).json("Username or password incorrect");
        }
      };
  } else {
      res.send('Username or password incorrect');
  }
})

// REGISTER
auth.post('/register', async function (req, res) {
    const { firstName, lastName, email, password, admin  } = req.body;
    if(req !== null) {
      const exists = await User.findOne({ where: { email: email } });
      console.log(exists)
    if (exists === null) {
        let hash = await bcrypt.hashSync( password, 10);
        await User.create({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hash
        });
      res.status(200).json("registered");
    } else {
      res.status(409).json("already registered");
    }
    }
})

// LIST ALL USER
auth.get('/list', authentificate, async function (req, res) {
  res.status(200).json(await User.findAll(), null, 2);
})

// EDIT USER
auth.post('/edit/:id', authentificate, async function (req, res) {
  const id = req.params.id;
  const { firstName, lastName, email, password, admin  } = req.body;
  const account = await User.findOne({ where: { id: req.user.id } });

  if(account.isAdmin === true) {
    User.update( { firstName: firstName, lastName: lastName, email: email, password: password, isAdmin: admin  }, { where: { id: id } } )
    .then(function(affectedRows) {
      res.status(200).json("updated " + affectedRows);
    })
  }
})

auth.get('/test', authentificate, async function (req, res) {
  const account = await User.findOne({ where: { email: req.user.username } });
  
  res.status(200).json(account);
})

module.exports = auth;