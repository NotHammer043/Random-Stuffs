const config = require("../config.json");
let deletemessage = typeof config.botDeleteMessages == "boolean" ? config.botDeleteMessages : true; // deletes message after 60 seconds
let showpcstats = config.showPcStats || true;
console.log("bot.js made by skittles#9999");
const fs = require("fs");
let file = JSON.parse(fs.readFileSync("./accounts.json"));

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 6431 });
const clients = new Map();

wss.on("connection", function connection(ws, req) {
	const username = req.url.split("username=")[1];
	console.log(`${username} Connected to wss`);
	clients.set(ws, username);

	ws.on("close", function close() {
		const username = clients.get(ws);
		console.log(`${username} Disconnected from wss`);
		clients.delete(ws);
	});
});

//stats
const os = require("os");

function cpuAverage() {
	var totalIdle = 0,
		totalTick = 0;
	var cpus = os.cpus();
	for (var i = 0, len = cpus.length; i < len; i++) {
		var cpu = cpus[i];
		for (type in cpu.times) {
			totalTick += cpu.times[type];
		}
		totalIdle += cpu.times.idle;
	}
	return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}
const arrAvg = function (arr) {
	if (arr && arr.length >= 1) {
		const sumArr = arr.reduce((a, b) => a + b, 0);
		return sumArr / arr.length;
	}
};

function getCPULoadAVG(avgTime = 2000, delay = 100) {
	return new Promise((resolve, reject) => {
		const n = ~~(avgTime / delay);
		if (n <= 1) {
			reject("Error: interval to small");
		}
		let i = 0;
		let samples = [];
		const avg1 = cpuAverage();
		let interval = setInterval(() => {
			if (i >= n) {
				clearInterval(interval);
				resolve(~~(arrAvg(samples) * 100));
			}
			const avg2 = cpuAverage();
			const totalDiff = avg2.total - avg1.total;
			const idleDiff = avg2.idle - avg1.idle;
			samples[i] = 1 - idleDiff / totalDiff;
			i++;
		}, delay);
	});
}

//robuxamout code
const axios = require("axios").default;
function cs(bot) {
	let retry = true;
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
						total.push(current.data.robux);
						pendingTotal.push(pending.data.pendingRobuxTotal);
					})
				)
				.catch((message) => {
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
		getCPULoadAVG(1000, 100).then((avg) => {
			if (showpcstats === true) {
				bot.user.setPresence({ activity: { name: `${allTotal}R$ | CPU: ${avg}% | RAM: ${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)}GB Used`, type: "WATCHING" }, status: "idle" });
			} else {
				bot.user.setPresence({ activity: { name: `💵 ${allTotal}R$ 💵`, type: "WATCHING" }, status: "idle" });
			}
		});
	})();
}

//bot code
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { Client } = require("discord.js");
const bot = new Client({ disableEveryone: true });
const exec = require("child_process").exec;
const { LaunchGame } = require("robloxlauncherapi");
const commands = ["addToken", "avatar", "block", "gamepass", "gen", "robuxAmount", "transfer", "group"];

function getSSec() {
	return Math.floor(Date.now() / 1000) + 60;
}
function gDelMSG() {
	if (deletemessage === true) {
		return "\nThis message will be deleted <t:" + getSSec() + ":R>";
	} else {
		return "";
	}
}
async function createLoop(boti, ms) {
	while (true) {
		cs(boti);
		await delay(ms);
	}
}

bot.on("ready", async () => {
	console.log(`Online as ${bot.user.tag}`);
	createLoop(bot, 30000);
});
bot.on("message", async (message) => {
	let args = message.content.trim().split(/ +/g);
	if (message.author.bot) return;
	if (config.botOwnerID && message.author.id != config.botOwnerID) return;
	prefix = ".";
	args = message.content.slice(prefix.length).trim().split(/ +/g);
	if (message.content.startsWith(prefix)) {
		if (args[0] == "help" || args[0] == "cmds") {
			await message
				.reply(
					`**Commands:** 

\`\`\`.help or .cmds - sends this
.avatar [username or "all"] [user to copy] - Copies a user's avatar
.block [username or "all"] - Blocks all accounts
.gamepass [username or "all"] - Sets up gamepass
.gen [number of accounts] - Generates new accounts
.robuxAmount - Get balance of all your accounts
.transfer [user to trasnfer to] [shirt id] - Transfer Robux to one account
.group [username or "all"] - Joins a Roblox group for you
.stats or .pcStats - Shows CPU and RAM usage
.launch [username] (placeid) - Launches account into game, placeid defaults to Pls Donate if there is none
.accountStatus or .accounts - shows if accounts are online or offline\`\`\`` + gDelMSG()
				)
				.then((msg) => {
					if (deletemessage === true) {
						setTimeout(() => msg.delete(), 59000);
					}
				});
		} else if (commands.indexOf(args[0]) > -1) {
			let botmsg = await message.reply(`Running \`\`.${args[0]} ${args[1]}\`\`...\nStarted <t:${Math.floor(Date.now() / 1000)}:R>`); // command running message
			let cmd = args[1] && args[1].toLowerCase() == "all" ? `node ./js/all.js ${args[0]} ${args[2]}` : `node ./js/${args[0]}.js ${args[1]} ${args[2]}`;
			exec(cmd, async function (error, stdout) {
				let trimmed = false;
				if (error && error.length > 1990) {
					console.log(error);
					error = error.substring(0, 1989);
					trimmed = true;
				} else if (stdout && stdout.length > 1990) {
					console.log(stdout);
					stdout = stdout.substring(0, 1989);
					trimmed = true;
				}
				await message.reply("```ansi\n" + (stdout || error) + "```" + gDelMSG()).then((msg) => {
					if (deletemessage === true) {
						setTimeout(() => msg.delete(), 59000);
					}
				});
				if (trimmed == true) {
					await message.reply("**MESSAGE TOO LONG, LOGGED TO CONSOLE**");
				}
				botmsg.delete();
			});
		} else if (args[0] == "stats" || args[0] == "pcStats") {
			var cpuavg;
			getCPULoadAVG(1000, 100).then((avg) => {
				cpuavg = avg;
			});
			await delay(1500);
			await message.reply(`\`\`\`CPU: ${cpuavg}%\nRAM: ${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)}GB Used\`\`\`` + gDelMSG()).then((msg) => {
				if (deletemessage === true) {
					setTimeout(() => msg.delete(), 59000);
				}
			});
		} else if (args[0] == "launch") {
			let user = file.filter(function (item) {
				return item.Username == args[1];
			});
			if (user.length == 0) return console.log("user not found");
			user = user[0];
			let LaunchLink = await LaunchGame(user.Cookie, args[2] || "8737602449");
			exec(`start "${LaunchLink}"`, { shell: "powershell.exe" }, async () => {
				await message.reply(`Successfully launched account **\`${user.Username}\`**` + gDelMSG());
			});
		} else if (args[0] == "accounts" || args[0] == "accountStatus") {
			let clientsConnectedToWSS = [...clients.values()];
			let accounts = JSON.parse(fs.readFileSync("./accounts.json"));
			let ret = "```";
			for (let x of accounts) {
				ret = clientsConnectedToWSS.includes(x["Username"]) ? ret + `🟩 ${x["Username"]}\n` : ret + `🟥 ${x["Username"]}\n`;
			}
			await message.reply(ret + "```" + gDelMSG()).then((msg) => {
				if (deletemessage === true) {
					setTimeout(() => msg.delete(), 59000);
				}
			});
		}
		if (deletemessage === true) message.delete();
	}
});
bot.login(config.botToken);
