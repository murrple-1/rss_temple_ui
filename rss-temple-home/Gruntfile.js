"use strict";
module.exports = function (grunt) {
  require("time-grunt")(grunt);

  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    yeoman: {
      app: "src",
      dist: "dist"
    },

    clean: {
      default: [".tmp/", "<%= yeoman.dist %>/"],
      dist: [".tmp/*", "<%= yeoman.dist %>/*"],
      tmp: [".tmp/"]
    },

    handlebarslayouts: {
      options: {
        partials: ["<%= yeoman.app %>/partials/*.hbs"],
        modules: ["<%= yeoman.app %>/modules/*.js"]
      },
      "dist index": {
        options: {
          context: [{}]
        },
        files: {
          ".tmp/index.html": "<%= yeoman.app %>/index.hbs"
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true
        },
        files: [
          {
            expand: true,
            cwd: ".tmp/",
            src: "*.html",
            dest: "<%= yeoman.dist %>/"
          }
        ]
      }
    },

    sass: {
      dist: {
        options: {
          implementation: require("node-sass"),
          fiber: require("fibers"),
          includePaths: []
        },
        files: {
          ".tmp/styles/main.css": "<%= yeoman.app %>/styles/main.scss"
        }
      }
    },

    cssmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: ".tmp/styles/",
            src: "main.css",
            dest: "<%= yeoman.dist %>/styles/",
            ext: ".min.css"
          }
        ]
      }
    },

    imagemin: {
      dist: {
        options: {
          use: [
            require("imagemin-mozjpeg")(),
            require("imagemin-gifsicle")(),
            require("imagemin-optipng")(),
            require("imagemin-svgo")()
          ]
        },
        files: [
          {
            expand: true,
            cwd: "<%= yeoman.app %>/media/",
            src: "**/*.{png,jpg,jpeg,gif,pdf}",
            dest: "<%= yeoman.dist %>/media/"
          }
        ]
      }
    },

    eslint: {
      target: ["<%= yeoman.app %>/scripts/main.js"],
      options: {
        parser: "babel-eslint",
        parserOptions: {
          sourceType: "module"
        }
      }
    },

    webpack: {
      dist: require("./webpack.config.js")
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: "<%= yeoman.app %>/",
            src: ["favicon.ico", "robots.txt"],
            dest: "<%= yeoman.dist %>/"
          }
        ]
      }
    },

    compress: {
      dist: {
        options: {
          mode: "gzip"
        },
        files: [
          {
            cwd: "<%= yeoman.dist %>/",
            expand: true,
            src: ["**/*.html"],
            dest: "<%= yeoman.dist %>/",
            ext: ".html.gz"
          },
          {
            cwd: "<%= yeoman.dist %>/",
            expand: true,
            src: ["**/*.min.js"],
            dest: "<%= yeoman.dist %>/",
            ext: ".min.js.gz"
          },
          {
            cwd: "<%= yeoman.dist %>/",
            expand: true,
            src: ["**/*.min.css"],
            dest: "<%= yeoman.dist %>/",
            ext: ".min.css.gz"
          }
        ]
      }
    }
  });

  var buildTasks = [
    "clean:dist",

    // HTML
    "handlebarslayouts:dist index",
    "htmlmin:dist",

    // CSS
    "sass:dist",
    "cssmin:dist",

    // Images
    "imagemin:dist",

    // JS
    "eslint",
    "webpack:dist",

    "copy:dist",
    "compress:dist",

    "clean:tmp"
  ];

  grunt.registerTask("build", buildTasks);

  grunt.registerTask("default", ["eslint"]);
};
