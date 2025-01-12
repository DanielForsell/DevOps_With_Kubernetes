const NATS = require('nats')
const TelegramBot = require('node-telegram-bot-api');

async function startBroadcaster() {
    try {

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatid = process.env.TELEGRAM_CHAT_ID;
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
                    telegramMessage = `🆕 New Todo Created:
                                        Todo id: \n${data.id}
                                        Todo: \n${data.task}
                                        Status: \n${data.done}
                                        Date: \n${data.created_at}`;
                    break;
                case 'todo.updated':
                    telegramMessage = `📝 Todo Status Updated with status:
                                        Status: \n${data.done}\n
                                        Todo id: \n${data.id}
                                        Todo: \n${data.task}
                                        Date: \n${data.created_at}`;
                    break;
                case 'todo.deleted':
                    telegramMessage = `🗑️ Todo Deleted with ID:\n${data.id}`;
                    break;
            }

            try {
                await bot.sendMessage(chatid, telegramMessage);
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