"use strict";

var fs = require("fs");
var path = require("path");
var rollup = require("rollup").rollup;
var typescriptPlugin = require("rollup-plugin-typescript2");
var Terser = require("terser");

var uglifyjs = require("uglify-js");
var stripAsserts = require("./assemble/stripAsserts")

var argPieceNames = process.argv.slice(2);
var defaultOutput = path.join(__dirname, "..", "dist", "Bacon.js");
var defaultNoAssert = path.join(__dirname, "..", "dist", "Bacon.noAssert.js");
var defaultMinified = path.join(__dirname, "..", "dist", "Bacon.min.js");
var defaultMinifiedES6 = path.join(__dirname, "..", "dist", "Bacon.min.mjs");

function main(options) {
  options = options || {};

  try {fs.mkdirSync("dist")} catch (e) {
    // directory exists, do nothing
  }

  var plugins = [
    typescriptPlugin({
      typescript: require("typescript"),
      useTsconfigDeclarationDir: true
    })
  ];
  
  var pluginsTargetingES6 = [
     typescriptPlugin({
      typescript: require("typescript"),
       tsconfigOverride: {
        compilerOptions: {
          target: "ES6",
          lib: ["ES6", "DOM", "DOM.Iterable"]
        }
       },
      useTsconfigDeclarationDir: true
    })
  ];

  // sequence of transpiling to ES5 and then to ES6
  rollup({
    input: 'src/bacon.ts',
    plugins: plugins
  })
  .then(bundle => Promise.all([
     bundle,
    rollup({
      input: 'src/bacon.ts',
      plugins: pluginsTargetingES6
    })
  ]))
  .then(([bundle, es6Bundle]) => Promise.all([
    bundle.write({
      format: 'umd',
      name: 'Bacon',
      globals: {
        jQuery: 'jQuery',
        Bacon: 'Bacon',
        Zepto: 'Zepto'
      },
      file: 'dist/Bacon.js',
      indent: false
    }),
    es6Bundle.write({
      format: 'esm',
      file: 'dist/Bacon.mjs'
    })
  ]))
  .then(function() {
    var output = fs.readFileSync('dist/Bacon.js', 'utf-8');
    var noAssertOutput = stripAsserts(output);
    if (options.noAssert) {
      fs.writeFileSync(options.noAssert, noAssertOutput);
    }

    if (options.minified) {
        var result = uglifyjs.minify(noAssertOutput);
        if (result.error) {
          throw result.error;
        }
        fs.writeFileSync(options.minified, result.code);
    }
    
    if (options.minifiedES6) {
      const
         esmOutput = fs.readFileSync('dist/Bacon.mjs', 'utf-8'),
         esmResult = Terser.minify(esmOutput);
      
      if (esmResult.error) {
        throw esmResult.error;
      }
      fs.writeFileSync(options.minifiedES6, esmResult.code);
    }
  }).catch(function(error) {
    console.error(error);
    process.exit(1);
  });
}

if (require.main === module) {
  main({
    verbose: true,
    output: defaultOutput,
    noAssert: defaultNoAssert,
    minified: defaultMinified,
    minifiedES6: defaultMinifiedES6
  });
}

exports.main = main;
