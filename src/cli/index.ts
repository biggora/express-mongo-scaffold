import { Command } from 'commander';
import { registerGenerateCommand } from './commands/generate.js';

const program = new Command();

program
  .name('express-mongo-scaffold')
  .description('CLI generator for Express.js + MongoDB REST API boilerplate')
  .version('0.1.0');

registerGenerateCommand(program);

program.parse();
