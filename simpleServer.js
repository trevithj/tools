// Serves static files relative to this file.
import http from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';

const PORT = process.argv[2] || 8888;

const contentTypesByExtension = {
    '.html': 'text/html',
    '.svg': 'image/svg+xml',
    '.css': 'text/css',
    '.js': 'text/javascript'
};

const writeError = (response, status, lines) => {
    response.writeHead(status, {'Content-Type': 'text/plain'});
    lines.forEach(line => {
        response.write(line);
    })
    response.end();
}

function isRealPath(filePath) {
    try {
        const realPath = fs.realpathSync.native(filePath);
        const status = realPath === filePath ? 1 : 0;
        return { realPath, filePath, status };
    } catch (err) {
        console.log(err.message);
        return { filePath, status:-1 }; // no such file
    }
}


const handleGet = (request, response) => {
    const uri = url.parse(request.url).pathname;
    let filename = path.join(process.cwd(), uri);
    const pathCheck = isRealPath(filename);
    switch (pathCheck.status) {
        case -1: // no filename found
            return writeError(response, 404, [
                '404 Not Found\n',
                `filename: ${filename}\nuri: ${uri}\n`,
                `status: ${response.statusCode} ${response.statusMessage}\n`,
                `method: ${request.method}\n`
            ]);
        case 0: // case doesn't match
        return writeError(response, 404, [
            '404 Not Found - wrong case?\n',
            `filename: ${filename}\nuri: ${uri}\n`,
            `expected: ${pathCheck.realPath}\n`,
            `status: ${response.statusCode} ${response.statusMessage}.\n`,
            `method: ${request.method}\n`
        ]);
        default: // okay, carry on.
    }

    if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
    }

    fs.readFile(filename, 'binary', function (err, file) {
        if (err) {
            return writeError(response, 500, [err + '\n']);
        }

        var headers = {};
        var contentType = contentTypesByExtension[path.extname(filename)];
        if (contentType) headers['Content-Type'] = contentType;
        response.writeHead(200, headers);
        response.write(file, 'binary');
        response.end();
    });
}

//Connect and serve...
// request: https://nodejs.org/api/http.html#http_class_http_incomingmessage
// response: https://nodejs.org/api/http.html#http_class_http_serverresponse
http
    .createServer(function (request, response) {
        const {method} = request;
        switch (method) {
            case "GET": return handleGet(request, response);
            //			case "POST": return handlePost(request, response);
            default: return writeError(response, 404, ['Not implemented yet.', method]);
        }
    })
    .listen(parseInt(PORT, 10));

console.log(`
Static file server running at
  => http://localhost:${PORT}
CTRL + C to shutdown`);
