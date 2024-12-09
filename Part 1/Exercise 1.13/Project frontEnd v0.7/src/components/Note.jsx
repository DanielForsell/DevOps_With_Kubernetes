const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <div>
      Author: {note.author} Title: {note.title} URL: {note.url} Votes: {note.votes} <br />
      
      <button onClick={toggleImportance}>{label}</button>
    </div>
  )
}

export default Note