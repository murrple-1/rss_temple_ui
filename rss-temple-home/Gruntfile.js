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
        files: {
          ".tmp/index.html": "<%= yeoman.app %>/index.hbs"
        }
      },
      "dist contact": {
        files: {
          ".tmp/contact.html": "<%= yeoman.app %>/contact.hbs"
        }
      },
      "dist tos": {
        files: {
          ".tmp/tos.html": "<%= yeoman.app %>/tos.hbs"
        }
      },
      "dist privacy": {
        files: {
          ".tmp/privacy.html": "<%= yeoman.app %>/privacy.hbs"
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
          includePaths: [
            "node_modules/bootstrap/scss/",
            "node_modules/@fortawesome/fontawesome-free/scss/",
            "node_modules/simple-line-icons/scss/"
          ]
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
            src: ["favicon.ico", "robots.txt", "config.json"],
            dest: "<%= yeoman.dist %>/"
          },
          {
            expand: true,
            cwd: "node_modules/@fortawesome/fontawesome-free/webfonts/",
            src: ["*"],
            dest: "<%= yeoman.dist %>/media/fonts/"
          },
          {
            expand: true,
            cwd: "node_modules/simple-line-icons/fonts/",
            src: ["*"],
            dest: "<%= yeoman.dist %>/media/fonts/"
          },
          {
            expand: true,
            cwd: "<%= yeoman.app %>/media/",
            src: ["*.svg"],
            dest: "<%= yeoman.dist %>/media/"
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
    "handlebarslayouts:dist contact",
    "handlebarslayouts:dist tos",
    "handlebarslayouts:dist privacy",
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
