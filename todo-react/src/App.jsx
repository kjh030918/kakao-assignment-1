import { useState } from "react"
import TodoForm from "./components/TodoForm"
import TodoList from "./components/TodoList"

const STORAGE_KEY = "todo-list"

// localstorage에서 저장된 todo 데이터를 꺼내오는 함수
// 페이지를 새로고침하거나 껐다 켜도 todo가 사라지지 않는 게 이 함수 덕분
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [message, setMessage] = useState("")

  function saveTodos(updated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setTodos(updated)
  }

  // Todo 추가
  function addTodo(text) {
    if (text.trim() === "") {
      setMessage("할 일을 입력해주세요.")
      return
    }
    const newTodo = { id: Date.now(), text: text.trim(), completed: false }
    saveTodos([...todos, newTodo])
    setMessage("")
  }

  // Todo 완료 토글
  function toggleTodo(id) {
    saveTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  // Todo 수정
  function updateTodo(id, newText) {
    if (newText.trim() === "") {
      setMessage("수정할 내용을 입력해주세요.")
      return
    }
    saveTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText.trim() } : todo
    ))
    setMessage("")
  }

  // Todo 삭제
  function deleteTodo(id) {
    saveTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex justify-center items-center">
      <section className="w-[470px] max-w-[calc(100vw-32px)] bg-white rounded-[20px] shadow-lg p-8">
        <h1 className="text-center text-[#672be0] text-[34px] font-bold mb-6">Todo List</h1>
        <TodoForm onAdd={addTodo} />
        {message && <p className="text-red-500 text-sm mb-2">{message}</p>}
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </section>
    </div>
  )
}

export default App