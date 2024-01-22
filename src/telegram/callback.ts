import type MongoDB from "../mongodb/init";
import type BotModel from "./core";
import type { InlineKeyboard } from "./data";

export default async function callback_hanle(this: BotModel) {
	const data_callback = this.message.data;
	switch (true) {
		case /^next(_\d+)?$/.test(data_callback):
			return await next_history.call(this);
		default:
			return await this.answerCallbackQuery(this.message.id);
	}
}

async function next_history(this: BotModel) {
	const data_callback = this.message.data;
	const number = data_callback.split("_");
	await this.randomfoodhistory(null, parseInt(number[1]), true);
	// await this.sendMessage(
	// 	this.makeHtmlCode(JSON.stringify(this.message, null, 2), "JSON"),
	// 	this.message.message.chat.id
	// );

	await this.answerCallbackQuery(this.message.id);
}
