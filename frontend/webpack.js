require('../../react-webpack')
    .config({
        port: 9992,
        sourcePath: __dirname,
        outputPath: __dirname + '/../assets',
        staticPath: '',
        baseUrl: '',
        webpack: {
            resolve: {
                alias: {
                    '@steroidsjs/core': __dirname + '/../../react',
                    '@steroidsjs/bootstrap': __dirname + '/../../react-bootstrap',
                },
            },
        },
    })
    .base(__dirname + '/index.ts');
