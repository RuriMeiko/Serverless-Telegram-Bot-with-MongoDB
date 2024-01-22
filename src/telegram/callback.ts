import type BotModel from "./core";

export default async function callback_hanle(this: BotModel) {
	const data_callback = this.message.data;
	switch (true) {
		//data dạng "next_x, x là số nguyên"
		case /^next(_\d+)?$/.test(data_callback):
			return await next_function.call(this);
		default:
			return await this.answerCallbackQuery(this.message.id);
	}
}

async function next_function(this: BotModel) {
	await this.sendMessage(
		this.makeHtmlCode(JSON.stringify(this.message, null, 2), "JSON"),
		this.message.message.chat.id,
		this.message.message.message_thread_id
	);

	await this.answerCallbackQuery(this.message.id);
}
