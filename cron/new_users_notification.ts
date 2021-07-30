const client = require('../db');

type Query = string;

interface Response {
    rows: Row[]
}

interface Row {
    count: number
}

const get_users_count = async function(): Promise<number> {
    const get_users_count: Query = `SELECT count(*) FROM quasar_telegrambot_users_new;`;

    const users_count_row: Response = await client.query(get_users_count);

    const users_count: number = users_count_row.rows[0].count;

    return users_count;
}
