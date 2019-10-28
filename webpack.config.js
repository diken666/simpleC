const path = require('path');
module.exports = {
    entry: './src/index.js',    //入口
    output: {       //出口
        filename: "main.min.js",
        path: path.resolve('./build')
    },
    devServer: {},    //服务器配置
    module: {},       //模块配置
    plugins: [],            //插件配置
    mode: 'production',   //开发环境
    resolve: {},    //配置解析
};