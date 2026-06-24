"use client";

type ErrorPageProps = {
    error: Error;
    reset: () => void;
};

export default function ErrorPage({
    error,
    reset,
}: ErrorPageProps) {
    return (
        <main>
            <h2>Todo를 불러오지 못했습니다.</h2>
            <p>{error.message}</p>

            <button type="button" onClick={reset}>
                다시 시도
            </button>
        </main>
    );
}