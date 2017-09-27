const webpack = require("webpack");
const { join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const autoprefixer = require("autoprefixer");

const PATHS = {
  build: join(__dirname, "build"),
  clients: join(__dirname, "clients"),
  config: join(__dirname, "clients/config/config.jsx"),
  configTemplate: join(__dirname, "clients/config/config.html"),
  liveConfig: join(__dirname, "clients/live_config/live_config.jsx"),
  liveConfigTemplate: join(__dirname, "clients/live_config/live_config.html"),
  viewer: join(__dirname, "clients/viewer/viewer.jsx"),
  viewerTemplate: join(__dirname, "clients/viewer/viewer.html")
};

const extractCSS = new ExtractTextPlugin({
  filename: "[name].[hash:6].css"
});

module.exports = env => {
  const config = {
    entry: {
      viewer: PATHS.viewer,
      liveConfig: PATHS.liveConfig,
      config: PATHS.config
    },

    output: {
      path: PATHS.build,
      filename: "[name].[hash:6].js"
    },

    resolve: {
      extensions: [".js", ".jsx", ".json"]
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [PATHS.clients],
          loader: "babel-loader",
          options: {
            cacheDirectory: true
          }
        },

        {
          test: /\.scss$/,
          include: [PATHS.clients],
          use: extractCSS.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  sourceMap: true
                }
              },
              {
                loader: "postcss-loader",
                options: {
                  plugins: () => [autoprefixer],
                  sourceMap: true
                }
              },
              {
                loader: "sass-loader",
                options: {
                  sourceMap: true
                }
              }
            ]
          })
        },

        {
          test: /\.(jpe?g|png|svg|gif)$/,
          include: [PATHS.clients],
          loader: "file-loader",
          options: {
            name: "[name].[hash:6].[ext]"
          }
        }
      ]
    },

    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: ["commons"]
      }),

      new webpack.BannerPlugin({
        banner: new GitRevisionPlugin().version()
      }),

      extractCSS,

      new HtmlWebpackPlugin({
        filename: "viewer.html",
        template: PATHS.viewerTemplate,
        chunks: ["commons", "viewer"],
        minify: {
          collapseWhitespace: true,
          removeComments: true
        }
      }),

      new HtmlWebpackPlugin({
        filename: "live_config.html",
        template: PATHS.liveConfigTemplate,
        chunks: ["commons", "liveConfig"],
        minify: {
          collapseWhitespace: true,
          removeComments: true
        }
      }),

      new HtmlWebpackPlugin({
        filename: "config.html",
        template: PATHS.configTemplate,
        chunks: ["commons", "config"],
        minify: {
          collapseWhitespace: true,
          removeComments: true
        }
      })
    ],

    devtool: env.prod ? "source-map" : "cheap-eval-source-map"
  };

  return config;
};
