import * as dotenv from "dotenv";
dotenv.config();
import Bot from 'keybase-bot';
import * as dilbert from './dilbert';
import * as xkcd from './xkcd';
import * as db from './db';
const bot = new Bot();
dilbert.setBot(bot);
xkcd.setBot(bot);

async function init() {
    await bot.init(process.env.keybaseName, process.env.keybasePaperKey, {verbose: false});
    console.log(`Your bot is initialized. It is logged in as ${bot.myInfo().username}`);
    looper();
    bot.chat.watchAllChannelsForNewMessages(async (message) => {
        try {
            if(message.content.type!='text') return;

            //dilbert
            if(message.content.text.body.trim()=='dilbert') {
                dilbert.sendRandom(message);
                return;
            }
            if(message.content.text.body.trim()=='dilbert latest') {
                dilbert.sendLatest(message);
                return;
            }
            if(message.content.text.body.trim().toLowerCase().match('^dilbert [0-9]{4}-[0-9]{2}-[0-9]{2}')) {
                dilbert.sendDate(message,message.content.text.body.trim().substr(7).trim());
                return;
            }

            //xkcd
            if(message.content.text.body.trim()=='xkcd') {
                xkcd.sendRandom(message);
                return;
            }
            if(message.content.text.body.trim()=='xkcd latest') {
                xkcd.sendLatest(message);
                return;
            }
            if(message.content.text.body.trim().toLowerCase().match('^xkcd [0-9]+')) {
                xkcd.sendNum(message,Number.parseInt(message.content.text.body.trim().substr(4).trim()));
                return;
            }

            //subscriptions
            if(message.content.text.body.trim().toLowerCase()=='subscribe dilbert') {
                db.toggleService(message.conversationId, db.services.dilbert, true);
                bot.chat.send(message.conversationId, {body:'subscribed to dilbert.'});
            }
            if(message.content.text.body.trim().toLowerCase()=='subscribe xkcd') {
                db.toggleService(message.conversationId, db.services.xkcd, true);
                bot.chat.send(message.conversationId, {body:'subscribed to xkcd.'});
            }

            //unsubscribe
            if(message.content.text.body.trim().toLowerCase()=='unsubscribe dilbert') {
                db.toggleService(message.conversationId, db.services.dilbert, false);
                bot.chat.send(message.conversationId, {body:'unsubscribed to dilbert.'});
            }
            if(message.content.text.body.trim().toLowerCase()=='unsubscribe xkcd') {
                db.toggleService(message.conversationId, db.services.xkcd, false);
                bot.chat.send(message.conversationId, {body:'unsubscribed to xkcd.'});
            }
        } catch(error) {
            console.log(error);
        }
    });
}

const looperRateMinute: number = 1;
async function looper(){
    xkcd.sendSubscribed();
    dilbert.sendSubscribed();
    setTimeout(looper, looperRateMinute*60*1000);
}

init();