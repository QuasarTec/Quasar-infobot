const client = require("../db");

const getAllReferals = async (ids, index, viz = false, type = "last_pay") => {
  return new Promise(async (resolve, reject) => {
    if (index < 1) {
      resolve([]);
      return;
    }

    let refs = [];

    for (let i = 0; i < ids.length; i++) {
      let query =
        type === "last_pay"
          ? `SELECT username, id, last_pay  FROM quasar_telegrambot_users_new WHERE ref_id = '${ids[i]}';`
          : `SELECT u.username, u.id, m.${type} FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.ref_id = '${ids[i]}';`;

      client.query(query, async (err, res) => {
        if (err) {
          console.error(err);
          resolve([]);
          return;
        }
        if (res.rowCount === 0) {
          resolve([]);
          return;
        }
        if (index === 1) {
          if (viz) {
            for (let j = 0; j < res.rowCount; j++) {
              if (viz) {
                refs.push({
                  name: res.rows[j].username,
                  id: res.rows[j].id,
                  data: {},
                  children: [],
                  active:
                    parseInt(
                      (new Date() - res.rows[j][type]) / (24 * 3600 * 1000)
                    ) <= 30,
                });
              } else {
                refs.push({
                  username: res.rows[j].username,
                  id: res.rows[j].id,
                  refs: [],
                  parent,
                  active:
                    parseInt(
                      (new Date() - res.rows[j][type]) / (24 * 3600 * 1000)
                    ) <= 30,
                });
              }
            }
          }
          resolve(refs);
          return;
        }

        let query = `SELECT username FROM quasar_telegrambot_users_new WHERE id = '${ids[i]}'`;

        let respose = await client.query(query);

        let parent;

        if (respose.rowCount === 0) {
          parent = "error";
        } else {
          parent = respose.rows[0].username;
        }

        let new_ids = [];
        for (let j = 0; j < res.rowCount; j++) {
          new_ids.push(res.rows[j].id);
        }
        for (let j = 0; j < res.rowCount; j++) {
          if (viz) {
            refs.push({
              name: res.rows[j].username,
              id: res.rows[j].id,
              data: {},
              children: await getAllReferals(
                [new_ids[j]],
                index - 1,
                viz,
                type
              ),
              active:
                parseInt(
                  (new Date() - res.rows[j][type]) / (24 * 3600 * 1000)
                ) <= 30,
            });
          } else {
            refs.push({
              username: res.rows[j].username,
              id: res.rows[j].id,
              refs: await getAllReferals([new_ids[j]], index - 1, viz, type),
              parent,
              active:
                parseInt(
                  (new Date() - res.rows[j][type]) / (24 * 3600 * 1000)
                ) <= 30,
            });
          }
        }

        if (i + 1 === ids.length) {
          resolve(refs);
        }
      });
    }
  });
};

const transformRefs = (refs, index = 9) => {
  let newRefs = [];

  for (let i = 0; i < refs.length; i++) {
    newRefs.push({
      value: refs[i].username,
      level: 9 - index,
      parent: refs[i].parent,
    });
  }

  let refsNextLevel = [];

  for (let i = 0; i < refs.length; i++) {
    if (refs[i].refs !== undefined) {
      let r = transformRefs(refs[i].refs, index - 1);
      if (r !== undefined) {
        for (let j = 0; j < r.length; j++) {
          if (r[j].constructor === Object) {
            newRefs.push({
              value: r[j].value,
              level: r[j].level,
              parent: r[j].parent,
            });
            continue;
          }
          refsNextLevel.push({
            value: r[j],
            level: 9 - index,
            parent: r[j].parent,
          });
        }
      }
    }
  }

  if (refsNextLevel.length > 0) {
    newRefs.push(refsNextLevel);
  }

  if (newRefs.length > 0) {
    return newRefs;
  }
};
module.exports = { getAllReferals, transformRefs };
