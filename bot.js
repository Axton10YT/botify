const { Client, GatewayIntentBits } = require('discord.js');
const getGeminiResponse = require('./gemini');
const webhookManager = require('./webhookManager');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  const webhookInfo = webhookManager.getWebhookForChannel(msg.channel.id);
  if (!webhookInfo) return;

  const reply = await getGeminiResponse(msg.content, webhookInfo.personality);

  try {
    await webhookInfo.webhook.send({
      content: reply,
      username: webhookInfo.name,
      avatarURL: webhookInfo.avatar,
    });
  } catch (err) {
    console.error('Webhook send failed:', err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
