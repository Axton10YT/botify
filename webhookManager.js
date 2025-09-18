const { WebhookClient } = require('discord.js');

const webhooks = {}; // channelId → { webhook, name, avatar, personality }

function setWebhook(channelId, webhook, name, avatar, personality) {
  webhooks[channelId] = {
    webhook: new WebhookClient({ id: webhook.id, token: webhook.token }),
    name,
    avatar,
    personality
  };
}

function getWebhookForChannel(channelId) {
  return webhooks[channelId];
}

module.exports = { setWebhook, getWebhookForChannel };
