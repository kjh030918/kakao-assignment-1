import { useState, useEffect } from "react"
import TodoForm from "./components/TodoForm"
import TodoList from "./components/TodoList"
import FilterTabs from "./components/FilterTabs"
import WeekHeader from "./components/WeekHeader"
import WeekDays from "./components/WeekDays"

const STORAGE_KEY = "todo-list"
const WEEK_START_KEY = "todo-week-start-date"
const SELECTED_DATE_KEY = "todo-selected-date"

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getTodayDate() {
  return formatDate(new Date())
}

function moveDate(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + amount)

  return formatDate(date)
}

function getWeekStartDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  const day = date.getDay()

  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)

  return formatDate(date)
}

function getWeekDates(weekStartDate) {
  return Array.from({ length: 7 }, (_, index) => {
    return moveDate(weekStartDate, index)
  })
}

function loadWeekStartDate() {
  const saved = localStorage.getItem(WEEK_START_KEY)

  if (saved) {
    return saved
  }

  return getWeekStartDate(getTodayDate())
}

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadSelectedDate() {
  const saved = localStorage.getItem(SELECTED_DATE_KEY)

  if (saved) {
    return saved
  }

  return getTodayDate()
}




function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [message, setMessage] = useState("")
  const [currentFilter, setCurrentFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState(loadSelectedDate)
  const [weekStartDate, setWeekStartDate] = useState(loadWeekStartDate)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem(SELECTED_DATE_KEY, selectedDate)
  }, [selectedDate])

  useEffect(() => {
    localStorage.setItem(WEEK_START_KEY, weekStartDate)
  }, [weekStartDate])

  function goToPreviousWeek() {
    const newWeekStartDate = moveDate(weekStartDate, -7)
    const newSelectedDate = moveDate(selectedDate, -7)

    setWeekStartDate(newWeekStartDate)
    setSelectedDate(newSelectedDate)
  }

  function goToNextWeek() {
    const newWeekStartDate = moveDate(weekStartDate, 7)
    const newSelectedDate = moveDate(selectedDate, 7)

    setWeekStartDate(newWeekStartDate)
    setSelectedDate(newSelectedDate)
  }

  function getTodoCountByDate(dateString) {
    return todos.filter((todo) => todo.date === dateString).length
  }

  function selectDate(dateString) {
    setSelectedDate(dateString)
  }

  function saveTodos(updated) {
    setTodos(updated)
  }

  function addTodo(text) {
    if (text.trim() === "") {
      setMessage("할 일을 입력해주세요.")
      return
    }

    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      date: selectedDate,
    }

    saveTodos([...todos, newTodo])
    setMessage("")
  }

  function toggleTodo(id) {
    saveTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  function updateTodo(id, newText) {
    if (newText.trim() === "") {
      setMessage("수정할 내용을 입력해주세요.")
      return
    }

    saveTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    )

    setMessage("")
  }

  function deleteTodo(id) {
    saveTodos(todos.filter((todo) => todo.id !== id))
  }

  const todosByDate = todos.filter((todo) => {
    return todo.date === selectedDate
  })

  const weekDates = getWeekDates(weekStartDate)
  const weekEndDate = moveDate(weekStartDate, 6)
  const todayDate = getTodayDate()

  const filteredTodos = todosByDate.filter((todo) => {
    if (currentFilter === "all") return true
    if (currentFilter === "active") return todo.completed === false
    if (currentFilter === "completed") return todo.completed === true
    return true
  })

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex justify-center items-center">
      <section className="w-[560px] max-w-[calc(100vw-32px)] bg-white rounded-[28px] shadow-lg p-10">
        <h1 className="text-center text-[#672be0] text-[34px] font-extrabold italic mb-6">
          Todo List
        </h1>

        <WeekHeader
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
        />

        <WeekDays
          weekDates={weekDates}
          selectedDate={selectedDate}
          todayDate={todayDate}
          onSelectDate={selectDate}
          getTodoCountByDate={getTodoCountByDate}
        />

        <TodoForm onAdd={addTodo} />

        <FilterTabs
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />

        {message && <p className="text-red-500 text-sm mb-2">{message}</p>}

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </section>
    </div>
  )
}

export default App