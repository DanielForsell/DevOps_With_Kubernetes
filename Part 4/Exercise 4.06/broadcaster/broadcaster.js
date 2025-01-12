const NATS = require('nats')

async function startBroadcaster() {
    try {

        const token = process.env.NATS_TOKEN;
        const chatid = process.env.NATS_CHATID;
        const bot = new TelegramBot(token, {polling: false});
        
        const nc = await NATS.connect({
            servers: process.env.NATS_URL || 'nats://my-nats:4222'
        });

        console.log('Connected to NATS');

        
        const subscription = nc.subscribe('todo.*');
        console.log('Subscribed to todo.* events');

        
        for await (const msg of subscription) {
            const data = JSON.parse(msg.data.toString());
            console.log(`Received message on ${msg.subject}:`, data);
            
            let telegramMessage = '';
            
            switch (msg.subject) {
                case 'todo.created':
                    telegramMessage = `🆕 New Todo Created:\n${data.content}`;
                    break;
                case 'todo.updated':
                    telegramMessage = `📝 Todo Updated:\n${data.content}`;
                    break;
                case 'todo.deleted':
                    telegramMessage = `🗑️ Todo Deleted:\n${data.content}`;
                    break;
            }

            try {
                await bot.sendMessage(chatId, telegramMessage);
                console.log('Message sent to Telegram');
            } catch (telegramError) {
                console.error('Error sending to Telegram:', telegramError);
            }
            
        }
    } catch (error) {
        console.error('Error in broadcaster:', error);
        process.exit(1);
    }
}

startBroadcaster().catch(console.error);