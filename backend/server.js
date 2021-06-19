const express = require("express");
const app = express();
const db = require('./config/database');
const User = require('./models/user')

async function main() {
  const { PORT } = process.env;

  db.authenticate().then(() => console.log("Connected to database..."))
  await db.sync()

  const Auth = require("./routes/Auth");
  app.use("/api/user", Auth);

  const port = PORT || 4000;

  app.listen(port, function () {
    console.log("Server listening on port " + port);
  });
}

main().catch(err => console.log(err));
