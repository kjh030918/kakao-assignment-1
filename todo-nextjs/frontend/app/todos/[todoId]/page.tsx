import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteTodo, updateTodo } from "../../actions";

type Todo = {
    id: number;
    title: string;
    completed: boolean;
    date: string | null;
};

type EditTodoPageProps = {
    params: Promise<{
        todoId: string;
    }>;
};

const API_URL = process.env.BACKEND_API_URL;

async function getTodo(todoId: number): Promise<Todo | undefined> {
    if (!API_URL) {
        throw new Error("BACKEND_API_URL이 설정되지 않았습니다.");
    }

    const response = await fetch(`${API_URL}/todos`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Todo를 불러오지 못했습니다.");
    }

    const todos: Todo[] = await response.json();

    return todos.find((todo) => todo.id === todoId);
}

export default async function EditTodoPage({
    params,
}: EditTodoPageProps) {
    const { todoId } = await params;
    const id = Number(todoId);

    if (!Number.isInteger(id)) {
        notFound();
    }

    const todo = await getTodo(id);

    if (!todo) {
        notFound();
    }

    const updateTodoWithId = updateTodo.bind(null, id);
    const deleteTodoWithId = deleteTodo.bind(null, id);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#ede9f6] px-4 py-10">
            <section className="w-full max-w-md rounded-3xl bg-white px-8 py-8 shadow-xl">
                <h1 className="mb-7 text-center text-3xl font-bold italic text-[#5b35c5]">
                    Todo 수정
                </h1>

                <form action={updateTodoWithId}>
                    {/* 날짜는 화면에 표시하지 않고 기존 값을 유지 */}
                    <input
                        type="hidden"
                        name="date"
                        value={todo.date ?? ""}
                    />

                    <div className="mb-4">
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-semibold text-[#5b35c5]"
                        >
                            제목
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            defaultValue={todo.title}
                            required
                            className="w-full rounded-full border border-gray-200 px-5 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-[#5b35c5]"
                        />
                    </div>

                    <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl bg-[#f1edfb] px-4 py-3">
                        <input
                            name="completed"
                            type="checkbox"
                            defaultChecked={todo.completed}
                            className="h-5 w-5 cursor-pointer accent-[#5b35c5]"
                        />

                        <span className="text-sm font-medium text-[#5b35c5]">
                            완료됨
                        </span>
                    </label>

                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <button
                            type="submit"
                            className="rounded-full bg-[#5b35c5] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                        >
                            저장
                        </button>

                        <Link
                            href="/todos"
                            className="rounded-full bg-[#ede9f6] px-5 py-3 text-center text-sm font-semibold text-[#5b35c5] transition-opacity hover:opacity-75"
                        >
                            취소
                        </Link>

                        <button
                            type="submit"
                            formAction={deleteTodoWithId}
                            className="rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                        >
                            삭제
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
