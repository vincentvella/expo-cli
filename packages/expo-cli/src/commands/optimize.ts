import { ProjectUtils } from '@expo/xdl';
import { spawn } from 'child_process';
import { Command } from 'commander';

import log from '../log';

type Options = {
  save?: boolean;
  quality?: string;
  include?: string;
  exclude?: string;
};

export async function action(projectDir = './', options: Options = {}) {
  const { exp } = await ProjectUtils.readConfigJsonAsync(projectDir);
  if (exp === null) {
    log.warn('No Expo configuration found. Are you sure this is a project directory?');
    process.exit(1);
  }

  // Everything after this is a redirect for the deprecated optimize command
  log.warn(
    '\u203A Deprecated: Please use `npx expo-optimize` as a drop-in replacement for `expo optimize`.'
  );

  const args: string[] = [projectDir];

  if (options.save) args.push('--save');
  if (options.quality) args.push('--quality', options.quality);
  if (options.include) args.push('--include', options.include);
  if (options.exclude) args.push('--exclude', options.exclude);

  const child = spawn(require.resolve('expo-optimize'), args);

  child.stdout.on('data', data => process.stdout.write(data.toString()));
  child.stderr.on('data', data => process.stdout.write(data.toString()));
}

export default function(program: Command) {
  program
    .command('optimize [project-dir]')
    .alias('o')
    .description('Compress the assets in your Expo project')
    .option('-s, --save', 'Save the original assets with a .orig extension')
    .option(
      '--quality [number]',
      'Specify the quality the compressed image is reduced to. Default is 80'
    )
    .option(
      '--include [pattern]',
      'Include only assets that match this glob pattern relative to the project root'
    )
    .option(
      '--exclude [pattern]',
      'Exclude all assets that match this glob pattern relative to the project root'
    )
    .allowOffline()
    .asyncAction(action);
}
