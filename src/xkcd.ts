import * as tmp from 'tmp-promise';
import * as tiny from 'tiny-json-http';
import * as dl from 'image-downloader';
import { MsgSummary } from "keybase-bot/lib/types/chat1";
import Bot from 'keybase-bot';
import * as db from './db';

let bot: Bot;
export function setBot(b: Bot) {
    bot = b;
}

interface xkcdInfoJson {
    month: number,
    num: number,
    link: string,
    year: number,
    news: string,
    safe_title: string,
    transcript: string,
    alt: string,
    img: string,
    title: string,
    day: number
}

export async function sendRandom(message: MsgSummary) {
    const newest: xkcdInfoJson = (await tiny.get({url: "https://xkcd.com/info.0.json"})).body;
    const num = Math.floor(Math.random()*(newest.num-1+1)+1);
    sendNum(message, num);
}

export async function sendLatest(message: MsgSummary) {
    const newest: xkcdInfoJson = (await tiny.get({url: "https://xkcd.com/info.0.json"})).body;
    send(message, newest);
}

export async function sendNum(message: MsgSummary, num: number) {
    const target: xkcdInfoJson = (await tiny.get({url: `https://xkcd.com/${num}/info.0.json`})).body;
    send(message, target);
}

async function send(message: MsgSummary, target: xkcdInfoJson) {
    const msg1 = bot.chat.send(message.conversationId, {body: `XKCD ${target.num}: ${target.title}`});
    const { path, cleanup} = await tmp.dir({unsafeCleanup: true});
    await dl.image({url: target.img, dest:`${path}/XKCD_${target.num}_${target.safe_title}.png`});
    await msg1;
    await bot.chat.attach(message.conversationId, `${path}/XKCD_${target.num}_${target.safe_title}.png`);
    cleanup();
}

export async function sendSubscribed() {
    const newest: xkcdInfoJson = (await tiny.get({url: "https://xkcd.com/info.0.json"})).body;
    if(await db.isLatest(db.services.xkcd, newest.num.toString())) {
        // it is already latest.
        return;
    }
    //not latest
    //send meme.
    const dbQuery = db.Conversation.find({xkcd: true}); //get list of subscribed users.
    const { path, cleanup} = await tmp.dir({unsafeCleanup: true});
    await dl.image({url: newest.img, dest:`${path}/XKCD_${newest.num}_${newest.safe_title}.png`});
    let subs = await dbQuery;
    for(let i=0; i< subs.length; i++) {
        await bot.chat.send(subs[i].conversationId, {body: `XKCD ${newest.num}: ${newest.title}`});
        await bot.chat.attach(subs[i].conversationId, `${path}/XKCD_${newest.num}_${newest.safe_title}.png`);
    }
    cleanup();
}