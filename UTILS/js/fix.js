const child = require("child_process");
const fs = require("fs");
const config = require("../config.json");
const package = require("../package.json");
const dependencies = Object.keys(package.dependencies);
const defaultSettings = {
	hidePassword: false,
	numberLength: 2,
	defaultGender: "Female",
	gamepasses: ["5", "10", "25", "50", "100", "250", "1000", "5000", "10000", "100000", "1000000"],
	gamepassNames: ["Donation", "Donation", "Donation", "Donation", "Donation", "Donation", "Donation", "Donation", "Donation", "Donation", "Donation"],
	gamepassAfterGen: true,
	ramAutoImport: true,
	ramPort: 7963,
	transferShirtName: "placeholder",
	botToken: "",
	botOwnerID: "",
	botDeleteMessages: false,
	showPcStats: true,
	autoGroup: false,
	groupId: "12121240",
	mainAccount: "",
};
const settingKeys = Object.keys(defaultSettings);

//Check for missing modules
for (let i = 0; i < dependencies.length; ++i) {
	try {
		console.log(`checking ${dependencies[i]}`);
		child.execSync(`npm ls ${dependencies[i]}`, { stdio: "ignore" });
	} catch (e) {
		i = -1;
		console.log(`installing missing modules\ndo not panic if it looks stuck\nthis can take 5+ minutes\n`);
		child.execSync(`npm i`, { stdio: "inherit" });
	}
}

//Check for missing settings
for (let x of settingKeys) if (config[x] === undefined) config[x] = defaultSettings[x];
fs.writeFileSync("./config.json", JSON.stringify(config));