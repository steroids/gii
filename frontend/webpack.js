require('../../react/webpack')
    .config({
        sourcePath: __dirname,
        staticPath: '',
        baseUrl: '',
        webpack: {
            resolve: {
                alias: {
                    '@steroids2/core': __dirname + '/../../react',
                    '@steroids2/bootstrap': __dirname + '/../../react-bootstrap',
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
