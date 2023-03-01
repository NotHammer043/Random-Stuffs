const colors = require("colors");
const axios = require("axios").default;
const fs = require("fs");
const config = require("../config.json");
let retry = true;
let file = JSON.parse(fs.readFileSync("./accounts.json"));
let total = [];
let pendingTotal = [];
(async () => {
	for (let x of file) {
		if (x.Username == config.mainAccount) {
			total.push(0);
			pendingTotal.push(0);
			continue;
		}
		axios
			.all([
				axios.get(`https://economy.roblox.com/v1/user/currency`, {
					headers: {
						Cookie: `.ROBLOSECURITY=${x.Cookie}`,
					},
				}),
				axios.get(`https://economy.roblox.com/v2/users/${x.UserID}/transaction-totals?timeFrame=Week&transactionType=summary`, {
					headers: {
						Cookie: `.ROBLOSECURITY=${x.Cookie}`,
					},
				}),
			])
			.then(
				axios.spread((current, pending) => {
					console.log(`${x.Username.cyan}\nCurrent: ${current.data.robux} R$\n${`Pending: ${pending.data.pendingRobuxTotal} R$`.gray}`);
					total.push(current.data.robux);
					pendingTotal.push(pending.data.pendingRobuxTotal);
				})
			)
			.catch((message) => {
				console.log(`${x.Username}: Error ${message.response}`.red);
				total.push(0);
				pendingTotal.push(0);
			});
	}
	while (total.length !== file.length || pendingTotal.length !== file.length) {
		await new Promise((r) => setTimeout(r, 100));
	}
	let totalAdded = total.reduce((a, b) => a + b, 0);
	let pendingTotalAdded = pendingTotal.reduce((a, b) => a + b, 0);
	let allTotal = totalAdded + pendingTotalAdded;
	console.log(`${`\nTotal`.cyan}\nCurrent: ${totalAdded} R$\n${`Pending: ${pendingTotalAdded} R$`.gray}\n${`${allTotal} R$`.green}\n\nAfter Transfer: ${Math.round(allTotal * 0.7)} R$`);
})();
