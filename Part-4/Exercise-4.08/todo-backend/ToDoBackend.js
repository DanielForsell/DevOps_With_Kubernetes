import express from 'express';
import Redis from 'redis';
import NATS from 'nats';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

const nc = await NATS.connect({
            servers: process.env.NATS_URL || 'nats://my-nats:4222'
        });

console.log('Connected to NATS');

const redisClient = Redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379
    },
    retryStrategy: function (times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redisClient.on('error', err => console.error('Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
        

        const exists = await redisClient.exists('todos');
        if (!exists) {
            await redisClient.set('todos', JSON.stringify([]));
        }
    } catch (err) {
        console.error('Error during setup:', err);
    }
})();


app.use(cors());
app.use(express.json());

app.use(async (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.get('/backend', (req, res) => {
    res.status(200).send('Ok')
})

app.get('/backend/todos', async (req, res) => {
    try {
        const todos = await redisClient.get('todos');
        res.json(JSON.parse(todos) || []);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});


app.post('/backend/todos', async (req, res) => {
    try {
        const { task } = req.body;
        if (!task) {
            return res.status(400).json({ error: 'Task is required' });
        }

        if (task.length > 140) {
            console.log('Todo creation failed: Task too long', {
                taskLength: task.length,
                task: task.substring(0, 50) + '...'
            });
            return res.status(400).json({ error: 'Task must be 140 characters or less' });
        }

        const todos = JSON.parse(await redisClient.get('todos') || '[]');
        const newTodo = {
            id: Date.now(),
            task,
            done: false,
            created_at: new Date().toISOString()
        };

        console.log('New todo created:', newTodo);
        todos.push(newTodo);
        await redisClient.set('todos', JSON.stringify(todos));
        console.log('New Todo added to database:', newTodo);

        nc.publish('todo.created', JSON.stringify(newTodo));

        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

app.put('/backend/todos/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { done } = req.body;

        const todos = JSON.parse(await redisClient.get('todos') || '[]');
        const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));

        if (todoIndex === -1) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        todos[todoIndex].done = done;
        await redisClient.set('todos', JSON.stringify(todos));
        console.log(`Updated todo ${id} status to ${done}`);

        nc.publish('todo.updated', JSON.stringify(todos[todoIndex]));

        res.status(204).end();
    } catch (error) {
        console.error('Error updating todo status:', error);
        res.status(500).json({ error: 'Failed to update todo status' });
    }
});

app.delete('/backend/todos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const todos = JSON.parse(await redisClient.get('todos') || '[]');
        const todoIndex = todos.findIndex(todo => todo.id === id);

        if (todoIndex === -1) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        todos.splice(todoIndex, 1);
        await redisClient.set('todos', JSON.stringify(todos));
        console.log('Deleted todo with id: ', id);

        nc.publish('todo.deleted', JSON.stringify({ id }));

        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});


process.on('SIGTERM', async () => {
    try {
        await redisClient.quit();
        console.log('Redis connection closed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Todo backend service running' });
});

app.listen(PORT, () => {
    console.log(`ToDo-BackEnd listening on port ${PORT}`);
});