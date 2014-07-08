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
					'lib/svg.js',
					'lib/svg.draggable.js',
					'lib/svg.math.js',
					'lib/svg.path.js',
					'lib/classList.js',
					'src/networkMap.js',
					'src/vec.js',
					'src/event.configuration.js',
					'src/widgets/integerinput.js',
					'src/widgets/textinput.js',
					'src/widgets/colorinput.js',
					'src/widgets/accordion.js',
					'src/widgets/list.js',
					'src/widgets/select.js',
					'src/widgets/modal.js',
					'src/widgets/checkbox.js',
					'src/widgets/gridinput.js',
					'src/properties.js',
					'src/datasource.js',
					'src/events.js', 
					'src/colormap.js', 
					'src/colorlegend.js', 
					'src/settingsmanager.js',
					'src/renderer/settingsManager.add.js',
					'src/renderer/settingsManager.addLink.js',					
					'src/renderer/settingsManager.delete.js',
					'src/renderer/settingsManager.modify.js',
					'src/renderer/settingsManager.configure.js',
					'src/renderer/link.utilizationLabel.js',
					'src/graph.js', 
					'src/graph.module.settings.js',
					'src/node.js',
					'src/node.module.settings.js',
					'src/node.events.js',
					'src/linkpath.js',
					'src/sublink.js',
					'src/link.js',
					'src/link.module.settings.js',
					'src/link.module.edge.js'
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
					document: true,
					undef: true
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
				files: ['<%= concat.dist.src %>', 'spec/spec/*.js'],
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
			},
			markdown: {
				files: ['README.md'],
				tasks: ['markdown'],
				options: {
					interrupt: true
				}
			}
		},
		markdown: {
			all:{
				options:{
					//markdownOptions: {
						gfm: true,
						highlight: 'manual'
					//}
				},
				files: [
					{
						expand: true,
						src: 'README.md',
						dest: 'docs/html/',
						ext: '.html'
					}
				]
			}
		}
	
	});
	
	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-markdown');
	
	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less']);

};
