const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {BaseHrefWebpackPlugin} = require('base-href-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode !== 'production';//process.env.NODE_ENV !== 'production';
    
    return {
        entry: {
            main: './admin_src/index.tsx',
        },
        output: {
            filename: '[name].js',
            //chunkFilename: '[name].js',
            path: path.resolve(__dirname, 'admin_dist'),
            publicPath: '/'
        },
        watch: isDevelopment,
        watchOptions: !isDevelopment ? undefined : {
              poll: true,
              ignored: /node_modules/
        },
        mode: isDevelopment ? 'development' : 'production',
        devtool: isDevelopment && "source-map",
        devServer: {
            historyApiFallback: true,
            port: 4000,
            open: true
        },
        resolve: {
            extensions: ['.js', '.json', '.ts', '.tsx'],
        },

        /*optimization: isDevelopment ? undefined : {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        output: {
                            comments: false
                        },
                        //ie8: false,
                        //toplevel: true
                    }
                })
            ]
        },*/
        optimization: isDevelopment ? undefined : {
            minimize: true,
            /*minimizer: [
                new UglifyJsPlugin({
                    exclude: 'sw.js',
                    uglifyOptions: {
                        output: {
                            comments: false
                        },
                        ie8: false,
                        toplevel: true
                    }
                })
            ],*/
            /*splitChunks: {
                //chunks: 'all',
                automaticNameDelimiter: '-',

                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.s?css$/,
                        chunks: 'all',
                        // minChunks: 1,
                        priority: -1,
                        reuseExistingChunk: true,
                        enforce: true,
                    }
                }
            }*/
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: 'awesome-typescript-loader',
                },
                { 
                    test: /\.handlebars$/, 
                    loader: "handlebars-loader" 
                },
                {
                    test: /\.(scss|css)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: isDevelopment,
                                //minimize: !isDevelopment //removed due to error source
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                autoprefixer: {
                                    browsers: 'last 2 versions, > 1%'
                                },
                                sourceMap: isDevelopment,
                                plugins: () => [
                                    autoprefixer
                                ]
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: isDevelopment
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ttf)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'static/',
                                useRelativePath: true,
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                              mozjpeg: {
                                progressive: true,
                                quality: 90
                              },
                              optipng: {
                                enabled: true,
                              },
                              pngquant: {
                                quality: '80-90',
                                speed: 4
                              },
                              gifsicle: {
                                interlaced: false,
                              },
                              /*webp: {
                                quality: 75
                              }*/
                            }
                        }
                    ]
                }
            ],
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name]-styles.css",
                chunkFilename: "[id].css"
            }),
            new HtmlWebpackPlugin({
                //inject: 'head',
                baseUrl:  'http://localhost:4000/',
                hash: isDevelopment,
                //favicon: './src/img/favicon.png',
                title: 'Aelios admin panel',
                minify: !isDevelopment,
                template: './admin_src/index.html',
                filename: 'index.html'
            }),
            new BaseHrefWebpackPlugin({ baseHref: '/' })
        ]
    };
};
