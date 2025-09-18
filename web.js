const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client } = require('discord.js');
const bodyParser = require('body-parser');
const webhookManager = require('./webhookManager');
require('dotenv').config();

const app = express();
const botClient = new Client({ intents: [] });
botClient.login(process.env.DISCORD_BOT_TOKEN);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_REDIRECT_URI,
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  req.user ? res.redirect('/servers') : res.render('index');
});

app.get('/login', passport.authenticate('discord'));
app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/servers'));
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

app.get('/servers', ensureAuth, (req, res) => {
  const guilds = req.user.guilds.filter(g => (g.permissions & 0x20) === 0x20); // MANAGE_GUILD
  res.render('servers', { user: req.user, guilds });
});

app.get('/servers/:id', ensureAuth, async (req, res) => {
  const guild = await botClient.guilds.fetch(req.params.id).catch(() => null);
  if (!guild) return res.send("Bot not in server.");
  const channels = (await guild.channels.fetch()).filter(c => c.isTextBased());
  res.render('channels', { guild, channels });
});

app.post('/create-webhook', ensureAuth, async (req, res) => {
  const { guildId, channelId, name, avatar, personality } = req.body;
  const guild = await botClient.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(channelId);
  const webhook = await channel.createWebhook({ name, avatar });
  webhookManager.setWebhook(channel.id, webhook, name, avatar, personality);
  res.send("✅ Webhook created and ready to reply using Gemini.");
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

app.listen(3000, () => console.log("Web dashboard running on http://localhost:3000"));
