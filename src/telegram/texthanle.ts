import type BotModel from "./core";
import type { TextMention } from "./data";

export default async function text_hanle(this: BotModel, currentcommand: any) {
	if (this.message.text === "@all") return this.tagall(null);
	if (currentcommand.document?.command) {
		switch (currentcommand.document.command) {
			case "debtcreate":
				return await debtcreate.call(this);
			case "debtcreatemoney":
				return await debtcreateSet.call(this, currentcommand.document.tempvalue);

			default:
				return false;
		}
	}
	return false;
}

async function debtcreate(this: BotModel) {
	const entities: TextMention[] = this.message.entities;
	console.log(this.message.entities)
	if (entities) {
		const filteredUser = entities
			.filter((item) => item.type === "text_mention")
			.map((item) => ({
				creditors: this.message.from.id,
				debtor: item.user.id,
				firstName: item.user.first_name,
				username: item.user.username,
				lastName: item.user.last_name || "",
			}));
		if (filteredUser.length > 1)
			return await this.sendMessage("Vui lòng tag một người thôii!", this.message.chat.id);
		if (!filteredUser.length)
			return await this.sendMessage("Người bạn tag không tồn tại!", this.message.chat.id);
		await this.database
			.db("randomfood")
			.collection("command")
			.updateOne({
				filter: { _id: this.message.chat.id },
				update: {
					$set: {
						messageId: this.message.message_id,
						command: "debtcreatemoney",
						tempvalue: filteredUser,
					},
				},
				upsert: true,
			});
		return await this.sendMessage(
			"Gửi tớ số tiền bạn nợ nhé, đơn vị là <b>k</b>\nVí dụ: <code>20k</code> hoặc <code>1tr200k</code>",
			this.message.chat.id
		);
	}
	return await this.sendMessage("Đối phương phải được tag và gửi vào đây!", this.message.chat.id);
}

async function debtcreateSet(this: BotModel, tempvalue: any) {
	function convertCurrencyToNumber(input: string): number | null {
		const regex = /^(\d+)(k|tr)?(\d+)?(k|tr)?$/;

		const match = input.match(regex);

		if (!match) {
			return null; // Trả về null nếu chuỗi không khớp định dạng
		}

		const numericValue = parseFloat(match[1]);
		const unit = match[2];

		if (unit === "k") {
			return numericValue * 1000;
		} else if (unit === "tr") {
			return numericValue * 1000000;
		} else {
			return numericValue;
		}
	}
	const { firstName, lastName, creditors, debtor, username } = tempvalue[0];
	const creditfirst_name: string = this.message.from.first_name;
	const creditlast_name: string = this.message.from.last_name ? this.message.from.last_name : "";
	const creditfullName: string =
		creditlast_name !== "" ? `${creditfirst_name} ${creditlast_name}` : creditfirst_name;
	const fullName: string = lastName !== "" ? `${firstName} ${lastName}` : firstName;
	if (creditors !== this.message.from.id)
		return await this.sendMessage("Cậu không phải người tạo khoảng nợ!", this.message.chat.id);
	const money = convertCurrencyToNumber(this.message.text);
	if (!money)
		return await this.sendMessage("Vui lòng gửi đúng định dạng số tiền!", this.message.chat.id);
	await this.database
		.db("randomfood")
		.collection("command")
		.deleteOne({
			filter: { _id: this.message.chat.id },
		});
	await this.sendMessage(
		`<a href="tg://user?id=${this.message.from.id}">${this.message.from.first_name}</a> Vui lòng kiểm tin nhắn riêng để xác nhận khoảng nợ`,
		this.message.chat.id
	);
	const creditorschat = await this.sendMessage(
		`Hãy nhấn vào nút dưới đây để xác nhận khoảng nợ\n${creditfullName} cho ${fullName} nợ <b>${money}đ</b>`,
		creditors
	);
	console.log(creditorschat);
	await this.database
		.db("randomfood")
		.collection("credit")
		.updateOne({
			filter: { _id: this.message.from.id },
			update: { $set: { money: money, ...tempvalue[0] } },
			upsert: true,
		});
	await this.database.db("randomfood").collection("historycredit").insertOne({
		debtor: debtor,
		creditors: creditors,
		money: money,
	});

	return await this.sendMessage(
		`Xong!\n${creditfullName} cho ${fullName} nợ <b>${money}đ</b>`,
		this.message.chat.id
	);
}
