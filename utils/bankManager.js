const fs = require('fs');
const path = require('path');

class BankManager {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/bank.json');
        this.users = new Map();
        this.loadUserData();
    }

    loadUserData() {
        try {
            if (fs.existsSync(this.dataPath)) {
                const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
                this.users = new Map(Object.entries(data));
            } else {
                this.saveUserData();
            }
        } catch (error) {
            console.error('Error loading bank data:', error);
            this.users = new Map();
        }
    }

    saveUserData() {
        try {
            const bankData = Object.fromEntries(this.users);

            const dataDir = path.dirname(this.dataPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(this.dataPath, JSON.stringify(bankData, null, 2));
        } catch (error) {
            console.error('Error saving bank data:', error);
        }
    }

    getUserData(userId) {
        userId = String(userId);
        if (!this.users.has(userId)) {
            this.users.set(userId, {
                "balance": 100,
                "totalEarned": 100,
                "gamesPlayed": 0,
                "gamesWon": 0,
                "lastDaily": null,
                "streak": 0
            });
            this.saveUserData();
        }
        return this.users.get(userId);
    }

    addCoins(userId, amount, reason = 'Unknown') {
        const userData = this.getUserData(userId);
        userData.balance += amount;
        userData.totalEarned += amount;
        this.saveUserData();
        return userData.balance;
    }

    removeCoins(userId, amount) {
        const userData = this.getUserData(userId);
        if (userData.balance < amount) {
            return false;
        }
        userData.balance -= amount;
        this.saveUserData();
        return true;
    }

    getBalance(userId) {
        return this.getUserData(userId).balance;
    }

    recordGameResult(userId, won, coinsEarned = 0) {
        const userData = this.getUserData(userId);
        userData.gamesPlayed++;
        if (won) {
            userData.gamesWon++;
            if (coinsEarned > 0) {
                userData.balance += coinsEarned;
                userData.totalEarned += coinsEarned;
            }
        }
        this.saveUserData();
    }

    canClaimDaily(userId) {
        const userData = this.getUserData(userId);
        if (!userData.lastDaily) return true;

        const lastDaily = new Date(userData.lastDaily);
        const now = new Date();
        const timeDiff = now - lastDaily;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        return hoursDiff >= 24;
    }

    claimDaily(userId) {
        if (!this.canClaimDaily(userId)) {
            return null;
        }

        const userData = this.getUserData(userId);
        const baseAmount = 50;
        const streakBonus = Math.min(userData.streak * 5, 100);
        const totalAmount = baseAmount + streakBonus;

        userData.balance += totalAmount;
        userData.totalEarned += totalAmount;
        userData.lastDaily = new Date().toISOString();
        userData.streak++;

        this.saveUserData();
        return { amount: totalAmount, streak: userData.streak };
    }

    getLeaderboard(limit = 10) {
        const sorted = Array.from(this.users.entries())
            .sort(([,a], [,b]) => b.balance - a.balance)
            .slice(0, limit);

        return sorted.map(([userId, data], index) => ({
            rank: index + 1,
            userId,
            balance: data.balance,
            totalEarned: data.totalEarned,
            gamesWon: data.gamesWon,
            gamesPlayed: data.gamesPlayed
        }));
    }
}

module.exports = BankManager;