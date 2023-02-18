
export function wait(ms = 1000){
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function round(inputNum, decimalPlaces = 0){
    return Math.round((inputNum + Number.EPSILON) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}