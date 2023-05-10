function floorStr(n: number) {
    return (n < 10 ? "0" : "") + n;
}

export function getRelativeDate(cdate: Date): string {
    const now = new Date();

    if (now.getDate() - cdate.getDate() == 0) return "Today at " + floorStr(cdate.getHours()) + ":" + floorStr(cdate.getMinutes());
    else if (now.getDate() - cdate.getDate() == 1) return "Yesterday at " + floorStr(cdate.getHours()) + ":" + floorStr(cdate.getMinutes());
    else if (now.getDate() - cdate.getDate() == -1) return "Tomorrow at " + floorStr(cdate.getHours()) + ":" + floorStr(cdate.getMinutes());
    else {
        const d = cdate.getDate();
        const m = cdate.getMonth() + 1;
        return floorStr(d) + "/" + floorStr(m) + "/" + cdate.getFullYear() + " " + floorStr(cdate.getHours()) + ":" + floorStr(cdate.getMinutes());
    }
}
