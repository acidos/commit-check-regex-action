//const { context, GitHub } = require('@actions/github');
//import { context, GitHub } from '@actions/github';
const github  = require('@actions/github');
const core    = require('@actions/core');

const context = github.context;
const repo    = context.payload.repository;
const owner   = repo.owner;

/*const commits = github.context.payload.commits.filter(c => c.distinct);
const repo    = github.context.payload.repository;
const org     = repo.organization;
const owner   = org || repo.owner;*/

const FILES          = [];
// const FILES_MODIFIED = new Set();
// const FILES_ADDED    = new Set();
// const FILES_DELETED  = new Set();
// const FILES_RENAMED  = new Set();

const gh    = new github.getOctokit(core.getInput('token'));
const inputItems = Array.from(core.getInput('items'));
const args  = { owner: owner.name || owner.login, repo: repo.name };

function debug(msg, obj = null) {
	core.debug(formatLogMessage(msg, obj));
}

function info(msg, obj = null) {
	core.info(formatLogMessage(msg, obj));
}

function formatLogMessage(msg, obj = null) {
	return obj ? `${msg}: ${toJSON(obj)}` : msg;
}

function isAdded(file) {
	return 'added' === file.status;
}

function isDeleted(file) {
	return 'deleted' === file.status;
}

function isModified(file) {
	return 'modified' === file.status;
}

function isRenamed(file) {
	return 'renamed' === file.status;
}

async function getCommits() {
	let commits;

	//debug('Getting commits...');

	switch(context.eventName) {
		case 'push':
			commits = context.payload.commits;
		break;

		case 'pull_request':
			const url = context.payload.pull_request.commits_url;

			commits = await gh.paginate(`GET ${url}`, args);
		break;

		default:
			info('You are using this action on an event for which it has not been tested. Only the "push" and "pull_request" events are officially supported.');

			commits = [];
		break;
	}

	return commits;
}

async function processCommit(commit) {
	//debug('Processing commit', commit);

	args.ref = commit.id || commit.sha;

	//debug('Calling gh.repos.getCommit() with args', args)

	let result = await gh.repos.getCommit(args);

	//debug('API Response', result);

	if (result && result.data) {
		const files = result.data.files;

		files.forEach( file => {
			isModified(file) && FILES.push(file.filename);
			isAdded(file) && FILES.push(file.filename);
			isRenamed(file) && FILES.push(file.filename);

			// isModified(file) && FILES_MODIFIED.push(file.filename);
			// isAdded(file) && FILES_ADDED.add(file.filename);
			// isDeleted(file) && FILES_DELETED.add(file.filename);
			// isRenamed(file) && FILES_RENAMED.add(file.filename);
		});
	}
}

function toJSON(value) {
	return JSON.stringify(value, null, 4);
}


//debug('context', context);
//debug('args', args);

getCommits().then(commits => {
	//debug('All Commits', commits);

	if ('push' === context.eventName) {
		commits = commits.filter(c => c.distinct);

		//debug('All Distinct Commits', commits);
  }
  
  Promise.all(commits.map(processCommit)).then(() => {
    debug('FILES', FILES);
    
    var outputItems = [];

    inputItems.forEach((pattern, i) => {
      debug('pattern', pattern);
      let re = new RegExp(pattern);
      const found = FILES.find(f => re.test(f));
      outputItems.push(found);
    });

    debug('outputItems', outputItems);

    core.setOutput('items', toJSON(outputItems));

  });
  
});







/*

console.log(items);
let r   = await gh.repos.getCommit(args);
console.log('args: ' + JSON.stringify(commits, null, 2));
console.log('args: ' + JSON.stringify(gh.repos., null, 2));
console.log('args: ' + JSON.stringify(args, null, 2));

function isAdded(file) {
	return 'added' === file.status;
}

function isDeleted(file) {
	return 'deleted' === file.status;
}

function isModified(file) {
	return 'modified' === file.status;
}

function isRenamed(file) {
	return 'renamed' === file.status;
}

async function processCommit(commit) {
	args.ref = commit.id;
	let result   = await gh.repos.getCommit(args);

	if (result && result.data) {
		const files = result.data.files;

		files.forEach( file => {
			isModified(file) && FILES.push(file.filename);
			isAdded(file) && FILES.push(file.filename);
			isRenamed(file) && FILES.push(file.filename);

			isModified(file) && FILES_MODIFIED.push(file.filename);
			isAdded(file) && FILES_ADDED.push(file.filename);
			isDeleted(file) && FILES_DELETED.push(file.filename);
			isRenamed(file) && FILES_RENAMED.push(file.filename);
		});
	}
}


(async () => {
  await commits.map(processCommit);
  console.log(FILES);
})();
*/













//const a = await commits.map(processCommit);


/*Promise.all(commits.map(processCommit)).then(() => {

	console.log('done');

	process.exit(0);
});*/

/*
Promise.all(commits.map(processCommit)).then(() => {

	console.log(`::debug::${JSON.stringify(FILES, 4)}`);
	console.log(`::set-output name=all::${JSON.stringify(FILES, 4)}`);
	console.log(`::set-output name=added::${JSON.stringify(FILES_ADDED, 4)}`);
	console.log(`::set-output name=deleted::${JSON.stringify(FILES_DELETED, 4)}`);
	console.log(`::set-output name=modified::${JSON.stringify(FILES_MODIFIED, 4)}`);
	console.log(`::set-output name=renamed::${JSON.stringify(FILES_RENAMED, 4)}`);

	process.exit(0);
});
*/

/*const core = require('@actions/core');
const wait = require('./wait');


// most @actions toolkit packages have async methods
async function run() {
  try { 
    const ms = core.getInput('milliseconds');
    console.log(`Waiting ${ms} milliseconds ...`)

    core.debug((new Date()).toTimeString())
    await wait(parseInt(ms));
    core.debug((new Date()).toTimeString())

    core.setOutput('time', new Date().toTimeString());
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
*/

