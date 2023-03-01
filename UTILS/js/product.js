const noblox = require("noblox.js");
const fs = require("fs");
const config = require("../config.json");
const file = JSON.parse(fs.readFileSync("./accounts.json"));
let user = file.filter(function (acc) {
	return acc.Username == process.argv[2];
});
user = user[0];
async function setPrice() {
	await noblox.setCookie(user.Cookie);
	await noblox.configureItem(process.argv[4], config.transferShirtName || "placeholder", "", false, parseInt(process.argv[3]));
}
(async () => {
	try {
		await setPrice();
	} catch (e) {
		console.log("rate limited, waiting 60 seconds...");
		await new Promise((r) => setTimeout(r, 60000));
		await setPrice()
	}
})();
