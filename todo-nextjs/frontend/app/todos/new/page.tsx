import Link from "next/link";

import { createTodo } from "../../actions";

export default function NewTodoPage() {
    return (
        <main>
            <h1>새 Todo 작성</h1>

            <form action={createTodo}>
                <div>
                    <label htmlFor="title">할 일</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="할 일을 입력하세요"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="date">날짜</label>
                    <input id="date" name="date" type="date" />
                </div>

                <button type="submit">등록</button>
            </form>

            <Link href="/todos">목록으로 돌아가기</Link>
        </main>
    );
}