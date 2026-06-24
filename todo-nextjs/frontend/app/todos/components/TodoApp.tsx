"use client";

import Link from "next/link";
import {
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

type Todo = {
    id: number;
    title: string;
    completed: boolean;
    date: string | null;
};

type Filter = "all" | "active" | "completed";

type QueryChanges = {
    filter?: Filter;
    search?: string;
    date?: string;
};

const DAY_KO = ["월", "화", "수", "목", "금", "토", "일"];

const FILTER_LABELS: Record<Filter, string> = {
    all: "전체",
    active: "진행 중",
    completed: "완료",
};

function toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function fromISODate(value: string): Date {
    return new Date(`${value}T00:00:00`);
}

function isValidDate(value: string | null): value is string {
    if (!value) {
        return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getWeekStart(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();

    result.setHours(0, 0, 0, 0);
    result.setDate(
        result.getDate() - (day === 0 ? 6 : day - 1)
    );

    return result;
}

function getWeekDates(weekStart: Date): Date[] {
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);

        return date;
    });
}

function getFilter(value: string | null): Filter {
    if (value === "active" || value === "completed") {
        return value;
    }

    return "all";
}

export default function TodoApp() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const today = toISODate(new Date());

    const currentFilter = getFilter(
        searchParams.get("filter")
    );

    const searchFromUrl = searchParams.get("search") ?? "";
    const dateFromUrl = searchParams.get("date");

    const selectedDate = isValidDate(dateFromUrl)
        ? dateFromUrl
        : today;

    const [todos, setTodos] = useState<Todo[]>([]);
    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [input, setInput] = useState("");
    const [searchInput, setSearchInput] =
        useState(searchFromUrl);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const isAddingRef = useRef(false);

    const weekDates = useMemo(() => {
        const weekStart = getWeekStart(
            fromISODate(selectedDate)
        );

        return getWeekDates(weekStart);
    }, [selectedDate]);

    const weekRange = `${toISODate(
        weekDates[0]
    )} ~ ${toISODate(weekDates[6])}`;

    const loadTodos = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const filteredParams = new URLSearchParams();

            if (currentFilter !== "all") {
                filteredParams.set("filter", currentFilter);
            }

            if (searchFromUrl.trim()) {
                filteredParams.set(
                    "search",
                    searchFromUrl.trim()
                );
            }

            filteredParams.set("date", selectedDate);

            const filteredQuery = filteredParams.toString();

            const filteredUrl = filteredQuery
                ? `/api/todos?${filteredQuery}`
                : "/api/todos";

            const [filteredResponse, allResponse] =
                await Promise.all([
                    fetch(filteredUrl, {
                        method: "GET",
                        cache: "no-store",
                    }),
                    fetch("/api/todos", {
                        method: "GET",
                        cache: "no-store",
                    }),
                ]);

            if (!filteredResponse.ok) {
                throw new Error(
                    "필터링된 Todo를 불러오지 못했습니다."
                );
            }

            if (!allResponse.ok) {
                throw new Error(
                    "전체 Todo를 불러오지 못했습니다."
                );
            }

            const filteredData: Todo[] =
                await filteredResponse.json();

            const allData: Todo[] =
                await allResponse.json();

            setTodos(filteredData);
            setAllTodos(allData);
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Todo 목록을 불러오는 중 오류가 발생했습니다."
            );
        } finally {
            setIsLoading(false);
        }
    }, [
        currentFilter,
        searchFromUrl,
        selectedDate,
    ]);

    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    useEffect(() => {
        setSearchInput(searchFromUrl);
    }, [searchFromUrl]);

    const updateQuery = useCallback(
        (
            changes: QueryChanges,
            mode: "push" | "replace" = "push"
        ) => {
            const params = new URLSearchParams(
                searchParams.toString()
            );

            if (changes.filter !== undefined) {
                if (changes.filter === "all") {
                    params.delete("filter");
                } else {
                    params.set("filter", changes.filter);
                }
            }

            if (changes.search !== undefined) {
                const keyword = changes.search.trim();

                if (keyword) {
                    params.set("search", keyword);
                } else {
                    params.delete("search");
                }
            }

            if (changes.date !== undefined) {
                if (
                    !changes.date ||
                    changes.date === today
                ) {
                    params.delete("date");
                } else {
                    params.set("date", changes.date);
                }
            }

            const query = params.toString();

            const url = query
                ? `${pathname}?${query}`
                : pathname;

            if (mode === "replace") {
                router.replace(url, {
                    scroll: false,
                });
            } else {
                router.push(url, {
                    scroll: false,
                });
            }
        },
        [
            pathname,
            router,
            searchParams,
            today,
        ]
    );

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const keyword = searchInput.trim();

            if (keyword === searchFromUrl) {
                return;
            }

            updateQuery(
                {
                    search: keyword,
                },
                "replace"
            );
        }, 500);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [
        searchInput,
        searchFromUrl,
        updateQuery,
    ]);

    function countForDate(date: Date): number {
        const isoDate = toISODate(date);

        return allTodos.filter(
            (todo) => todo.date === isoDate
        ).length;
    }

    function moveWeek(amount: number) {
        const newSelectedDate =
            fromISODate(selectedDate);

        newSelectedDate.setDate(
            newSelectedDate.getDate() + amount
        );

        updateQuery({
            date: toISODate(newSelectedDate),
        });
    }

    async function handleAdd(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const title = input.trim();

        if (!title || isAddingRef.current) {
            return;
        }

        isAddingRef.current = true;
        setIsAdding(true);

        try {
            const response = await fetch("/api/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    completed: false,
                    date: selectedDate,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    "Todo 추가에 실패했습니다."
                );
            }

            setInput("");
            await loadTodos();
        } catch (error) {
            console.error(error);
            alert("Todo 추가 중 오류가 발생했습니다.");
        } finally {
            isAddingRef.current = false;
            setIsAdding(false);
        }
    }

    async function handleToggle(todo: Todo) {
        try {
            const response = await fetch(
                `/api/todos/${todo.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        completed: !todo.completed,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Todo 상태 변경에 실패했습니다."
                );
            }

            await loadTodos();
        } catch (error) {
            console.error(error);
            alert("Todo 상태 변경 중 오류가 발생했습니다.");
        }
    }

    async function handleDelete(todoId: number) {
        try {
            const response = await fetch(
                `/api/todos/${todoId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Todo 삭제에 실패했습니다."
                );
            }

            await loadTodos();
        } catch (error) {
            console.error(error);
            alert("Todo 삭제 중 오류가 발생했습니다.");
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#ede9f6] px-4 py-10">
            <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <h1 className="mb-6 text-center text-3xl font-bold italic text-[#5b35c5]">
                    Todo List
                </h1>

                <div className="mb-4 flex items-center justify-between px-1">
                    <button
                        type="button"
                        onClick={() => moveWeek(-7)}
                        className="text-lg font-bold text-[#5b35c5] transition-opacity hover:opacity-60"
                        aria-label="이전 주"
                    >
                        ◀
                    </button>

                    <span className="text-xs text-gray-400">
                        {weekRange}
                    </span>

                    <button
                        type="button"
                        onClick={() => moveWeek(7)}
                        className="text-lg font-bold text-[#5b35c5] transition-opacity hover:opacity-60"
                        aria-label="다음 주"
                    >
                        ▶
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-7 gap-1">
                    {weekDates.map((date, index) => {
                        const isoDate = toISODate(date);
                        const isSelected =
                            isoDate === selectedDate;

                        return (
                            <button
                                key={isoDate}
                                type="button"
                                onClick={() =>
                                    updateQuery({
                                        date: isoDate,
                                    })
                                }
                                className="flex flex-col items-center rounded-2xl px-1 py-2 transition-colors"
                                style={{
                                    backgroundColor: isSelected
                                        ? "#5b35c5"
                                        : "#ede9f6",
                                    color: isSelected
                                        ? "#ffffff"
                                        : "#5b35c5",
                                }}
                            >
                                <span className="mb-1 text-[11px]">
                                    {DAY_KO[index]}
                                </span>

                                <span className="text-lg font-bold leading-none">
                                    {date.getDate()}
                                </span>

                                <span className="mt-1 text-[11px]">
                                    {countForDate(date)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <form
                    onSubmit={handleAdd}
                    className="mb-3 flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(event) =>
                            setInput(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key === "Enter" &&
                                event.nativeEvent.isComposing
                            ) {
                                event.preventDefault();
                            }
                        }}
                        placeholder="할 일을 입력하세요"
                        disabled={isAdding}
                        className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[#5b35c5] disabled:bg-gray-50"
                    />

                    <button
                        type="submit"
                        disabled={
                            isAdding || !input.trim()
                        }
                        className="rounded-full bg-[#5b35c5] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isAdding ? "추가 중..." : "추가"}
                    </button>
                </form>

                <div className="relative mb-4">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        🔍
                    </span>

                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        placeholder="검색어를 입력하세요"
                        className="w-full rounded-full border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#5b35c5]"
                    />
                </div>

                <div className="mb-5 flex gap-2">
                    {(
                        [
                            "all",
                            "active",
                            "completed",
                        ] as Filter[]
                    ).map((filterName) => (
                        <button
                            key={filterName}
                            type="button"
                            onClick={() =>
                                updateQuery({
                                    filter: filterName,
                                })
                            }
                            className="flex-1 rounded-full py-2 text-sm font-medium transition-colors"
                            style={{
                                backgroundColor:
                                    currentFilter === filterName
                                        ? "#5b35c5"
                                        : "#ede9f6",
                                color:
                                    currentFilter === filterName
                                        ? "#ffffff"
                                        : "#5b35c5",
                            }}
                        >
                            {FILTER_LABELS[filterName]}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <p className="py-8 text-center text-sm text-gray-400">
                        Todo를 불러오는 중입니다...
                    </p>
                ) : errorMessage ? (
                    <p className="py-8 text-center text-sm text-rose-500">
                        {errorMessage}
                    </p>
                ) : todos.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-400">
                        {searchFromUrl
                            ? `"${searchFromUrl}"에 해당하는 Todo가 없습니다.`
                            : "할 일이 없습니다. 추가해보세요!"}
                    </p>
                ) : (
                    <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
                        {todos.map((todo) => (
                            <li
                                key={todo.id}
                                className="flex items-center gap-3 rounded-xl bg-[#f5f3ff] p-3"
                            >
                                <button
                                    type="button"
                                    aria-label="완료 상태 변경"
                                    onClick={() =>
                                        handleToggle(todo)
                                    }
                                    className="h-5 w-5 flex-shrink-0 rounded-full border-2 transition-colors"
                                    style={{
                                        backgroundColor:
                                            todo.completed
                                                ? "#5b35c5"
                                                : "transparent",
                                        borderColor:
                                            todo.completed
                                                ? "#5b35c5"
                                                : "#a78bfa",
                                    }}
                                />

                                <span
                                    className={`min-w-0 flex-1 truncate text-sm ${todo.completed
                                        ? "text-gray-400 line-through"
                                        : "text-gray-700"
                                        }`}
                                >
                                    {todo.title}
                                </span>

                                <Link
                                    href={`/todos/${todo.id}`}
                                    aria-label="Todo 수정"
                                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#ede9f6] text-xs text-[#5b35c5] transition-opacity hover:opacity-70"
                                >
                                    ✎
                                </Link>

                                <button
                                    type="button"
                                    aria-label="Todo 삭제"
                                    onClick={() =>
                                        handleDelete(todo.id)
                                    }
                                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-rose-500 transition-opacity hover:opacity-70"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}