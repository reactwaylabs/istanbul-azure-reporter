export function getClassNameByPercentage(value: number): string {
    if (value > 50) {
        return "high";
    }
    if (value === 50) {
        return "medium";
    }
    if (value >= 0 && value < 50) {
        return "low";
    }

    return "";
}
