
const Logger = require('./logger');

class AdminManager {
    constructor(config) {
        this.config = config;
        this.admins = config.admins || { discord: [], telegram: [] };
    }

    isAdmin(platform, userId) {
        if (!this.admins[platform]) return false;
        return this.admins[platform].includes(String(userId));
    }

    async requireAdmin(context) {
        const isUserAdmin = this.isAdmin(context.platform, context.user.id);
        
        if (!isUserAdmin) {
            await context.reply('❌ **Access Denied**\nThis command requires administrator privileges.');
            return false;
        }
        
        return true;
    }

    addAdmin(platform, userId) {
        if (!this.admins[platform]) {
            this.admins[platform] = [];
        }
        
        if (!this.admins[platform].includes(String(userId))) {
            this.admins[platform].push(String(userId));
            return true;
        }
        
        return false;
    }

    removeAdmin(platform, userId) {
        if (!this.admins[platform]) return false;
        
        const index = this.admins[platform].indexOf(String(userId));
        if (index > -1) {
            this.admins[platform].splice(index, 1);
            return true;
        }
        
        return false;
    }

    getAdmins(platform) {
        return this.admins[platform] || [];
    }

    getAllAdmins() {
        return this.admins;
    }
}

module.exports = AdminManager;
