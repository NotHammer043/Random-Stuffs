// const Termit = require("termit");
// const prompt = require("prompt-sync")();
// const term = new Termit();
// const settingsFile = require("path").join(__dirname, "../config.json");

// /*
// hidePassword = Show or hide passwords while generating new accounts
// numberLength = How many numbers to have at the end of your generated account's username
// defaultGender = What gender to use by default if none is selected when generating accounts
// gamepasses = Gamepass prices
// gamepassNames = Names of the gamepasses {EX: First name will correlate to first gamepass price}
// gamepassAfterGen = Whether or not to make gamepasses after generating an account
// ramAutoImport = Whether or not to import generated account automatically to Account Manager [WEB SERVER MUST BE ENABLED]
// ramPort = What port your Account Manager web server is running on
// transferShirtName = What to name your shirt while transfering Robux
// */
// console.log(`
// hidePassword = Show or hide passwords while generating new accounts
// numberLength = How many numbers to have at the end of your generated account's username
// defaultGender = What gender to use by default if none is selected when generating accounts
// gamepasses = Gamepass prices
// gamepassNames = Names of the gamepasses {EX: First name will correlate to first gamepass price}
// gamepassAfterGen = Whether or not to make gamepasses after generating an account
// ramAutoImport = Whether or not to import generated account automatically to Account Manager [WEB SERVER MUST BE ENABLED]
// ramPort = What port your Account Manager web server is running on
// transferShirtName = What to name your shirt while transfering Robux
// botToken = Your Discord bot token
// botOwnerID = Your Discord User ID
// `);
// prompt("CTRL+X to save\npress enter to edit config.json");
// term.init(settingsFile);

const term = require("terminal-kit").terminal;
const config = require("../config.json");
const fs = require("fs");

async function configScreen() {
	term.clear();
	term.brightGreen("SETTINGS\n");

	let options = [];

	for (let x in config) {
		options.push(`${x} - ${config[x]}`);
	}
	options.push("Exit");

	term.singleColumnMenu(options, async function (error, response) {
		if (response.selectedText == "Exit") process.exit();
		if (typeof config[response.selectedText.split(" ")[0]] == "boolean") config[response.selectedText.split(" ")[0]] = !config[response.selectedText.split(" ")[0]]
		else {
			term.clear();
            term.bold(`${response.selectedText.split(" ")[0]} - `);
            let words = await term.inputField({ default: config[response.selectedText.split(" ")[0]].toString() }).promise;
			config[response.selectedText.split(" ")[0]] = words.includes(",") ? words.split(",") : words
		}
		fs.writeFileSync("./config.json", JSON.stringify(config));
		configScreen();
	});
}
configScreen();
