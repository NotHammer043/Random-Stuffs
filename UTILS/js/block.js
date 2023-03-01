const colors = require("colors");
const noblox = require("noblox.js");
const fs = require("fs");
let file = JSON.parse(fs.readFileSync("./accounts.json"));
let ids = []
file.filter((acc) => ids.push(acc.UserID));
let user = file.filter(function (acc) {
	return acc.Username == process.argv[2];
});
async function blockUsers(id) {
    try {
        await noblox.block(id);
        console.log(`Blocked ${id}`.green)
    } catch (e) {
        console.log(`Failed to block ${id} or user is already blocked`.red)
    }
}
(async () => {
    await noblox.setCookie(user[0].Cookie);
	let index = ids.indexOf(user[0].UserID);
	if (index > -1) {
		ids.splice(index, 1);
	}
	for (let x of ids) {
        await blockUsers(x);
	}
})();
