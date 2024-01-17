// get current time
const getTime = () => {
    const now = new Date();
    const localTime = now.getTime();
    const localOffset = now.getTimezoneOffset() * 60000;
    const utc = localTime + localOffset;
    const offset = 8;
    const calctime = utc + (3600000 * offset);
    const calcDate = new Date(calctime);
    return calcDate.toLocaleString();
}

module.exports = getTime;