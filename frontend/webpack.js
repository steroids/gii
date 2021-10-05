require('../../react-webpack')
    .config({
        port: 9992,
        sourcePath: __dirname,
        // outputPath: __dirname + '/../assets',
        webpack: {
            resolve: {
                alias: {
                    '@steroidsjs/core': __dirname + '/../../react/src',
                    '@steroidsjs/bootstrap': __dirname + '/../../react-bootstrap/src',
                },
            },
        },
    })
    .base(__dirname + '/index.tsx');
