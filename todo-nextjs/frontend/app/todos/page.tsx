import { Suspense } from "react";

import TodoApp from "./components/TodoApp";

function TodoLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#ede9f6] px-4 py-10">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
                <p className="text-sm text-gray-400">
                    Todo를 불러오는 중입니다...
                </p>
            </section>
        </main>
    );
}

export default function TodosPage() {
    return (
        <Suspense fallback={<TodoLoading />}>
            <TodoApp />
        </Suspense>
    );
}