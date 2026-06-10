// 전체 / 진행 중 / 완료 버튼을 렌더링하는 컴포넌트
// currentFilter: 현재 선택된 필터 상태
// setCurrentFilter: 필터 상태를 변경하는 함수

function FilterTabs({ currentFilter, setCurrentFilter }) {
    const filters = [
        { value: "all", label: "전체" },
        { value: "active", label: "진행 중" },
        { value: "completed", label: "완료" },
    ]

    return (
        <div className="grid grid-cols-3 gap-3 mb-8">
            {filters.map((filter) => {
                const isSelected = currentFilter === filter.value

                return (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setCurrentFilter(filter.value)}
                        className={`h-[46px] rounded-[22px] text-sm font-bold transition ${isSelected
                                ? "bg-[#672be0] text-white shadow-md"
                                : "bg-[#f0eafc] text-[#b99df3]"
                            }`}
                    >
                        {filter.label}
                    </button>
                )
            })}
        </div>
    )
}

export default FilterTabs