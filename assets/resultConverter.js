function lunarDayConverter(result){
    return result.map(item => Object.assign({}, item, {start: item.start, end: item.end}))
}

function allLunarDayInMonthConverter(result){
    return result.map(item => (Object.assign(item)))
}