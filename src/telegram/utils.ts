import yourbotname from "./self";
import * as utils from "../utils";

export default class Handler {
	private configs: any;
	private token: any;
	private response: Response;
	private request: any;
	private bot: yourbotname | undefined;
	constructor(configs: any) {
		this.configs = configs;
		this.token = this.configs.token;
		this.response = new Response();
	}

	async handle(request: any) {
		this.request = await this.processRequest(request);
		this.bot = new yourbotname({
			userBot: this.configs.userBot,
			bingImageCT: this.configs.bingImageCT,
			database: this.configs.database,
			token: this.token, // Bot Token
			commands: this.configs.commands, // Bot commands
		});

		if (
			this.request.method === "POST" &&
			this.request.type.includes("application/json") &&
			this.request.size > 6 &&
			this.request.content.message
		)
			this.response = await this.bot.update(this.request);
		else if (
			this.request.method === "POST" &&
			this.request.type.includes("application/json") &&
			this.request.size > 6 &&
			this.request.content.callback_query
		) {
			this.response = await this.bot.updateCallback(this.request);
		} else {
			console.log(JSON.stringify(this.request.content, null, 2));
			this.response = utils.toJSON("OK");
		}

		return this.response;
	}
	error(error: any): Response {
		throw new Error(error);
	}

	async processRequest(req: any) {
		let request = req;
		request.size = parseInt(request.headers.get("content-length")) || 0;
		request.type = request.headers.get("content-type") || "";
		if (request.size && request.type) request.content = await this.getContent(request);
		else
			request.content = {
				message: "",
				error: "Invalid content type or body",
			};
		return request;
	}
	async getContent(request: any) {
		if (request.type.includes("application/json")) {
			return await request.json();
		}
		return {
			message: "",
			error: "Invalid content/content type",
		};
	}
}
