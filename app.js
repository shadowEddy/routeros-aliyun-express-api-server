const express = require("express");
const app = express();
const api = require("./api");
const { errorHandler, getTime } = require("./util")
const PORT = 6180;

app.use(express.json());

app.use("/", api);
app.use(errorHandler());

app.listen(PORT, () => {
    console.log(getTime(), `Aliyun DDNS api server is listening at http://localhost:${PORT}`)
})