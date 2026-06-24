import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL;

function getBackendUrl(): string {
    if (!API_URL) {
        throw new Error("BACKEND_API_URL이 설정되지 않았습니다.");
    }

    return API_URL.replace(/\/$/, "");
}

async function getResponseData(response: Response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            detail: text,
        };
    }
}

export async function GET(request: NextRequest) {
    try {
        const backendUrl = new URL(
            `${getBackendUrl()}/todos`
        );

        // 브라우저에서 받은 filter, search, date를 FastAPI에 전달
        request.nextUrl.searchParams.forEach((value, key) => {
            backendUrl.searchParams.append(key, value);
        });

        const response = await fetch(backendUrl, {
            method: "GET",
            cache: "no-store",
        });

        const data = await getResponseData(response);

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                detail: "Todo 목록을 불러오지 못했습니다.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(
            `${getBackendUrl()}/todos`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                cache: "no-store",
            }
        );

        const data = await getResponseData(response);

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                detail: "Todo 추가에 실패했습니다.",
            },
            {
                status: 500,
            }
        );
    }
}