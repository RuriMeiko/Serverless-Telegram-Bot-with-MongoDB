const botCommands = {
	start: async (bot: any, req: any, args: any) => await bot.start(req, args),
	help: async (bot: any, req: any, args: any) => await bot.help(req, args),
	randomfood: async (bot: any, req: any, args: any) => await bot.randomfood(req, args),
	randomfoodhistory: async (bot: any, req: any, args: any) => await bot.randomfoodhistory(req, args),
	debt: async (bot: any, req: any, args: any) => await bot.debt(req, args),
	debthistory: async (bot: any, req: any, args: any) => await bot.debthistory(req, args),
	debtcreate: async (bot: any, req: any, args: any) => await bot.debtcreate(req, args),
	debtpay: async (bot: any, req: any, args: any) => await bot.debtpay(req, args),
	debtdelete: async (bot: any, req: any, args: any) => await bot.debtdelete(req, args),
	debthelp: async (bot: any, req: any, args: any) => await bot.debthelp(req, args),
	about: async (bot: any, req: any, args: any) => await bot.about(req, args),
	checkdate: async (bot: any, req: any, args: any) => await bot.checkdate(req, args),
	image: async (bot: any, req: any, args: any) => await bot.image(req, args),
	tagall: async (bot: any, req: any, args: any) => await bot.tagall(req, args),

};
export default botCommands;
