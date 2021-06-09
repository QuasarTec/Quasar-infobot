const client = require('../db');

const getAllInviters = async (id, i, type = 'last_pay') => {
    return new Promise((resolve, reject) => {

        if (i < 1) {
            resolve([]);
            return;
        }

        const query = type === 'last_pay' ? `SELECT username, ref_id, id, last_pay FROM quasar_telegrambot_users_new WHERE id = ${id};` : 
        `SELECT m.${type}, u.username, u.ref_id, u.id FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.id = ${id};`
        
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

            

            const {username, ref_id, id} = res.rows[0];

            
            let refs;
            if (parseInt((new Date()-res.rows[0][type])/(24*3600*1000)) <= 30) {
                refs = await getAllInviters(ref_id, i-1, type)
                refs.push({username, id});
            } else {
                refs = await getAllInviters(ref_id, i, type)
            }


            resolve(refs);
    
        })
    })
}

module.exports = getAllInviters;