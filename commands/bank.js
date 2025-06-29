
const CommandBase = require('../utils/commandBase');

class BankCommand extends CommandBase {
    constructor() {
        super({
            name: 'bank',
            description: 'Deposit or withdraw coins from your bank account',
            category: 'Economy',
            usage: 'bank <deposit/withdraw> <amount>',
            aliases: ['vault'],
            slashCommand: {
                name: 'bank',
                description: 'Manage your bank account',
                options: [
                    {
                        name: 'action',
                        description: 'Choose to deposit or withdraw',
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: 'deposit',
                                value: 'deposit'
                            },
                            {
                                name: 'withdraw',
                                value: 'withdraw'
                            },
                            {
                                name: 'info',
                                value: 'info'
                            }
                        ]
                    },
                    {
                        name: 'amount',
                        description: 'Amount to deposit or withdraw',
                        type: 4,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const action = context.args[0]?.toLowerCase();
        const amount = parseInt(context.args[1]);

        if (!action || !['deposit', 'withdraw', 'info'].includes(action)) {
            await context.reply('❌ **Invalid action!** Use: `bank <deposit/withdraw/info> [amount]`');
            return;
        }

        const userData = global.bot.bankManager.getUserData(context.user.id);
        
        if (action === 'info') {
            await this.showBankInfo(context, userData);
            return;
        }

        if (!amount || amount <= 0) {
            await context.reply('❌ **Invalid amount!** Please enter a positive number.');
            return;
        }

        if (action === 'deposit') {
            await this.handleDeposit(context, userData, amount);
        } else if (action === 'withdraw') {
            await this.handleWithdraw(context, userData, amount);
        }
    }

    async handleDeposit(context, userData, amount) {
        if (userData.balance < amount) {
            await context.reply(`❌ **Insufficient funds!** You only have ${userData.balance} coins in your wallet.`);
            return;
        }

        // Remove from wallet balance and add to bank
        global.bot.bankManager.removeCoins(context.user.id, amount);
        
        if (!userData.bankBalance) userData.bankBalance = 0;
        userData.bankBalance += amount;
        global.bot.bankManager.saveUserData();

        const newWalletBalance = global.bot.bankManager.getBalance(context.user.id);

        if (context.isDiscord) {
            const embed = {
                color: 0x00ff00,
                title: '🏦 Bank Deposit Successful',
                fields: [
                    {
                        name: '💰 Amount Deposited',
                        value: `${amount} coins`,
                        inline: true
                    },
                    {
                        name: '🏛️ Bank Balance',
                        value: `${userData.bankBalance} coins`,
                        inline: true
                    },
                    {
                        name: '👛 Wallet Balance',
                        value: `${newWalletBalance} coins`,
                        inline: true
                    }
                ],
                footer: {
                    text: 'Your coins are safely stored in the bank!'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                '🏦 <b>Bank Deposit Successful</b>',
                '',
                `💰 <b>Amount Deposited:</b> ${amount} coins`,
                `🏛️ <b>Bank Balance:</b> ${userData.bankBalance} coins`,
                `👛 <b>Wallet Balance:</b> ${newWalletBalance} coins`,
                '',
                '<i>Your coins are safely stored in the bank!</i>'
            ].join('\n');

            await context.reply(message);
        }
    }

    async handleWithdraw(context, userData, amount) {
        if (!userData.bankBalance) userData.bankBalance = 0;
        
        if (userData.bankBalance < amount) {
            await context.reply(`❌ **Insufficient bank funds!** You only have ${userData.bankBalance} coins in your bank account.`);
            return;
        }

        // Remove from bank and add to wallet balance
        userData.bankBalance -= amount;
        global.bot.bankManager.addCoins(context.user.id, amount, 'Bank withdrawal');

        const newWalletBalance = global.bot.bankManager.getBalance(context.user.id);

        if (context.isDiscord) {
            const embed = {
                color: 0xff9500,
                title: '🏦 Bank Withdrawal Successful',
                fields: [
                    {
                        name: '💰 Amount Withdrawn',
                        value: `${amount} coins`,
                        inline: true
                    },
                    {
                        name: '🏛️ Bank Balance',
                        value: `${userData.bankBalance} coins`,
                        inline: true
                    },
                    {
                        name: '👛 Wallet Balance',
                        value: `${newWalletBalance} coins`,
                        inline: true
                    }
                ],
                footer: {
                    text: 'Coins transferred to your wallet!'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                '🏦 <b>Bank Withdrawal Successful</b>',
                '',
                `💰 <b>Amount Withdrawn:</b> ${amount} coins`,
                `🏛️ <b>Bank Balance:</b> ${userData.bankBalance} coins`,
                `👛 <b>Wallet Balance:</b> ${newWalletBalance} coins`,
                '',
                '<i>Coins transferred to your wallet!</i>'
            ].join('\n');

            await context.reply(message);
        }
    }

    async showBankInfo(context, userData) {
        if (!userData.bankBalance) userData.bankBalance = 0;
        
        const totalWealth = userData.balance + userData.bankBalance;
        const bankPercentage = totalWealth > 0 ? ((userData.bankBalance / totalWealth) * 100).toFixed(1) : '0.0';

        if (context.isDiscord) {
            const embed = {
                color: 0x667eea,
                title: '🏦 Bank Account Information',
                fields: [
                    {
                        name: '👛 Wallet Balance',
                        value: `${userData.balance} coins`,
                        inline: true
                    },
                    {
                        name: '🏛️ Bank Balance',
                        value: `${userData.bankBalance} coins`,
                        inline: true
                    },
                    {
                        name: '💎 Total Wealth',
                        value: `${totalWealth} coins`,
                        inline: true
                    },
                    {
                        name: '📊 Bank Percentage',
                        value: `${bankPercentage}% of total wealth`,
                        inline: false
                    }
                ],
                footer: {
                    text: 'Use /bank deposit <amount> or /bank withdraw <amount>'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                '🏦 <b>Bank Account Information</b>',
                '',
                `👛 <b>Wallet Balance:</b> ${userData.balance} coins`,
                `🏛️ <b>Bank Balance:</b> ${userData.bankBalance} coins`,
                `💎 <b>Total Wealth:</b> ${totalWealth} coins`,
                `📊 <b>Bank Percentage:</b> ${bankPercentage}% of total wealth`,
                '',
                '<i>Use /bank deposit &lt;amount&gt; or /bank withdraw &lt;amount&gt;</i>'
            ].join('\n');

            await context.reply(message);
        }
    }
}

module.exports = new BankCommand();
