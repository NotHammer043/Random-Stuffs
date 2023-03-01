const term = require("terminal-kit").terminal;
const child = require("child_process");
const noblox = require("noblox.js");
const dialog = require("node-file-dialog");
const fs = require("fs");
const axios = require("axios").default;
const ini = require("ini");
const { chromium } = require('playwright-extra')
const stealth = require('puppeteer-extra-plugin-stealth')()
chromium.use(stealth);
const config = require("../config.json");
let acc = [];
term.on("key", function (name) {
	if (name === "CTRL_C") {
		console.clear();
		process.exit();
	}
});

acc.add = async function (account, id) {
	if (!account) {
		console.log("Enter your .ROBLOSECURITY Cookie");
		account = await term.inputField().promise;
	}
	let retry = true;
	async function validate() {
		try {
			let currentUser = await noblox.setCookie(account.toString());
			let username = currentUser.UserName;
			let file;
			if (fs.existsSync("./accounts.json")) {
				file = JSON.parse(fs.readFileSync("./accounts.json"));
			} else {
				file = [];
			}
			let user = file.filter(function (acc) {
				return acc.Username == username;
			});
			if (user.length > 0) {
				return console.log("user already exists");
			}
			let userId = id ? parseInt(id) : currentUser.UserID;

			file.push({ Username: username, Cookie: account, UserID: userId });
			fs.writeFileSync("./accounts.json", JSON.stringify(file));
			console.log(`added ${username}`);
		} catch (e) {
			console.log(e);
			if (retry) {
				retry = false;
				console.log("invalid cookie or rate limited\nretrying in 60 seconds...");
				await new Promise((r) => setTimeout(r, 5000));
				validate();
			} else {
				return console.log("invalid cookie");
			}
		}
	}
	await validate();
	if (id == undefined) {
		console.log("Press enter to continue...");
		term.inputField(function () {
			accountScreen();
		});
	}
};

acc.login = async function () {
	const browser = await chromium.launchPersistentContext("", {
		headless: false,
		viewport: { width: 545, height: 545 },
	});
	const page = await browser.newPage();
	page.context().setDefaultNavigationTimeout(3600000);
	await page.goto("https://www.roblox.com/login", { waitUntil: "networkidle" });
	try {
		await page.waitForSelector("#nav-robux");
	} catch (e) {
		await browser.close();
		return console.log("took too long");
	}
	let cookies = await page.context().cookies("https://www.roblox.com");
	for (let x of cookies) {
		if (x.name == ".ROBLOSECURITY") {
			await acc.add(x.value);
			break;
		}
	}
	await browser.close();
};

acc.remove = async function () {
	term.clear();
	if (fs.existsSync("./accounts.json")) {
		let file = JSON.parse(fs.readFileSync("./accounts.json"));
		let users = ["All Users"];
		for (let x of file) {
			users.push(x.Username);
		}
		term.clear();
		console.log('enter the username or "all"\n');
		let account = await term.inputField().promise;
		if (account.toLowerCase() == "all") {
			fs.unlinkSync("./accounts.json");
		} else {
			let user = file.filter(function (acc) {
				return acc.Username == account;
			});
			let index = file.indexOf(user[0]);
			if (index > -1) {
				file.splice(index, 1);
			}
			fs.writeFileSync("./accounts.json", JSON.stringify(file));
		}
		console.log(`\nremoved ${account}`);
	}
	console.log("Press enter to continue...");
	term.inputField(function () {
		accountScreen();
	});
};

acc.list = function () {
	term.clear();
	if (fs.existsSync("./accounts.json")) {
		let file = JSON.parse(fs.readFileSync("./accounts.json"));
		for (let x of file) {
			console.log(x.Username);
		}
	}
	console.log("Press enter to continue...");
	term.inputField(function () {
		accountScreen();
	});
};

