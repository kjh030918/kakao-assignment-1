function WeekHeader({ weekStartDate, weekEndDate, onPreviousWeek, onNextWeek }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <button
                type="button"
                onClick={onPreviousWeek}
                className="text-[#672be0] text-xl font-bold px-2"
            >
                ◀
            </button>

            <p className="text-sm font-bold text-gray-400">
                {weekStartDate} ~ {weekEndDate}
            </p>

            <button
                type="button"
                onClick={onNextWeek}
                className="text-[#672be0] text-xl font-bold px-2"
            >
                ▶
            </button>
        </div>
    )
}

export default WeekHeader