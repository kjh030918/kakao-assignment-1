## 1. `backend/main.py`

from collections.abc import Generator
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


DATABASE_URL = "sqlite:///./todos.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


class TodoModel(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    date: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )


Base.metadata.create_all(bind=engine)


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    completed: bool = False
    date: str | None = None


class TodoUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    completed: bool | None = None
    date: str | None = None


class TodoResponse(BaseModel):
    id: int
    title: str
    completed: bool
    date: str | None

    model_config = ConfigDict(from_attributes=True)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/todos", response_model=list[TodoResponse])
def get_todos(
    status_filter: Literal["active", "completed"] | None = Query(
        default=None,
        alias="filter",
    ),
    search: str | None = Query(
        default=None,
        max_length=100,
    ),
    date: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(TodoModel)

    # 진행 중 / 완료 상태 필터링
    if status_filter == "active":
        query = query.filter(TodoModel.completed.is_(False))

    if status_filter == "completed":
        query = query.filter(TodoModel.completed.is_(True))

    # 제목 검색
    if search and search.strip():
        keyword = search.strip()

        query = query.filter(
            TodoModel.title.ilike(f"%{keyword}%")
        )

    # 선택한 날짜 필터링
    if date:
        query = query.filter(TodoModel.date == date)

    return query.order_by(TodoModel.id.desc()).all()


@app.get("/todos/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    db: Session = Depends(get_db),
):
    todo = db.get(TodoModel, todo_id)

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo를 찾을 수 없습니다.",
        )

    return todo


@app.post(
    "/todos",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_todo(
    todo_data: TodoCreate,
    db: Session = Depends(get_db),
):
    title = todo_data.title.strip()

    if not title:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Todo 제목을 입력해주세요.",
        )

    todo = TodoModel(
        title=title,
        completed=todo_data.completed,
        date=todo_data.date,
    )

    db.add(todo)
    db.commit()
    db.refresh(todo)

    return todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    db: Session = Depends(get_db),
):
    todo = db.get(TodoModel, todo_id)

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo를 찾을 수 없습니다.",
        )

    update_data = todo_data.model_dump(exclude_unset=True)

    if "title" in update_data:
        title = update_data["title"].strip()

        if not title:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Todo 제목을 입력해주세요.",
            )

        update_data["title"] = title

    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)

    return todo


@app.delete(
    "/todos/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
):
    todo = db.get(TodoModel, todo_id)

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo를 찾을 수 없습니다.",
        )

    db.delete(todo)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

