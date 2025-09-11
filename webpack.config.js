const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');
const nodeExternals = require('webpack-node-externals');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const shouldObfuscate = env && env.obfuscate;
    const shouldAnalyze = env && env.analyze;
    const preserveStructure = env && env.preserve;

    const getEntryPoints = () => {
        if (!preserveStructure) {
            return './src/server.js';
        }
        const entries = {};
        const files = glob.sync('src/**/*.js', {
            ignore: ['**/node_modules/**', 'src/router/**/*.js'] // routers não entram como entry
        });
        files.forEach(file => {
            const name = file
                .replace(/\\/g, '/')
                .replace('src/', '')
                .replace('.js', '');
            entries[name] = './' + file.replace(/\\/g, '/');
        });
        console.log('Entry points encontrados:', entries);
        return entries;
    };

    const config = {
        target: 'node',
        mode: isProduction ? 'production' : 'development',
        entry: getEntryPoints(),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: preserveStructure ? '[name].js' : 'server.bundle.js',
            clean: true,
            ...(preserveStructure && {
                library: {
                    type: 'commonjs2'
                }
            })
        },
        externals: [nodeExternals({
            allowlist: preserveStructure ? [] : ['zod', 'axios']
        })],
        resolve: {
            extensions: ['.js', '.json'],
            preferRelative: true,
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@config': path.resolve(__dirname, 'src/config'),
                '@controller': path.resolve(__dirname, 'src/controller'),
                '@database': path.resolve(__dirname, 'src/database'),
                '@helpers': path.resolve(__dirname, 'src/helpers'),
                '@lib': path.resolve(__dirname, 'src/lib'),
                '@middleware': path.resolve(__dirname, 'src/middleware'),
                '@model': path.resolve(__dirname, 'src/model'),
                '@router': path.resolve(__dirname, 'src/router'),
                '@service': path.resolve(__dirname, 'src/service'),
                '@utils': path.resolve(__dirname, 'src/utils')
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: [
                        /node_modules/,
                        path.resolve(__dirname, 'src/router') // <- router nunca passa pelo babel
                    ],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            comments: false,
                            presets: [
                                ['@babel/preset-env', {
                                    targets: { node: '18' },
                                    modules: preserveStructure ? 'commonjs' : 'auto'
                                }]
                            ],
                            plugins: preserveStructure ? [
                                '@babel/plugin-transform-modules-commonjs'
                            ] : []
                        }
                    }
                }
            ]
        },
        plugins: [
            // Copia os routers sem alterar (mantém comentários JSDoc)
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src/router'),
                        to: path.resolve(__dirname, 'dist/router'),
                        noErrorOnMissing: true
                    }
                ]
            }),

            ...(shouldObfuscate ? [
                new JavaScriptObfuscator({
                    rotateStringArray: true,
                    stringArray: true,
                    stringArrayEncoding: ['base64'],
                    stringArrayThreshold: 0.8,
                    unicodeEscapeSequence: false,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 0.75,
                    transformObjectKeys: true,
                    splitStrings: true,
                    splitStringsChunkLength: 10,
                    renameGlobals: false,
                    compact: true,
                    selfDefending: true,
                    debugProtection: false
                }, ['**/node_modules/**/*'])
            ] : []),

            ...(shouldAnalyze ? [
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    openAnalyzer: true,
                    reportFilename: preserveStructure ? 'structure-report.html' : 'bundle-report.html'
                })
            ] : [])
        ],
        optimization: {
            minimize: isProduction && !preserveStructure,
            nodeEnv: isProduction ? 'production' : 'development',
            ...(preserveStructure && {
                splitChunks: false,
                runtimeChunk: false,
                minimize: false
            }),
            minimizer: [
                new TerserPlugin({
                    exclude: /router/, 
                    extractComments: false,
                })
            ]
        },
        stats: {
            colors: true,
            chunks: false,
            modules: false,
            children: preserveStructure,
            assets: true,
            errorDetails: true
        },
        devtool: isProduction ? false : 'source-map',
        ...(preserveStructure && {
            node: {
                __dirname: false,
                __filename: false
            }
        })
    };

    return config;
};
