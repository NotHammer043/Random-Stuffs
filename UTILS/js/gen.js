const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);
const noblox = require("noblox.js");
const axios = require("axios").default;
const fs = require("fs");
const colors = require("colors");
const child = require("child_process");
const ini = require("ini");
const dialog = require("node-file-dialog");
const config = require("../config.json");
const lastNames = require("../extra/lastNames.json");
let arg3 = process.argv[3] ? process.argv[3] : "";
let nopechaKey = process.argv[4] ? process.argv[4] : "";
let accsMade = 0;
const nopechaPath = require("path").join(__dirname, "../extra/nopecha");
const cookiePath = require("path").join(__dirname, "../extra/extCookies");

async function removeAccount(username) {
	if (fs.existsSync("./accounts.json")) {
		let file = JSON.parse(fs.readFileSync("./accounts.json"));

		let user = file.filter(function (acc) {
			return acc.Username == username;
		});
		let index = file.indexOf(user[0]);
		if (index > -1) {
			file.splice(index, 1);
		}
		fs.writeFileSync("./accounts.json", JSON.stringify(file));
	}
}

async function setup(second) {
	if (second != true) console.log("Generating " + process.argv[2] + " Accounts");

	let browser = await chromium.launchPersistentContext("", {
		headless: false,
		viewport: { width: 545, height: 545 },
		args: [`--disable-extensions-except=${nopechaPath},${cookiePath}`, `--load-extensions=.${nopechaPath},${cookiePath}`],
	});
	let page = await browser.newPage();
	page.context().setDefaultTimeout(200000);
	if (nopechaKey) {
		await page.goto(`https://nopecha.com/setup#${nopechaKey}`);
		await page.waitForSelector("body > p:nth-child(3)");
		await new Promise((r) => setTimeout(r, 2500));
	}
	try {
		while (accsMade != process.argv[2]) {
			await makeAccount(page);
		}
	} catch (e) {
		console.log(e);
	}
	await browser.close();
}
async function makeAccount(page) {
	console.log(`${`Generating Account ${accsMade + 1}/${process.argv[2]}`.bgGreen.black}`);
	let names = require("../extra/femaleNames.json");
	let gender = "Female";
	if (config.defaultGender == "Male" || arg3.toLowerCase() == "m" || (arg3.toLowerCase() == "r" && Math.random() >= 0.5)) {
		names = require("../extra/maleNames.json");
		gender = "Male";
	}
	await page.goto("https://www.roblox.com/", { waitUntil: "networkidle" });
	// await new Promise((r) => setTimeout(r, 5000000));

	await page.locator('[id="MonthDropdown"]').selectOption(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Math.floor(Math.random() * 12)]);
	await page.locator('[id="DayDropdown"]').selectOption(Math.floor(Math.random() * (28 - 10) + 10).toString());
	await page.locator('[id="YearDropdown"]').selectOption(Math.floor(Math.random() * (2000 - 1970) + 1970).toString());
	const minNum = parseInt("1" + "0".repeat(config.numberLength - 1 || 1));
	const maxNum = parseInt("9".repeat(config.numberLength || 2));
	const username = names[Math.floor(Math.random() * names.length)] + lastNames[Math.floor(Math.random() * lastNames.length)] + Math.floor(Math.random() * (maxNum - minNum) + minNum).toString();
	//Password generator
	const password = Array(15)
		.fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
		.map(function (x) {
			return x[Math.floor(Math.random() * x.length)];
		})
		.join("");
	const shownPass = config.hidePassword ? "***************" : password;
	console.log(`Username: ${username.cyan}\nPassword: ${shownPass.cyan}\nGender: ${gender.cyan}`);
	await page.locator('input[id="signup-username"]').fill(username);
	await page.locator('input[id="signup-password"]').fill(password);
	await page.click(`#${gender}Button`);
	await page.waitForTimeout(1000);
	const inner_html = await page.$eval("#signup-usernameInputValidation", (element) => element.innerHTML);
	if (inner_html) {
		console.log(inner_html.red);
		return await makeAccount(page);
	}
	await page.click("#signup-button");
	try {
		await page.waitForSelector("#nav-robux");
	} catch (e) {
		console.log(e);
		if (await page.$eval("#signup-GeneralErrorText", (element) => element.innerHTML)) {
			throw e;
		} else {
			return await makeAccount(page);
		}
	}
	let cookies = await page.context().cookies("https://www.roblox.com");
	let token;
	for (let x of cookies) {
		if (x.name == ".ROBLOSECURITY") {
			token = x.value;
			break;
		}
	}
	++accsMade;
	let retry = true;
	async function validate() {
		try {
			let currentUser = await noblox.setCookie(token);
			let username = currentUser.UserName;
			let file;
			if (fs.existsSync("./accounts.json")) {
				file = JSON.parse(fs.readFileSync("./accounts.json"));
			} else {
				file = [];
			}
			let userId = currentUser.UserID;
			file.push({ Username: username, Cookie: token, UserID: userId });
			fs.writeFileSync("./accounts.json", JSON.stringify(file));
		} catch (e) {
			if (retry) {
				retry = false;
				console.log("invalid cookie or rate limited\nretrying in 60 seconds...");
				await new Promise((r) => setTimeout(r, 60000));
				await validate();
			}
		}
	}
	await validate();
	let gamepassFail = false;
	if (config.gamepassAfterGen == true) {
		try {
			child.execSync(`node ./js/gamepass.js "${username}"`, { stdio: "inherit" });
		} catch (e) {
			console.log(`Couldn't create gamepasses\nAccount will not be added, saved to "nogamepass_generated.txt"`);
			fs.appendFileSync("nogamepass_generated.txt", `${username}:${password}\n${token}\n`);
			gamepassFail = true;
		}
	}
	if (config.autoGroup == true) {
		try {
			child.execSync(`node ./js/group.js "${username}"`, { stdio: "inherit" });
		} catch (e) {
			console.log("Couldn't join group");
		}
	}
	if (gamepassFail) {
		await removeAccount(username);
	} else {
		fs.appendFileSync("generated.txt", `${username}:${password}\n${token}\n`);
		if (config.ramAutoImport == true) {
			async function webimport() {
				let modified = false;
				let inifile = ini.parse(fs.readFileSync(`${location}/RAMSettings.ini`, "utf-8"));
				if (!inifile.Developer.EnableWebServer) {
					inifile.Developer.EnableWebServer = true;
					modified = true;
				}
				if (inifile.WebServer.WebServerPort != config.ramPort) {
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
				await axios.get(`http://localhost:${config.ramPort}/ImportCookie?Cookie=${token}`).catch(function (err) {
					console.log(err);
					console.log("FAILED TO IMPORT USING WEB SERVER!".bold.red);
				});
			}
			await axios.get(`http://localhost:${config.ramPort}/ImportCookie?Cookie=${token}`).catch(async function (e) {
				console.log("FAILED TO IMPORT USING WEB SERVER!\nPLEASE SELECT YOUR ROBLOX ACCOUNT MANAGER FOLDER".bold.red);
				await dialog({ type: "directory" }).then((dir) => (location = dir));
				await webimport();
			});
		}
	}
	return await page.context().clearCookies();
}
(async () => {
	await setup(false);
	while (accsMade != process.argv[2]) {
		await setup(true);
	}
})();
