## Quasar Infobot - The main bot of the QuasarTec company

**So far, this repository cannot be run locally as the main bot.**

Soon it will be possible to run on a local machine and work with a special devbot and a dev database.

To run devbot locally, you need:

- Change the token in the bot.js file to "1617275539: AAFxPsWd44f3VMjC3HBtW7WUAW05grh6ntM"

  ```javascript
  const token = "1617275539: AAFxPsWd44f3VMjC3HBtW7WUAW05grh6ntM";
  ```

- Create a local postgresql db, and apply a dump from the dump folder.
- In the db.js file, replace the values for entering the database with yours
  ```javascript
  const client = new Client({
    user: "*Your user*",
    host: "localhost",
    database: "apps",
    password: "*Your Password*",
    port: 5432,
  });
  ```
- Start bot
  ```bash
  npm start
  That's it, now you can use the @quasar_dev2_bot bot, but do not forget to return the token when committing.

**Alternatively, you can develop directly on the server. To do this, you need to contact your team lead to issue ssh data to log into the server**
