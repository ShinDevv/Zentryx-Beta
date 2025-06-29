
class RateLimiter {
    constructor() {
        this.users = new Map();
        this.globalLimit = 30; // commands per minute
        this.userLimit = 10; // commands per minute per user
    }

    checkLimit(userId, isGlobal = false) {
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        
        if (isGlobal) {
            const globalKey = 'global';
            const globalData = this.users.get(globalKey) || { count: 0, resetTime: now + windowMs };
            
            if (now > globalData.resetTime) {
                globalData.count = 0;
                globalData.resetTime = now + windowMs;
            }
            
            if (globalData.count >= this.globalLimit) {
                return false;
            }
            
            globalData.count++;
            this.users.set(globalKey, globalData);
        }
        
        const userData = this.users.get(userId) || { count: 0, resetTime: now + windowMs };
        
        if (now > userData.resetTime) {
            userData.count = 0;
            userData.resetTime = now + windowMs;
        }
        
        if (userData.count >= this.userLimit) {
            return false;
        }
        
        userData.count++;
        this.users.set(userId, userData);
        
        return true;
    }

    getRemainingTime(userId) {
        const userData = this.users.get(userId);
        if (!userData) return 0;
        
        const remaining = userData.resetTime - Date.now();
        return Math.max(0, Math.ceil(remaining / 1000));
    }
}

module.exports = new RateLimiter();
