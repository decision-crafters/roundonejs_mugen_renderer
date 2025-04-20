const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'roundonejs.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'RoundOneJS',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  externals: {
    'node-fetch': 'fetch'
  }
};
