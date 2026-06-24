import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL;

type RouteContext = {
  params: Promise<{
    todoId: string;
  }>;
};

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
    return { detail: text };
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { todoId } = await context.params;
    const body = await request.json();

    const response = await fetch(
      `${getBackendUrl()}/todos/${todoId}`,
      {
        method: "PUT",
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
      { detail: "Todo 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { todoId } = await context.params;

    const response = await fetch(
      `${getBackendUrl()}/todos/${todoId}`,
      {
        method: "DELETE",
        cache: "no-store",
      }
    );

    if (response.status === 204) {
      return new Response(null, {
        status: 204,
      });
    }

    const data = await getResponseData(response);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { detail: "Todo 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
