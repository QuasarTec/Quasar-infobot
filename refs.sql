SELECT * FROM quasar_telegrambot_users_new WHERE
username = 'ladygold11'
Or username = 'Zoreslava43'
Or username = 'Farida2606'
Or username = 'Pifagor9'
Or username = 'grum5'
Or username = 'Popovi52'
Or username = 'AlexandrZhaaa'

SELECT username, id, ref_id FROM quasar_telegrambot_users_new WHERE
username = 'Nadia_Magia'
Or username = 'AsyaUna'
Or username = 'foxykleo89'
Or username = 'Elena575757'
Or username = 'Miledi555'
Or username = 'Rolina5555'
Or username = 'skarlet802'
Or username = 'NataStars18'
Or username = 'ecotop_greenway'
Or username = 'kupava19'

   username    | id  | ref_id 
---------------+-----+--------
 grum5         |  42 |       
 lianashevela  | 428 |       
 Lilusa        | 429 |       
 Pifagor9      | 456 |       
 AlexandrZhaaa | 284 |       
 Popovi52      | 227 |       

INSERT INTO quasar_telegrambot_users_new (username, ref_id, last_pay) VALUES
('GulsemAnarbaeva',123,Now()),
('leoniv25',(SELECT id FROM quasar_telegrambot_users_new WHERE username = 'brilliant989'),Now()),
('okhlopru',(SELECT id FROM quasar_telegrambot_users_new WHERE username = 'brilliant989'),Now()),
('vipgoldlineoj',(SELECT id FROM quasar_telegrambot_users_new WHERE username = 'systemmoneys'),Now()),
('InvestExpert_info',(SELECT id FROM quasar_telegrambot_users_new WHERE username = 'systemmoneys'),Now());

UPDATE marketings set qcloud_pay = Now(), franchise_pay = Now(),message_pay = Now(),insta_comment_pay = Now(),
insta_lead_pay = Now(),skype_lead_pay = Now(),skype_reg_pay = Now(), tele_lead_pay = Now(), vk_lead_pay = Now(), 
vk_reg_pay = Now(), insta_king_pay = Now() where user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'jnecua123');

UPDATE quasar_telegrambot_users_new SET last_pay = Now();

UPDATE quasar_telegrambot_users_new 
SET ref_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'Quasar_Company') 
WHERE username = 'Vmlynko' OR
username = 'topleader111' OR
username = 'top444444' OR
username = 'bvornik444' OR
username = 'asia0001';

    username    | id  | ref_id 
----------------+-----+--------
 alla_donskowa  | 542 |       

 SELECT ref_id FROM quasar_telegrambot_users_new GROUP BY ref_id HAVING count(*)>4;

 CREATE TABLE SkypeLeadFingerprints (
     id serial primary key,
     fingerprint text
 );

ALTER TABLE marketings ADD COLUMN insta_lead_pay timestamp;
ALTER TABLE marketings ADD COLUMN skype_lead_pay timestamp;
ALTER TABLE marketings ADD COLUMN skype_reg_pay timestamp;
ALTER TABLE marketings ADD COLUMN tele_lead_pay timestamp;
ALTER TABLE marketings ADD COLUMN vk_lead_pay timestamp;
ALTER TABLE marketings ADD COLUMN vk_reg_pay timestamp;

SELECT SUM(amount) AS total FROM payments_history;

INSERT INTO payments_history (marketing, amount, user_id) VALUES ('franchise_pay', 10.57, (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'jnecua123'));

INSERT INTO marketings (user_id) VALUES (583);

UPDATE quasar_telegrambot_users_new SET sign = 'test' WHERE username = 'jnecua123';

CREATE TABLE chats (
    id serial primary key,
    msg_text text,
    active boolean
);


DELETE FROM marketings WHERE user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'jnecua123');
DELETE FROM quasar_telegrambot_users_new WHERE username = 'jnecua123';

INSERT INTO newsletters (chat_ids, msg_text, img, send_time) VALUES ('{"-558470404"}', 'Хелло индеец', '54326.jpg', '2021-06-15 13:44:00.000000');

___________________________

DUMP
PGPASSWORD="DKJ&^%1231dsahldsaj(*&" pg_dump -U apps -h localhost apps > dump/apps.dump
psql -U apps -h localhost apps -W < dump/apps.dump
___________________________