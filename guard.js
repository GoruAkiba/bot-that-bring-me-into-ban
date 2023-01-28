module.exports = class guarding {
	constructor(_bot, _username, _Movements, _goals) {
		this.bot = _bot;
		this.username = _username;
		this.guardPos = null;
		this.movingToGuardPos = false;
		this.Movements = _Movements;
		this.goals = _goals;


		// Check for new enemies to attack
		this.bot.on('physicTick', async () => {
			if (!this.guardPos) return // Do nothing if bot is not guarding anything

			let entity = null
			// Do not attack mobs if the bot is to far from the guard pos
			if (this.bot.entity.position.distanceTo(this.guardPos) < 5) {
				// Only look for mobs within 16 blocks
				// const filter =  // Mojang classifies armor stands as mobs for some reason?

				entity = this.bot.nearestEntity(e => {
					return (e.type === 'hostile' || e.type === 'mob') && e.position.distanceTo(this.bot.entity.position) < 4 && e.mobType !== 'Armor Stand'
					e.mobType !== 'Armor Stand'
				})
			}

			if (entity != null && !this.movingToGuardPos) {
				// If we have an enemy and we are not moving back to the guarding position: Start attacking
				await this.bot.invent.equipItem("diamond_sword", "hand", true);
				this.bot.pvp.attack(entity)
			} else {
				// If we do not have an enemy or if we are moving back to the guarding position do this:
				// If we are close enough to the guarding position do nothing
				if (this.bot.entity.position.distanceTo(this.guardPos) < 2) return
				// If we are to far stop pvp and move back to the guarding position
				await this.bot.pvp.stop()
				this.moveToGuardPos()
			}
		})
	}

	guardArea(pos) {
		this.guardPos = pos

		// We we are not currently in combat, move to the guard pos
		if (!this.bot.pvp.target) {
			this.moveToGuardPos()
		}
	}

	// Pathfinder to the guard position
	async moveToGuardPos() {
		// Do nothing if we are already moving to the guard position
		if (this.movingToGuardPos) return
		// console.info('Moving to guard pos')
		const mcData = require('minecraft-data')(this.bot.version)
		this.bot.pathfinder.setMovements(new this.Movements(this.bot, mcData))
		try {
			this.movingToGuardPos = true
			// Wait for pathfinder to go to the guarding position
			await this.bot.pathfinder.goto(new this.goals.GoalNear(this.guardPos.x, this.guardPos.y, this.guardPos.z, 4))
			this.movingToGuardPos = false
		} catch (err) {
			// Catch errors when pathfinder is interrupted by the pvp plugin or if pathfinder cannot find a path
			this.movingToGuardPos = false
		}
	}

	// Cancel all pathfinder and combat
	async stopGuarding() {
		this.movingToGuardPos = false
		this.guardPos = null
		await this.bot.pvp.stop()
	}



}