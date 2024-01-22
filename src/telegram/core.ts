import * as utils from "../utils";
import { supportedLanguages, type InlineKeyboard, type supportedLanguagesType } from "./data";
import type MongoDB from "../mongodb/init";
import callback_hanle from "./callback";
import text_processor from "./text_processor";
export default class BotModel {
	[x: string]: any;
	private token: any;
	private commands: any;
	private url: string;
	message: any;
	database: MongoDB;
	userBot: any;
	constructor(config: any) {
		this.token = config.token;
		this.commands = config.commands;
		this.url = "https://api.telegram.org/bot" + this.token;
		this.database = config.database;
		this.userBot = config.userBot;
	}
	async update(request: any) {
		try {
			this.message = request.content.message;
			// console.log(this.message);
			if (this.message.hasOwnProperty("text")) {
				// process text

				// Test command and execute
				if (!(await this.executeCommand(request))) {
					// Test is not a command
					await text_processor.call(this);
				} else if (this.message.hasOwnProperty("photo")) {
					// process photo
					console.log(this.message.photo);
				} else if (this.message.hasOwnProperty("video")) {
					// process video
					console.log(this.message.video);
				} else if (this.message.hasOwnProperty("animation")) {
					// process animation
					console.log(this.message.animation);
				} else if (this.message.hasOwnProperty("locaiton")) {
					// process locaiton
					console.log(this.message.locaiton);
				} else if (this.message.hasOwnProperty("poll")) {
					// process poll
					console.log(this.message.poll);
				} else if (this.message.hasOwnProperty("contact")) {
					// process contact
					console.log(this.message.contact);
				} else if (this.message.hasOwnProperty("dice")) {
					// process dice
					console.log(this.message.dice);
				} else if (this.message.hasOwnProperty("sticker")) {
					// process sticker
					console.log(this.message.sticker);
				} else if (this.message.hasOwnProperty("reply_to_message")) {
					// process reply of a message
					console.log(this.message.reply_to_message);
				}
			} else {
				console.log(this.message);
			}
		} catch (error: JSON | any) {
			console.error(error);
			return utils.toError(error.message);
		}
		// return 200 OK response to every update request
		return utils.toJSON("OK");
	}
	async updateCallback(request: any) {
		try {
			this.message = request.content.callback_query;
			await callback_hanle.call(this);
		} catch (error: JSON | any) {
			console.error(error);
			return utils.toError(error.message);
		}
		// return 200 OK response to every update request
		return utils.toJSON("OK");
	}
	escapeHtml(str: string): string {
		const escapeMap: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return str.replace(/[&<>"']/g, (match) => escapeMap[match]);
	}
	makeHtmlCode(str: string, language: supportedLanguagesType): string {
		// Kiểm tra xem ngôn ngữ có được hỗ trợ hay không
		if (!supportedLanguages.includes(language)) {
			return `<pre>${this.escapeHtml(str)}</pre>`;
		}
		// Tạo mã HTML với thẻ <code> và cấu trúc cho ngôn ngữ cụ thể
		return `<pre><code class="language-${language}">${this.escapeHtml(str)}</code></pre>`;
	}
	async executeCommand(req: any) {
		let cmdArray = this.message.text.split(" ");
		let command: string = cmdArray.shift();
		if (command.endsWith("@" + this.userBot)) {
			let cmdArray2 = command.split("@");
			//@ts-ignore
			command = cmdArray2.shift();
		}
		const isCommand = Object.keys(this.commands).includes(command);

		if (isCommand) {
			await this.commands[command](this, req, cmdArray.join(""));
			return true;
		}
		return false;
	}
	async getMe() {
		const base_url = `${this.url}/getMe`;
		try {
			const response: any = await fetch(base_url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}).then((resp) => resp.json());
			if (!response.ok) {
				return null;
			}
			return response.result;
		} catch (error: any) {
			console.error("Error sending message:", error.message);
			return null;
		}
	}
	async sendMessage(
		text: string,
		chatId: number,
		message_thread_id?: number,
		inlineKeyboard?: InlineKeyboard,
		parseMode: string = "HTML"
	) {
		const base_url = `${this.url}/sendMessage`;

		const body = {
			chat_id: chatId,
			text: text,
			parse_mode: parseMode,
			reply_markup: inlineKeyboard
				? { inline_keyboard: inlineKeyboard }
				: { remove_keyboard: true },
			message_thread_id: message_thread_id,
		};

		try {
			const response: Response = await fetch(base_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}).then((resp) => resp.json());

			return response;
		} catch (error: any) {
			console.error("Error sending message:", error.message);
			return null;
		}
	}
	async sendMediaGroup(
		photoUrls: string[],
		chatId: number,
		caption: string = "",
		message_thread_id?: number,
		parseMode: string = "HTML"
	) {
		const base_url = `${this.url}/sendMediaGroup`;

		const photos = photoUrls.map((photoUrl) => ({
			type: "photo",
			media: photoUrl,
			caption: caption,
		}));

		const body = {
			chat_id: chatId,
			media: photos,
			parse_mode: parseMode,
			caption: caption,
			message_thread_id: message_thread_id,
		};

		try {
			const response = await fetch(base_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}).then((resp) => resp.json());

			return response;
		} catch (error: any) {
			console.error("Error sending media group:", error.message);
			return null;
		}
	}
	async sendSticker(
		stickerId: string,
		chatId: number,
		message_thread_id?: number,
		replyMarkup?: InlineKeyboard
	) {
		const base_url = `${this.url}/sendSticker`;

		const body = {
			chat_id: chatId,
			sticker: stickerId,
			reply_markup: replyMarkup
				? { inline_keyboard: replyMarkup }
				: { remove_keyboard: true },
			message_thread_id: message_thread_id,
		};

		try {
			const response: Response = await fetch(base_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}).then((resp) => resp.json());

			return response;
		} catch (error: any) {
			console.error("Error sending sticker:", error.message);
			return null;
		}
	}
	async sendPhoto(
		photoUrls: string,
		chatId: number,
		caption: string = "",
		message_thread_id?: number,
		inlineKeyboard?: InlineKeyboard,
		parseMode: string = "HTML"
	) {
		const base_url = `${this.url}/sendPhoto`;

		const body = {
			chat_id: chatId,
			photo: photoUrls,
			parse_mode: parseMode,
			caption: caption,
			reply_markup: inlineKeyboard
				? { inline_keyboard: inlineKeyboard }
				: { remove_keyboard: true },
			message_thread_id: message_thread_id,
		};

		try {
			const response = await fetch(base_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}).then((resp) => resp.json());

			return response;
		} catch (error: any) {
			console.error("Error sending photos:", error.message);
			return null;
		}
	}
	async editMessage(
		text: string,
		chatId: number,
		messageId: number,
		inlineKeyboard: InlineKeyboard | undefined = undefined,
		parseMode: string = "HTML"
	) {
		const base_url = `${this.url}/editMessageText`;

		const body = {
			chat_id: chatId,
			message_id: messageId,
			text: text,
			parse_mode: parseMode,
			reply_markup: inlineKeyboard
				? { inline_keyboard: inlineKeyboard }
				: { remove_keyboard: true },
		};

		try {
			const response = await fetch(base_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}).then((resp) => resp.json());

			return response;
		} catch (error: any) {
			console.error("Error editing message:", error.message);
			return null;
		}
	}
	async answerCallbackQuery(
		callbackQueryId: number,
		text: string | undefined = undefined,
		showAlert: boolean = false
	) {
		const base_url = `${this.url}/answerCallbackQuery`;

		const body = {
			callback_query_id: callbackQueryId,
			text: text,
			show_alert: showAlert,
		};

		try {
			const response = await fetch(base_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}).then((resp) => resp.json());

			return response;
		} catch (error: any) {
			console.error("Error answering callback query:", error.message);
			return null;
		}
	}
}
