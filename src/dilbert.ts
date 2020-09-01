import * as dilbert from '@noahwitt/dilbertapi';
import * as tmp from 'tmp-promise';
import * as dl from 'image-downloader';
import { MsgSummary } from "keybase-bot/lib/types/chat1";
import Bot from 'keybase-bot';
import * as db from './db';
let bot: Bot;
export function setBot(b: Bot) {
    bot = b;
}

export async function sendRandom(message: MsgSummary) {
    const response = await dilbert.getRandom();
    sendDilbert(message, response);
}

export async function sendLatest(message: MsgSummary) {
    const response = await dilbert.getLatest();
    sendDilbert(message, response);
}

export async function sendDate(message: MsgSummary, date: string) {
    const response = await dilbert.getByDateString(date);
    sendDilbert(message, response);
}

async function sendDilbert(message: MsgSummary, response: dilbert.dilbertComic) {
    const msg1 = bot.chat.send(message.conversationId, {body:`Dilbert: ${response.title}, ${response.date}\n${response.url}`});
    const { path, cleanup} = await tmp.dir({unsafeCleanup: true});
    await dl.image({url: response.url, dest:`${path}/${response.title}-${response.date}.gif`});
    await msg1;
    await bot.chat.attach(message.conversationId, `${path}/${response.title}-${response.date}.gif`);
    cleanup();
    return;
}

export async function sendSubscribed() {
    const newest = await dilbert.getLatest();
    if(await db.isLatest(db.services.dilbert, newest.date)) {
        // it is already latest.
        return;
    }
    //not latest
    //send meme.
    const dbQuery = db.Conversation.find({dilbert: true}); //get list of subscribed users.
    const { path, cleanup} = await tmp.dir({unsafeCleanup: true});
    await dl.image({url: newest.url, dest:`${path}/${newest.title}-${newest.date}.gif`});
    let subs = await dbQuery;
    for(let i=0; i< subs.length; i++) {
        await bot.chat.send(subs[i].conversationId, {body: `Dilbert: ${newest.title}, ${newest.date}\n${newest.url}`});
        await bot.chat.attach(subs[i].conversationId, `${path}/${newest.title}-${newest.date}.gif`);
    }
    cleanup();
}