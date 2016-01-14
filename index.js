var irc = require('irc');
var fs = require('fs');
var exec = require('child_process').exec;

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var minecraftProcess = exec('java -jar  ' + config.jarfile + ' nogui', function(error, stdout, stderr) {
	console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
    	console.log('exec error: ' + error);
    }
});

var bot = new irc.Client(config.ircServer, config.botName, {
	channels: [config.channel],
	realName: config.realName
});

minecraftProcess.stdout.on('data', function(data) {
	var join = /\[Server thread\/INFO\]: (.*) (joined the game)/;
	var left = /\[Server thread\/INFO\]: (.*) (left the game)/;
	var talk = /\[Server thread\/INFO\]: <(.*)> (.*)/;
	var chunk = data.toString();

	var match;

	if(match = talk.exec(chunk)) {
		bot.say(config.channel, '<' + match[1] + '> ' + match[2]);
	} else if (match = join.exec(chunk)) {
		bot.say(config.channel, match[1] + ' joined the game.');
	} else if (match = left.exec(chunk)) {
		bot.say(config.channel, match[1] + ' left the game.');
	}
});

bot.addListener('message#', function(nick, channel, text, message) {
	if(nick !== config.botName) {
		minecraftProcess.stdin.write("/say <" + nick + "> " + text + "\n");
	}
});

minecraftProcess.stderr.on('data', function (data) {
	console.log('error with minecraft server: ', data);
});