//When a reaction has been added to a message in a server (This includes verification role)
const Discord = require('discord.js')
module.exports = async (bot, reaction, user) => {
  //make sure it dosen't happen in a DM
  if (reaction.message.channel.type == 'dm') return
  //Make sure it's not a BOT
  if (user.bot) return
  //Get server settings
  let settings;
  try {
      settings = await bot.getGuild(reaction.message.channel.guild)
  } catch (e) {
      console.log(e)
  }
  //Check if anti-raid plugin is active
  if (settings.AntiRaidPlugin == true && settings.AntiRaidCompletion == 1) {
    //check if the reaction was done in the #verify channel
    if (reaction.message.channel.id == settings.AntiRaidChannelID) {
      //Make sure its the right emoji as well
      if (reaction._emoji.id == 748984689779540110) {
        //get user
        var member = reaction.message.channel.guild.member(user)
        for (var i = 0; i < settings.welcomeRoleGive.length; i++) {
          if (member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i])) {
            member.roles.add(member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i]))
          }
        }
      }
    }
  }
  //record all reactions
  var embed = new Discord.MessageEmbed()
    .setDescription(`**${user.toString()} reacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
    .setColor(3066993)
    .setFooter(`User: ${user.id} | Message: ${reaction.message.id} `)
    .setAuthor(user.tag, user.displayAvatarURL())
    .setTimestamp()
  //send message
  var channel = reaction.message.channel.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
  if (channel) {
    channel.send(embed)
  }
}
