# argchecker

A command line options parser for Node.js.

## Installation

    $ npm install argchecker

## Usage
```js
#!/usr/bin/env node

var ac = require('argchecker').check({
  expect: {
    '-a': {},
    '-l': {param: 'LOG_FILE', default: 'log.txt'},
    'arg1': {},
    'arg2': {must: true}
  }
});

// When invalid arg comes from command line, this script shows the usage information, and exit here.

var log = ac.get('-l');       // get '-l' option's param

var arg1 = ac.get('arg1');    // get non option args
var arg2 = ac.get('arg2');    // 

if (ac.isOn('-a')) {          // check '-a' option
  // ...
}
```

### Example
in command line

    $ app2 -a -l log1.txt XXX YYY

app2
```js
#!/usr/bin/env node

var ac = require('argchecker').check({
  expect: {
    '-a': {},
    '-l': {param: 'LOG_FILE'},
    'arg1': {},
    'arg2': {}
  }
});

var log = ac.get('-l');     // log1.txt

var arg1 = ac.get('arg1');  // XXX
var arg2 = ac.get('arg2');  // YYY

if (ac.isOn('-a')) {        // true
  // ...
}
```

## Tags
### repeat
in command line

    app3 -a -l log1.txt XXX1 XXX2 XXX3 YYY

app3
```js
#!/usr/bin/env node

var ac = require('argchecker').check({
  expect: {
    '-a': {},
    '-l': {param: 'LOG_FILE'},
    'arg1': {repeat: true},     // <-- set 'repeat'
    'arg2': {}
  }
});

var arg1 = ac.get('arg1');    // [XXX1, XXX2, XXX3]
var arg2 = ac.get('arg2');    // YYY
```

### repeat (for option)
in command line

    $ app4 -b 10 -b 20 -b 30 XXX

app4
```js
#!/usr/bin/env node

var ac = require('argchecker').check({
  expect: {
    '-b': {param: 'B_PARAM', repeat: true},   // <-- set 'repeat'
    'arg1': {},
    'arg2': {}
  }
});

var b = ac.get('-b');       // [10, 20, 30]

var arg1 = ac.get('arg1');  // XXX
var arg2 = ac.get('arg2');  // undefined
```

### must
in command line

    $ app5 -b 10 YYY

app5
```js
#!/usr/bin/env node

var ac = require('argchecker').check({
  expect: {
    '-b': {param: 'B_PARAM'},
    'arg1': {},
    'arg2': {must: true}    // <-- set 'must'
  }
});

var b = ac.get('-b');       // 10

var arg1 = ac.get('arg1');  // undefined  <-- skiped
var arg2 = ac.get('arg2');  // YYY        <-- must
```

## Other tags

### param (for option)
You **have to** set this tag, when an option has a next parameter.
```js
var ac = require('argchecker').check({
  expect: {
    '-l': {param: 'LOG_FILE'}     // <-- 
  }
});
```

### default (for option)
This tag can be set when the "param" tag exists.
```js
var ac = require('argchecker').check({
  expect: {
    '-l': {param: 'LOG_FILE', default: 'log.txt'},    // <-- 
    'arg1': {must: true}
  }
});
```

### name (top level only)
"name" is used in the usage information.
```js
var ac = require('argchecker').check({
  expect: {
    '-b': {param: 'B_PARAM'},
  },
  name: 'app_name'  // <-- 
});
```
in stderr message

    Usage: app_name [-b B_PARAM]

### exit (top level only)
The status code at the time of an error. Default: 1
```js
var ac = require('argchecker').check({
  expect: {
    '-b': {param: 'B_PARAM'},
  },
  name: 'app_name',
  exit: 20          // <-- 
});
```

## License

The MIT License
