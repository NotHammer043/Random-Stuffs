const noblox = require("noblox.js");
const Bottleneck = require("bottleneck");
const fs = require("fs");
const file = JSON.parse(fs.readFileSync("./accounts.json"));
let user = file.filter(function (acc) {
	return acc.Username == process.argv[2];
});
user = user[0];
const limiter = new Bottleneck({
	minTime: 2000,
});
(async () => {
	let currentUser = await noblox.setCookie(user.Cookie);
	let copy = process.argv[3];
	if (isNaN(copy)) {
		copy = await limiter.schedule(() => noblox.getIdFromUsername(copy));
	}
	let outfit = await limiter.schedule(() => noblox.getAvatar(copy));

	//Dumb noblox things throw errors for no reason...
	try {
		await limiter.schedule(() => noblox.setAvatarScales(outfit.scales.height, outfit.scales.width, outfit.scales.head, outfit.scales.depth, outfit.scales.proportion, outfit.scales.bodyType));
		console.log("copied scaling");
	} catch (e) {
		console.log("copied scaling");
	}
	try {
		await limiter.schedule(() => noblox.setPlayerAvatarType(outfit.playerAvatarType));
		console.log("copied type");
	} catch (e) {
		console.log("copied type");
	}
	try {
		await limiter.schedule(() => noblox.setAvatarBodyColors(outfit.bodyColors.headColorId, outfit.bodyColors.torsoColorId, outfit.bodyColors.rightArmColorId, outfit.bodyColors.leftArmColorId, outfit.bodyColors.rightLegColorId, outfit.bodyColors.leftLegColorId));
		console.log("copied colors");
	} catch (e) {
		console.log("copied colors");
	}
	await limiter.schedule(() => noblox.setWearingAssets([]));
	for (let x of outfit.assets) {
		try {
			if (!(await limiter.schedule(() => noblox.getOwnership(user.UserID, x.id, "Asset")))) {
				await limiter.schedule(() => noblox.buy(x.id));
			}
			await limiter.schedule(() => noblox.wearAssetId(x.id));
			console.log(`wore ${x.name}`);
		} catch (e) {
			console.log(`failed to wear`);
		}
	}
})();
