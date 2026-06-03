// HTML 요소 가져오기
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const message = document.querySelector("#message");

const weekRangeText = document.querySelector("#week-range-text");
const weekDays = document.querySelector("#week-days");
const prevWeekButton = document.querySelector("#prev-week-button");
const nextWeekButton = document.querySelector("#next-week-button");

const filterButtons = document.querySelectorAll(".filter-button");

// localStorage에 저장할 때 사용할 key 이름
const STORAGE_KEY = "todo-list";

// Todo 데이터를 저장할 배열
let todos = [];

// 현재 선택된 필터 상태
// all: 전체, active: 진행 중, completed: 완료
let currentFilter = "all";

// 현재 화면에 보여줄 주차 기준 날짜
let currentWeekDate = new Date();

// 현재 선택된 날짜
// 처음에는 오늘 날짜를 선택된 상태로 시작
let selectedDateKey = getDateKey(new Date());

// localStorage에 Todo 배열을 저장하는 함수
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// localStorage에서 Todo 배열을 불러오는 함수
function loadTodos() {
    const savedTodos = localStorage.getItem(STORAGE_KEY);

    if (savedTodos === null) {
        return [];
    }

    try {
        const parsedTodos = JSON.parse(savedTodos);

        if (Array.isArray(parsedTodos)) {
            return parsedTodos;
        }

        return [];
    } catch (error) {
        console.error("Todo 데이터를 불러오는 중 오류가 발생했습니다.", error);
        return [];
    }
}

// 날짜를 YYYY-MM-DD 형태의 문자열로 변환하는 함수
function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// 선택된 날짜가 포함된 주의 월요일을 구하는 함수
function getMonday(date) {
    const copiedDate = new Date(date);
    const day = copiedDate.getDay();

    // JS에서 일요일은 0이므로 월요일 기준으로 보정
    const diff = day === 0 ? -6 : 1 - day;

    copiedDate.setDate(copiedDate.getDate() + diff);

    return copiedDate;
}

// 기준 날짜가 포함된 주의 월요일부터 일요일까지 배열로 만드는 함수
function getWeekDates(date) {
    const monday = getMonday(date);
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
        const weekDate = new Date(monday);
        weekDate.setDate(monday.getDate() + i);
        weekDates.push(weekDate);
    }

    return weekDates;
}

// 주간 범위 텍스트를 YYYY-MM-DD ~ YYYY-MM-DD 형태로 표시하는 함수
function renderWeekRange() {
    const weekDates = getWeekDates(currentWeekDate);
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    weekRangeText.textContent = `${getDateKey(startDate)} ~ ${getDateKey(endDate)}`;
}

// 특정 날짜에 Todo가 몇 개 있는지 계산하는 함수
function getTodoCountByDate(date) {
    const dateKey = getDateKey(date);

    return todos.filter(function (todo) {
        return todo.date === dateKey;
    }).length;
}

// 이번 주 월요일부터 일요일까지 날짜 카드를 렌더링하는 함수
function renderWeekDays() {
    weekDays.innerHTML = "";

    const weekDates = getWeekDates(currentWeekDate);
    const dayNames = ["월", "화", "수", "목", "금", "토", "일"];
    const todayKey = getDateKey(new Date());

    weekDates.forEach(function (date, index) {
        const dateKey = getDateKey(date);
        const todoCount = getTodoCountByDate(date);

        const dayCard = document.createElement("button");
        dayCard.type = "button";
        dayCard.classList.add("day-card");

        // 오늘 날짜는 선택 여부와 상관없이 연보라색으로 미리 표시
        if (dateKey === todayKey) {
            dayCard.classList.add("today");
        }

        // 선택된 날짜가 오늘이면 꽉 찬 보라색
        if (dateKey === selectedDateKey && dateKey === todayKey) {
            dayCard.classList.add("selected-today");
        }

        // 선택된 날짜가 오늘이 아닌 다른 날짜면 보라색 테두리만 표시
        if (dateKey === selectedDateKey && dateKey !== todayKey) {
            dayCard.classList.add("selected-other");
        }

        dayCard.innerHTML = `
      <span class="day-name">${dayNames[index]}</span>
      <span class="day-number">${date.getDate()}</span>
      <span class="todo-count">${todoCount}</span>
    `;

        dayCard.addEventListener("click", function () {
            selectedDateKey = dateKey;
            showMessage("");
            renderTodos();
        });

        weekDays.appendChild(dayCard);
    });
}

// Todo 생성 함수
function createTodo(text) {
    return {
        id: Date.now(),
        text: text,
        completed: false,
        date: selectedDateKey,
    };
}

// 안내 메시지를 표시하는 함수
function showMessage(text) {
    message.textContent = text;
}

// 입력창을 초기화하는 함수
function clearInput() {
    todoInput.value = "";
    todoInput.focus();
}

