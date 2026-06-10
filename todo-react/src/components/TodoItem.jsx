// Todo 항목 하나하나를 담당 
// 텍스트 표시, 완료/수정/삭제 버튼을 가짐
// 가장 핵심적인 파일
// isEditing state로 "텍스트 보기 모드" ↔ "인라인 수정 모드"를 전환
// Vanilla JS의 prompt() 대신 이 방식 사용

import { useState } from "react"

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(todo.text)

    function handleUpdate() {
        onUpdate(todo.id, editText)
        setIsEditing(false)
    }

    return (
        <li className="flex items-center justify-between gap-2 py-3 border-b border-gray-100">
            {isEditing ? (
                // 수정 모드: 인라인 입력창
                <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 h-[36px] px-2 py-1 border border-[#672be0] rounded-xl text-sm focus:outline-none"

                />
            ) : (
                // 일반 모드: 텍스트 표시
                <span className={`flex-1 text-sm ${todo.completed ? "line-through text-gray-400" : ""}`}>
                    {todo.text}
                </span>
            )}

            <div className="flex gap-1">
                {isEditing ? (
                    // 수정 모드: 저장/취소 버튼
                    <>
                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 rounded-full bg-[#672be0] text-white shadow-md text-xs font-bold hover:opacity-90"
                        >
                            확인
                        </button>
                        <button
                            onClick={() => {
                                setEditText(todo.text)
                                setIsEditing(false)
                            }}
                            className="px-4 py-2 rounded-full bg-[#f0eafc] text-[#b99df3] text-xs font-bold hover:opacity-90"
                        >
                            취소
                        </button>
                    </>
                ) : (
                    // 일반 모드: 완료/수정/삭제 버튼
                    <>
                        <button
                            onClick={() => onToggle(todo.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition ${todo.completed
                                ? "bg-[#f0eafc] text-[#b99df3]"
                                : "bg-[#672be0] text-white shadow-md"
                                }`}
                        >
                            완료
                        </button>
                        <button
                            onClick={() => {
                                setEditText(todo.text)
                                setIsEditing(true)
                            }}
                            className="px-4 py-2 rounded-full bg-[#f0eafc] text-[#b99df3] text-xs font-bold hover:opacity-90"
                        >
                            수정
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(todo.id)}
                            className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold"
                        >
                            삭제
                        </button>
                    </>
                )}
            </div>
        </li>
    )
}

export default TodoItem