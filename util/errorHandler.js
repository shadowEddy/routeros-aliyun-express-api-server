const getTime = require("./getTime");

module.exports = () => {
    return (err, req, res, next) => {
        console.log(getTime(), err.message)
        res.status(200).send("2");
    }
}