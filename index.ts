import * as matsch from './matsch';
import * as fs from 'fs';

function usage() {
  console.log(`matscha <match-expr> <files>`);
}

function main() {
  const argv = process.argv;
  argv.splice(0, 2);
  if (argv.length < 2) {
    usage();
    return 1;
  }
  const matcher = matsch.createMatcher(argv[0]);
  argv.splice(0, 1);
  for (const file of argv) {
    const text = fs.readFileSync(file).toString();
    const matches = matsch.matchInText(matcher, text);
    for (const m of matches) {
      console.log(`${file}: ${m}`);
    }
  }
  return 0;
}

if (require.main === module) {
  process.exit(main());
}