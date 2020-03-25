const utils = require('../../react/webpack/utils');

require('../../react/webpack')
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
        devServer: {
            proxy: [
                {
                    context: ['/api'],
                    target: process.env.APP_BACKEND_URL || 'http://steroids.loc',
                    changeOrigin: true,
                },
            ],
        },
    })
    .base(__dirname + '/index.js');
