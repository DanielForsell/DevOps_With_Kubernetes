const NATS = require('nats')

async function startBroadcaster() {
    try {
        
        const nc = await NATS.connect({
            servers: process.env.NATS_URL || 'nats://my-nats:4222'
        });

        console.log('Connected to NATS');

        
        const subscription = nc.subscribe('todo.*');
        console.log('Subscribed to todo.* events');

        
        for await (const msg of subscription) {
            const data = JSON.parse(msg.data.toString());
            console.log(`Received message on ${msg.subject}:`, data);
            
            switch (msg.subject) {
                case 'todo.created':
                    console.log('New todo created:', data);
                    break;
                case 'todo.updated':
                    console.log('Todo updated:', data);
                    break;
                case 'todo.deleted':
                    console.log('Todo deleted:', data);
                    break;
            }
        }
    } catch (error) {
        console.error('Error in broadcaster:', error);
        process.exit(1);
    }
}

startBroadcaster().catch(console.error);