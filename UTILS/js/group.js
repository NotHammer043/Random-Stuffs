const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);
const fs = require("fs");
const config = require("../config.json");
let file = JSON.parse(fs.readFileSync("./accounts.json"));
let user = file.filter(function (item) {
	return item.Username == process.argv[2];
});
if (user.length == 0) return console.log("user not found");
const nopechaPath = require("path").join(__dirname, "../extra/nopecha");
const cookiePath = require("path").join(__dirname, "../extra/extCookies");
(async () => {
	let cookies = [
		{
			name: ".ROBLOSECURITY",
			value: user[0].Cookie,
			domain: ".roblox.com",
			path: "/",
		},
	];
	const browser = await chromium.launchPersistentContext("", {
		headless: false,
		viewport: { width: 545, height: 545 },
		args: [`--disable-extensions-except=${nopechaPath},${cookiePath}`, `--load-extensions=.${nopechaPath},${cookiePath}`],
	});
	const page = await browser.newPage();
	await page.context().addCookies(cookies);
	await page.goto(`https://www.roblox.com/groups/${config.groupId}/about`, { waitUntil: "networkidle" });
	await page.waitForTimeout(2500);
	let joined = await page.isVisible("#group-container > div > div > div.group-details.col-xs-12.ng-scope.col-sm-9 > div > div.section-content > div.group-header > div.group-caption.ng-scope > div.group-info > ul > li.group-rank.text-overflow.ng-scope");
	if (joined == true) return await browser.close();
	await page.waitForSelector("#group-join-button", { visible: true });
	await page.click("#group-join-button");
	await page.waitForSelector("#group-container > div > div > system-feedback > div > div > div > span", { visible: true });
	console.log(await page.$eval("#group-container > div > div > system-feedback > div > div > div > span", (element) => element.innerHTML));
	await browser.close();
})();
