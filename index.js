const pino = require('pino');
const _ = require('lodash');
const minimatch = require('minimatch');
const { AsyncLocalStorage } = require('async_hooks');
const crypto = require("crypto");

const asyncLocalStorage = new AsyncLocalStorage();

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
    const { asyncId } = (asyncLocalStorage.getStore() || {});

    if (asyncId) {
        return asyncIdLogWrapper(log, level, asyncId, msg, ...args);
    }

    if (!args.length) {
        log[level](msg);
    } else if (args.length > 1) {
        log[level]({ ...args }, msg);
    } else if (_.isPlainObject(args[0]) || args[0] instanceof Error) {
        log[level](args[0], msg);
    } else if (_.isArray(args[0])) {
        log[level]({ array: args[0] }, msg);
    } else {
        log[level](msg, args[0]);
    }
}

function asyncIdLogWrapper(log, level, asyncId, msg, ...args) {
    if (!args.length) { // No args
        log[level]({ asyncId }, msg);
    } else if (args.length > 1) { // multiple args
        log[level]({ ...args, asyncId }, msg);
    } else if (args[0] instanceof Error) {
        log[level]({ error: args[0], asyncId }, msg);
    } else if (_.isPlainObject(args[0])) {
        log[level]({ ...args[0], asyncId }, msg);
    } else if (_.isArray(args[0])) {
        log[level]({ array: args[0], asyncId }, msg);
    } else {
        log[level]({ ...(args[0]), asyncId }, msg);
    }
}

function setAsyncId(id, next) {
    // Store a random if no ID is provided
    const asyncId = id || crypto.randomBytes(16).toString("hex");

    asyncLocalStorage.run({ asyncId }, next);
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
        setAsyncId,
    };
};
