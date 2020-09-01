import { createSchema, Type, typedModel,ExtractDoc, ExtractProps } from 'ts-mongoose';
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const ConversationSchema = createSchema({
    conversationId: Type.string({required:true, index: true, unique: true}),
    xkcd: Type.boolean({required: false, default: false, index: true}),
    dilbert: Type.boolean({required: false, default: false, index: true}),
},{ _id: true, timestamps: false });
export const Conversation = typedModel('Conversation', ConversationSchema);
export type ConversationDoc = ExtractDoc<typeof ConversationSchema>;
export type ConversationProps = ExtractProps<typeof ConversationSchema>;

const LastSchema = createSchema({
    key: Type.string({required:true, index: true, unique: true}),
    latest: Type.string({required: true}),
},{ _id: true, timestamps: false });
export const Last = typedModel('Last', LastSchema);
export type LastDoc = ExtractDoc<typeof LastSchema>;
export type LastProps = ExtractProps<typeof LastSchema>;

/**
 * @returns true if it is the latest
 * sets version to latest.
 * @param name the service name
 * @param latest the latest version
 */
export async function isLatest(name: services, latest: string) {
    let results = await Last.find({key: name.valueOf()});
    if(results.length==0) {
        let target = new Last();
        target.key = name;
        target.latest = latest;
        target.save();
        return false;
    }
    if(results[0].latest.trim().toLowerCase()==latest.trim().toLowerCase()) {
        return true;
    }
    //new version
    results[0].latest = latest;
    results[0].save();
    return false;
}

export enum services {
    xkcd='xkcd',
    dilbert='dilbert'
}
export async function toggleService(conversationId: string, service: services, enabled: boolean): Promise<boolean> {
    const result = await Conversation.find({conversationId: conversationId});
    if(result.length==0) {
        const target = new Conversation();
        target.conversationId = conversationId;
        target[service] = enabled;
        target.save();
        return false;
    }
    const pre = result[0][service];
    result[0][service] = enabled;
    result[0].save();
    return pre;
}