
class Formatter {
    static bold(text, platform) {
        if (platform === 'discord') {
            return `**${text}**`;
        } else if (platform === 'telegram') {
            return `<b>${text}</b>`;
        }
        return text;
    }

    static italic(text, platform) {
        if (platform === 'discord') {
            return `*${text}*`;
        } else if (platform === 'telegram') {
            return `<i>${text}</i>`;
        }
        return text;
    }

    static code(text, platform) {
        if (platform === 'discord') {
            return `\`${text}\``;
        } else if (platform === 'telegram') {
            return `<code>${text}</code>`;
        }
        return text;
    }

    static codeBlock(text, language = '', platform) {
        if (platform === 'discord') {
            return `\`\`\`${language}\n${text}\n\`\`\``;
        } else if (platform === 'telegram') {
            return `<pre><code class="${language}">${text}</code></pre>`;
        }
        return text;
    }

    static underline(text, platform) {
        if (platform === 'discord') {
            return `__${text}__`;
        } else if (platform === 'telegram') {
            return `<u>${text}</u>`;
        }
        return text;
    }

    static strikethrough(text, platform) {
        if (platform === 'discord') {
            return `~~${text}~~`;
        } else if (platform === 'telegram') {
            return `<s>${text}</s>`;
        }
        return text;
    }

    static createEmbed(title, description, fields = [], color = 0x667eea, platform) {
        if (platform === 'discord') {
            const embed = {
                color: color,
                title: title,
                description: description,
                fields: fields,
                timestamp: new Date().toISOString()
            };
            return { embeds: [embed] };
        } else if (platform === 'telegram') {
            let message = [];
            
            if (title) {
                message.push(`<b>${title}</b>`);
                message.push('');
            }
            
            if (description) {
                message.push(description);
                message.push('');
            }
            
            if (fields && fields.length > 0) {
                fields.forEach(field => {
                    message.push(`<b>${field.name}</b>`);
                    message.push(field.value);
                    message.push('');
                });
            }
            
            return message.join('\n').trim();
        }
        
        return { title, description, fields };
    }

    static createList(items, platform, ordered = false) {
        if (!items || items.length === 0) return '';
        
        if (platform === 'discord') {
            return items.map((item, index) => {
                const prefix = ordered ? `${index + 1}.` : '•';
                return `${prefix} ${item}`;
            }).join('\n');
        } else if (platform === 'telegram') {
            return items.map((item, index) => {
                const prefix = ordered ? `${index + 1}.` : '•';
                return `${prefix} ${item}`;
            }).join('\n');
        }
        
        return items.join('\n');
    }

    static escapeText(text, platform) {
        if (platform === 'telegram') {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        } else if (platform === 'discord') {
            return text
                .replace(/\*/g, '\\*')
                .replace(/_/g, '\\_')
                .replace(/`/g, '\\`')
                .replace(/~/g, '\\~')
                .replace(/\|/g, '\\|');
        }
        
        return text;
    }

    static format(text, style, platform) {
        switch (style) {
            case 'bold':
                return this.bold(text, platform);
            case 'italic':
                return this.italic(text, platform);
            case 'code':
                return this.code(text, platform);
            case 'underline':
                return this.underline(text, platform);
            case 'strikethrough':
                return this.strikethrough(text, platform);
            default:
                return text;
        }
    }

    static link(text, url, platform) {
        if (platform === 'discord') {
            return `[${text}](${url})`;
        } else if (platform === 'telegram') {
            return `<a href="${url}">${text}</a>`;
        }
        return `${text}: ${url}`;
    }

    static mention(userId, platform) {
        if (platform === 'discord') {
            return `<@${userId}>`;
        } else if (platform === 'telegram') {
            return `@${userId}`;
        }
        return `@${userId}`;
    }
}

module.exports = Formatter;
