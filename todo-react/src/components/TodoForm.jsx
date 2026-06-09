// 입력창 + 추가 버튼 영역
// 사용자가 텍스트를 입력하고 추가 버튼을 누르면 App.jsx의 addTodo 함수를 호출
// 입력창 상태(input value)를 직접 관리

import { useState } from "react"

function TodoForm({ onAdd }) {
    const [input, setInput] = useState("")

    function handleSubmit(e) {
        e.preventDefault()
        onAdd(input)
        setInput("")
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="할 일을 입력하세요"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-[#672be0]"
            />
            <button
                type="submit"
                className="px-4 bg-[#672be0] text-white font-bold rounded-[10px] hover:opacity-90"
            >
                추가
            </button>
        </form>
    )
}

export default TodoForm