#!/usr/bin/env node

const split = require('split2');
const pump = require('pump');
const through = require('through2');
const program = require('commander');
const chalk = require('chalk');
const pretty = require('pino').pretty();

program
    .description('Pipe heroku live tail logs into a readable output')
    .option('-i, --include [include]', 'Comma-delimited list of properties to include. Defaults to all')
    .parse(process.argv);

const props = program.include ? program.include.split(',') : [];
const regex = /^.*?:\s({.*})$/;

const transformer = through.obj((chunk, enc, cb) => {
    const [, herokuSyslog, message] = chunk.match(/^(.*?]:)(\s.*)$/);

    // Non-JSON logs
    if (!regex.test(chunk)) {
        return cb(null, `${chalk.green(herokuSyslog)}${message}\n`);
    }

    // Parse JSON
    let parsed;
    try {
        parsed = JSON.parse(chunk.match(regex)[1]);
    } catch (e) {
        // Not a valid JSON line, log it as is
        return cb(null, `${chalk.green(herokuSyslog)}${message}\n`);
    }

    // Cherry picked default properties
    const defaultProps = {
        time: parsed.time,
        level: parsed.level,
        name: parsed.name,
        v: parsed.v,
        msg: parsed.msg,
        namespace: parsed.namespace,
    };

    const extraProps = !props.length
        // Include all properties if user hasn't chosen any
        ? parsed
        // Included properties by user
        : props.reduce((acc, prop) => ({
            ...acc,
            [prop]: parsed[prop],
        }), {});

    // Stringify JSON
    const stringified = JSON.stringify({ ...defaultProps, ...extraProps });

    return cb(null, `${stringified}\n`);
});

// Pipeline steps
pump(
    process.stdin, // Take everything that is piped in
    split(), // Split stream so we have a line per chunk
    transformer, // Apply our own transformer
    pretty, // Pretty print JSON lines through Pino
    process.stdout, // Output everything to stdout
);
