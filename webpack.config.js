module.exports = {
    entry: './webpack.js',
    output: {
        filename: 'dist/caver-js-ext-kas.min.js',
    },
    node: {
        fs: 'empty',
        net: 'empty',
    },
}
