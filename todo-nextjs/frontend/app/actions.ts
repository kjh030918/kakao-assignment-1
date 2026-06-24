"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTodo(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();

    if (!title) {
        throw new Error("Todo 제목을 입력해주세요.");
    }

    const API_URL = process.env.BACKEND_API_URL;

    if (!API_URL) {
        throw new Error("BACKEND_API_URL이 설정되지 않았습니다.");
    }

    const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            completed: false,
            date: date || null,
        }),
    });

    if (!response.ok) {
        throw new Error("Todo 생성에 실패했습니다.");
    }

    revalidatePath("/todos");
    redirect("/todos");
}

export async function updateTodo(
    todoId: number,
    formData: FormData
) {
    const title = String(formData.get("title") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const completed = formData.get("completed") === "on";

    if (!title) {
        throw new Error("Todo 제목을 입력해주세요.");
    }

    const API_URL = process.env.BACKEND_API_URL;

    if (!API_URL) {
        throw new Error("BACKEND_API_URL이 설정되지 않았습니다.");
    }

    const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            completed,
            date: date || null,
        }),
    });

    if (!response.ok) {
        throw new Error("Todo 수정에 실패했습니다.");
    }

    revalidatePath("/todos");
    redirect("/todos");
}

export async function deleteTodo(
    todoId: number,
    _formData: FormData
) {
    const API_URL = process.env.BACKEND_API_URL;

    if (!API_URL) {
        throw new Error("BACKEND_API_URL이 설정되지 않았습니다.");
    }

    const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Todo 삭제에 실패했습니다.");
    }

    revalidatePath("/todos");
}