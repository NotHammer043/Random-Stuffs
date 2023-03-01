const noblox = require("noblox.js");
const child = require("child_process");
const fs = require("fs");
const config = require("../config.json");
const term = require("terminal-kit").terminal;
term.on("key", function (name) {
	if (name === "CTRL_C") {
		console.clear();
		process.exit();
	}
});
let arg1;
let arg2;
let currentUser;
let user;
let file = JSON.parse(fs.readFileSync("./accounts.json"));

async function transfer(x) {
	if (x.Username == user.Username || x.Username == config.mainAccount) return;
	try {
		currentUser = await noblox.setCookie(x.Cookie);
		console.log(x.Username + ": " + currentUser.RobuxBalance);
	} catch (e) {
		console.log("\nrate limited, waiting 60 seconds...");
		await new Promise((r) => setTimeout(r, 60000));
		currentUser = await noblox.setCookie(x.Cookie);
		console.log(x.Username + ": " + currentUser.RobuxBalance);
	}
	if (currentUser.RobuxBalance >= 5) {
		try {
			await noblox.deleteFromInventory(arg2);
		} catch (e) {}
		child.execSync(`node ./js/product.js ${user.Username} ${currentUser.RobuxBalance} ${arg2}`, { stdio: "inherit" });
		await noblox.buy(arg2);
	}
}

(async () => {
	if (process.argv[2]) {
		arg1 = process.argv[2];
	} else if (config.mainAccount != "") {
		arg1 = config.mainAccount;
	} else {
		console.log("Enter the username to transfer to ");
		arg1 = await term.inputField().promise;
	}
	if (process.argv[3]) {
		arg2 = process.argv[3];
	} else {
		console.log("\nEnter the T-SHIRT ID to use ");
		arg2 = await term.inputField().promise;
	}
	console.log("\n");
	user = file.filter(function (acc) {
		return acc.Username == arg1;
	});
	if (!user) {
		console.log("\nuser not found");
		process.exit();
	}
	user = user[0];
	for (let x of file) {
		try {
			await transfer(x);
		} catch (e) {
			console.log(e);
			console.log("\nrate limited, waiting 60 seconds...");
			await new Promise((r) => setTimeout(r, 60000));
			await transfer(x);
		}
	}
	process.exit();
})();
