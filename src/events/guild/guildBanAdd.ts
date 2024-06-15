import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, GuildBan } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Guild ban add event
 * @event Egglord#GuildBanAdd
 * @extends {Event}
	*/
export default class GuildBanAdd extends Event {
	constructor() {
		super({
			name: Events.GuildBanAdd,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildBan} guildBan The ban that occurred
	 * @readonly
	*/
	async run(client: EgglordClient, guildBan: GuildBan) {
		const { guild, user } = guildBan;

		// Make sure all relevant data is fetched
		try {
			if (guildBan.partial) await guildBan.fetch();
			if (guildBan.user.partial) await guildBan.user.fetch();
		} catch (err: any) {
			if (['Missing Permissions', 'Missing Access'].includes(err.message)) return;
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}

		// For debugging
		client.logger.debug(`Member: ${user.displayName} has been banned in guild: ${guild.id}.`);

		// Check if event guildBanAdd is for logging
		const moderationSettings = guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, guild)
			.setDescription(client.languageManager.translate(guild, 'misc:USER', { USER: `${user}` }))
			.setColor(Colors.Red)
			.setAuthor({ name: client.languageManager.translate(guild, 'events/channel:DELETE_TITLE'), iconURL: user.displayAvatarURL() })
			.setThumbnail(user.displayAvatarURL())
			.addFields({ name: client.languageManager.translate(guild, 'misc:REASON'), value: guildBan.reason ?? client.languageManager.translate(guild, 'misc:NO_REASON') })
			.setFooter({ text: client.languageManager.translate(guild, 'misc:ID', { ID: user.id }) });

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}