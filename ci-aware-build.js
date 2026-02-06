import { spawn, spawnSync } from 'child_process';
import os from 'os';

const envCheckPatterns = /^(GITHUB|CI|RUNNER|CLOUDFLARE)/i;
const maxDisplayLen = 55;

function announceStart(title = 'CONTINUOUS INTEGRATION ENVIRONMENT CHECK') {
  const border = '\n' + '*'.repeat(70) + '\n';
  console.log(border + `    ${title}` + border);
}

function announceEnd() {
  console.log('\n' + '*'.repeat(70) + '\n');
}

function truncateIfNeeded(textValue) {
  return textValue.length > maxDisplayLen 
    ? textValue.slice(0, maxDisplayLen - 3) + '...' 
    : textValue;
}

function gatherCiData() {
  const foundEntries = [];
  
  for (const [varName, varValue] of Object.entries(process.env)) {
    if (envCheckPatterns.test(varName)) {
      foundEntries.push({ varName, varValue });
    }
  }
  
  return foundEntries;
}

function runGitCommand(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    return null;
  }
  const output = (result.stdout || '').trim();
  return output.length > 0 ? output : null;
}

function gatherRunnerData() {
  const resolveUserName = () => {
    try {
      return os.userInfo().username;
    } catch (error) {
      return process.env.USER || process.env.USERNAME;
    }
  };

  const runnerEntries = [
    { label: 'Local User', value: resolveUserName() },
    { label: 'Host', value: os.hostname() },
    { label: 'Working Directory', value: process.cwd() },
    { label: 'Node Version', value: process.version },
    { label: 'GitHub Actor', value: process.env.GITHUB_ACTOR },
    { label: 'GitHub Triggering Actor', value: process.env.GITHUB_TRIGGERING_ACTOR },
    { label: 'GitHub Run ID', value: process.env.GITHUB_RUN_ID }
  ];

  return runnerEntries.filter(({ value }) => Boolean(value));
}

function gatherGitData() {
  const gitEntries = [];

  const addGitEntry = (label, value) => {
    if (value) {
      gitEntries.push({ label, value });
    }
  };

  addGitEntry('Repository Root', runGitCommand(['rev-parse', '--show-toplevel']));
  addGitEntry('Git Directory', runGitCommand(['rev-parse', '--git-dir']));
  addGitEntry('Current Branch', runGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']));
  addGitEntry('HEAD Commit', runGitCommand(['rev-parse', 'HEAD']));
  addGitEntry('Short SHA', runGitCommand(['rev-parse', '--short', 'HEAD']));
  addGitEntry('Describe', runGitCommand(['describe', '--always', '--dirty', '--tags']));
  addGitEntry('Remote Origin', runGitCommand(['config', '--get', 'remote.origin.url']));
  addGitEntry('Remotes', runGitCommand(['remote', '-v']));
  addGitEntry('Commit Message', runGitCommand(['log', '-1', '--pretty=%s']));
  addGitEntry('Last Commit Author', runGitCommand(['log', '-1', '--pretty=%an <%ae>']));
  addGitEntry('Last Commit Committer', runGitCommand(['log', '-1', '--pretty=%cn <%ce>']));
  addGitEntry('Last Commit Date', runGitCommand(['log', '-1', '--pretty=%cI']));
  addGitEntry('Working Tree Status', runGitCommand(['status', '--short', '--branch']));

  return gitEntries;
}

function printDataEntries(entries, { truncate = true } = {}) {
  entries.forEach(({ label, value }) => {
    const lines = value.split('\n');
    if (lines.length === 1) {
      const formattedValue = truncate ? truncateIfNeeded(lines[0]) : lines[0];
      console.log(`     ${label}: ${formattedValue}`);
      return;
    }

    console.log(`     ${label}:`);
    lines.forEach((line) => {
      const formattedValue = truncate ? truncateIfNeeded(line) : line;
      console.log(`       ${formattedValue}`);
    });
  });
}

function printCiInfo() {
  announceStart('BUILD CONTEXT AND GIT INFORMATION');
  
  const ciData = gatherCiData();
  
  if (ciData.length === 0) {
    console.log('  >> Local build detected - no CI environment found\n');
  } else {
    console.log(`  >> Found ${ciData.length} CI environment entries:\n`);
    printDataEntries(
      ciData.map(({ varName, varValue }) => ({ label: varName, value: varValue }))
    );
  }

  const runnerData = gatherRunnerData();
  if (runnerData.length > 0) {
    console.log('\n  >> Build context:\n');
    printDataEntries(runnerData, { truncate: false });
  }

  const gitData = gatherGitData();
  if (gitData.length > 0) {
    console.log('\n  >> Git details:\n');
    printDataEntries(gitData, { truncate: false });
  } else {
    console.log('\n  >> Git details unavailable (no repository detected)\n');
  }
  
  announceEnd();
}

printCiInfo();

const buildProcess = spawn('npx', ['vite', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (exitCode) => {
  process.exit(exitCode || 0);
});
