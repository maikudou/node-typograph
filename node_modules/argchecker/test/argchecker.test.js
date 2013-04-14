var assert = require('assert');
var fs = require('fs');
var path = require('path');
var util = require('util');

var ArgChecker = require('../lib/argchecker.js');

describe('argchecker', function() {
  describe('usage', function() {
    it('expect:a(PD),b,c(PR),XX(R),YY,ZZ(M)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {},
          'ZZ': {must: true}
        },
        name: 'testapp'
      });
      assert.equal(ac.usage, 'Usage: testapp [-a PARAM_A] [-b] [-c PARAM_C] ... [XX] ... [YY] ZZ');
    });
  });

  describe('parse', function() {
    it('expect:a | arg:a', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {}
        }
      });
      ac.check(['-a']);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a,b,c | arg:a,b,c', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check(['-a', '-b', '-c']);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a,b,c | arg:a,b', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check(['-a', '-b']);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a,b,c | arg:c', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check(['-c']);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a,b,c | arg:', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check([]);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a(P) | arg:a(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'}
        }
      });
      ac.check(['-a', '1']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a(P),b(P),c(P) | arg:a(P),b(P),c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-a', '1', '-b', '2', '-c', '3']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), '2');
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(P),b(P),c(P) | arg:a(P),b(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-a', '1', '-b', '2']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), '2');
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a(P),b(P),c(P) | arg:c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-c', '3']);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(P),b(P),c(P) | arg:', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check([]);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a(P),b,c(P) | arg:a(P),b,c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(PD),b,c(P) | arg:b,c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-b', '-c', '3']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(PM) | arg:a(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', must: true}
        }
      });
      ac.check(['-a', '1']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a(PM) | arg:a >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A', must: true}
          }
        });
        ac.check(['-a']);
      })
    });

    it('expect:a | arg:a,a >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {}
          }
        });
        ac.check(['-a', '-a']);
      })
    });

    it('expect:a | arg:b >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {}
          }
        });
        ac.check(['-b']);
      })
    });

    it('expect:a(P) | arg:b(P) >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A'}
          }
        });
        ac.check(['-b', 2]);
      })
    });

    it('expect:a(PR) | arg:a(P),a(P),a(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', repeat: true}
        }
      });
      ac.check(['-a', '1', '-a', '2', '-a', '3']);
      assert.deepEqual(ac.get('-a'), ['1', '2', '3']);
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a(P) | arg:a(P),a(P),a(P) >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A'}
          }
        });
        ac.check(['-a', '1', '-a', '2', '-a', '3']);
      })
    });

    it('expect:XX | arg:XX', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {}
        }
      });
      ac.check(['10']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
    });

    it('expect:XX | arg:XX,YY >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            'XX': {}
          }
        });
        ac.check(['10', '20']);
      })
    });

    it('expect:XX,YY | arg:XX,YY', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {}
        }
      });
      ac.check(['10', '20']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:XX,YY,ZZ | arg:XX,YY,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {}
        }
      });
      ac.check(['10', '20', '30']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:XX,YY,ZZ | arg:XX,YY', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {}
        }
      });
      ac.check(['10', '20']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), undefined);
      assert.equal(ac.isOn('ZZ'), false);
    });

    it('expect:XX,YY,ZZ(M) | arg:XX,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {must: true}
        }
      });
      ac.check(['10', '30']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), undefined);
      assert.equal(ac.isOn('YY'), false);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:XX(M),YY,ZZ(M) | arg:XX >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            'XX': {must: true},
            'YY': {},
            'ZZ': {must: true}
          }
        });
        ac.check(['10']);
      })
    });

    it('expect:XX,YY,ZZ(R) | arg:XX,YY,ZZ1,ZZ2,ZZ3', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {repeat: true}
        }
      });
      ac.check(['10', '20', '30', '31', '32']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.deepEqual(ac.get('ZZ'), ['30', '31', '32']);
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:XX,YY(R),ZZ | arg:XX,YY1,YY2,YY3,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {repeat: true},
          'ZZ': {}
        }
      });
      ac.check(['10', '20', '21', '22', '30']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.deepEqual(ac.get('YY'), ['20', '21', '22']);
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:a(PD),XX(M) | arg:XX', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          'XX': {must: true}
        }
      });
      ac.check(['10']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
    });

    it('expect:a(PD),XX(M) | arg:a,XX >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A', default:'1'},
            'XX': {must: true}
          }
        });
        ac.check(['-a', '10']);
      })
    });

    it('expect:a(PD),b,c(P),XX | arg:a(P),b,c(P),XX', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3', '10']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
    });

    it('expect:a(PD),b,c(P),XX,YY | arg:a(P),b,c(P),XX,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {},
          'YY': {}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3', '10', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(P),XX,YY | arg:a(P),b,c(P),XX', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {},
          'YY': {}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3', '10']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), undefined);
      assert.equal(ac.isOn('YY'), false);
    });

    it('expect:a(PD),b,c(P),XX,YY(M) | arg:a(P),b,c(P),YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {},
          'YY': {must: true}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), undefined);
      assert.equal(ac.isOn('XX'), false);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(P),XX(R),YY(M) | arg:a(P),b,c(P),XX1,XX2,XX3,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {repeat: true},
          'YY': {must: true}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3', '10', '11', '12', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.deepEqual(ac.get('XX'), ['10', '11', '12']);
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(P),XX(M),YY(R) | arg:a(P),b,c(P),XX,YY1,YY2,YY3', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {must: true},
          'YY': {repeat: true}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3', '10', '20', '21', '22']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.deepEqual(ac.get('YY'), ['20', '21', '22']);
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M) | arg:a(P),b,c(P),c(P),c(P),XX1,XX2,XX3,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3', '-c', '4', '-c', '5', '10', '11', '12', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.deepEqual(ac.get('-c'), ['3', '4', '5']);
      assert.equal(ac.isOn('-c'), true);
      assert.deepEqual(ac.get('XX'), ['10', '11', '12']);
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M) | arg:XX1,a(P),b,c(P),c(P),c(P),XX2,XX3,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true}
        }
      });
      ac.check(['10', '-a', '1', '-b', '-c', '3', '-c', '4', '-c', '5', '11', '12', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.deepEqual(ac.get('-c'), ['3', '4', '5']);
      assert.equal(ac.isOn('-c'), true);
      assert.deepEqual(ac.get('XX'), ['10', '11', '12']);
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M),ZZ | arg:XX1,a(P),b,c(P),c(P),c(P),XX2,YY,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true},
          'ZZ': {}
        }
      });
      ac.check(['10', '-a', '1', '-b', '-c', '3', '-c', '4', '-c', '5', '11', '20', '30']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.deepEqual(ac.get('-c'), ['3', '4', '5']);
      assert.equal(ac.isOn('-c'), true);
      assert.deepEqual(ac.get('XX'), ['10', '11']);
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M),ZZ | arg:XX,a(P),b,c(P),c(P),c(P),YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true},
          'ZZ': {}
        }
      });
      ac.check(['10', '-a', '1', '-b', '-c', '3', '-c', '4', '-c', '5', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.deepEqual(ac.get('-c'), ['3', '4', '5']);
      assert.equal(ac.isOn('-c'), true);
      assert.deepEqual(ac.get('XX'), ['10']);
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), undefined);
      assert.equal(ac.isOn('ZZ'), false);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY,ZZ(M) | arg:XX,a(P),b,c(P),c(P),c(P),ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'5'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {},
          'ZZ': {must: true}
        }
      });
      ac.check(['10', '-a', '1', '-b', '-c', '3', '-c', '4', '-c', '5', '30']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), true);
      assert.deepEqual(ac.get('-c'), ['3', '4', '5']);
      assert.equal(ac.isOn('-c'), true);
      assert.deepEqual(ac.get('XX'), ['10']);
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), undefined);
      assert.equal(ac.isOn('YY'), false);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:a(PD),b,c(PR),XX(M),YY,ZZ(M) | arg:XX,a(P),b,c(P),c(P),YY,ZZ1,ZZ2 >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A', default:'5'},
            '-b': {},
            '-c': {param: 'PARAM_C', repeat: true},
            'XX': {must: true},
            'YY': {},
            'ZZ': {must: true}
          }
        });
        ac.check(['10', '-a', '1', '-b', '-c', '3', '-c', '4', '20', '31', '32']);
      })
    });

  });

});
