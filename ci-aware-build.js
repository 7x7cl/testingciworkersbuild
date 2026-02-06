import { spawn } from 'child_process';

const envCheckPatterns = /^(GITHUB|CI|RUNNER|CLOUDFLARE)/i;
const maxDisplayLen = 55;

function announceStart() {
  const border = '\n' + '*'.repeat(70) + '\n';
  console.log(border + '    CONTINUOUS INTEGRATION ENVIRONMENT CHECK' + border);
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

function printCiInfo() {
  announceStart();
  
  const ciData = gatherCiData();
  
  if (ciData.length === 0) {
    console.log('  >> Local build detected - no CI environment found\n');
  } else {
    console.log(`  >> Found ${ciData.length} CI environment entries:\n`);
    ciData.forEach(({ varName, varValue }) => {
      console.log(`     ${varName}: ${truncateIfNeeded(varValue)}`);
    });
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
