/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */
 
const child_process = require("child_process");

function StartIOCom(){
	const subprocess = child_process.spawn(process.argv[0], [__dirname + '/iocommander-usr.js'], { 
		cwd: process.cwd(),
		env: process.env,
		detached: true
	});
	subprocess.stdout.on('data', (data) => {
		console.log('restart iocommander client');
	});
	subprocess.stderr.on('data', (data) => {
		console.error(`updater error: ${data}`);
	});
	subprocess.on('error', (data) => {
		console.error(`updater error: ${data}`);
	});
}

StartIOCom();