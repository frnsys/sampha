module.exports = function(grunt) {

	// Configuration
	// =======================================
	grunt.initConfig({
		// Server
		connect: {
			server: {
				options: {
					port: 8989
				}
			}
		},

		// Watch
		watch: {
            options: { livereload: true },
			files: [
			],
			tasks: []
		}

	});

	// Define grunt tasks
	// =======================================
	grunt.registerTask('default', ['connect', 'watch']);

	// Load grunt packages
	// =======================================
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

};