acc.importFrom = async function () {
	let location;
	console.log("select your roblox account manager folder");
	await new Promise((r) => setTimeout(r, 1000));
	await dialog({ type: "directory" }).then((dir) => (location = dir));
	if (!location) return;
	if (!fs.existsSync(`${location}\\AccountData.json`)) return console.log("cannot find AccountData.json");
	fs.copyFileSync(`${location}\\AccountData.json`, "./AccountData.json");
	try {
		dataFile = JSON.parse(fs.readFileSync("./AccountData.json", "utf-8"));
	} catch (e) {
		// try statement inside of a try statement very cool
		try {
			child.execSync("echo & echo.|.\\extra\\RAMDecrypt.exe AccountData.json", { stdio: "pipe" });
		} catch (e) {}
		dataFile = JSON.parse(fs.readFileSync("./AccountData.json", "utf-8"));
	}
	for (let x in dataFile) {
		console.log(`adding account ${parseInt(x) + 1}/${dataFile.length}`);
		await acc.add(dataFile[x].SecurityToken, dataFile[x].UserID);
	}
	fs.unlinkSync("./AccountData.json");
	console.log("Press enter to continue...");
	term.inputField(function () {
		accountScreen();
	});
};

acc.importTo = async function () {
	term.clear();
	if (fs.existsSync("./accounts.json")) {
		let file = JSON.parse(fs.readFileSync("./accounts.json"));
		let location;
		async function webimport(user) {
			let modified = false;
			let inifile = ini.parse(fs.readFileSync(`${location}/RAMSettings.ini`, "utf-8"));
			if (!inifile.Developer.EnableWebServer) {
				inifile.Developer.EnableWebServer = true;
				modified = true;
			}
			if (inifile.WebServer.WebServerPort != config.ramPort) {
				console.log(inifile.WebServer.WebServerPort, config.ramPort);
				inifile.WebServer.WebServerPort = config.ramPort;
				modified = true;
			}
			if (modified == true) {
				fs.writeFileSync(`${location}/RAMSettings.ini`, ini.stringify(inifile));
				try {
					child.execSync('taskkill /IM "RBX ALT MANAGER.exe" /F', { stdio: "ignore" });
				} catch (e) {}
				child.execSync(`start /D "${location}" "" "${location}/RBX ALT MANAGER.exe"`, { stdio: "ignore" });
				console.log("waiting for web server");
				await new Promise((r) => setTimeout(r, 10000));
			}
			await axios.get(`http://localhost:${config.ramPort}/ImportCookie?Cookie=${user.Cookie}`).catch(function (err) {
				console.log(err);
				console.log("FAILED TO IMPORT USING WEB SERVER!");
			});
		}

		await dialog({ type: "directory" }).then((dir) => (location = dir));
		for (let x of file) {
			await webimport(x);
		}
	}
	console.log("Press enter to continue...");
	term.inputField(function () {
		accountScreen();
	});
};

acc.verify = async function () {
	term.clear();
	if (fs.existsSync("./accounts.json")) {
		let file = JSON.parse(fs.readFileSync("./accounts.json"));
		let retry = true;
		async function validate(user) {
			try {
				let currentUser = await noblox.setCookie(user.Cookie);
				let username = currentUser.UserName;
				term.brightGreen(`Verified ${username}\n`);
			} catch (e) {
				term.bold.red(`FAILED TO VERIFY ${user.Username}!\n`);
				if (retry) {
					retry = false;
					term.bold.red("RETRYING IN 60 SECONDS!\n");
					await new Promise((r) => setTimeout(r, 60000));
					validate(user);
				} else {
					let index = file.indexOf(user);
					if (index > -1) {
						file.splice(index, 1);
					}
					return (retry = true);
				}
			}
		}
		for (let x of file) {
			await validate(x);
		}
		fs.writeFileSync("./accounts.json", JSON.stringify(file));
	}
	console.log("Press enter to continue...");
	term.inputField(function () {
		accountScreen();
	});
};

const choices = {
	"Add Account [Cookie]": "add",
	"Add Account [Credentials]": "login",
	"Remove Account": "remove",
	"List Accounts": "list",
	"Import Accounts from Roblox Account Manager": "importFrom",
	"Export Accounts to Roblox Account Manager": "importTo",
	"Verify Accounts": "verify",
	Exit: "",
};
// console.log();
function accountScreen() {
	term.clear();
	term.cyan("ACCOUNT MANAGEMENT\n");

	term.singleColumnMenu(Object.keys(choices), async function (error, response) {
		if (response.selectedText == "Exit") process.exit();
		console.clear();
		await acc[choices[response.selectedText]]();
	});
}
accountScreen();
