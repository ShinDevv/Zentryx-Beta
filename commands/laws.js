
const CommandBase = require('../utils/commandBase');

class LawsCommand extends CommandBase {
    constructor() {
        super({
            name: 'laws',
            description: 'Get information about Philippine laws and legal facts',
            category: 'Educational',
            usage: 'laws [topic]',
            cooldown: 5,
            slashCommand: {
                name: 'laws',
                description: 'Get information about Philippine laws',
                options: [
                    {
                        name: 'topic',
                        description: 'Legal topic (constitution, criminal, civil, labor)',
                        type: 3,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const topic = (context.args[0] || 'general').toLowerCase();
        
        const legalInfo = this.getLegalInfo(topic);
        
        if (!legalInfo) {
            const availableTopics = ['constitution', 'criminal', 'civil', 'labor', 'cybercrime', 'consumer', 'environment'];
            await context.reply(`❌ Topic not found. Available topics: ${availableTopics.join(', ')}`);
            return;
        }

        const response = this.createEmbed(
            `⚖️ Philippine Law: ${legalInfo.title}`,
            legalInfo.description,
            legalInfo.sections.map(section => ({
                name: section.name,
                value: section.value,
                inline: false
            })),
            context
        );

        await context.reply(response);
    }

    getLegalInfo(topic) {
        const laws = {
            constitution: {
                title: "Philippine Constitution",
                description: "The 1987 Constitution of the Republic of the Philippines",
                sections: [
                    {
                        name: "📜 Article II - Declaration of Principles",
                        value: "The Philippines is a democratic and republican State. Sovereignty resides in the people."
                    },
                    {
                        name: "🏛️ Article III - Bill of Rights",
                        value: "No person shall be deprived of life, liberty, or property without due process of law."
                    },
                    {
                        name: "⚖️ Key Rights",
                        value: "Freedom of speech, religion, press, assembly, and petition for redress of grievances."
                    }
                ]
            },
            criminal: {
                title: "Criminal Law",
                description: "Revised Penal Code and special criminal laws in the Philippines",
                sections: [
                    {
                        name: "🚨 Felonies",
                        value: "Acts or omissions punishable by law, committed with malice (dolus) or negligence (culpa)."
                    },
                    {
                        name: "⏰ Prescription of Crimes",
                        value: "Light felonies: 2 months, Correctional penalties: 10 years, Afflictive penalties: 15 years."
                    },
                    {
                        name: "🔒 Penalties",
                        value: "Principal penalties include death (suspended), reclusion, prison, arrest, and fines."
                    }
                ]
            },
            civil: {
                title: "Civil Law",
                description: "Civil Code of the Philippines and related civil matters",
                sections: [
                    {
                        name: "👥 Persons",
                        value: "Civil personality begins at birth and ends at death. Legal capacity acquired at majority age (18)."
                    },
                    {
                        name: "🏠 Property Rights",
                        value: "Ownership includes right to enjoy, dispose, and recover property within legal limits."
                    },
                    {
                        name: "📋 Obligations",
                        value: "Every person must render account of their acts and pay damages for injury to others."
                    }
                ]
            },
            labor: {
                title: "Labor Code",
                description: "Presidential Decree No. 442 - Labor Code of the Philippines",
                sections: [
                    {
                        name: "⏰ Working Hours",
                        value: "Normal working day: 8 hours, Normal work week: 48 hours. Overtime pay: +25% of regular wage."
                    },
                    {
                        name: "💰 Wages",
                        value: "Minimum wage varies by region. 13th month pay mandatory for all employees."
                    },
                    {
                        name: "🏖️ Leave Benefits",
                        value: "Service incentive leave: 5 days annually after 1 year of service."
                    }
                ]
            },
            cybercrime: {
                title: "Cybercrime Prevention Act",
                description: "Republic Act No. 10175 - Cybercrime Prevention Act of 2012",
                sections: [
                    {
                        name: "💻 Cyber Offenses",
                        value: "Illegal access, data interference, system interference, misuse of devices."
                    },
                    {
                        name: "🌐 Computer-related Offenses",
                        value: "Computer-related fraud, forgery, and identity theft."
                    },
                    {
                        name: "📱 Content-related Offenses",
                        value: "Cybersex, child pornography, unsolicited commercial communications (spam)."
                    }
                ]
            },
            consumer: {
                title: "Consumer Protection",
                description: "Republic Act No. 7394 - Consumer Act of the Philippines",
                sections: [
                    {
                        name: "🛡️ Consumer Rights",
                        value: "Right to safety, information, choice, representation, redress, and consumer education."
                    },
                    {
                        name: "📦 Product Standards",
                        value: "All consumer products must meet safety and quality standards."
                    },
                    {
                        name: "⚖️ Remedies",
                        value: "Consumers may file complaints with DTI for violations of consumer rights."
                    }
                ]
            },
            environment: {
                title: "Environmental Laws",
                description: "Philippine Environmental Laws and Regulations",
                sections: [
                    {
                        name: "🌱 Environmental Rights",
                        value: "Right to a balanced and healthful ecology enshrined in the Constitution."
                    },
                    {
                        name: "🚯 Clean Air Act",
                        value: "RA 8749 - Prohibits air pollution and promotes clean air."
                    },
                    {
                        name: "💧 Clean Water Act",
                        value: "RA 9275 - Protects water quality and manages water pollution."
                    }
                ]
            }
        };

        return laws[topic] || null;
    }
}

module.exports = new LawsCommand();
