import BotModel from "./core";
import type MongoDB from "../mongodb/init";
import type { InlineKeyboard, TextMention } from "./data";

export default class yourbotname extends BotModel {
	constructor(config: any) {
		super(config);
	}
	// bot command: /start
	async start(req: any, content: string) {
		const first_name: string = this.message.from.first_name;
		const last_name: string = this.message.from.last_name ? this.message.from.last_name : "";
		const fullName: string = last_name !== "" ? `${first_name} ${last_name}` : first_name;
		const botinfo = await this.getMe();
		const welcomeText = `Chào mừng <b>${fullName}</b> đến với <b>${botinfo.first_name}</b>\nBấm vào /help để xem chỉ dẫn nha 😉`;
		return await this.sendMessage(
			welcomeText,
			this.message.chat.id,
			this.message.message_thread_id
		);
	}
	async about(req: any, content: string) {
		const text = "Bot này tạo ra bởi <b>nthl</b> aka <b>rurimeiko</b> ヽ(✿ﾟ▽ﾟ)ノ";
		await this.sendMessage(text, this.message.chat.id);
	}
	async help(req: any, content: string) {
		const text = "help mi";
		const inline_keyboard: InlineKeyboard = [[{ text: "okiii 🤤", callback_data: `next_1` }]];
		// const text = await this.database.db("").collection("").find();
		await this.sendMessage(
			this.makeHtmlCode(JSON.stringify(text, null, 2), "JSON"),
			this.message.chat.id,
			this.message.message_thread_id,
			inline_keyboard
		);
	}
}
