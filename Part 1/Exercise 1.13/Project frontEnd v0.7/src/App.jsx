import { useState, useEffect } from 'react'
import noteService from './services/notes'
import Notification from './components/Notification'

const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16
  }

  return (
    <div style={footerStyle}>
      <br />
      <em>TODO-app, Department of Computer Science, University of Helsinki 2024</em>
    </div>
  )
}

const App = () => {
  const [notes, setNotes] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState('some error happened...')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })

      const fetchImage = async () => {
        try {
          const response = await fetch('/api/image');
          if (!response.ok) {
            throw new Error('Failed to fetch image');
          }
          
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          setImageUrl(url);
        } catch (error) {
          console.error('Error fetching the image:', error);
          setErrorMessage('Could not load the image. Please try again later.');
        }
      };
  
      fetchImage();
      
  }, [])

  const addNote = (event) => {
    event.preventDefault()

    if(notes.some(note => note.title === newTitle)) {
      setErrorMessage('Title is already in the list, updating it with new content')

      const note = notes.find(note => note.title === newTitle)
      const changedNote = { ...note, author: newAuthor, url: newURL, votes: newVotes }

      noteService.update(note.id, changedNote).then(response => {
        setNotes(notes.map(note => note.id !== response.id ? note : response))
        setNewTitle('')

      }).catch(error => {
        setErrorMessage(
          `Article '${note.title}' was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000);
        setNotes(notes.filter(n => n.id !== note.id))
      })

      setTimeout(() => {
        setErrorMessage(null)
      }, 5000);
    }

    const noteObject = {
      title: newTitle,
    }

    noteService
      .create(noteObject)
      .then(response => {
        setNotes(notes.concat(response))
        setNewTitle('')
      })
  }


  const deleteArticle = (id) => {
    console.log('deleting article by id: ', id);
    if (window.confirm(`Are you sure that you want to delete article by id: ${id}?`)) {
      noteService.deleteArticle(id).then(response => {
        console.log('deleted person')
        setNotes(notes.filter(note => note.id !== id))

        setErrorMessage(`Deleted person by id: ${id}`)

        setTimeout(() => {
          setErrorMessage(null)
        }, 5000);

      })
    }


  }

  const handleTitleChange = (event) => {
    console.log(event.target.value)
    setNewTitle(event.target.value)
  }


  const Note = ({ note, toggleImportance, deleteArticle }) => {
    return (
      <div>
        Title: {note.title} <br />
    
        <button onClick={deleteArticle}>Delete</button>
      </div>
    )
  }



  return (
    <div>
      <h1>To-Do App</h1>
      <Notification message={errorMessage} />
      <div>
        <img src={imageUrl} alt="Random" style={{ width: '150px' }} />
      </div>

      <form onSubmit={addNote}>
  
        <div>
          <input value={newTitle} onChange={handleTitleChange}/>
          <button type="submit" className='button'>Create TO-DO</button>
        </div>
        <ul>
          <li>todo</li>
          <li>todo</li>
          <li>todo</li>
          <li>todo</li>
        </ul>
        
      </form>

      <ul>
        {notes.map(note =>
          <Note 
          key={note.id} 
          note={note}
          deleteArticle={() => deleteArticle(note.id)}/>
        )}
      </ul>
      <Footer />
    </div>
  )
}

export default App 