const http = require('http');

const server = http.createServer((req , res) => {
    const { url , method , headers } = req
    const body = []
    req.on("data" , chunk => body.push(chunk))
    console.log(body);
    console.log(`URL : ${url}
    Method : ${method}
    Headers : ${headers}
    `);
})

const PORT = process.env.PORT || 3000
server.listen(PORT , () => {console.log(`server running on port ${PORT}`)})