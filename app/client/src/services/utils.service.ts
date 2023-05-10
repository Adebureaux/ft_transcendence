
function getRelativeDate(cdate: Date): string {
  function floorStr(n: number) {
    return (n < 10 ? "0" : "") + n;
  }
  const now = new Date();
  if (now.getDate() - cdate.getDate() == 0)
    return (
      "Today at " +
      floorStr(cdate.getHours()) +
      ":" +
      floorStr(cdate.getMinutes())
    );
  else if (now.getDate() - cdate.getDate() == 1)
    return (
      "Yesterday at " +
      floorStr(cdate.getHours()) +
      ":" +
      floorStr(cdate.getMinutes())
    );
  else if (now.getDate() - cdate.getDate() == -1)
    return (
      "Tomorrow at " +
      floorStr(cdate.getHours()) +
      ":" +
      floorStr(cdate.getMinutes())
    );
  else {
    const d = cdate.getDate();
    const m = cdate.getMonth() + 1;
    return (
      floorStr(d) +
      "/" +
      floorStr(m) +
      "/" +
      cdate.getFullYear() +
      " " +
      floorStr(cdate.getHours()) +
      ":" +
      floorStr(cdate.getMinutes())
    );
  }
}

function usernameToColor(str: string): string {
  var hash = 42;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
}
export default { usernameToColor, getRelativeDate };
