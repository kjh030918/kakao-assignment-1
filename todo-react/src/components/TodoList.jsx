// Todo 목록 전체를 보여주는 컨테이너
// App.jsx에서 todos 배열을 받아서 TodoItem을 반복 렌더링해
// 할 일이 없을 때 안내 메시지도 여기서 처리

import TodoItem from "./TodoItem"

function TodoList({ todos, onToggle, onUpdate, onDelete }) {
    if (todos.length === 0) {
        return <p className="text-gray-400 text-sm text-center py-4">할 일이 없어요!</p>
    }

    return (
        <ul className="h-[100px] overflow-y-auto">
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    )
}

export default TodoList