
# 🤖 ZENTRYX - CrossPlatform Bot

**ZENTRYX** is an intelligent, cross-platform chatbot for **Discord** and **Telegram** with integrated **AI**, a sleek **web dashboard**, and fun, interactive features. Built with a modular architecture, it’s perfect for developers looking for flexibility and scalability.

**Developer**: [ShinDevv](https://github.com/ShinDevv)
**Repository**: [https://github.com/ShinDevv/Zentryx-Beta](https://github.com/ShinDevv/Zentryx-Beta)
**Platforms**: Discord + Telegram + Facebook Messenger (Coming Soon!)

---

## ✨ Features

- 🔄 **Cross-Platform**: One bot, multiple platforms (Discord, Telegram, Facebook Messenger coming soon)
- 📊 **Web Dashboard**: Monitor performance & commands live
- 🎬 **Entertainment**: Games and more
- ⚡ **Modular System**: Clean code, easy command management

---

## 🚀 Getting Started (All Platforms)

### 1. Get Your Tokens

- **Discord**: [Discord Developer Portal](https://discord.com/developers/applications)  
  Create → Bot → Copy your **Bot Token** and **Client ID**
- **Telegram**: [@BotFather](https://t.me/BotFather) → `/newbot` → Get **Token**
- **Facebook Messenger**: Coming Soon! (Will support Page Access Token & Webhook setup)

### 2. Configure `config.json`

```json
{
  "discord": {
    "token": "YOUR_DISCORD_BOT_TOKEN",
    "clientId": "YOUR_DISCORD_CLIENT_ID"
  },
  "telegram": {
    "token": "YOUR_TELEGRAM_BOT_TOKEN"
  },
  "facebook": {
    "enabled": false,
    "pageAccessToken": "COMING_SOON",
    "verifyToken": "COMING_SOON",
    "status": "coming_soon"
  }
}
````

### 3. Start the Bot

```bash
node index.js
```

---

## 📱 Termux Hosting (Android)

You can host **ZENTRYX** directly on Android using **Termux**. Here’s a step-by-step guide:

### ✅ Requirements

* Updated **Termux** app
* Stable internet connection
* At least **1GB RAM** and **500MB storage**

### 🔧 Setup in Termux

1. **Install dependencies**:

   ```bash
   pkg update && pkg upgrade
   pkg install nodejs git
   ```

2. **Clone the Repository**:

   ```bash
   git clone https://github.com/ShinDevv/Zentryx-Beta.git
   cd Zentryx-Beta
   ```

3. **Install Node Modules**:

   ```bash
   npm install
   ```

   Or install dependencies individually:

   ```bash
   npm install @types/node axios chalk discord.js express figlet fs node-fetch node-telegram-bot-api path
   ```

4. **Configure Tokens**:

   * Open `config.json` with a text editor:

     ```bash
     nano config.json
     ```
   * Paste your tokens and save.

5. **Run the Bot**:

   ```bash
   node index.js
   ```

6. (Optional) **Keep Alive**:
   Use [Termux\:Widget](https://wiki.termux.com/wiki/Termux:Widget) or [Termux\:Boot](https://wiki.termux.com/wiki/Termux:Boot) to auto-run the bot on reboot.

---

## 🧱 Project Structure

```
├── commands/        # Bot commands
├── platforms/       # Discord & Telegram logic
├── utils/           # Utilities and helpers
├── web/             # Web dashboard files
├── config.json      # Bot credentials/config
└── index.js         # Entry point
```

---

## 📦 Dependencies

Required npm packages:

```bash
npm install @types/node axios chalk discord.js express figlet fs node-fetch node-telegram-bot-api path
```

**Core Dependencies:**
- `discord.js` - Discord API wrapper
- `node-telegram-bot-api` - Telegram Bot API
- `express` - Web server framework
- `axios` - HTTP client for API requests
- `chalk` - Terminal styling
- `figlet` - ASCII art text generation
- `node-fetch` - HTTP request library

---

## 🧩 Create Your Own Command

ZENTRYX uses an easy-to-extend base system. Here's how to make a new command:

### 🧠 Command Template

```js
const CommandBase = require('../utils/commandBase');

class YourCommand extends CommandBase {
    constructor() {
        super({
            name: 'commandname',
            description: 'Command description',
            category: 'Category', // e.g., Utility, Games, etc.
            usage: 'commandname [args]',
            aliases: ['alias1', 'alias2'],
            cooldown: 3,
            permissions: [],
            slashCommand: {
                name: 'commandname',
                description: 'Command description',
                options: [
                    {
                        name: 'argument',
                        description: 'Argument description',
                        type: 3, // 3 = string
                        required: true
                    }
                ]
            }
        });
    }

    async execute(context) {
        const arg1 = context.args[0];
        const arg2 = context.args[1];

        if (context.isDiscord) {
            // Discord-specific logic
        } else {
            // Telegram-specific logic
        }

        await context.reply('Your response here');
    }
}

module.exports = new YourCommand();
```

### ✨ Formatting Methods

You can use built-in helpers for rich formatting:

```js
this.bold('text', context)         // **text** (Discord) or <b>text</b> (Telegram)
this.italic('text', context)       // *text* or <i>text</i>
this.code('text', context)         // `text` or <code>text</code>
this.createEmbed(title, desc, fields, context)  // Discord embed / Telegram formatted text
this.createList(items, context)    // List formatting
```

---

## 🌐 Hosting Options

### ✅ Replit (Recommended)

* One-click deploy
* Auto-dependencies & monitoring
* Free or 24/7 with Reserved VM

1. Clone/fork on Replit
2. Add secrets (tokens)
3. Press **Run** and go!

### 🛠️ Other Platforms

* **Render**: GitHub-connected hosting
* **Railway**: \$5/month for always-on
* **Docker**: Use the provided Dockerfile
* **Termux**: See guide above ⬆️

---

## 🔧 Environment Variables (for production)

Use `.env` or host-specific environment variables:

```bash
DISCORD_TOKEN=your_discord_token
DISCORD_CLIENT_ID=your_client_id
TELEGRAM_TOKEN=your_telegram_token
PORT=5000
```

---

## 📊 Dashboard

Access your bot’s dashboard at:

```
http://localhost:5000
```

View:

* Bot uptime
* Command usage
* Platform status
* Modern, responsive UI

---

## 🛡️ Security

* Never commit your tokens
* Use `.gitignore` to prevent leaking secrets
* Use environment variables or hosting secrets

---

## 🤝 Contribute

1. Fork the repo
2. Create a new branch
3. Add your command in `commands/`
4. Test it (Discord & Telegram)
5. Submit a pull request

---

## 📄 License

MIT License – Free to use and modify.

---

### 📬 Need Help?

Use the `/info` command in the bot, or visit your web dashboard for insights and logs.

### 🔗 Contact: 
[Ryan Alexis](https://www.facebook.com/rai.senpaix) • [@shxnlovesu](t.me/@shxnlovesu)

