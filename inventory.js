module.exports = class inventory {
	constructor(_bot, _username) {
		this.bot = _bot
		this.username = _username
	}

	sayItems(items = null) {
		if (!items) {
			items = this.bot.inventory.items()
			if (this.bot.registry.isNewerOrEqualTo('1.9') && this.bot.inventory.slots[45]) items.push(this.bot.inventory.slots[45])
		}
		items = items.slice(0, 9);
		const output = items.map(this.itemToString).join(', ')
		if (output) {
			this.bot.chat(`/msg ${this.username} ${output}`)
		} else {
			this.bot.chat(`/msg ${this.username} empty`)
		}
	}

	async tossItem(name, amount) {
		amount = parseInt(amount, 10)
		const item = this.itemByName(name)
		if (!item) {
			this.bot.chat(`/msg ${this.username} I have no ${name}`)
		} else {
			try {
				if (amount) {
					await this.bot.toss(item.type, null, amount)
					this.bot.chat(`/msg ${this.username} tossed ${amount} x ${name}`)
				} else {
					await this.bot.tossStack(item)
					this.bot.chat(`/msg ${this.username} tossed ${name}`)
				}
			} catch (err) {
				this.bot.chat(`/msg ${this.username} unable to toss: ${err.message}`)
			}
		}
	}

	async equipItem(name, destination, _silent = false) {
		const item = this.itemByName(name)
		if (item) {
			try {
				await this.bot.equip(item, destination)
				if (!_silent) this.bot.chat(`/msg ${this.username} equipped ${name}`)
			} catch (err) {
				this.bot.chat(`/msg ${this.username} cannot equip ${name}`) //: ${err.message}
			}
		} else {
			if (!_silent) this.bot.chat(`/msg ${this.username} I have no ${name}`)
		}
	}

	async unequipItem(destination) {
		try {
			await this.bot.unequip(destination)
			this.bot.chat(`/msg ${this.username} unequipped`)
		} catch (err) {
			this.bot.chat(`/msg ${this.username} cannot unequip: ${err.message}`)
		}
	}

	useEquippedItem() {
		this.bot.chat(`/msg ${this.username} activating item`)
		this.bot.activateItem()
	}

	async craftItem(name, amount) {
		amount = parseInt(amount, 10)
		const item = this.bot.registry.itemsByName[name]
		const craftingTableID = this.bot.registry.blocksByName.crafting_table.id

		const craftingTable = this.bot.findBlock({
			matching: craftingTableID
		})

		if (item) {
			const recipe = this.bot.recipesFor(item.id, null, 1, craftingTable)[0]
			if (recipe) {
				this.bot.chat(`/msg ${this.username} I can make ${name}`)
				try {
					await this.bot.craft(recipe, amount, craftingTable)
					this.bot.chat(`/msg ${this.username} did the recipe for ${name} ${amount} times`)
				} catch (err) {
					this.bot.chat(`/msg ${this.username} error making ${name}`)
				}
			} else {
				this.bot.chat(`/msg ${this.username} I cannot make ${name}`)
			}
		} else {
			this.bot.chat(`/msg ${this.username} unknown item: ${name}`)
		}
	}

	itemToString(item) {
		if (item) {
			return `${item.name} x ${item.count}`
		} else {
			return 'null'
		}
	}

	itemByName(name) {
		const items = this.bot.inventory.items()
		if (this.bot.registry.isNewerOrEqualTo('1.9') && this.bot.inventory.slots[45]) items.push(this.bot.inventory.slots[45])
		return items.filter(item => item.name === name)[0]
	}
}