const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const colors = require("colors");
const fg = require("fast-glob");
const FormData = require("form-data");
const config = require("../config.json");
let file = JSON.parse(fs.readFileSync("./accounts.json"));
const gamepassPrices = config.gamepasses || [5, 10, 25, 50, 100, 250, 1000, 5000, 10000, 100000, 1000000];
const gamepassNames = config.gamepassNames;
if (gamepassPrices.length > 100) return console.log("ERROR: 100 Gamepass limit");
let user;
let name = process.argv[2];
user = file.filter(function (item) {
	return item.Username == name;
})[0];
async function getToken(COOKIE) {
	let xCsrfToken = "";
	const rbxRequest = async (verb, url, body) => {
		const response = await fetch(url, {
			headers: {
				Cookie: `.ROBLOSECURITY=${COOKIE};`,
				"x-csrf-token": xCsrfToken,
				"Content-Length": body?.length.toString() || "0",
			},
			method: "POST",
			body: body || "",
		});
		if (response.status == 403) {
			if (response.headers.has("x-csrf-token")) {
				xCsrfToken = response.headers.get("x-csrf-token");
				return rbxRequest(verb, url, body);
			}
		}
		return response;
	};
	const response = await rbxRequest("POST", "https://auth.roblox.com");
	return xCsrfToken;
}
(async () => {
	let xcsrf = await getToken(user.Cookie);
	let places = await fetch(`https://games.roblox.com/v2/users/${user.UserID}/games?sortOrder=Asc&limit=50`, {
		method: "GET",
	});

	let gameId = (await places.json()).data[0].id; // Used for creating gamepasses and fetching

	async function changePrice(id, price) {
		await fetch("https://www.roblox.com/game-pass/update", {
			method: "POST",
			body: JSON.stringify({
				isForSale: true,
				price: price,
				id: id,
			}),
			headers: {
				Cookie: `.ROBLOSECURITY=${user.Cookie}`,
				"x-csrf-token": xcsrf,
				"Content-Type": "application/json",
			},
		});
	}

	async function editGamePass(id, name, price, image) {
		const formData = new FormData();
		formData.append("id", id);
		formData.append("Name", name || "Donation");
		formData.append("Description", "");
		formData.append("File", fs.createReadStream(image));
		const options = {
			method: "POST",
			headers: {
				Cookie: `.ROBLOSECURITY=${user.Cookie}`,
				"x-csrf-token": xcsrf,
			},
		};
		options.body = formData;

		let response = await fetch("https://www.roblox.com/game-pass/update", options);

		let jsoned = await response.json();
		if (!jsoned.isValid) throw jsoned.error;

		await changePrice(id, price);
	}

	async function makeGamePass(name, price, image) {
		const formData = new FormData();
		formData.append("Name", name || "Donation");
		formData.append("Description", "");
		formData.append("UniverseId", gameId);
		formData.append("File", fs.createReadStream(image));
		const options = {
			method: "POST",
			headers: {
				Cookie: `.ROBLOSECURITY=${user.Cookie}`,
				"x-csrf-token": xcsrf,
			},
		};
		options.body = formData;

		let response = await fetch("https://apis.roblox.com/game-passes/v1/game-passes", options);
		await changePrice((await response.json()).gamePassId, price);
	}
	let response = await fetch(`https://games.roblox.com/v1/games/${gameId}/game-passes?limit=100&sortOrder=Asc`, {
		method: "GET",
	});
	let gamepasses = await response.json();
	while (gamepasses.data.length < gamepassPrices.length) {
		let index = gamepasses.data.length;
		await makeGamePass(gamepassNames[index], gamepassPrices[index], Object.values(fg.sync(`./gamepasses/${gamepassPrices[index]}.*`))[0] || "./gamepasses/default.png");
		console.log(`Created Gamepass: ${gamepassNames[index]}`.green);
		gamepassPrices.splice(index, 1);
		gamepassNames.splice(index, 1);
	}
	for (let i = 0; i < gamepassPrices.length; ++i) {
		try {
			await editGamePass(gamepasses.data[i].id, gamepassNames[i], gamepassPrices[i], Object.values(fg.sync(`./gamepasses/${gamepassPrices[i]}.*`))[0] || "./gamepasses/default.png");
		console.log(`Modified Gamepass: ${gamepassNames[i]}`.green);
		} catch (e) {
			console.log(e.red + "\nRetrying in 60 seconds".yellow);
			await new Promise((r) => setTimeout(r, 70000));
			--i;
		}
	}
})();
