// 입력창 + 추가 버튼 영역
// 사용자가 텍스트를 입력하고 추가 버튼을 누르면 App.jsx의 addTodo 함수를 호출
// 입력창 상태(input value)를 직접 관리

import { useState } from "react"

function TodoForm({ onAdd }) {
    const [text, setText] = useState("")

    function handleSubmit(e) {
        e.preventDefault()
        onAdd(text)
        setText("")
    }

    return (
        <form onSubmit={handleSubmit} className="flex mb-6">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="할 일을 입력하세요"
                className="flex-1 h-[54px] border border-gray-200 focus:border-[#672be0] rounded-l-[20px] px-5 text-gray-700 outline-none placeholder:text-gray-300 transition" />

            <button
                type="submit"
                className="w-[95px] h-[54px] bg-[#672be0] text-white font-bold rounded-r-[20px]"
            >
                추가
            </button>
        </form>
    )
}

export default TodoForm