import * as utils from "./utils";
import Handler from "./telegram/utils";
import mongodb from "./mongodb/init";
import botCommands from "./telegram/command";
// // The Worker's environment bindings. See `wrangler.toml` file.
interface Bindings {
	// MongoDB Realm Application ID
	API_MONGO_TOKEN: string;
	API_TELEGRAM: string;
	URL_API_MONGO: string;
}

// Define the Worker logic
const worker: ExportedHandler<Bindings> = {
	async fetch(req, env) {
		const database = new mongodb({
			apiKey: env.API_MONGO_TOKEN,
			apiUrl: env.URL_API_MONGO,
			dataSource: "AtlasCluster",
		});
		const url = new URL(req.url);
		const path = url.pathname.replace(/[/]$/, "");
		if (path !== "/your_api") {
			return utils.toError(`Unknown "${path}" URL; try "/your_api" instead.`, 404);
		}
		const botConfig = {
			userBot: "yourbotname",
			database: database,
			token: env.API_TELEGRAM,
			commands: {
				"/start": botCommands.start,
				"/help": botCommands.help,
				"/about": botCommands.about,
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
