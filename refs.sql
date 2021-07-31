
SELECT * FROM quasar_telegrambot_users_new WHERE
username = 'oleg3857'
Or username = 'vadim8967'
Or username = 'klim52'
Or username = 'grid848'
Or username = 'kostj974'
Or username = 'burov304'
Or username = 'avd157'
Or username = 'VOVO4KA1224'
Or username = 'systemmoneys'
Or username = 'Kdan_dev'
Or username = 'ShoSupport'
Or username = 'BeverleySok'
Or username = 'ImyaaPolzovatelya'
Or username = 'LevShma'

SELECT username, id, ref_id FROM quasar_telegrambot_users_new WHERE
id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = 'oleg3857')
Or id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = 'vadim8967')
Or id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = 'klim52')
Or id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = 'grid848')
Or id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = 'burov304')
Or id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = 'avd157')
Or id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = 'kostj974')
Or id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'Nadia_Magia')
Or id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'Nadia_Magia')


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

UPDATE marketings set qcloud_pay = Null, franchise_pay = Null,message_pay = Null,insta_comment_pay = Null,
insta_lead_pay = Null,skype_lead_pay = Null,skype_reg_pay = Null, tele_lead_pay = Null, vk_lead_pay = Null, 
vk_reg_pay = Null, insta_king_pay = Null where user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'olysa470330');

UPDATE quasar_telegrambot_users_new SET last_pay = Now() where username = 'Quasar_Company';

UPDATE quasar_telegrambot_users_new 
SET ref_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'Quasar_Company') 
WHERE username = 'AR_261056' OR
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

SELECT SUM(amount) AS total FROM payments_history WHERE currency = 'USD';

INSERT INTO payments_history (marketing, amount, user_id) VALUES ('franchise_pay', 10.57, (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'jnecua123'));

INSERT INTO marketings (user_id) VALUES (583);

UPDATE quasar_telegrambot_users_new SET sign = 'test' WHERE username = 'Quasar_Company';

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
PGPASSWORD="admin12345" pg_dump -U synapse_user -h 127.0.0.1 synapse > dump/apps_synapse.dump
PGPASSWORD="4Y5FvarAv3hT69B" pg_dump -U apps -h matrix-apps.c0w0nxnsuhxv.eu-north-1.rds.amazonaws.com apps > dump/apps.dump
psql -U synapse_user -h matrix-apps.c0w0nxnsuhxv.eu-north-1.rds.amazonaws.com synapse -W < dump/apps_synapse.dump

___________________________

SELECT * FROM payments_history WHERE
user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = 'systemmoneys')
ORDER BY datetime ASC;

SELECT sum(amount) AS total FROM payments_history WHERE datetime > '2021-06-27 12:37:42.215118+00';


@EasyStarsMain
@Quasar_Company
@topleader111
@olyudmila6
@verakr8
@yava369
@Evgeniy_Sakardin
@s1_alter