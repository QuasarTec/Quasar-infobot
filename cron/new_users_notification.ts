const client = require('../db');
const old_users_count = require('./old_users_count.json');
const bot = require('../bot');
const fs = require('fs')

type Query = string;

interface Response {
    rows: Row[]
}

interface Row {
    count: number
}


/**
 * Sends message to main chat
 */
const send_message = async function (): Promise<void> {
    const new_users_msg = `За прошлый день, наша команда пополнилась на ${await get_new_users_count()} человек!`;

    await bot.sendMessage(-1001286565304, new_users_msg);
}

const save_users_count = async function (): Promise<void> {
    const json = JSON.stringify({
        users_count: await get_users_count()
    })

    fs.writeFile('old_users_count.json', json, (err: Error) => {
        if (err) throw err;
    })
}

/**
 * Returns the number of users in the database
 */
const get_users_count = async function(): Promise<number> {
    const get_users_count: Query = `SELECT count(*) FROM quasar_telegrambot_users_new;`;

    const users_count_row: Response = await client.query(get_users_count);

    const users_count: number = users_count_row.rows[0].count;

    return users_count;
}

/**
 * Returns the number of users in the database of last night
 */
const get_users_count_of_last_night = function (): number {
    return old_users_count.users_count;
}

/**
 * Returns the number of new users in the database of last night
 */
const get_new_users_count = async function (): Promise<number> {
    let users_count: number = await get_users_count();
    let old_users_count: number = get_users_count_of_last_night();

    let new_users_count: number = users_count - old_users_count;

    return new_users_count;
}

const start = async function (): Promise<void> {
    await send_message();
    await save_users_count();
    setTimeout(() => {
        process.exit(0)
    }, 2000)
}

start();

