function WeekDays({
    weekDates,
    selectedDate,
    todayDate,
    onSelectDate,
    getTodoCountByDate,
}) {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

    return (
        <div className="grid grid-cols-7 gap-2 mb-7">
            {weekDates.map((dateString) => {
                const date = new Date(`${dateString}T00:00:00`)
                const dayName = dayNames[date.getDay()]
                const day = date.getDate()
                const todoCount = getTodoCountByDate(dateString)

                const isSelected = selectedDate === dateString
                const isToday = todayDate === dateString

                const cardClass = isSelected
                    ? "bg-[#672be0] text-white shadow-lg"
                    : isToday
                        ? "bg-[#efe8ff] text-[#672be0]"
                        : "bg-transparent text-gray-400"

                return (
                    <button
                        key={dateString}
                        type="button"
                        onClick={() => onSelectDate(dateString)}
                        className={`h-[72px] rounded-[18px] flex flex-col items-center justify-center transition ${cardClass}`}
                    >
                        <span className={`text-xs font-bold ${isSelected ? "text-white" : ""}`}>
                            {dayName}
                        </span>
                        <span className={`text-sm font-bold leading-6 ${isSelected ? "text-white" : "text-gray-500"}`}>
                            {day}
                        </span>
                        <span className={`text-xs ${isSelected ? "text-white/80" : "text-gray-300"}`}>
                            {todoCount}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default WeekDays