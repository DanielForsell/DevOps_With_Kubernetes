import axios from 'axios'
const baseUrl = '/backend/todos'


const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const updateStatus = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}/status`, newObject)
  return request.then(response => response.data)
}

const deleteArticle = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`)
  return request.then(response => response.data)
}

export default { getAll, create, updateStatus, deleteArticle}