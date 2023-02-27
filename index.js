const http = require('http');

const { default: axios } = require('axios');

const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer((req, res) => {

    if (req.method === "POST") {
        let addr = new URLSearchParams(req.url);//new URL(req.url);
        const token = addr.get("/?token")
        const logLocation = addr.get("logLocation") == null ? process.env.LOG_LOCATION : addr.get("logLocation");

        if (token != process.env.AUTH_TOKEN) {
            return defaultResponse();
        }
        const size = parseInt(req.headers['content-length'], 10)
        const buffer = Buffer.allocUnsafe(size)
        var pos = 0

        req
            .on('data', (chunk) => {
                const offset = pos + chunk.length
                if (offset > size) {
                    reject(413, 'Too Large', res)
                    return
                }
                chunk.copy(buffer, pos)
                pos = offset
            })
            .on('end', () => {
                if (pos !== size) {
                    reject(400, 'Bad Request', res)
                    return
                }
                const data = buffer.toString();

                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + logLocation,
                    'Agent': 'Agent'
                };
                axios.post('https://in.logtail.com/', data, { headers: headers })
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

                console.log('User Posted: ', data)
                res.setHeader('Content-Type', 'application/json;charset=utf-8');
                res.end('You Posted: ' + data)
            })

    } else {
        return defaultResponse();
    }

    function defaultResponse() {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello World');
    }
}
);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
