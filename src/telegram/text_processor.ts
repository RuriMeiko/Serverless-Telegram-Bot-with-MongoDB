import type BotModel from "./core";
import type { TextMention } from "./data";

export default async function text_hanle(this: BotModel) {
	console.log("text_hanle");
	await this.sendMessage("text_hanle!", this.message.chat.id);
}

