# Logger

### Install
```
npm install @bitrefill/logger
```

### Usage
```js
const log = require('@bitrefill/logger')('my-module');

log.info('Regular operation');
log.warn('Something is off but not critical');
log.error('Someone should look into this');

log.info('With an object', { my: { deep: 'object' } });
log.info('A number', 100000000);
log.info('Multiple arguments:', 'isProduction', true, 'amount', 27);

log.error(new Error('Oops!'));
log.error('Error with a message', new Error('Oops, I did it again!'));
log.error('Error within an object, error prop', { error: new Error('An error!'), amount: 0.00081 });
log.error('Error within an object, err prop', { err: new Error('An err!'), amount: 0.00081 });
log.error('Error within an object, e prop', { e: new Error('An e!'), amount: 0.00081 });
```
Will output:
```
{"level":30,"time":1521079820856,"msg":"Regular operation","namespace":"my-module","v":1}
{"level":40,"time":1521079820858,"msg":"Something is off but not critical","namespace":"my-module","v":1}
{"level":50,"time":1521079820858,"msg":"Someone should look into this","namespace":"my-module","v":1}

{"level":30,"time":1521080308250,"msg":"With an object","namespace":"my-module","my":{"deep":"object"},"v":1}
{"level":30,"time":1521080308250,"msg":"A number 100000000","namespace":"my-module","v":1}
{"level":30,"time":1521080308250,"msg":"Multiple arguments: isProduction true amount 27","namespace":"my-module","v":1}

{"level":50,"time":1521080917001,"msg":"Oops!","namespace":"my-module","type":"Error","stack":"Error: Oops!\n    at Object.
<anonymous>...","v":1}
{"level":50,"time":1521080917001,"msg":"Error with a message","namespace":"my-module","type":"Error","stack":"Error: Oops,
I did it again!\n    at Object.<anonymous>...","v":1}
{"level":50,"time":1521080917001,"msg":"Error within an object, error prop","namespace":"my-module","error":{"type":"Error"
,"message":"An error!","stack":"Error: An error!\n    at Object.<anonymous>..."},"amount":0.00081,"v":1}
{"level":50,"time":1521080917002,"msg":"Error within an object, err prop","namespace":"my-module","err":{"type":"Error","me
ssage":"An err!","stack":"Error: An err!\n    at Object.<anonymous>..."},"amount":0.00081,"v":1}
{"level":50,"time":1521080917002,"msg":"Error within an object, e prop","namespace":"my-module","e":{"type":"Error","messag
e":"An e!","stack":"Error: An e!\n    at Object.<anonymous>..."},"amount":0.00081,"v":1}
```
Note: For brevity the stack has been shortened but in practice the entire error stack will be logged as a string.
### Config
The library is configurable through ENV vars.

#### `APP_NAME`
Every log line will output the value of this variable. Use for different app instances. Eg.: `api`, `worker`, etc. .

#### `NODE_ENV`
If equal to `development` the logs will be pretty printed for easier debugging on localhost.
```
[2018-03-15T02:41:38.460Z] INFO: Regular operation
    namespace: "my-module"
```
Note: `NODE_ENV=test` will silent all logs

### CLI

We provide a command line interface that can be used to parse Heroku live tail into an easy to read format.

To use the command line tool, you can install the module globally:
```
npm install -g @bitrefill/logger
```

Then pipe the Heroku live tail output:
```
heroku logs -t -a my-app | logger
```

#### Options

##### `-i, --include`
Which JSON properties to include. Specify one or more property names, separated by commas. By default all JSON properties are included.

### License
Licensed under the MIT License, Copyright © 2018 Airfill Prepaid AB.

See [LICENSE](./LICENSE) for more information.
