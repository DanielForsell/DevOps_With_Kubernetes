const express = require('express');
const Redis = require('redis');
const app = express();

const PORT = process.env.PORT || 3000;

// Redis client configuration with retries
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

// Error handling for Redis
redisClient.on('error', err => console.error('Redis Client Error', err));

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
        
        // Initialize todos if not exists
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

// Add error handling middleware
app.use(async (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Get all todos
app.get('/backend/todos', async (req, res) => {
    try {
        const todos = await redisClient.get('todos');
        res.json(JSON.parse(todos) || []);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// Create new todo
app.post('/backend/todos', async (req, res) => {
    try {
        const { task } = req.body;
        if (!task) {
            return res.status(400).json({ error: 'Task is required' });
        }

        const todos = JSON.parse(await redisClient.get('todos') || '[]');
        const newTodo = {
            id: Date.now(), // Use timestamp for unique IDs
            task,
            created_at: new Date().toISOString()
        };
        todos.push(newTodo);
        await redisClient.set('todos', JSON.stringify(todos));
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

// Delete todo
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

// Graceful shutdown
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

app.listen(PORT, () => {
    console.log(`ToDo-BackEnd listening on port ${PORT}`);
});