const child = require("child_process");
const fs = require("fs");
const file = JSON.parse(fs.readFileSync("./accounts.json"));
const config = require("../config.json");
let arg = "";
if (process.argv[3]) {
	arg = process.argv[3];
}
for (let x of file) {
	if (x.Username == config.mainAccount) continue;
	console.clear();
	console.log(x.Username);
	try {
		child.execSync(`node ./js/${process.argv[2]}.js ${x.Username} ${arg}`, { stdio: "inherit" });
	} catch (e) {}
}
