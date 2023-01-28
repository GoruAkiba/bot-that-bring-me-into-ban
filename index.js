const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer;

// movement and utils requirement
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalBlock } = require('mineflayer-pathfinder').goals
const pvp = require('mineflayer-pvp').plugin
const inventory = require("./inventory.js");
const guarding = require("./guard.js");

// additional requirement
const blocksPlugin = require('mineflayer/lib/plugins/blocks');
const gamePlugin = require('mineflayer/lib/plugins/game')
const healthPlugin = require('mineflayer/lib/plugins/health')


// creating bot
const bot = mineflayer.createBot({
	host: 'play.holocraft.xyz',
	username: process.env.username,
	hideErrors: true
})



// load plugins
bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

bot.guard = new guarding(bot, null, Movements, GoalBlock);
bot.invent = new inventory(bot, null);
bot.on('chat', (username, message) => {


	if (!message.includes("me]")) return console.log("[" + x_n(username, 18) + "]", ":", message)

	// parse direct message	
	message = message.replace("me] ", "");
	console.log("private message from " + username + " :", message);

	// set Guarding props
	bot.guard.username = username;

	// init bot inventory
	bot.invent.username = username;

	// init eval and command props
	var exp = /do ([\/\_\\\,\. a-zA-Z 0-9]*)/;
	const command = message.split(' ');


	// command logic
	switch (true) {
		case message.includes("tptome"):
			var tpmsg = "/tpa " + username;
			bot.chat(tpmsg)
			break

		case message.includes("guardme"):
			const player = bot.players[username]

			if (!player) {
				bot.chat(`/msg ${username} I can't see you.`)
				return
			}

			bot.chat(`/msg ${username} I will guard that location.`)
			// Copy the players Vec3 position and guard it
			bot.guard.guardArea(player.entity.position.clone())
			break

		case message.includes("stopguard"):
			bot.chat(`/msg ${username} I will no longer guard this area.`)
			bot.guard.stopGuarding()
			break

		case exp.exec(message) !== null:
			// console.log("tryna emmiting req")
			bot.chat(exp.exec(message)[1])
			break

		case /^list$/.test(message):
			bot.invent.sayItems()
			break

		case /^toss \d+ \w+$/.test(message):
			// toss amount name
			// ex: toss 64 diamond
			bot.invent.tossItem(command[2], command[1])
			break

		case /^toss \w+$/.test(message):
			// toss name
			// ex: toss diamond
			bot.invent.tossItem(command[1])
			break

		case /^equip [\w-]+ \w+$/.test(message):
			// equip destination name
			// ex: equip hand diamond
			bot.invent.equipItem(command[2], command[1])
			break

		case /^unequip \w+$/.test(message):
			// unequip testination
			// ex: unequip hand
			bot.invent.unequipItem(command[1])
			break

		case /^use$/.test(message):
			bot.invent.useEquippedItem()
			break
	}
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)

bot.once('spawn', async () => {

	await bot.chat("/login " + process.env.pswd)
	await bot.chat("/survival");

	// start webView using prismarine-viewer
	// mineflayerViewer(bot, { port: 3000, firstPerson: false }) // Start the viewing server on port 3000
	// Draw the path followed by the bot
	// const path = [bot.entity.position.clone()]
	// bot.on('move', () => {
	// 	if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
	// 		path.push(bot.entity.position.clone())
	// 		bot.viewer.drawLine('path', path)
	// 	}
	// })

	// bot.on('path_update', (r) => {
	// 	const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
	// 	const path = [bot.entity.position.offset(0, 0.5, 0)]
	// 	for (const node of r.path) {
	// 		path.push({ x: node.x, y: node.y + 0.5, z: node.z })
	// 	}
	// 	bot.viewer.drawLine('path', path, 0xff00ff)
	// })

	// const mcData = require('minecraft-data')(bot.version)
	// const defaultMove = new Movements(bot, mcData)

	// bot.viewer.on('blockClicked', (block, face, button) => {
	// 	if (button !== 2) return

	// 	const p = block.position.offset(0, 1, 0)

	// 	bot.pathfinder.setMovements(defaultMove)
	// 	bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z))
	// })
})

// utils functions
function x_n(x, n) {
	var x_length = x.length;
	var rep = " ";
	return n > x_length ? String(x) + rep.repeat(n - x_length) : x;
}
