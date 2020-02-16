const pino = require('pino');
const _ = require('lodash');
const minimatch = require('minimatch');

function dolog(namespace) {
    if (process.env.LOG) {
        const patterns = process.env.LOG.split(',');

        for (const pattern of patterns) {
            if (minimatch(namespace, pattern)) {
                return true;
            }
        }

        return false;
    }

    return true;
}

const logger = pino({
    prettyPrint: process.env.NODE_ENV === 'development',
    level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    base: {
        name: process.env.APP_NAME,
    },
    serializers: {
        error: pino.stdSerializers.err,
        err: pino.stdSerializers.err,
        e: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
    },
});

function logWrapper(log, level, msg, ...args) {
    if (!args.length) {
        log[level](msg);
    } else if (args.length > 1) {
        log[level](msg, ...args);
    } else if (_.isPlainObject(args[0]) || args[0] instanceof Error) {
        log[level](args[0], msg);
    } else if (_.isArray(args[0])) {
        log[level]({ array: args[0] }, msg);
    } else {
        log[level](msg, args[0]);
    }
}

module.exports = (namespace) => {
    if (!dolog(namespace)) {
        return {
            info: () => { },
            warn: () => { },
            error: () => { },
        };
    }

    const log = logger.child({ namespace });
    return {
        info(msg, ...args) {
            logWrapper(log, 'info', msg, ...args);
        },
        warn(msg, ...args) {
            logWrapper(log, 'warn', msg, ...args);
        },
        error(msg, ...args) {
            logWrapper(log, 'error', msg, ...args);
        },
    };
};
