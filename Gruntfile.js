module.exports = function(grunt) {

// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},
		concat: {
			options: {
				// define a string to put between each file in the concatenated output
				separator: ';'
			},
			dist: {
				// the files to concatenate
				src: [
					'src/networkMap.js', 
					'src/widgets/integerinput.js',
					'src/widgets/textinput.js',
					'src/widgets/accordion.js',
					'src/datasource.js',
					'src/events.js', 
					'src/colormap.js', 
					'src/colorlegend.js', 
					'src/settingsmanager.js', 
					'src/graph.js', 
					'src/node.js',
					'src/sublink.js',
					'src/link.js',
				],
				// the location of the resulting JS file
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'spec/spec/*.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					console: true,
					document: true
				}
			}
		},
		less: {
			production: {
				options: {
					paths: ['resources/less'],
					yuicompress: true
				},
				files: {
					'dist/networkmap.css': 'resources/less/networkmap.less'
				}
			}
		},
		watch: {
			scripts: {
				files: ['<%= concat.dist.src %>'],
				tasks: ['jshint', 'concat'],
				options: {
						interrupt: true
				}
			},
			less: {
				files: ['<%= less.production.options.paths %>/*.less'],
				tasks: ['less'],
				options: {
					interrupt: true
				}	
			}
		}
	
	});
	
	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	
	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less']);

};
