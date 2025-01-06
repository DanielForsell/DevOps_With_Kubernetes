const express = require('express');
const Redis = require('redis');
const app = express();

const PORT = process.env.PORT || 3000;

const redisClient = Redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379
    },
    retryStrategy: function(times) {
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
        console.error('Redis connection failed:', err);
    }
})();

const cors = require('cors');
app.use(cors());
app.use(express.json());

app.use(async (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});


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
            created_at: new Date().toISOString()
        };
        console.log('New todo created:', newTodo);
        todos.push(newTodo);
        await redisClient.set('todos', JSON.stringify(todos));
        console.log('New added to database:', newTodo);
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
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
    res.status(200)
});

app.listen(PORT, () => {
    console.log(`ToDo-BackEnd listening on port ${PORT}`);
});