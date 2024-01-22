import * as utils from "./utils";
import Handler from "./telegram/utils";
import mongodb from "./mongodb/init";
import botCommands from "./telegram/command";
import bingImgCreater from "./bing/bing@imgcreater";
// // The Worker's environment bindings. See `wrangler.toml` file.
interface Bindings {
	// MongoDB Realm Application ID
	API_MONGO_TOKEN: string;
	API_TELEGRAM: string;
	URL_API_MONGO: string;
	_U_BING_COOKIE: string;
	SRCHHPGUSR_BING_COOKIE: string;
}

// Define the Worker logic
const worker: ExportedHandler<Bindings> = {
	async fetch(req, env) {
		const database = new mongodb({
			apiKey: env.API_MONGO_TOKEN,
			apiUrl: env.URL_API_MONGO,
			dataSource: "AtlasCluster",
		});
		const bingImageCT = new bingImgCreater(env._U_BING_COOKIE, env.SRCHHPGUSR_BING_COOKIE);
		const url = new URL(req.url);
		const path = url.pathname.replace(/[/]$/, "");
		if (path !== "/api/randomfood") {
			return utils.toError(`Unknown "${path}" URL; try "/api/randomfood" instead.`, 404);
		}
		const botConfig = {
			userBot: "randomfoodruribot",
			bingImageCT: bingImageCT,
			database: database,
			token: env.API_TELEGRAM,
			commands: {
				"/start": botCommands.start,
				"/help": botCommands.help,
				"/randomfood": botCommands.randomfood,
				"/randomfoodhistory": botCommands.randomfoodhistory,
				"/debt": botCommands.debt,
				"/debthistory": botCommands.debthistory,
				"/debtcreate": botCommands.debtcreate,
				"/debtpay": botCommands.debtpay,
				"/debtdelete": botCommands.debtdelete,
				"/debthelp": botCommands.debthelp,
				"/about": botCommands.about,
				"/checkdate": botCommands.checkdate,
				"/image": botCommands.image,
				"/all": botCommands.tagall,
			},
		};
		const bot = new Handler(botConfig);

		try {
			return bot.handle(req);
		} catch (err) {
			const msg = (err as Error).message || "Error with query.";
			return utils.toJSON(msg, 200);
		}
	},
	async scheduled(event, env, ctx) {
		console.log("cron processed");
	},
};

// Export for discoverability
export default worker;
