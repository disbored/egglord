// Dependencies
const Event = require('../../structures/Event');

/**
 * SelectMenuSubmit event
 * @event Egglord#SelectMenuSubmit
 * @extends {Event}
*/
class SelectMenuSubmit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {ModalSubmitInteraction} interaction The member that was warned
	 * @readonly
	*/
	async run(client, interaction) {
		const guild = client.guilds.cache.get(interaction.guildId),
			channel = guild.channels.cache.get(interaction.channelId);

		console.log(interaction);
		switch (interaction.customId) {
			case 'plugin_change': {
				// Fetch slash command data
				const data = [];
				for (const plugin of interaction.values) {
					const g = await client.loadInteractionGroup(plugin, guild);
					if (Array.isArray(g)) data.push(...g);
				}

				// Add interactions
				if (guild.id == client.config.SupportServer.GuildID) {
					const g = await client.loadInteractionGroup('Host', guild);
					if (Array.isArray(g)) data.push(...g);
				}

				try {
					// Update interactions + database with new plugins
					await guild.updateGuild({ plugins: interaction.values });
					await guild.commands.set(data);
					interaction.reply({ embeds: [channel.success('plugins/set-plugin:ADDED', { PLUGINS: interaction.values }, true)] });
				} catch (err: any) {
					console.log(err: any);
					interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
				}
				break;
			}
			default:

		}
	}
}

module.exports = SelectMenuSubmit;