// 현재 선택된 날짜와 필터 상태에 맞는 Todo만 반환하는 함수
function getFilteredTodos() {
    // 주차 이동 후 날짜를 아직 선택하지 않은 경우 Todo를 보여주지 않음
    if (selectedDateKey === null) {
        return [];
    }

    const todosByDate = todos.filter(function (todo) {
        return todo.date === selectedDateKey;
    });

    if (currentFilter === "active") {
        return todosByDate.filter(function (todo) {
            return todo.completed === false;
        });
    }

    if (currentFilter === "completed") {
        return todosByDate.filter(function (todo) {
            return todo.completed === true;
        });
    }

    return todosByDate;
}

// 현재 선택된 필터 버튼에 active 클래스를 적용하는 함수
function updateFilterButtonStyle() {
    filterButtons.forEach(function (button) {
        const buttonFilter = button.dataset.filter;

        if (buttonFilter === currentFilter) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

// Todo 목록을 화면에 다시 그리는 함수
function renderTodos() {
    todoList.innerHTML = "";

    const filteredTodos = getFilteredTodos();

    filteredTodos.forEach(function (todo) {
        const todoItem = document.createElement("li");
        todoItem.classList.add("todo-item");

        if (todo.completed) {
            todoItem.classList.add("completed");
        }

        const todoText = document.createElement("span");
        todoText.classList.add("todo-text");
        todoText.textContent = todo.text;

        const actionWrapper = document.createElement("div");
        actionWrapper.classList.add("todo-actions");

        const completeButton = document.createElement("button");
        completeButton.textContent = todo.completed ? "취소" : "완료";
        completeButton.addEventListener("click", function () {
            toggleTodo(todo.id);
        });

        const editButton = document.createElement("button");
        editButton.textContent = "수정";
        editButton.addEventListener("click", function () {
            updateTodo(todo.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.addEventListener("click", function () {
            deleteTodo(todo.id);
        });

        actionWrapper.appendChild(completeButton);
        actionWrapper.appendChild(editButton);
        actionWrapper.appendChild(deleteButton);

        todoItem.appendChild(todoText);
        todoItem.appendChild(actionWrapper);

        todoList.appendChild(todoItem);
    });

    updateFilterButtonStyle();
    renderWeekRange();
    renderWeekDays();
}

// Todo 추가 함수
function addTodo(event) {
    event.preventDefault();

    const inputValue = todoInput.value.trim();

    if (inputValue === "") {
        showMessage("할 일을 입력해주세요.");
        return;
    }

    if (selectedDateKey === null) {
        showMessage("날짜를 먼저 선택해주세요.");
        return;
    }

    const newTodo = createTodo(inputValue);
    todos.push(newTodo);

    saveTodos();
    showMessage("");
    clearInput();
    renderTodos();
}

// Todo 완료 상태 변경 함수
function toggleTodo(id) {
    todos = todos.map(function (todo) {
        if (todo.id === id) {
            return {
                ...todo,
                completed: !todo.completed,
            };
        }

        return todo;
    });

    saveTodos();
    renderTodos();
}

// Todo 수정 함수
function updateTodo(id) {
    const targetTodo = todos.find(function (todo) {
        return todo.id === id;
    });

    if (!targetTodo) {
        return;
    }

    const updatedText = prompt("수정할 내용을 입력하세요.", targetTodo.text);

    if (updatedText === null) {
        return;
    }

    const trimmedText = updatedText.trim();

    if (trimmedText === "") {
        showMessage("수정할 내용을 입력해주세요.");
        return;
    }

    todos = todos.map(function (todo) {
        if (todo.id === id) {
            return {
                ...todo,
                text: trimmedText,
            };
        }

        return todo;
    });

    saveTodos();
    showMessage("");
    renderTodos();
}

// Todo 삭제 함수
function deleteTodo(id) {
    todos = todos.filter(function (todo) {
        return todo.id !== id;
    });

    saveTodos();
    renderTodos();
}

// 필터 변경 함수
function changeFilter(event) {
    currentFilter = event.target.dataset.filter;
    renderTodos();
}

// 주차 이동 함수
function changeWeek(weekAmount) {
    currentWeekDate.setDate(currentWeekDate.getDate() + weekAmount * 7);

    // 주차를 이동하면 날짜 선택 상태를 초기화
    selectedDateKey = null;

    showMessage("");
    renderTodos();
}

// Todo 추가 이벤트
todoForm.addEventListener("submit", addTodo);

// 필터 버튼 이벤트
filterButtons.forEach(function (button) {
    button.addEventListener("click", changeFilter);
});

// 이전 주 버튼 이벤트
prevWeekButton.addEventListener("click", function () {
    changeWeek(-1);
});

// 다음 주 버튼 이벤트
nextWeekButton.addEventListener("click", function () {
    changeWeek(1);
});

// 페이지가 처음 열렸을 때 localStorage에서 Todo 데이터를 불러온 뒤 화면 렌더링
todos = loadTodos();
renderTodos();