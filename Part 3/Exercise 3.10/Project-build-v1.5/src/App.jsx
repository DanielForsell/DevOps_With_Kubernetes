import { useState, useEffect } from 'react'
import noteService from './services/notes'  
import Notification from './components/Notification'


const App = () => {
  const [notes, setNotes] = useState([])
  const [newTask, setNewTask] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
      .catch(error => {
      console.error('Error fetching tasks:', error);
      setErrorMessage('Could not load tasks. Please try again later.');
    });

    const fetchImage = async () => {
      try {
        const response = await fetch('/api/image')
        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        setImageUrl(url)
      } catch (error) {
        console.error('Error fetching the image:', error)
        setErrorMessage('Could not load the image. Please try again later.')
      }
    }

    fetchImage()
  }, [])

  const addNote = (event) => {
    event.preventDefault()

    if (notes.some(note => note.task === newTask)) {
      setErrorMessage('Task is already in the list, try different name')

      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      return
    }

    const noteObject = {
      task: newTask,  
    }

    noteService
      .create(noteObject)
      .then(response => {
        setNotes(notes.concat(response))
        setNewTask('')
      })
      .catch(error => {
        setErrorMessage('Failed to add task')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const deleteArticle = (id) => {
    console.log('deleting task by id: ', id)
    if (window.confirm(`Are you sure that you want to delete task by id: ${id}?`)) {
      noteService.deleteArticle(id).then(response => {
        setNotes(notes.filter(note => note.id !== id))
        setErrorMessage(`Deleted task by id: ${id}`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
    }
  }

  const handleTaskChange = (event) => {
    setNewTask(event.target.value)
  }

  const Note = ({ note, deleteArticle }) => {
    return (
      <div className="note">
        <span>{note.task}</span>
        <button 
          onClick={() => deleteArticle(note.id)} 
          className="button"
        >
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="container">
      <h1>To-Do App</h1>
      <Notification message={errorMessage} />
      <div className="image-container">
        <img 
          src={imageUrl} 
          alt="Random" 
          style={{ 
            width: '200px',
            borderRadius: '8px',
            marginBottom: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }} 
        />
      </div>
      <div className="notes-container">
        {notes.map(note => 
          <Note 
            key={note.id}
            note={note}
            deleteArticle={() => deleteArticle(note.id)}
          />
        )}
      </div>
      <form onSubmit={addNote}>
        <input
          value={newTask}
          onChange={handleTaskChange}
          placeholder="Add a new task..."
        />
        <button type="submit" className="button">
          Add Task
        </button>
      </form>
    </div>
  );
}

export default App