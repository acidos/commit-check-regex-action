//const { context, GitHub } = require('@actions/github');
//import { context, GitHub } from '@actions/github';
const github  = require('@actions/github');
const core    = require('@actions/core');

const commits = github.context.payload.commits.filter(c => c.distinct);
const repo    = github.context.payload.repository;
const org     = repo.organization;
const owner   = org || repo.owner;

const FILES          = [];
const FILES_MODIFIED = [];
const FILES_ADDED    = [];
const FILES_DELETED  = [];
const FILES_RENAMED  = [];

//console.log('token: ' + core.getInput('token'));
//github.context.payload
const gh   = new github.getOctokit(core.getInput('token'));//GitHub(core.getInput('token'));
const items = core.getInput('items');
const args = { owner: owner.name, repo: repo.name };

console.log(items);

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

