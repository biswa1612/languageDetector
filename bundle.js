(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var possibleNames = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

module.exports = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof global[possibleNames[i]] === 'function') {
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":3,"get-intrinsic":8}],3:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":7,"get-intrinsic":8}],4:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%');
if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"get-intrinsic":8}],5:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],6:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],7:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":6}],8:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('has');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":7,"has":11,"has-symbols":9}],9:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":10}],10:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],11:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":7}],12:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],13:[function(require,module,exports){
'use strict';

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{"call-bind/callBound":2}],14:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};

},{}],15:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('foreach');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var hasSymbols = require('has-symbols')();
var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

var typedArrays = availableTypedArrays();

var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arr = new global[typedArray]();
		if (!(Symbol.toStringTag in arr)) {
			throw new EvalError('this engine has support for Symbol.toStringTag, but ' + typedArray + ' does not have the property! Please report this.');
		}
		var proto = getPrototypeOf(arr);
		var descriptor = gOPD(proto, Symbol.toStringTag);
		if (!descriptor) {
			var superProto = getPrototypeOf(proto);
			descriptor = gOPD(superProto, Symbol.toStringTag);
		}
		toStrTags[typedArray] = descriptor.get;
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var anyTrue = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!anyTrue) {
			try {
				anyTrue = getter.call(value) === typedArray;
			} catch (e) { /**/ }
		}
	});
	return anyTrue;
};

module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag) {
		var tag = $slice($toString(value), 8, -1);
		return $indexOf(typedArrays, tag) > -1;
	}
	if (!gOPD) { return false; }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":1,"call-bind/callBound":2,"es-abstract/helpers/getOwnPropertyDescriptor":4,"foreach":5,"has-symbols":9}],16:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};

},{}],17:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],18:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],19:[function(require,module,exports){
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

var isArgumentsObject = require('is-arguments');
var isGeneratorFunction = require('is-generator-function');
var whichTypedArray = require('which-typed-array');
var isTypedArray = require('is-typed-array');

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBufferCopy === 'undefined') {
    return false;
  }

  if (typeof isSharedArrayBufferToString.working === 'undefined') {
    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBufferCopy;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});

},{"is-arguments":13,"is-generator-function":14,"is-typed-array":15,"which-typed-array":21}],20:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  var debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = require('./support/types');

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

}).call(this)}).call(this,require('_process'))
},{"./support/isBuffer":18,"./support/types":19,"_process":17,"inherits":12}],21:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('foreach');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var hasSymbols = require('has-symbols')();
var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		if (typeof global[typedArray] === 'function') {
			var arr = new global[typedArray]();
			if (!(Symbol.toStringTag in arr)) {
				throw new EvalError('this engine has support for Symbol.toStringTag, but ' + typedArray + ' does not have the property! Please report this.');
			}
			var proto = getPrototypeOf(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			toStrTags[typedArray] = descriptor.get;
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var foundName = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!foundName) {
			try {
				var name = getter.call(value);
				if (name === typedArray) {
					foundName = name;
				}
			} catch (e) {}
		}
	});
	return foundName;
};

var isTypedArray = require('is-typed-array');

module.exports = function whichTypedArray(value) {
	if (!isTypedArray(value)) { return false; }
	if (!hasToStringTag) { return $slice($toString(value), 8, -1); }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":1,"call-bind/callBound":2,"es-abstract/helpers/getOwnPropertyDescriptor":4,"foreach":5,"has-symbols":9,"is-typed-array":15}],22:[function(require,module,exports){
const franc = require("franc");
const langs = require("langs");
const colors = require("colors");
const langForm = document.querySelector('#detect');
const container = document.querySelector('#language');

langForm.addEventListener('submit', function (e){
    e.preventDefault();
    const input = document.querySelector('input').value;
    const langCode = franc(input);
    if(langCode === 'und'){
        const newpara = document.createElement('P');
        newpara.innerText = 'Sorry unable to detect!!!';
        container.classList.add('red');
        container.append(newpara);
    }
    else{
        const language = langs.where("3", langCode);
        const newpara = document.createElement('P');
        newpara.append(`Our best guess is: ${language.name}`);
        container.classList.add('green');
        container.append(newpara);
    }
    
});

// const input = process.argv[2];
// console.log(input);
// const langCode = franc(input);
// const language = langs.where("3", langCode);
// console.log(language.name);
},{"colors":28,"franc":38,"langs":40}],23:[function(require,module,exports){
'use strict'

module.exports = collapse

// `collapse(' \t\nbar \nbaz\t') // ' bar baz '`
function collapse(value) {
  return String(value).replace(/\s+/g, ' ')
}

},{}],24:[function(require,module,exports){
/*

The MIT License (MIT)

Original Library
  - Copyright (c) Marak Squires

Additional functionality
 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var colors = {};
module['exports'] = colors;

colors.themes = {};

var util = require('util');
var ansiStyles = colors.styles = require('./styles');
var defineProps = Object.defineProperties;
var newLineRegex = new RegExp(/[\r\n]+/g);

colors.supportsColor = require('./system/supports-colors').supportsColor;

if (typeof colors.enabled === 'undefined') {
  colors.enabled = colors.supportsColor() !== false;
}

colors.enable = function() {
  colors.enabled = true;
};

colors.disable = function() {
  colors.enabled = false;
};

colors.stripColors = colors.strip = function(str) {
  return ('' + str).replace(/\x1B\[\d+m/g, '');
};

// eslint-disable-next-line no-unused-vars
var stylize = colors.stylize = function stylize(str, style) {
  if (!colors.enabled) {
    return str+'';
  }

  var styleMap = ansiStyles[style];

  // Stylize should work for non-ANSI styles, too
  if(!styleMap && style in colors){
    // Style maps like trap operate as functions on strings;
    // they don't have properties like open or close.
    return colors[style](str);
  }

  return styleMap.open + str + styleMap.close;
};

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
var escapeStringRegexp = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe, '\\$&');
};

function build(_styles) {
  var builder = function builder() {
    return applyStyle.apply(builder, arguments);
  };
  builder._styles = _styles;
  // __proto__ is used because we must return a function, but there is
  // no way to create a function with a different prototype.
  builder.__proto__ = proto;
  return builder;
}

var styles = (function() {
  var ret = {};
  ansiStyles.grey = ansiStyles.gray;
  Object.keys(ansiStyles).forEach(function(key) {
    ansiStyles[key].closeRe =
      new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
    ret[key] = {
      get: function() {
        return build(this._styles.concat(key));
      },
    };
  });
  return ret;
})();

var proto = defineProps(function colors() {}, styles);

function applyStyle() {
  var args = Array.prototype.slice.call(arguments);

  var str = args.map(function(arg) {
    // Use weak equality check so we can colorize null/undefined in safe mode
    if (arg != null && arg.constructor === String) {
      return arg;
    } else {
      return util.inspect(arg);
    }
  }).join(' ');

  if (!colors.enabled || !str) {
    return str;
  }

  var newLinesPresent = str.indexOf('\n') != -1;

  var nestedStyles = this._styles;

  var i = nestedStyles.length;
  while (i--) {
    var code = ansiStyles[nestedStyles[i]];
    str = code.open + str.replace(code.closeRe, code.open) + code.close;
    if (newLinesPresent) {
      str = str.replace(newLineRegex, function(match) {
        return code.close + match + code.open;
      });
    }
  }

  return str;
}

colors.setTheme = function(theme) {
  if (typeof theme === 'string') {
    console.log('colors.setTheme now only accepts an object, not a string.  ' +
      'If you are trying to set a theme from a file, it is now your (the ' +
      'caller\'s) responsibility to require the file.  The old syntax ' +
      'looked like colors.setTheme(__dirname + ' +
      '\'/../themes/generic-logging.js\'); The new syntax looks like '+
      'colors.setTheme(require(__dirname + ' +
      '\'/../themes/generic-logging.js\'));');
    return;
  }
  for (var style in theme) {
    (function(style) {
      colors[style] = function(str) {
        if (typeof theme[style] === 'object') {
          var out = str;
          for (var i in theme[style]) {
            out = colors[theme[style][i]](out);
          }
          return out;
        }
        return colors[theme[style]](str);
      };
    })(style);
  }
};

function init() {
  var ret = {};
  Object.keys(styles).forEach(function(name) {
    ret[name] = {
      get: function() {
        return build([name]);
      },
    };
  });
  return ret;
}

var sequencer = function sequencer(map, str) {
  var exploded = str.split('');
  exploded = exploded.map(map);
  return exploded.join('');
};

// custom formatter methods
colors.trap = require('./custom/trap');
colors.zalgo = require('./custom/zalgo');

// maps
colors.maps = {};
colors.maps.america = require('./maps/america')(colors);
colors.maps.zebra = require('./maps/zebra')(colors);
colors.maps.rainbow = require('./maps/rainbow')(colors);
colors.maps.random = require('./maps/random')(colors);

for (var map in colors.maps) {
  (function(map) {
    colors[map] = function(str) {
      return sequencer(colors.maps[map], str);
    };
  })(map);
}

defineProps(colors, init());

},{"./custom/trap":25,"./custom/zalgo":26,"./maps/america":29,"./maps/rainbow":30,"./maps/random":31,"./maps/zebra":32,"./styles":33,"./system/supports-colors":35,"util":20}],25:[function(require,module,exports){
module['exports'] = function runTheTrap(text, options) {
  var result = '';
  text = text || 'Run the trap, drop the bass';
  text = text.split('');
  var trap = {
    a: ['\u0040', '\u0104', '\u023a', '\u0245', '\u0394', '\u039b', '\u0414'],
    b: ['\u00df', '\u0181', '\u0243', '\u026e', '\u03b2', '\u0e3f'],
    c: ['\u00a9', '\u023b', '\u03fe'],
    d: ['\u00d0', '\u018a', '\u0500', '\u0501', '\u0502', '\u0503'],
    e: ['\u00cb', '\u0115', '\u018e', '\u0258', '\u03a3', '\u03be', '\u04bc',
      '\u0a6c'],
    f: ['\u04fa'],
    g: ['\u0262'],
    h: ['\u0126', '\u0195', '\u04a2', '\u04ba', '\u04c7', '\u050a'],
    i: ['\u0f0f'],
    j: ['\u0134'],
    k: ['\u0138', '\u04a0', '\u04c3', '\u051e'],
    l: ['\u0139'],
    m: ['\u028d', '\u04cd', '\u04ce', '\u0520', '\u0521', '\u0d69'],
    n: ['\u00d1', '\u014b', '\u019d', '\u0376', '\u03a0', '\u048a'],
    o: ['\u00d8', '\u00f5', '\u00f8', '\u01fe', '\u0298', '\u047a', '\u05dd',
      '\u06dd', '\u0e4f'],
    p: ['\u01f7', '\u048e'],
    q: ['\u09cd'],
    r: ['\u00ae', '\u01a6', '\u0210', '\u024c', '\u0280', '\u042f'],
    s: ['\u00a7', '\u03de', '\u03df', '\u03e8'],
    t: ['\u0141', '\u0166', '\u0373'],
    u: ['\u01b1', '\u054d'],
    v: ['\u05d8'],
    w: ['\u0428', '\u0460', '\u047c', '\u0d70'],
    x: ['\u04b2', '\u04fe', '\u04fc', '\u04fd'],
    y: ['\u00a5', '\u04b0', '\u04cb'],
    z: ['\u01b5', '\u0240'],
  };
  text.forEach(function(c) {
    c = c.toLowerCase();
    var chars = trap[c] || [' '];
    var rand = Math.floor(Math.random() * chars.length);
    if (typeof trap[c] !== 'undefined') {
      result += trap[c][rand];
    } else {
      result += c;
    }
  });
  return result;
};

},{}],26:[function(require,module,exports){
// please no
module['exports'] = function zalgo(text, options) {
  text = text || '   he is here   ';
  var soul = {
    'up': [
      '̍', '̎', '̄', '̅',
      '̿', '̑', '̆', '̐',
      '͒', '͗', '͑', '̇',
      '̈', '̊', '͂', '̓',
      '̈', '͊', '͋', '͌',
      '̃', '̂', '̌', '͐',
      '̀', '́', '̋', '̏',
      '̒', '̓', '̔', '̽',
      '̉', 'ͣ', 'ͤ', 'ͥ',
      'ͦ', 'ͧ', 'ͨ', 'ͩ',
      'ͪ', 'ͫ', 'ͬ', 'ͭ',
      'ͮ', 'ͯ', '̾', '͛',
      '͆', '̚',
    ],
    'down': [
      '̖', '̗', '̘', '̙',
      '̜', '̝', '̞', '̟',
      '̠', '̤', '̥', '̦',
      '̩', '̪', '̫', '̬',
      '̭', '̮', '̯', '̰',
      '̱', '̲', '̳', '̹',
      '̺', '̻', '̼', 'ͅ',
      '͇', '͈', '͉', '͍',
      '͎', '͓', '͔', '͕',
      '͖', '͙', '͚', '̣',
    ],
    'mid': [
      '̕', '̛', '̀', '́',
      '͘', '̡', '̢', '̧',
      '̨', '̴', '̵', '̶',
      '͜', '͝', '͞',
      '͟', '͠', '͢', '̸',
      '̷', '͡', ' ҉',
    ],
  };
  var all = [].concat(soul.up, soul.down, soul.mid);

  function randomNumber(range) {
    var r = Math.floor(Math.random() * range);
    return r;
  }

  function isChar(character) {
    var bool = false;
    all.filter(function(i) {
      bool = (i === character);
    });
    return bool;
  }


  function heComes(text, options) {
    var result = '';
    var counts;
    var l;
    options = options || {};
    options['up'] =
      typeof options['up'] !== 'undefined' ? options['up'] : true;
    options['mid'] =
      typeof options['mid'] !== 'undefined' ? options['mid'] : true;
    options['down'] =
      typeof options['down'] !== 'undefined' ? options['down'] : true;
    options['size'] =
      typeof options['size'] !== 'undefined' ? options['size'] : 'maxi';
    text = text.split('');
    for (l in text) {
      if (isChar(l)) {
        continue;
      }
      result = result + text[l];
      counts = {'up': 0, 'down': 0, 'mid': 0};
      switch (options.size) {
        case 'mini':
          counts.up = randomNumber(8);
          counts.mid = randomNumber(2);
          counts.down = randomNumber(8);
          break;
        case 'maxi':
          counts.up = randomNumber(16) + 3;
          counts.mid = randomNumber(4) + 1;
          counts.down = randomNumber(64) + 3;
          break;
        default:
          counts.up = randomNumber(8) + 1;
          counts.mid = randomNumber(6) / 2;
          counts.down = randomNumber(8) + 1;
          break;
      }

      var arr = ['up', 'mid', 'down'];
      for (var d in arr) {
        var index = arr[d];
        for (var i = 0; i <= counts[index]; i++) {
          if (options[index]) {
            result = result + soul[index][randomNumber(soul[index].length)];
          }
        }
      }
    }
    return result;
  }
  // don't summon him
  return heComes(text, options);
};


},{}],27:[function(require,module,exports){
var colors = require('./colors');

module['exports'] = function() {
  //
  // Extends prototype of native string object to allow for "foo".red syntax
  //
  var addProperty = function(color, func) {
    String.prototype.__defineGetter__(color, func);
  };

  addProperty('strip', function() {
    return colors.strip(this);
  });

  addProperty('stripColors', function() {
    return colors.strip(this);
  });

  addProperty('trap', function() {
    return colors.trap(this);
  });

  addProperty('zalgo', function() {
    return colors.zalgo(this);
  });

  addProperty('zebra', function() {
    return colors.zebra(this);
  });

  addProperty('rainbow', function() {
    return colors.rainbow(this);
  });

  addProperty('random', function() {
    return colors.random(this);
  });

  addProperty('america', function() {
    return colors.america(this);
  });

  //
  // Iterate through all default styles and colors
  //
  var x = Object.keys(colors.styles);
  x.forEach(function(style) {
    addProperty(style, function() {
      return colors.stylize(this, style);
    });
  });

  function applyTheme(theme) {
    //
    // Remark: This is a list of methods that exist
    // on String that you should not overwrite.
    //
    var stringPrototypeBlacklist = [
      '__defineGetter__', '__defineSetter__', '__lookupGetter__',
      '__lookupSetter__', 'charAt', 'constructor', 'hasOwnProperty',
      'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString',
      'valueOf', 'charCodeAt', 'indexOf', 'lastIndexOf', 'length',
      'localeCompare', 'match', 'repeat', 'replace', 'search', 'slice',
      'split', 'substring', 'toLocaleLowerCase', 'toLocaleUpperCase',
      'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight',
    ];

    Object.keys(theme).forEach(function(prop) {
      if (stringPrototypeBlacklist.indexOf(prop) !== -1) {
        console.log('warn: '.red + ('String.prototype' + prop).magenta +
          ' is probably something you don\'t want to override.  ' +
          'Ignoring style name');
      } else {
        if (typeof(theme[prop]) === 'string') {
          colors[prop] = colors[theme[prop]];
          addProperty(prop, function() {
            return colors[prop](this);
          });
        } else {
          var themePropApplicator = function(str) {
            var ret = str || this;
            for (var t = 0; t < theme[prop].length; t++) {
              ret = colors[theme[prop][t]](ret);
            }
            return ret;
          };
          addProperty(prop, themePropApplicator);
          colors[prop] = function(str) {
            return themePropApplicator(str);
          };
        }
      }
    });
  }

  colors.setTheme = function(theme) {
    if (typeof theme === 'string') {
      console.log('colors.setTheme now only accepts an object, not a string. ' +
        'If you are trying to set a theme from a file, it is now your (the ' +
        'caller\'s) responsibility to require the file.  The old syntax ' +
        'looked like colors.setTheme(__dirname + ' +
        '\'/../themes/generic-logging.js\'); The new syntax looks like '+
        'colors.setTheme(require(__dirname + ' +
        '\'/../themes/generic-logging.js\'));');
      return;
    } else {
      applyTheme(theme);
    }
  };
};

},{"./colors":24}],28:[function(require,module,exports){
var colors = require('./colors');
module['exports'] = colors;

// Remark: By default, colors will add style properties to String.prototype.
//
// If you don't wish to extend String.prototype, you can do this instead and
// native String will not be touched:
//
//   var colors = require('colors/safe);
//   colors.red("foo")
//
//
require('./extendStringPrototype')();

},{"./colors":24,"./extendStringPrototype":27}],29:[function(require,module,exports){
module['exports'] = function(colors) {
  return function(letter, i, exploded) {
    if (letter === ' ') return letter;
    switch (i%3) {
      case 0: return colors.red(letter);
      case 1: return colors.white(letter);
      case 2: return colors.blue(letter);
    }
  };
};

},{}],30:[function(require,module,exports){
module['exports'] = function(colors) {
  // RoY G BiV
  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta'];
  return function(letter, i, exploded) {
    if (letter === ' ') {
      return letter;
    } else {
      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
    }
  };
};


},{}],31:[function(require,module,exports){
module['exports'] = function(colors) {
  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green',
    'blue', 'white', 'cyan', 'magenta', 'brightYellow', 'brightRed',
    'brightGreen', 'brightBlue', 'brightWhite', 'brightCyan', 'brightMagenta'];
  return function(letter, i, exploded) {
    return letter === ' ' ? letter :
      colors[
          available[Math.round(Math.random() * (available.length - 2))]
      ](letter);
  };
};

},{}],32:[function(require,module,exports){
module['exports'] = function(colors) {
  return function(letter, i, exploded) {
    return i % 2 === 0 ? letter : colors.inverse(letter);
  };
};

},{}],33:[function(require,module,exports){
/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var styles = {};
module['exports'] = styles;

var codes = {
  reset: [0, 0],

  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  brightRed: [91, 39],
  brightGreen: [92, 39],
  brightYellow: [93, 39],
  brightBlue: [94, 39],
  brightMagenta: [95, 39],
  brightCyan: [96, 39],
  brightWhite: [97, 39],

  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],

  bgBrightRed: [101, 49],
  bgBrightGreen: [102, 49],
  bgBrightYellow: [103, 49],
  bgBrightBlue: [104, 49],
  bgBrightMagenta: [105, 49],
  bgBrightCyan: [106, 49],
  bgBrightWhite: [107, 49],

  // legacy styles for colors pre v1.0.0
  blackBG: [40, 49],
  redBG: [41, 49],
  greenBG: [42, 49],
  yellowBG: [43, 49],
  blueBG: [44, 49],
  magentaBG: [45, 49],
  cyanBG: [46, 49],
  whiteBG: [47, 49],

};

Object.keys(codes).forEach(function(key) {
  var val = codes[key];
  var style = styles[key] = [];
  style.open = '\u001b[' + val[0] + 'm';
  style.close = '\u001b[' + val[1] + 'm';
});

},{}],34:[function(require,module,exports){
(function (process){(function (){
/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

module.exports = function(flag, argv) {
  argv = argv || process.argv;

  var terminatorPos = argv.indexOf('--');
  var prefix = /^-{1,2}/.test(flag) ? '' : '--';
  var pos = argv.indexOf(prefix + flag);

  return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};

}).call(this)}).call(this,require('_process'))
},{"_process":17}],35:[function(require,module,exports){
(function (process){(function (){
/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

'use strict';

var os = require('os');
var hasFlag = require('./has-flag.js');

var env = process.env;

var forceColor = void 0;
if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
  forceColor = false;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true')
           || hasFlag('color=always')) {
  forceColor = true;
}
if ('FORCE_COLOR' in env) {
  forceColor = env.FORCE_COLOR.length === 0
    || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
  if (level === 0) {
    return false;
  }

  return {
    level: level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3,
  };
}

function supportsColor(stream) {
  if (forceColor === false) {
    return 0;
  }

  if (hasFlag('color=16m') || hasFlag('color=full')
      || hasFlag('color=truecolor')) {
    return 3;
  }

  if (hasFlag('color=256')) {
    return 2;
  }

  if (stream && !stream.isTTY && forceColor !== true) {
    return 0;
  }

  var min = forceColor ? 1 : 0;

  if (process.platform === 'win32') {
    // Node.js 7.5.0 is the first version of Node.js to include a patch to
    // libuv that enables 256 color output on Windows. Anything earlier and it
    // won't work. However, here we target Node.js 8 at minimum as it is an LTS
    // release, and Node.js 7 is not. Windows 10 build 10586 is the first
    // Windows release that supports 256 colors. Windows 10 build 14931 is the
    // first release that supports 16m/TrueColor.
    var osRelease = os.release().split('.');
    if (Number(process.versions.node.split('.')[0]) >= 8
        && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }

    return 1;
  }

  if ('CI' in env) {
    if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function(sign) {
      return sign in env;
    }) || env.CI_NAME === 'codeship') {
      return 1;
    }

    return min;
  }

  if ('TEAMCITY_VERSION' in env) {
    return (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0
    );
  }

  if ('TERM_PROGRAM' in env) {
    var version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

    switch (env.TERM_PROGRAM) {
      case 'iTerm.app':
        return version >= 3 ? 3 : 2;
      case 'Hyper':
        return 3;
      case 'Apple_Terminal':
        return 2;
      // No default
    }
  }

  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }

  if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }

  if ('COLORTERM' in env) {
    return 1;
  }

  if (env.TERM === 'dumb') {
    return min;
  }

  return min;
}

function getSupportLevel(stream) {
  var level = supportsColor(stream);
  return translateLevel(level);
}

module.exports = {
  supportsColor: getSupportLevel,
  stdout: getSupportLevel(process.stdout),
  stderr: getSupportLevel(process.stderr),
};

}).call(this)}).call(this,require('_process'))
},{"./has-flag.js":34,"_process":17,"os":16}],36:[function(require,module,exports){
module.exports={
  "Latin": {
    "spa": " de|os |de | la|la | y | a |es |ón |ión|rec|ere|der| co|e l|el |en |ien|ent|cho|ech|ció|aci|o a|a p| el|al |a l|as |e d| en|ona|na |da |s d|nte| to|ad |ene|con| su| pr|tod| se|ho | pe|los|per|ers| lo| ti|cia|o d|n d|a t|cio|ida|res| es|tie|ion|rso|te | in|do |to |son|dad| re| li|e s|tad|que|pro|est|oda|men|nci| po|a e| qu|ue | un|ne |s y|lib|n e|su | na|s e|ia |nac|e e|tra|or | pa|ado|a d|nes|se |ra |a c|com|nal|por|er |a s|ual|rta| o |ber|les|one|rá |des|s p|dos|sta|ser|ter|ar |era|ibe|ert|ale| di|a a|nto|l d|del|ica|hos|o e|io |imi|oci|n c|s n|ant|cci|re |e c|y l|ame| as|mie|enc| so|o s|ici|las|par|s t|ndi| cu|ara|dic|bre|una|tos|ntr|l p|s l|e a|pre|cla|o t|a y|omo|man|y a|ial|so |nid|n l|n p| al|mo |e p|s s| ig|igu|gua|uma| fu|nta|y e|soc|o p|no |ali|ten|s a|ade|hum|ran|l t|n t|s c|ria|dis|d d| ca|cas|das|ada|ido|l e|y d|tiv|vid|mbr|a i| hu|fun|und|eli|s i| ma|nda|e i| ha|uni|nad|a u|sar|s o| ac|die|qui|rac|ndo| tr|ind| me|ori|tal|odo|ari|lid|esp|o y|tic|ca |un |esa|cti|cua|ier|ta |lar|ons|ont|iva|ide|med|edi|d y|ele|nos|ist|l m|s h|ecc|sti|tor| le|seg|cie|r e|n a|ito|ios|rse|ie |o i|a o|o l|pen|tri|rim|l y|ami|lig|erá|o c|rot|ote|mat|ond|ern|n s|e h|an |ect|lo |ibr|ple|sus|us ",
    "eng": " th|the| an|he |nd |and|ion| of|of |tio| to|to |on | in|al |ati|igh|rig|ght| ri|or |ent|as |ll |is |ed |in | be|e r|ne |ver|one|s t|all|eve|t t| fr| ha| re|s a|ty |ery|d t| pr| or|e h| ev| co|ht |e a|ng |his|ts |yon|be |ing|ce |ryo| sh|n t|fre|ree|men|her|pro|has|nal|sha|es |nat|y a|for| hi|hal|n a|f t|nt | pe|n o|s o| fo|nce|d i|er |e s|res|ect|ons|ity|l b|ly |e e|ry |an |e o|ter|ers|e i| de|cti|hts|eed|edo|dom| wh|ona|re | no|l a| a |e p| un| as|ny |d f| wi|nit| na|nte| en|d a|any|ere|ith| di|e c|e t|st |y t|ns |ted|sta|per|th |man|ve |om |nti|s e|t o|ch | ar|d o|equ|soc|oci|wit|ess|ote|ial|rea| al| fu| on| so|uni|oth| ma| ac| se|enc| eq|qua|ual|ive|lit|thi|int| st|tat|r t|t a|y o|e w|hum|uma|und|led|cia|l o|e f| is|le |f h| by|by | la|ali|are|y i|con|te | wo|eas| hu|ave|o a|com| me|ic |r a|ge |f a|ms |whe| ch|en |n e|rot|tec|tit|s r| li|o t|ple|s d|rat|ate|t f|o o|wor| fa|hou|dis|t i|nda|nde|eli|anc|rom| su|cie|no |ary|inc|son|age|at |oms|oun|nst|s w|d w|ld |n p|nta|l p|tan|edu|n s|duc|itl|tle|whi|hic|ich|ble|o s|imi|min|law|aw |gni|iti| ot|g t|eme|se |e b|ntr|tra| pu|d n|s i|act|e d|ort| he|r s|cou|unt|pen|ily| ag|ces|rit|it |din|s f|hav|ind| ed|uca|cat|ren|ien|tho|ern|d e|omm",
    "por": "os |de | de| a | e |o d|to |ão | di|ent|da |ito|em | co|eit|as |dir|ire|es |rei| se|ção|ade|a p|e d|s d|dad|men|nte|do |s e| pe| pr|dos| to| da|o e| o |a a|o a|ess|tod|con| qu|que| do|e a|te |al |res|ida|m d| in|er | ou|sso| re| na|a s| po|uma| li|cia| te|pro|açã|e e|ar |a d|a t|ue | su| es|ou |s p|a e|tos|des|com|ra |ia |tem|no | pa|ame|nto|e p|is |est|oda|na |s o|tra|ões|das|pes|soa|o s|s n|o p|ser|s a| à |ais| as| em|o o|e o|ber|oa |o t|ado|a c|sua|ua | no|ter|man|e s| os|s s|e n|çõe|ica|lib|ibe|erd|rda|nci|odo|nal|so |ntr|or |ura|s t|o c|ona| so| ao|hum|ual|sta|ma |ons|a n|era|e t|pre|ara|r a|por| hu|cio|o à|ria|par|ind|e c|ran|gua| um|o i|a l|s c|ndi|m a| en|und|nos|e r|ano|aci|ion|soc|oci|nid|sen|raç| ac|ndo|nsi| ig|igu| fu|fun|m o|nac|per|ali|rec|ime|ont|açõ|int|r p| al|um | me|a i|s h|nta|rio|cçã|ere|pel|l d|a o| ex|pri|uni|ese|ada| ma|ant|ide|nda| fa|am |e f|lid|io |ém |ita|iva|omo|o r|esp|a f|m p|lic|ca |s f|naç|pod|ode|ver|a q|r e|tad|tiv|vid|e l|o q|r d|e i|seu|eli|mo |ecç|s i|ial|ing|ngu|s l| vi|ist|ta |eci|ênc|a m| ca|der|ido|ios| un|dis|cla|qua|se |ati|sti|r o|sid|roc| tr|sem|o n|ao |dam|ens|tur|ico|rot|ote|tec|sse|l e|ena|for| pl| ni|nin|gué|uém|não|ela|tro|ros|ias",
    "ind": "an |ang| da|ng | pe|ak | ke| me| se|ata|dan|kan| di| be|hak|ber|per|ran|nga|yan|eng| ya| ha|asa|men|gan|ara|nya|n p|n d|n k|a d| at|tan|at |ora|ala| ba|san|erh|ap |ya |rha|n b| ma|a s|pen|g b|eba|as |aan| or|ntu|uk |eti|tia|tas|aka|set|ban|n s| un|n y| te|ter|iap|tuk|k m|beb|bas|lam| de|n m|k a|keb|am |i d|ama|unt|ah |dal|end|n h|p o|den|sa |dak|mem|ika|ra |ebe|pun|ri |nda|ela|ma | sa|di |a m|n t|k d|ngg|n a|tau|asi| ti|eri|gar|man|ada|al |um |un |ari|au |lak|a p|ta |a b|ngs|ole| ne|neg|dar|ers|gsa|ida|leh|ert|k h|ana|sam|sia|i m|ia |dap|era|dil|ila|tid|eh |h d|atu|bat|uka|aha|a a|ai |g d|lan|tu |t d|uan| in|ena|har|sem|ser|kat|erl|apa|erb|uat|na |kum|g s|ung|nan|emp|rta|l d|mas|ega|n u| hu|ka |eni|pat|mba|adi| su|aga|ent|nta|huk|uku|rga|ndi|ind|i s|ar |sua|aku|rus|n i|ni |car|si |nny|han| la|in |u d|lah|ik |gga|ua |ian|ann|lai|usi|emb|rik|mer|erk|arg|emu|dun|dip|nas|lua|aru|ema|a u|min|mat|aya|kes|rak|eka|a t|rka|a k|iba|rbu|rma|yat|ini|ina|anu|nus|mua|s p|ut |lin| ta|us |ndu|da |pem|ami|sya|yar|nak|das|k s|kel|ese|mel| pu|ern|a n|aik|uar|t p|g p|ant|ili|dik| an|tin|ing|ipe|tak|iny|ain| um| ja|aks|sar|rse|aup|upu|seo|eor|g m|g t|dir|pel|ura|bai|aba|erd|eca|h p|kep|m m|jam|umu|mum",
    "fra": " de|es |de |ion|nt |et |tio| et|ent| la|la |e d|on |ne |oit|le |e l| le|s d|t d|ati|e p|roi|it | dr|dro| à | co|té |ns |te |e s|men|re | to|tou| l’|con|que|les| qu| so| pe|des|son|ons|s l| un| pr|ue |s e| pa|e c|ts |t l|onn| au|e a|e e|eme| li|ant|ont|out|ute|ers|res|t à| sa| a |ce |per|tre|a d|er |cti| en|ité|lib| re|en |ux |lle|rso| in| ou|un |à l|nne|nat|une|ou |n d|us |par|nte|ur | se| d’|dan|ans|s s|pro|e t|s p|r l|ire|a p|t p|its|és |ond|sa |a l|nce|é d| dé|nal|aux|omm|me |ert| fo| na|iqu|ect|ale| da| ce|t a|s a|mme|ibe|ber|rté|s c|e r|al |t e| po|our|com|san|qui|e n|ous|r d| ne|fon|au |e o|ell|ali|lit| es| ch|iss|tes|éra|air|s n| di|ter|ui | pl|ar |aut|ien|soc|oci|tra|rat|êtr|int|été|pou|du |est|éga|ran|ain|s o|eur|ona|rs |anc|n c|rai|pri|cla|age|nsi|e m|s t| do|bre|sur|ure|ut | êt| ét|à u|ge |ess|ser|ens| ma|cia|l e| su|n p|a c|ein|st |bli| du|ntr|rés|sen|ndi|ir |n t|a s|soi| ég|ine|l’h|nda|rit| ré|t c|s i|il |l’a|e q| te|é e|t s|qu’|ass|ais|cun|peu|ée |tat|ind|t q|u d|n a| ac|tés|idé|l n|ill| as|’en|ign|gal|hom|nta| fa|lig|ins| on|ie |rel|ote|t i|n s|sse| tr|n e|oir|ple|l’e|s é|ive|a r|rec|nna|ssa| mo|s u|uni|t ê|pré|act| vi|era|sid| nu|e f|pay|’ho|cat|leu|ten|rot|tec|s m",
    "deu": "en |er |der| un|nd |und|ein|ung|cht| de|ich|sch|ng | ge|ie |che| di|die|ech|rec|gen|ine|eit| re| da|ch |n d|ver|hen| zu|t d| au|ht | ha|lic|it |ten|rei| be|in | ei| in| ve|nde|auf|ede|den|n s|zu |uf |ter|ne |fre| je|jed|es | se| an|n u|and|sei|run| fr|at |s r|das|hei|hte|e u|ens|r h|nsc|as |nge| al|ere|hat|men|lle|nte|rde|t a|ese|ner| od|ode| we|g d|n g|all|t u|ers| so|d d|n a|nen|te |lei| vo|wer| gr|ben|ige|e a|ion| st|ege|le |cha| me|ren|n j|haf|aft| er|erk|bei|ent|erd| si|kei|tig|eih|ihe|r d|len|on |n i|lun| gl|chu|e s|ist|st |unt|ern|tli|gem|ges|ft |ati|tio|gru|end|ies|mit|eic|sen|r g|e e|ei | wi|n n| na|sta|gun|ite|n z|r s|gle|chl|lie|mei|em |uch|nat|n w|urc|rch|de |hre| sc|sse|ale|ach|r m|des|n e|spr|t w|r e|d f| ni| du|dur|nie| mi|ied|fen|int|dar|e f|e g|geh|e d|f g|t s|ang|ste|hab|abe|h a|n v|alt|tz |hli|sic|her|nun|eme|ruc|taa|aat|he |e m|erf|ans|geg| is|tun|pru|d g|arf|rf |n o|ndl|ehe|e b|h d|d s|dig|arb|wie|r b| ih|r w|nsp|ber|t i|r a|r v|igk|gke|bes|n r|str|gew|rbe|ema|e v|n h| ar|rt |ind|n f|ins|esc|ieß|ken|ger|eru|ffe|ell|han|igu|man|sam|t g|ohn|hul|rst|tra|rli|lte|hut|utz|ls |ebe|von|r o|e i|nne|etz|d a|rn |isc|sel| fa|one|son|et |aus|r i|det|da |raf|iem|e z|lan|sow",
    "jav": "ng |an |ang| ka|ing|kan| sa|ak |lan| la|hak| ha| pa| ma|ngg|ara|sa |abe|ne | in|ant|n k| ng|nin|tan|nga| an|ata|en |ran|man| ba|ban|ane|ong|ra |n u|hi |nth| da|ake|ke |thi|ung|uwo|won|ngs| uw|asa|ben|gsa|sab|ana|aka|beb|nan|a k|nda|g p|adi|at |awa|san|ni |pan| be|dan|eba|g k|e k|ani|bas|g s|dha|aya| pr|gan|mar|di |ya |wa |g u|n s|ta |a s| wa|arb|e h| na|a n|a l|n p|a b|yan| ut|n n|ah |asi| um|g d|as |han|g n| tu|dar|rbe|wen|ggo| di|dak|mat|sar|eni| un|und|iya|a a|k h|kab|ka |be |uma|art|ora|ngk|i h|ala|rta|n b| or|n m|gar|kar|yat|al |g b|na |a m|n i|ega|ina|kak|g a|pra| ta|gge|ger|ena|kat|kal|a p|i k|tum|oni|nya| ne|adh|g m|duw|uwe|dad|kas| pe| si|aga|uta|k k|pa |and|nun|i l|ngu|go |nal| ke|n a|uju|anu|ama|a d|i p|t m|er | li|per|iba|min|sak|apa|war|ha |pad|ggu|gay|ras|taw|ind|eng|a u|we | bi|n l|ali|awi|neg|awe|bak|g t|e p|ndu|bis| ku|ih |ase| me|iji|pri|bad|eh |i t|uwa|ron|ndh|mra|ar | pi|ur |isa|mba|sin|aba|g l|ebu|n t|ika|men|ini|lak|a w|arg|ku |ami|ayo|a i|nas|liy|e s| we|rib|ngl| ik|k b|e d|rga|rap|tin| lu|aku|bed|k a|h k|yom| as| nd|eka|il | te|umu|rak|ut |dil|i w|i s|jin|kon|jud|wae|ae |kap|uha|uto|tow|gka|umr|n d| ti|eda|gon|ona| mi|ate|mum|um |but|r k|wat|si |k p|k l|gaw",
    "vie": "ng |̣c |́c | qu| th|à |nh | ng|̣i | nh| va|và|̀n |uyê| ph| ca|quy|yề|ền|̀i | ch|̀nh| tr| cu|ngư|i n|gươ|ườ|ời|́t | gi| co|ác|̣t |ó |c t|ự |n t|cá|ông| kh|ượ|ợc| tư| đư|đươ|iệ|ìn|́i | ha| đê|i đ|có|gia| mo|mọ|ọi|như|pha|n n|củ|ủa|̉a |̣n | ba|n c|̀u |̃ng|ân |ều| bi|hôn|ất|tự|g t| vi|n đ|đề|t c| la| ti|nhâ| đô|u c|hiê|bả|ên | tô|hân| do|do |́ q|ch |̀ t| na|́n |ới|ay | hi|àn|̣ d| đi|g n|hay|há| mô|ội|hữ|uố|ốc|n v|̣p |́p |quô|thư| ho|nà|ị |́ch|̀ng|ào|̀o |̉n |ôn |i c| hô|c đ|i v|khô|c h|i t|g v| đa|mộ|ột|́ng|tro|ữn|ướ|ia |̣ng|ản|̉ng|h t|hư |ện|ộc|g c|ả | đo|̉ c|là|c c|n h|n b|hà|iế|̣ t| cô| vê|ức|t t|ã |hộ| vơ|iên|g đ|̉i | bâ|̀y |ớc|a c|̉m | sư|áp|ật|viê|vớ|hươ|tha|ực|h v|ron|ong|g b|qua|iá|̀ c|ể |h c|a m|ế |uậ|ảo|̉o |sự|o v|cho|phâ|n l| mi|hạ|côn|o c|̃ h| cư|ục|̀ n| hơ|i h|c q|á |ại|bị|cả|c n| lu|ín|h đ| xa|g h|độ|bấ| nư|m v|thô| tâ|tộ|hả|oà|áo|́o |ốn|ệ |thu|mì| du|̣ c|xã|c p|ải| hư|́ c|ho |y t|o n|n p|ở |hứ|iể|y đ|hấ|ối|chi|án|ề |́ t|ệc|cũ|ũn|tiê|hợ|ợp|o h|hoa|ày|ai |ết|̉ n|c b|đó| đâ|luâ|đố|kha|về|̉ t|c l|̀ đ|i b|nươ| bă|dụ|họ| ta|thê|tri|hí|́nh|g q|p q|n g|o t|c g|hự|yên|i l|́u |an | cơ",
    "ita": " di|to |ion| de| in|la |e d|ne |di | e |zio|re |le |ni |ell|one|lla|a d|rit|o d|itt|del| co|dir|iri|ti |ess|ent| al|azi|tto|te |i d|i i|ere|tà | pr|ndi|e l|ale|ind|o a|e e|gni|e i|nte|con|li |a s| un|i e|ogn|men|uo | og| ne|idu|ivi|e a|div|vid|duo| ha|tti| es|a p|no | li|za |pro|ato|all|sse|per|ser| so|i s| la| su|e p| pe|a l|na |ibe|ali| il|il |e n|lib|ber|e c|ia |ha |che|e s|o s|o e| qu|in |nza|ta |nto| ri|he |o i|oni|sta| o | a |o c|nel|e o|naz|so |o p|o h|gli| po|i u|ond|i p|ame|ers|i c|ver|ro |ri |era|un |lle|a c|ua | ch|ssi|una|el |i a|ert|rtà| l |a a|tat|ant|dis|ei |a e| si| ad|à e|nal| da| le|est|pri|nit|ter|ual| st|ona|are|ità|dei|cia|gua|anz|tut| pa|al | ed| re|sua|ono| na|uni|raz|si |ita|com|ist|man|ed |der|ad |i o|enz|soc|que|res| se|o o|ese| tu|i r|io |ett|à d|on |dic|sia|rso|se |uma|ani|rio|ari|ial|eri|ien|ll |oci|rat|tra|ich|pre|qua|do | um|a t|i l|zza|sci|tri|er |ico|pos|a n|ara|o n|son|att| fo|fon|nda|utt|par|nti|sti|nes|n c| i |chi|hia|iar|int|sen|e u|str|uzi|ati|a r|rop|opr|egu| me|ra |ann| ma| eg|ost|bil|isp|ues| no|ont|rà |tta|ina|ezz|l i|tal| ra|gio|nno|a i|d a|i m|ria| cu|ore|e r|izi|dev|tan|lit|cie|non|sso|sun|ite|ica|l d|ide|lia|cos|i n|nta|a f| is|l p|art",
    "tur": " ve| ha|ve |ler|lar|ir |in |hak| he|her|bir|arı|er |an |eri| bi|ya |r h|ak |ın |eti|iye|ası| ka|yet| ol|tle|ını|ara|eya|akk|kkı|etl|sın|na |esi|de |ek | ta|nda|ini| bu|rın|ile|vey|kla|rin|ne |e h|ır |ine|e k|ına|sin|dır|ere| sa|n h|ama|ınd|nın|mas| ge|le |ı v| va|erk|rke|lma|nma|lan| te|tin|akl|rle|nin|en |e m|ard|a v|ill| de|let|da |k h| me|aya| şa|k v| hü|riy|e b|kın|nı |et |dan|san|e d|var|rdı|kes|si |mil|e a| il|hür|ana|ret|dir| se|şah|mes|irl| mi|ola|bu |ürr|rri|n e|n i|kı |n v|mek| ma|mak|lle|lik|nsa|li |ı h| iş| ed| iç|n b|kar| ba|ala| hi|eli|ulu|a h|eme|re |e s|ni |e t|n k|a b|iş |rak|evl|e i|etm|ik |r ş|ar | eş|olm|un |hai|aiz|izd|zdi|im |dil|n t|nde| gö|ilm|lme|tir|mal|hiç|e g|unm|ma |ele|a i|e e|eşi|şit|ık |mel| et| ko|n s|ahs|i v|sı | an|el |yla|la |ili|r v|rı |anı|ede|ket| ya|lun|may|se |ins|tim|edi|siy|t v|içi|çin|a k|nla|r b|miş|i b|yan|ame|tme| da|bul|mem|eml|eke|mle| ki| ke|lek| in| di|din|uğu|n m|it |ser|ind| mü|arş|rşı|es |ger|a s|len| ay| ku|vle|erd|eye|ye |oru|nam|ken| uy|a m|ün |r a|i i|tür|i m|kor| so|al |hsı|cak|rme|nun|lam|eni|dev|rde|ri |mey|a d|i o|kim|ims|mse|end|ndi|rek|ahi|il |hay|lık|e v|iç |sız| öğ|öğr|ğre| bü|büt|ütü|tün|anl|alı|şma|k g|at |den|i s",
    "pol": " pr|nie| i |ie |pra| po|ani|raw|ia |nia|go |wie| do|ch |ego|iek|owi| ni|ści|ci |awo|a p|do | cz|ośc|ych| ma|ek |rze|prz| na|wo | za| w |ej |noś|czł|zło|eni| je|wa |łow|i p|wol|oln| lu|rod| ka|wsz| wo|lno|y c|ma |każ|ażd|ny |dy |o d|stw|owa|żdy| wy|rzy|ecz|sta| sw|e p|twa|czn|dzi|i w|szy|zys|na |ów |lub|ub |a w|k m|est| sp|kie|wan|ają| ws|pow|e w|spo|nyc|pos|rac|a i|cze|yst|ać |neg|sze|ne |mi |aro|ńst| ja|jak|o p|pod| z |acj|obo| ko|i i|nar|i n| ro|awa| ró|zy |dow|zen|zan|zne|zec|jąc|iej|cy |rów|nej|odn|nic|czy|o s|no |ony|aw |i z|ówn|odz|jeg|o w|edn|o z|aki|o o|a s| st|ni |bez|owo| in|ien|eńs|ami| or|dno|zie|mie| ob|kol|stę|tęp|i k|ez |w c|poł|ołe|łec|ym |orz|jed|o u| os|olw|lwi|wia|ka |owy|owe|y w| be|o n|jes|wob|wyc|a j| od|zna|inn|zyn|aln|któ|cji|ji |się|i s|raz|y s|lud| kr|ją |cza|zes|nik|st |swo|a o|sza|ora|icz|kra|a z|h p|i o|ost|roz|war|ara|że |lni|raj| si|ię |e o|a n|em |eka|stk|tki|pop|ą p|iec|ron|kow|odo|w p|peł|ełn|ran|wni|dni|ows|ech|gan|dów|zon|pie|a d|i l| kt|tór|ini|ejs| de|dek|ywa|iko|z w|god|ków|adz|dst|taw| to|trz|e i|ich|dzy|by |bod|iu |nan|h i|chn|zeń|y z|ano|udz|ieg|w z|ier|ale|a k|z p|zaw|ekl|kla|lar|any|du | zw| go|o r|to |az |y n|ods|ymi|ju |och|nau|wej|i m",
    "gax": "aa |an |uu | ka|ni |aan|umm|ii |mma|maa| wa|ti | fi|nam|ta |tti| na|saa| mi|fi |rga|i k|a n| qa|dha|iyy|oot|mir|irg|in |raa|qab|a i|kan|a k|isa|chu|akk|amu|aba|a f|huu|kam| ta|kka|amn|ami| is|a a|mni|att| bi|yaa|ach|yyu|yuu|ee |miy|wal|waa|ga |aat|ata|a e|tii|oo | ni| ee|moo|ba |ota| ak|a h| ga|i q| dh|daa|a m|haa|ama|i a|a b|yoo|ka |kaa| hi|aas|sum|u n| uu|arg| hu|man| ha| ar| ke| yo| ba|ees|i i|taa|uuf|uf |ada|iin|i f|rra|ani|a w|i w| ad|da |nya|a u|irr|na |hun|isu|hin| ma| ho|ess|und|i m|i b|bar|is |een|ana|mu |bu |i d| sa|f m|add|sa |eeg| ir|i h|n h|u a|aad| la|al |ala|udh|ira|hoj|kee|goo| ya|ook|abu|gac|mum|as |itt|nda|see|n t|n i|uum|n k|ra |rgo|ara|a q|ums|muu|mat|a d|nii|sii|ssa|ati|a g|asu|biy|yya|eef|haw| da| mo|tum|a t|u h|gar|uma|a s|n a|n b|baa|awa|nis|eny|u y|roo|mmo|gam|sat|abs|n m|tee|nna|eer|bir| ku| qo|bil|ili|lis|otu| to|kko|n w|ali|rum|msa|rka| fu|amm|gaa|aaf|era|ya | ye|yer|ero|oti|kun|un |jii|ald|i y|ant|suu|n d|tok|okk|ame|mee|nni|tan| am|lii|n u|aru|lee|gum|ddu|i g|u m|oji|ura|lda|lab|ila|laa|aal|n y|ef |chi|uud| qi|qix|dar|ark|dda|gal|u b| ji|jir|han|art|arb|asa|ega|tam|hii|ffa| se| bu|faa|ndi|n g|bat|oka|kar| mu|mur|aja|uun|naa|sad|a l|lam|ken|enn|u f|egu",
    "swh": "a k|wa |na | ya| ku|ya | na| wa|a m| ha|i y|a h|a n|ana|ki |aki|kwa| kw|hak| ka| ma|la |a w|tu |li |a u|ni |i k|a a|ila| ki|ali|a y|ati|za |ifa|ili| mt|ke | an|kil|kat|mtu|ake|ote|te |ma |ika|ka |we |a s|yo |i n|fa |ata|e k|ama|zi |u a|amb|ia |kut|ina|u w|azi| yo|i z|asi| za|o y|au |yak|uhu|ish|tik|ha |wat| au|u k|e a|mba|hur| bi|ara|sha|uru|mu | as| hi|u n|hi |ru |tai|aif|a b|hal|ayo|cha| uh|i h|yot| ch|awa|chi|atu|e n| zi|u y|ngi|mat|shi|ani|e y|sa |eri|ja |uli| am|ele|i a|end|o k| sh|ima|ami|oja|a t| ta| nc|nch|any|a j|ham|wan|ada|uta|i w|iki|ra |moj|ii |ari|kuw|uwa|ye | la| wo|o h| sa|ti |wak|she|iwe|kan|nay|eza|iri|iwa|fan|bu |i m|uto|lim|ao |her|ria|wen|kam|di | ja|jam| ni|ing|a l|wot|bin|amu|dha|o w|ahi|kaz|zo |da |adh|si | hu|ri |bil|e m|aka|e w|ang|ini|agu|sta|a z|kup|kul|lin|ind|ne |aji|zim|nya|kus|har|nye|asa|nad|dam|rik|iyo| ba|bar| nd|nde|ita|ta |gin|ine|uu |mwe|maa|ndi|kuf|o n|u h|i s|uzi|nga| ye|tah|sil|imu| ut|azo|esh|uni|taa|aar|rif|hii|wez|uba|wam|ush|mbo|bo |ibu|lez|wal|saw|kos|e b|a c| si|aza|tok|oka|tak|eng|dhi|ala|hir|yan|izo|ten|guz| mw|liw|ndo|oa |laz|aha|uku|ian|eli|mam|ua |ndw|zin|aba|pat|del|i b|ufu|nda|a i|mai|ais| um|man|ba |u m|kuh|zwa|sia|tan|taw|e i",
    "sun": "an |na |eun| ka|ng | sa|ana|ang| di| ha|ak |nga|hak|un |ung|keu| ba|anu| an|nu |a b| bo| je|a h|ata|asa|jeu|ina| ng|ara|nan|gan|sa |a k|awa|ah | na|n k|kan|aha|ga |a s|a p|ban| ma|a n|bog|oga|ing|sar| ku| pa|man|a a|ha |san|bae|ae |din|g s|sah|tan|aga|ra | si|ala|kat|n s| pe|ma | ti|per|aya|sin| te| pi| at|n a|aan|pan|lah|gar|n n|u d|ta |eu |kum|ari|ngs|ran|a d|n d|n b|gsa|a m|wa |ama|ku |ike|taw|n p|k h|al | ja|eba|bas|a t|at |ika|beb|asi|atu|pik|kab|una|nda|a j|e b|n h|nag|oh |aba|en |ila|g k|boh|aku|ngg|art|rta|abe|ar |ima|n j|um |di |usa|udu|geu|k a|adi|ola|sak|aca|u s|rim| ay|car|h k|aka|eh |teu|tin| me| po|ti |awe|ngt|sac|jen|u a|uma|ent|k n|gaw|law|dan|uku|ur |teh|h s|bar|aru|ate| hu|nar|n t|jal|aja|dil|ere|iba|ieu|pol|nya|ut |wan|are|mas|ake|upa|pa |yan|huk| so|nus|ngk| du|ura|tun|ya |mpa|isa|lan| ge| mi|u m|kal|uan|ern|tut|tay|h b|hna|kaw|kud|us |und|ena|n m|han|nte|lak| ie|ula|ka | ke|rup| tu|u k| nu|g n|umn|mna|h p|g d|u n|gta|ayu|yun|mba|gam| be|du | ta| wa|wat|eus|a u|ren|umu|i m|ri |eri|rik|u p|dit|ali|h a|k k|k d|ngu|rua|ua | da|amp|men|sal|nge| ra|sas|nas|ona| bi|ame|sab|alm|lma|ami|min|il |kas|ter|mum|rak|mer|ksa|k j|yat|wil|mar|eur|g b|war|gal|kaa|we |tur|e a|r k",
    "ron": " de|și | și|re | în|are|te |de |ea |ul |rep|le |dre|ept|e d| dr|ie |e a|ate|în |tul|ptu| sa| pr|e p|or | pe|la |e s|ori| la| co|lor| or|ii |rea|ce |tat|au | a |ați| ca|ent|ale| fi|ă a| ar|a s|ice|per|ers|uri| li|a d|al |ric| re|e c|e o|nă |i s|ei |tur|men|con| să|lib|ibe|ber|să |rso|tăț|ilo| ac|sau|pri|ăți|i a|i l|l l|car| in|ter|ție|lă |că |tea|a p|ții|soa|oan|ri |nal|in | al|e ș|i î|ril|ană|pre|ui |uni|e f|se |ile|ere|i d|ita| un|ert|e î|a o|ia |i c|fie|ele|ace|i ș|nte|tă |pen|ntr| se|a l|pro| că|ire|ală|eni|est| ni|ă d|lui|a c| cu|n c| nu|ona|sal| as|eri|naț|ând|ră | om| su|ecu|i p|rin|e n|ici|i n|nu |oat|inț|ni |tre| to|tor|ări|soc|oci|ste| na|iun| di| po|l d|va |ega|gal| tr|ă p|ulu|n m|ă î|a a|rec|res|i o| so|fi |sta|sa |uie| au|lit| ce| mo|din|ces|nic|int|nd |i e|cla|ara|ons| îm| eg|a î|rel|e l|ial|i f| fa|ță |leg|e e|tar|ra |ă f|a f|rar|iei|nit|ă c|tru|ru |u d|act|at |rtă|ți |nta|nde|eme|ntu|ame|reb|ebu|bui|toa|l c| o |ion|ă ș|dep|ali|ât |ili|ect|ite|i i|pli|n a|dec|rta|cu |împ|cți|ane|e r|văț|nt |u c|ța |l ș|cia|țio|ită|bil|r ș|poa|ca | st|t î|tri|riv|man|ne |omu|rie|rit|înv|nvă|ăță|mân|mod|od |rot| ma|cur|u a|oar|uma|a ș|rii|era| ex|tra|iil|ani|țiu|lic|t s|nța|eze|ta | va",
    "hau": "da | da|in |a k|ya |an |a d|a a| ya| ko| wa| a |sa |na | ha|a s|ta |kin|wan|wa | ta| ba|a y|a h|n d|n a|iya|ko |a t|ar |ma | na|yan| sa|ba |asa| za| ma|hak|a w| ka|ata|ama|akk|i d|a m| mu|su |owa|a z|iki| ƙa|nci|a b| ci|ai | sh|kow|anc|nsa|a ƙ|a c| su|shi|ka | ku| ga|ne |ani|ci |e d|kum|uma|‘ya|cik| du|uwa|ana| ‘y|i k|ali|ɗan| yi|ada|ƙas|aka|kki|utu|n y|hi |a n| ad| do| ra|mut|tar| ɗa| ab|nda|a g|man|nan|ars|cin|ane|and|n k|min|yi |i a|ke |sam|ins|a i|nin|yin|ki |tum|ni |aɗa|ann|e m|ami|dam|za |en |kan|um |yar|mi |duk|oka|n h| ja|dai|kam|ewa|mat|i y|nna|abi|ash|n s|waɗ|ida|am |re |ga |sar|kok|oki|una|mas|ra |i b|dun|uni|abu|a ‘| ƙu|n j|awa|ce |a r|e s|ara|a ɗ|san|li |aba|cew|she|ƙun|kar|ari|m n|niy| ai|aik|u d|kko|buw|n w| la| ne|rsa|zam|omi|rin|hal|bub|ubu|aya|a l|han|ban|o n|are|add|i m|zai| hu|me |bin|tsa|sas|i s|ake|n ‘| fa|kiy|n m|ans|dom| ce|r d|uns|ƙar| an|jam|ɗin|i w| am|n t|wat|ika|yya|nce|har|ame|gan|hen|n b|n ƙ|dok|fa | ki|yak|ray|abb|din|on |bay|aid|ayi|aci|dan|aur|ili|u k| al|rsu| ts|ukk|kka|aye|nsu|ayu|bba| id|ant|n r|o d|sun|tun|unc|sha| lo|lok|kac|aif|fi |gam|aga|un |lin|aɗi|yuw|aja|fan|i i|ace|uka|n i|war|riy|imi|sak| ir|yay|tab|bat|mar| iy|sab|nta|afi|o a| ak|bi ",
    "fuv": "de | e |e n|nde| ha|la |e e|akk| ka| nd|ina| wa|al |hak|na | in|ndi|ɗo |kke|ii |di |aad|ade|um |ko |i h|ala| mu| ne|lla|ji |wal| jo|mum| fo|all|neɗ|eɗɗ| le| ko|e h|kal|taa|re |aaw| ng|e k|aa |e w|ee |ley|jog|ke |e m|laa|nnd|eed|e l|ɗɗo|aag|ol | ta|o k|kee|gu |ti |dee|a j|ogi|waa|m e|am |le |eji|ond|nga|gal| wo|ɓe |ɗe |e d|awa|gii|ede|eej| re|gol|aan| go|agu|i e|oti|ann|fot|eyd|e t|ɗee|naa|oto|ydi| po|pot|maa| he|een|i n|enn|ni |taw|a i|e j|e f|a k|goo|to |dim|der|ele| aa|o n| de| fa| ba|ngu|oot|er |dir|won|oor| sa|ngo|ka |ndo|i k|a n|ay |ota|a f|ima|e ɓ| to|i f|a e|tee|ren| ja|i w|wa |o f|fof|ore|eyɗ|yɗe|a w|too|ma |o t|awi|i m|kam|o e|hay|and|nan|ñaa|e y|of |eel|e s|hee|aak|nka| do|l e|e g|ira| la| so| ɓe|a t|dii|e i| te|tin|e r|e p|o w|ani|aar|are| na|ral| ña| yi|awo| ya|so |aam|i l| ho|oo |ooj|nng|nge|woo| ma|faw|kaa| mo|u m|und|dow|gaa|en |o i| li|lig|igg|e a|ita|e b| o | nj| mb|o h|nda|ude|ɗi | no|haa|a h| fe| di|iin|iti|tii|yan| tu|tuu|inn|ama|baa|iiɗ|den|tal|aaɗ|yim|imɓ|njo|edd|ine|nee| je|jey|lli|lit|uug|ugn|no |bel|go | hu|ank|je |do |guu| da|mii| ke|a d|ano|non|l n|y g| ɗu|gna|mɓe|ete|i a|wit|jaŋ|aŋd|ŋde| su|alt| ɗe|nna|a a| ɓa|ɓam|amt|tde|ago|l h|m t|ind|ɗɗa|aga|eɗe|ow ",
    "bos": " pr| i |je |rav| na|pra|na |da |ma |ima| sv|a s|nje|a p| da| po|anj|a i|vo |ko |ja |va | u |ako|o i|no | za|ju |e s| im|avo|ti |sva|ava|o n|i p|li |ili|i s|ost|van|vak| ko|ih |ne |a u| sl|nja|jed| ne| dr|koj|ije|i d| bi|stv|im |u s| il|slo|lob|obo|bod| je| ra|pri|sti|vje| ob|a d|om |se | su|e i|a n| se|i i|dru|enj| os|a b|e p|voj|cij|u p|o d|a o|raz|su |i n|uje|ova|u i|edn| nj| od|i u|u o|lo |ran|lju|ni |jen|ovo|aci|iti|o p|a k|oje|žav|nos|dje|e o|bra|pre|a j|pro|ji |i o| ka|nih|bit|jeg| tr|tre|bud|u z|og |sta|drž|rža|e d|u n|pos|mij|elj|svo|reb| bu|avn|jem|ija|e b|ći |aro|rod|red|ba |a z|šti|ka |de |em |aju|iva|lje|ve |e u|jel|jer|bil|ilo| iz|eni|du | do| st|a t|za |tu |nar|tva|odn|gov| sa|nim|m i|e n|vim| ni|u d|o k|oji| sm|dna|ući|ist|i m|eba|ičn|vno| dj|oda|nak|e k|an |nov|sno|stu|aln|nst|eno|eđu|čno|ani|nom|olj|tiv|nac|ave|i b|smi|čov|ovj|osn|a r|nap|ovi|ans|dno|jan|nju|oja|nog|m s|edi|ara|oj |nu |kri| kr|odu|iko|lja|sto|rad|nik|tup| čo|jek|tvo| vj| mi|tel|obr|živ|tit|una|ego|pod|sam|o o|rug| op|nji|din| mo|vu | ov|h p|udu|riv|dst|te | te|a č|vni|svi|i v|ina|i t|ite|o s|u u|m n|zaš|ašt|itu|ak |dni|nic|nič|odr|vol|avi|g p| ta|rim|kla|e t|ao | vr|akv|tno|mje|duć|ona|ada|obi|eds",
    "hrv": " pr| i |je |rav|pra|ma | na|ima| sv|na |ti |a p|nje| po|a s|anj|a i|vo |ko |da |vat|va |no |o i| za|ja |i s|avo| im|sva| u |i p|e s| bi|tko|ju |o n|li |ili|van|ava| sl|ih |ije| dr|ne |ost|jed| ne|u s|ova|nja| os| da| ra| ko|slo|lob|obo|bod|atk|i d|koj|iti| il|stv|pri|im |om | ob| je| su|vje|i u|i n|e i|i i| ka|bit|dru|ati|se |voj|i o|a b|a o|ćen|ući|a n| se|o p|enj|edn|a u|sti| mo|ćav|lo |dje|raz| od|ran|u p|rod|a k|ni |su |mij|u i|svo|ako|a j|aro|drć|rća|pos|eno|e p|pre| nj|e o|ćiv|nar|ji |oje|e n|eni|nih|oda|ći |nov|bra|ra |nim|a d|avn|og |aju|iva|ovo|nos|i b|bil|sno|za |ovi|red|tva|a z|mor|ora|ka |sta|jem|pro|jen|u o|cij|ve |e d|jel|jer|ilo| do|osn|i m|odn| iz|nom|lju|em |lje| ni|aci|oji|o d|du | st|nit|elj|u z|jeg| sa|o o|m i|vno|vim|uje|e b|oj | dj|rad| sm|dna|nak|e k|an |stu|o s|tit|tu |aln|nst|eću|dno|gov|ani|juć|u d|m s|e u|a ć|u u|nju| bu|bud|te |ćov|ovj|tvo|a r|nap|šti|ist|ću |ans|m p|jan|nić|olj|u n|edi|ara|nu |o k|udu|ona|smi|odu|ada|oja|tup| ćo|jek| vj|ina| mi|tel|i v|obr|zaš|ašt|una|dni|ija|pod|sam|duć|rug| op| ta|nji|e m|oso|sob|h p|itk|svi|ite|elo|itu|meć|jim|odr|di |vol|avi|nog|štv|rim|din|kla|će |ao |tno| ći|kak|akv|ave|nac|lja|sto|obi| te|to |vi |ovn|vni|odi|lji",
    "nld": "en |de |an | de|van| va| en| he|ing|cht|der|ng |n d|n v|et |een|ech| ge|n e|ver|rec|nde| ee| re| be|ede|er |e v|gen|het|den| te|ten| op| in|n i| ve|lij| zi|zij|ere|eli|ijk|oor|ht |te |ens|n o|and|t o|ied|ijn| on|ke |op |eid| vo|jn |id |ond|in |sch| vr|n z|rde|aan| ie|aar|ren|men|rij|hei|ord|hte|eft| we|ft |n g|n w|or |n h|eef| me|wor|vri|t r|hee|al |le |of |ati| of|g v|lle|e b| wo|eni| aa|voo|r h|n a| al|nd |e o|n t|ege|erk|t h|jke| na|sta|at | da|e e|end|nat| st|nge|ste|e g|tie|n b|om |die|e r|r d|erw|ij |dig|e s| om|wel|t e|ige|ter|gel|ie |e m|re |t d| za|ers|ijh|jhe|d v|zal|nig|nie|bes|ns |e w|est|d e|g e|e n|ele| do|ge |vol|che|e d|ig |gin|eze|nst|ona|eke|cha|hap|dat|lke|e a| di|waa| to|min|jk |tel| gr|len|eme|lin|elk|ard|doo| wa|eve|ven|n s|str|gro|han|del|ich| ov|ove|n n|t v|tio|ion|wet|it |gem|ijd|met| zo|uit|aat|dez|ze |rin|e i|all|st |ach| ni|toe|n m|ies|es |taa|per|hed|heb|ebb|bbe|ien|sti| ma|nte|ale|kin|nin|mee|daa|el |ben|ema|man|s e|e h|esc|her|lan|ang|ete|g o|wer|is | er|pen|nsc|beg|igd|t g|ont|iet|tig|ron|tin|p v|r e|rwi|wij|ijs| hu|erm|nal|bij|eer|edi|ite|t a|t w|d o|naa|weg|iem|g d|teg|ert|arb|als|d z|tan|tre| la|ar |ame|js |rmi|t b|app|rwe| bi|t z|ker|eri|ken| an",
    "srp": " pr| i |rav|pra| na|na | sv|ma | po|je |da |ima|a p|ja |a i|vo |nje|ko |va |anj|ti |i p|ako| u |a s| da|avo|ju |i s|ost| za|o i|sva| im|vak|o n|e s|ava|nja| sl| ko|om |no | ne|ne |li |u s| dr|ili|a n|slo|obo|koj|ih |lob|bod|im |sti|stv|a o| il| bi|pri|a u| ra| je|og |jed|enj|e p|u p|van|ni |a d|i u|edn|iti|nos|a k|o d|ova|pro| su|i i| os|ran|sta|dru|e i|cij|se |rod| ob|i o|aju|e o|i n|ove| de|aci| ka|ovo| ni| od|ve | se|i d| st|m i|voj|avn|uje|eni|ija|dna|žav|u i|red|su |nov|odi|tva|e b|oja|što|lju|u o|ara|a b|ji |drž|rža|odn|jan|nim|poš|ošt|a j|ka |jen| ov|u u| nj|du |ave|osn|sno|šti|aro|raz|bit|a z|u z|de | iz|nih|o p|u d|e d|pre|vu |u n|lja| tr|tu |eđu|nar|gov|svo|bez|ičn|lje|e n|za |vno|lo |oji| sa|to |an |nak| me|čno|đen|vim|nac|oda|ani|me |iko|nik|ika|e k|pos| kr|tre|reb|nst|stu|e u|ku | do|ašt|tit|aln|dno|jeg|nom|olj|nog|m s| vr|o k|oj |čov|ans|ovi|o s|bra|te |tav|tup|eno|živ|zaš|em |i m|dni|šen|var|riv|rug|vol|avi|tan|štv|kao|ao | li|st |ilo|nju|sme|o j| sm| čo|odu|vre|dst|od |a t|kri| bu|bud| ve|ver|a r|m n|del|tvo|međ|oje|jem|m p|avl|vlj|ego|u v|pod|ena|ugi|la |jav|por| op|ruš|ušt|kom|edi|ba |kla| mo|oju|i b|kak|akv|rad|nu |vek|rim|gla|juć|ude|vni|eba|e r|svi|i v|itu|ter",
    "ckb": " he| û |ên | bi| ma|in | di|na |maf|an | ku|ku | de| ji|xwe|her|iya| xw|ya |kes|kir|rin|iri| ne|ji |bi |yên|afê|e b|de |tin|ke |iyê|e h|es |ye | we|er |di |we |i b|ê d|erk| na|î û| an|ina| be|yê |eye|rke|î y|nê |kî |diy|ete|hey|hem| ci|eke| li|wek|ber|fê |n d|li | bê| se|yî | te|ne |rî |sti|net|tew|yek|af |hev|yan|n b|kar| ki|re |e k|wî |i h| ew|n û|û b|aza|n k| wî| mi|î b|dan|e d|î a|ekî|a m| az|zad|mir|iro|rov|nav|n h|ser|est|a w|ara|bin|ewe|anê|adi|tê |be |emû|mû | yê| ya|ta |ast|tî |ev |ewl|s m|n m|wey| tu|wle| bo|bo | tê|n j| me|ê h|din|ras|î d|n n| da|n w|bat|wed|ema|ê b|cih|st | ge|iye|ing|ar |în |r k| ke| pê|îna|î h|ekh|khe|vî |ana|par|û m|ûna|civ|vak|n e|dî |nge|geh| ye|ê t|ê k|û a|fên|hî |e û|av |eyî|bûn|erb|î m|bik|ê m|a x|iva| re|e n|eyê|vê |ane|man|nên|ela|end| pa|erî|n x| ta|jî |ika|kê |a k|f û|f h|e j|î n|ra |ehî|tiy|tên|û h|a s|rbe|bes|mî |ari|eza| ni|nek|n a|ov |i n|erw|rwe|erd|aye|e e|riy| a |ike|ê x|ovî|û d|inê|etê|tem|yet|eta|ek |ê j|a n|e t|i d|zan|bê |anî|nîn| ra|ama|ere| hi|i a|tuk|uke|bib|lat|awa|u d|ibe|xeb|atê|i m|mal|nda|ewa|a d|a b|arî| ba|edi| hî|hîn|rti| za|ist|e m| wi|mam| şe| qa|qan|anû|nûn|asî|han| ên|a g|u h|tu |dew|let|are|ine|pêş|êr |e a|wel|ger",
    "yor": "ti | ní|ó̩ | è̩|ní | lá|̩n |o̩n|é̩ |wo̩|àn | e̩|kan|an |tó̩| tí|tí | kò|ò̩ | àw|̩tó|è̩ | àt|è̩t|bí |e̩n|àti|lát|áti| gb|lè̩| ló| ó |s̩e|àwo|gbo|̩nì|n l| a | tó|í è|ra | s̩|n t|ò̩k|tó |sí |kò̩|̩ka|o̩ | sí|ìyà|orí|ílè|ì k|̩‐è|dè |yàn|ni |̩ à|ún | or|èdè|jé̩|ríl|è̩‐|‐èd|í à|àbí|n à|nì |ò̩ò|̩ò̩|í ó| tà|tàb| ti|̩ t|jo̩|̩ l|̩e | wo|í ì|nìy|ó n| jé|ló | sì|kò |n è|wó̩|n n| bá|̩ s|rè̩|sì | fú|fún|í a| pé|̩ni| òm| kí|gbà| èn|ènì|pé |in |ba |òmì|nir|ira|ìí |ràn| ìg|ìgb|n o|bá |mìn|ìni|gba|kí |n e| rè|e̩ |̩ n|un |̩ p| o̩|í ò|nín|nú |fi |gbé|yé | ka|ínú|a k|bé̩|mo̩| fi|̩ ì|í i|ó s|i l|wà |o̩d|̩dò|dò̩|̩ o|bò |dá |i ì|bo̩|hun|i ò|o̩m|̩mo|̩ k|áà |̩wó|bo |àgb|ló̩| ò̩|ó j| bí| oh|ohu|í k|n s|írà|bà |ara| ìb|ogb|pò̩|ú ì|yìí|rú |kó̩|ó̩n|i t|̩ ò| lè|lè |̩ e|à t|à l|bog|a w|gé̩| yó|yóò|óò |ò l|̩gb|ò̩r|̩ y|í w|̩ f|í t| wà|ó̩w|yí |ó b|̩ a|ìké|i n|i è|láà|àbò|fin|wùj|ùjo|n k|í e|é̩n| òf|òfi| mì|mìí|ìír|jú |rin|̩é̩|i j|ó t| ar| ir| ná|náà| ìk|̩ b|i s|ú à| yì|kàn|irú|rí | i |è̩k|̩kó|fé̩|é à|i o|s̩é|̩ m| ìd|è̩d|̩dá|i à|àwù|à n|ú è|wù | èt|áyé|í g|í o| mú|a l|láb|ábé|̩è̩|ìn | kú|láì| àà|i g|bé |níp|ípa| ìm|níg|ígb|wò̩|báy|ké̩|mú |í n|de |è̩s|mó̩| dá|i a|dó̩|ó̩g| ni|i p| wó|ayé|ùn |̩ w|a n|n f|n ì|je̩|ò t|n g",
    "uzn": "lar|ish|an |ga |ar | va| bi|da |va |ir | hu|iga|sh |uqu|bir|shi|huq|quq|gan| ha| bo|ini|ng |a e|r b|ni | ta|lis|lik|ing|ida|oʻl|ili|ari|nin|on | in|ins|adi|nso|son|iy | oʻ|lan| ma|har|dir|hi |kin|ash|i b|boʻ| yo| mu|uqi|dan|ila|qig|ega|r i|qla|oʻz| eg|a b| er|erk|kla|qil|oli|ki |gad| ol|nli|lga|at |i h|a o|rki|oki|osh|lig|igi| qa|yok|ib |las|n m| ba| qi|n b|ara|atl|ri |iya| sh|ham|ala|lat|bil|in |r h|bos|a t|siy|a y|cha|n o|a h|ik |a s|inl|a q|yat|nis| et|eti|osi|h h|i v|ani|tla|til|mas|ʻli|asi|ati| qo|i m|ris|im |a i|uql|arn|rni|qar|ha |gi | da|sha|n h|i o|rch|mla|li |i t| xa|arc|bar|ʻz |hun|a a|rla| bu|a m|lin|lib|taʼ| tu| as|h v|tib|aro|un |tga|r v|ikl| be|mum|n q|ali| te|sid| to|mat|amd|mda|tas| ke|shu|lla|shg|hga|n e| ya|dam|aml|oya|xal|hla|ola|iri|irl|ill|rga|iro|tis| de|umk|mki| eʼ|ten|eng|rda| is| sa|gin|imo|tar|ush|ur |ayo|rak| so|alq| ki|aza|k b|oda|oʻr|a k|tni|ʻlg|n v|hda|nda|shq|hqa|zar|miy|i q| mi|mil|r t| si|ak |ada|rat|or |kat|era|siz|am |ch |aso|sos|yot|atn|shl|n t|nid|y t|ana|ti |rin|asl|bu |sin|dav|ilg|as |i y|ech|nga|lak|h k|ino|ʼti|gʻi|muh|a v|bor|uch|lim|a u|uni|lli|n i|uri|si |i e| ka| ch|a d| ja|ami|qon|na |rig|lma|ker|avl|vla|i a|dek|ekl|liy|aka| em|ema|eʼt",
    "zlm": "an |ang| ke| se|ng | da|ada|dan|ara| pe|ak | be|ran|ber| me|ah |nya|hak|per|n s|ata|ala|ya |a s|kan|asa|lah|n k| di|da |aan|gan|nga|dal|erh| ma|n d|eba|rha|a p| ha|kep|pad|yan|ap |ama| ba| ya|nda| te|ra |a b|tia|man|eng|a d|ora|men|iap|n p|ter|epa|san| or|eti|pen| ad| at|n a|a a|h b|set|tan|sia|tau|n t|n b|ta |dak| sa|sa |at |au |ela|apa|pa |beb|bas|p o|h d|n m|keb|end|aka|ega|a k|am |sam|ana|gar|k k|ban|ole|leh|neg| un|lam|di |g a|eh |n y|aha|han|a m|eri|any|ma | ti|a t|uan|mas|ngs|atu|seb|ebe|ing|ian|car|bag| ne|mem|kes|mat|gsa|ia |ika|i d|nan|asi|und| la|epe|ert|agi|emb|na |ers| de|emu|pem|ngg|anu|i m|ind|erk|ung|n h|tu |gi |kla|g b|pun|iha| in|nus|usi|tin|al |si |as |akl|dap|erl|era|sec|eca|i s|lan|bar|k m|ena|aya| as|sas|nny|rta|sem|awa| su|bol|rat|den|ini|ni | ta| he|hen| an|tar|g m|ai |kem|adi|had|in |ti |i k| bo|uka| ap|g t|ka |ann|ema|g s|ain|k h|rka|ri |n i|aga|un |ses|dun|enu|emp|elu|lai|kat|ent|nta|rsa|iad|ua |dia|ira|a n|mpu|ntu|uk |mel|k d|har|ker|dil|mar|h m|aja|ila|k a|mba|lua|i a|rak|uat|jua|rma| pu|t d|rga|i p|uma|ser|esi|ar |esa|nak|bah|rli|lin|ndu|dar|ari|ese|l d|ant|ngk| ol|sua|g d|ati|tuk|erm|saa|erj|rja|kea|raa|gam|g u|tik|ida|sek|eka|sat|i b|mbe|unt|dir|iri",
    "ibo": "a n|e n|ke | na|na | ọ | bụ|nwe| n |ere|ọ b|re |nye| nk|ya |la | nw| ik| ma|ye |e ọ|ike|a o|nke|ụ n|a m| ya|a ọ|ma |bụl|ụla|e i| on| a |iki|kik|ka |ony|ta |bụ |kwa|i n|a i| nd|di |a a|wa |wer|do | mm|dụ |e a|any|ha | ga| ok|e m| ob|he |ndi|e o|a e|ite|ọ n|rụ |hi |ga‐|mma|wu | dị|aka|ara|che|oke|o n|we |n o| ih|mad|adụ|obo|bod|odo|a g|te | ez|hị | ka|ụta|be | an|akw|zi |a‐e|dị | oh|gba|nya|u n|ihe| ak|me |i m|ala|ri | ọz|ghi|ohe|her| mb|ba | nt| si| iw|weg|pụt|ra |iri|chi|ụrụ|rị |zọ |oro|ro |iwu|a‐a|ụ ọ|ụ i| eb|ebe|e ị|a y| in|ezi|kpa|kpe|inw|mba|sit|ịrị|ile|le | ha|e e|bi |n e|chị| en| e |i ọ|asị|mak| ni|nil|ghị|si |ide|a u|o i|i o|i i|apụ|a s|e y|u o|ụ m|ahụ|hụ |a ụ|nkw|edo|n a|ru |ụ o|ozu|enw|ọzọ|kwu|gid|sor|egh|yer|tar|n i|pa |eny|uru|kwe|toz|ị o| mk|ama|de |uso|tu | im|ime| me|i a|ịch|ọ d| ịk|obi| ọn|hed| ọr|ọrụ| to| ch|gas|wet|mkp| kw|osi|a d| nh|nha|ọnọ|nọd| al| nc|nch|sir| o |n u|sịr|eta|u ọ|ị m|n ụ| us|nọ | ot|otu| gb|ọdụ|nwa|o m| ag|ali|lit|ọta|ega|ị n|e k|e s|ji |a k|ikp|ọch| ug|ban|ekọ|pe |nta|agb|na‐|n ọ|hu |i e|e g|a b|zu |chọ|u a|kwụ|ram|esi|uch|onw| nọ|ị k|u m|eme|wan|e h|dịg|ịgh|hịc|ugw|gwu| di|ich|cha| og|okp|kpu| nn|zụz|zụ |i ị|o y|ach| ng|pụr|ị e|a h|meg|nat|uwa",
    "ceb": "sa | sa|ng |ang| ka|an | pa|ga | ma|nga|pag| ng|a p|on |kat|a k|od |ug | ug|g m| an|ana|n s|ay |ata|ung|ngo|a m|atu|ala|san|ag |tun|g s|g k|d s|god|a s|ong| mg|mga|g p|n u|yon|pan|a a|usa|ing|tag|tan|una|mat|ali|aga|g u|han| us|nan|y k|man|ina|non|kin| na|lan|syo|a b|asa|nay|a i|n n| ta|awa|nas|taw| o |nsa|gaw|a n|agp|dun|iya|ban|isa|was| ad|adu| gi|ili|ini|asy|bis|nag|g a|a t|o s| bi|nah|lin| ki|al |sam|lay|ahi|nal| ba|ano| wa|wal|asu|agt| di|yan|ama|a u|n a|ags| iy|gan|n k|kan|him|kag|ya | un|gpa|kas|aha| su|g t|awh|wha|gsa|l n|agk|gka|a g|gla|kal|gal|ran|sud|ud |imo|d u|aba|aka|ika|ig |ngl|ipo|g d|ara|g n|uka|uns|uta|d n|og |i s|y s|kau|li |n o|aki|o p|kab| og|ot |mta|gik| si|n m|gpi| la|g i|aho|ayo|iin|ok |awo|hat|o a|gon|ip |a w|apa|lip|na |a h|bal|la |ad | ga| ti| hu|uba|wo |ati|uga|hon|hin|ma |sal| ub|agb|gba|nin| bu|buh|uha|t n|ahu|may|pin|as |ni |mak|ihi|abu|uma| in|say|d a| pi|dil| ni|ins| pu|agh|at |hun|but|aug|lak|bah|sak|o u|mal|s s|os |amt|t s|pod|sos|ngp|lam|aod|ila|a d|ami|k s|tin|ura|mo |agi|tra| at|bat|aan|ulo|iha|ha |n p|kar|oon|sya|ona|aya|in |inu| hi|it |agl|amb|mbo|mag|a l|ho |lao| al| il|iko|ngb|mah|lih|g b|gta|gtu|y p|rab|ato|tar|nab| re| so|osy|yal|aw |gda",
    "tgl": "ng |ang| pa|an |sa | sa|at | ka| ng| ma|ala|g p|apa| na|ata|pag|pan| at| an|ay |ara|ga |a p|tan|g m| mg|mga|n n|pat| ba|aya|n a|na |ama|g k|kar|awa|a k|lan|rap|gka|nga|n s|g n|g b|a a|aha| ta|agk|gan|asa|tao|aka|yan|ao |a m|may|man|kal|ing|nan|a s| la|aga|ban|ali|g a|ana|y m|kat|san|kan|pam|g i|ong|mag|a n|baw|o a|wat| y |isa|lay|y k|t t|ila|g s|in |kas|o y|aan| ay|ina|t n|t p|wal|ag |una|yon| it| o |nag|tay|pin|ili|ans|lal|ito|any|nsa|kak|a i|lah|mam|nta|nya|gal|hay|to |ant|aba|ran|agt|on |han|agp|kap| ga|t s| wa|gaw|o m|ya |as |g t|lip|y n|hat|g l|ung|ngk|no |gpa|lag|gta|t m|wa |yaa|ari|sal|a l|kai|pap|lin| pi|ita|ahi| is| di|agi|ipi|bat|mak|pun|a b|y s|aki|tat|la |hin|pah|yag|gay|o n|ags|iti|di |i n|sas| si|t a|al |a t|ika|mal|s n|ipu|t k|ais|hal|i a|sap|lit|od |ihi|alo|y p|ani|ig |par|ap | ip|tas|gin|gga|nin|uma|gsa|ano|ira|a g|nah|uka|syo| bu|ini|o s|nap|ngi|o p| ha|a h|mah|a o|li |ipa|uha|asy|lam|iba|aru|mba|g e|usa|lim|sam|pil| da|kin|duk|sin|dai|aig|igd|gdi|dig| tu|d n|ba |nas|pak|iga|kil|n o|nak|ad |lig|git|lab|ma |kab|nar|tag| ed|edu|aho|buh|and|nda|mas|pas| ib|it |ri |lun|ula|agb|g g|ain|pul|ino|gi |sar|g w|abu|s a|api|nil|iyo|siy|iya|anl|uli|aun|agg|amb|g d|ati| li|i m",
    "hun": " sz| a |en | va|és | és|min|ek | mi| jo|jog|ind|an |nek|sze|ság| az|gy |nde|ala|sza|den|az |a v|val|ele| el|mél|oga|egy|n a| eg|ga |zem|zab| me|emé|van|int|tel|aba|bad|tet|ak | te|tás| ne|gye|t a|ény|ély|tt |n s|ben|zet|ség|lam|meg|nak|ni |ete| se|lyn|yne|s a| al|let|z e|ra |et |agy|sen|eté|k j|tek|mel|kin|ok | ki|ez |hoz|oz |n m|re |vag|ett|emb|mbe|es | kö| le|nem|ell|em |ely|hog|ogy|s s|gok|atá|k a|nt |köz| ho|z a|hez|el |len|yen|ásá|ads|dsá|tés| em|a m|a s|nte| ál|k m|ás |a t|szt|áll|a h|y a|ogo|sem|ber|ban|enk|nki|nye|lap|t s|ese|ame|nyi|k é|ágo|ló |ág |t m|on | vé|i m|ami|ébe|s e|lat|lla|ly |mén|fel|tat|eri|lő |a n|eki|n v|yes|emz|mze|lle|a a| cs|át |kül|elő|l a|nd | ke|ég |i é|lis|vet|éte|ért|rés|yil|ésé|enl|szo| am|tar|art|alá|elé|a j| ny|koz|het|ész|ja |lem|nlő|ri |i j|s é|éle|ól |aló|kel| ha|ges|zás|más|s t|tár|s k|t é|vel|tko|zés|ése|se |tő |ot |ott|sít| fe|n k|lek|tte|olg|áza|ssá|e a|eve|szá|ti |n e|ül |zte|ána|zto|tos|árs|os |k k|eze|leh|ehe|t n|tes|kor|atk|del|t k|tot|ány|ége|fej|i v| né|ház|leg|k e|ll |nev|is |ába|t t|véd|éde|d a|zer|ere|kif|ife|téb|ny |ai | bi|biz|izt|i e|sül|lt |zat|at |elm| ar|arr|rra|sel|t e|ágá|s n|csa| mu|nél|it |esz| há|zas|ass|üle| ta|nyo|alk",
    "azj": " və|və |ər |lar| hə|in |ir | ol| hü|hüq|üqu| bi|quq|na |lər|də |hər| şə|bir|an |lik| tə|r b|mal|lma|ası|ini|r h|ən |şəx|əxs|qla|arı|a m|dir|ali|aq |uqu| ma|ilə|ın |una|yət| ya|ara|ikd|ar |əri|əsi|r ş|rin|əti|dən|nin|n h| az|yyə|sin| mü|tin|ni |zad|iyy| mə|ərə|mək|ün |nda|ət |i v|ını|nın|ndə|ə a|aza|rın|qun|olu| et| qa|lıq|ilm|kdi|lə |ə y|ək |lmə|ına|ind|olm|xs |mas|sın|lun| in|ə b|da |n t|əmi| bə|adl|dlı|n m|nə |q v|ya |tmə|bər| on|ə h|əya|sı |nun|etm|dan|inə|maq|un |raq|ə v| va|n a|n b|rlə|ə m|si |əra|n i|ınd| öz|anı|nma|ama|rı |ığı|li |il | al|ala| di|ə d|ik |irl|ins|lət|a b|bil|ıq |müd| sə|ə i|nı |nla|ələ|dil|alı|ə e|unm|n v|ola|asi|üda|ili| də|nsa|san|uql|ə o|xsi| he|uq |ətl|həm|əni|eyn|u v| da|tər|min|yin|kil|dır| bu|lan|iş | ha|məs| ki|mi |lığ|ə q|q h|i s|daf|afi|fiə|r v| iş| əs|sos|osi|sia|xal|alq| ta| as| ed|bu |heç|eç |rə |yan|ı h|kim|iyi|ı o|ina|siy|əsa|sas|a q|yar|lı |tün| is|ist| so|al |n ə|ifa|əmə|ə t|mil|ill|lıd|ıdı|ır |ədə|ıql|liy|tlə|a h|məz| bü|büt|ütü|iya|iə | üç|üçü|çün|t v|dax|axi|xil|r a|ılı|man|sil| se|seç|adə|ial|onu|öz | cə|miy|əyi|n e|edi| mi| nə|a v|mən|ril|əz |ild|rab|abə|şər|ğın|aya|zam| ni|ulm| xa|təh|əhs|hsi|i h|sti|qu |var|ad |tam|uğu|z h|qan|rəf|n d",
    "ces": " pr| a |ní | ne|prá|ráv|ost| sv| po|na |ho |ch | na|nos|o n|ání| ro|ti |vo |neb|má |ávo| má|ou | ka|kaž|ažd|ebo|bo | je| za|ždý|dý | př|svo|a s|sti| st|á p| v |vob|obo| sp|bod|pro| zá|rod|ých|ván|ý m|né | by|ení|ého|spo| ná|í a|ová|o p|roz|mi |ně |ter| li|a p|nár|áro| ja|jak|by |to |lid|u p| vš|ny |ím |í p|i a|a z|o v|kte|mu |at |odn| vy| ma| so|ví |zák|tní|a v|oli|li | kt|í n|kla|do |je |pod|en |em |byl|mí |áva|stá| do|t s|rov|í s|tví|vše|it |dní|o s| ve|pol|í b| bý|být|ýt | se|čin| k |sou|a n|stn|ran|vol|nou|ejn|nes|se |ci |nýc|du |ným|stv|žen|své|vé |ají|jeh|eho|va |mez|ním|ích|ým |ké |ečn|pří|u s|tát|i s|kol|ova|e s|ech|í v|ids| i |maj| to|nu |hra|ave|ole|i v|kon|m p|ému|y s|o z|eré| ze|o d| že|chn|ovn|len|dsk|lad|vat|chr| ta|m a| ab|aby|sta|pra|néh|esm|smí| ni|i n|že |ako| os|sob|aké|i p|st |rac|kdo|zem|m n|odu| ji|bez|ste|ákl|ens|ými|í m| vz|i k| oc|och|jí |oci|áln|lní|a m|dy |lně|vou|při|rav|leč| s |t v| či|čen|áv |slu|jin|oko|nez|tej|řís|stu|ské|ský|nit|ivo|a j|věd|iál| me|ezi|ven|oln|zen|í z|y b|zac|níc|ky |u a|a o|u k|inn|est| tr|svě|nik|ikd|í k| mu|u v|kéh|jno|jíc| dů| od|tup|ože|i j|odi|děl|ího|rok|anu|soc|ciá|ve |é v|něn|din| vo| pl|pln|vin|u o|h p|tak|adn|a t|cho|ává",
    "run": "ra |we |wa | mu|e a| n |se |a k|ira|ntu|tu | ku| um|ko |a i|mu |ye |hir|iri|mun|ing|unt|ere|ash|shi|a n|umu|zwa| bi|gu |ege|a a|za |teg|e k|ama|go |aba|uba|ngo| ba|o a| ar|ung|ish|ora|a m|e n| we|sho|na |ese| kw|nga|e m|mwe| ab|ugu|ate|ndi|kwi| gu|ger|riz|wes| at|di |u w|n u|yo |gih|ban|ngi|iza|e b|ara| am|ri |ka |a b|e i|hob|obo| ca|ro |u b|can|nke|ezw|a u| in|bor|bah|ahi|rez|iwe|gir|iki|igi|ihu|ke |ari|ang|aku|a g|hug|ank|ose|u n|o n|rwa| ak|and|kan| vy|ngu|nta| ub|aka|ran| nt|n i|ata|kur|kun|i n|ana| ko|e u|iye| ka|re |any|amw|ta |nye|uko|gin| zi|ite|era|ga |aha| ib| ng|n a|o u|o k| iv|ivy|ho | as|sha|o m|o b| bu|mak|ako|o i| ig|o z|o y| uk|ubu|aga|izw|i b|vyi|ba |aho|kir|nya| is|kub|hin| it|uri|gan|rik| im|u m|guk|bat|nge|kug|ani|vyo|ene|imi|imw| y |jwe|ze |agi|e c|u a|gek|ush|i i|uru|ham|uza|e y|ibi|amb|bur|ina|eme|i a|abi|ha | nk|eye|gus|ber|u g|no |rah|zi |w i|ma |tun|ind|ron|ras|wo |ne |wub| gi|gen|kiz|y i|kor|ura| zu|zub|zin|je |iro|mat|eko|bwa|ika| bo|bak|onk| ma|ugi|mbe|ihe| mw|eka|ukw|wir|ryo| ic|a z| ry|bwo| ag|yiw| ki|gis| yo|bik|ni |nka|rek| bw| ya|tse| ha| ah|umw|he |eng|bir|aro|ury|twa|ant|a c|tar|uki|mw |bih|ku |tan|bos|nde|uro|y a|utu| no|i y| yi|ya |puz|zam|eny",
    "plt": "ny |na |ana| ny|y f|a n|sy |aha|ra |a a| fa|n n|a m|y n|an | fi|tra|any| ma|han|nan|ara|y a| am|in |ka |y m|ami|olo| ts|min|lon| mi| sy| na|a t| ol|fan|a i| ha| iz|iza|man|ina|ona|aka|y h|ian|o a|a h|reh|a s|etr|het|a f|on |ire|fah|tsy|mba|ay |zan| hi| ar|ndr|ira|y o|y t|ehe| an|o h|y i|afa|ren|ran| zo|ena|dia|amb|amp|ala|zo |ika|y s| di|tan| az|y z|m p|rin|ia |n j| jo|jo | dr|a d|zy |ao |ry |and| ka|dre|mpi|rah|nen|haf|n d| ir|eo |elo| ta|omb|rai|oan|fa |am | pi|ene|ho | ho|ant|iny|itr|azo|dra|ava|tsa| to|tsi|zon|asa|van|a k|ari|ha |n i|mbe|ray|fia| fo|sa |ony|isy|ova|lal|ly |azy|o f|bel|lom|ham|mis|sam|zay| ra|oto|fir|ban|a r|nat|kan| vo| he|ito|ary|nin|iha| re|a e| ko|tok|fit| no|ita|iar|fot|nam|voa|isa|y v| sa|y r|o n|no |aly|mah|har|ain|kam|aza|n o|otr|eri|hev|oka|sia|ial|atr|y l| la|ila|oa |y d|ano|ata|its|tov|pia|y k|pan|fam|oko|aro|nto|pir| ao|ty |anj|nja|reo| as|o s|hia|o t|mpa|mit| eo|ais|sir|air|ba |tin| it|ver|ino|vah|vy |ton|tao|ank|era|rak|kon|a z|tot|ive|ame|aho|hoa|hit|ati|ity|o m|mik|a v|ani|ori|koa|hah|nga|dri|eha|dy | mo|oni| za|ato|bar|jak|n t|nao|end|eve|lah|aov|mia|izy|lan|nar|ria|ama| pa| mb|aln|lna|ifa|za |to |dro|va | in|ind|ehi|n k|iva|nta| va| al|via|rar",
    "qug": "una|ta | ka|na |ka |ash|cha|a k|ari|ish|kun|kta|pak|ana|hka|mi |shk|apa|ach|hay|akt|shp|man|ak | ch| ha|ata|rin|lla|tak|ita|ami|ama|aku| pa|har|pas|ayñ|yñi|ina| ma| ru|uku|sh |hpa|run|kuy|all|aka| tu|tuk|an |chi|yta|a c|chu|in |ñit|ris|a h|nka|nak|tap|kan| ki|ayt|pi |pa | sh|i k|nap|a p|pay|kaw|kam|nam|ayp|aws|wsa|a s|ank|nta|iri|uy |a t|hin|a m|ay | li|ant|kay|lia|nat|a r|shi|iak| wa|lak|uya|say|yuy|y r|ypa|kis|a a|hun| yu|n t|tam| ti|n k| ya|yay|lli|a w|hpi|api| al|un |yku|ipa|a i|iku|ayk|shu| sa|ush|pir|ich|kas|kat| il|huk|ill|a y|hu |rik|yac|a l|kac| ku|hik|tan|ypi|wan|ika|i c| ni|ima|ila|ink|ayl|yll|mac|nis| ta| wi|kus|i y|i p|n s|llu|tin|la |yan|kpi|awa|li | ri|may|tik|iks|lan| pi|aya|kin|yas|ksi|kll|kak|lat|aym|ura|war| ay|k h|uch|akp|sha|ukt|nch|h k|i t|ull|uma|mas|iya|kir| ii|h m|pip|n p|kik|iki|i s|kar|aki|riy|han|y h| su|mak|n m|tac|nal|nac| ña|k k|k t|k a|iwa|mam|i m|nki|yma|wil|his|pal|i i|asi|nmi|i w|sam|k l| hu|sum|pam|kap|k i|pan|iia|huc|ik | mu|mun|pik|was|k m|ma |hat| im|k r|akl|u t|ha |llp|a u|wak|has|anc| ak|imi|mal|y k|ian|iña|tar|yka| iñ|iñi| mi|n y|ywa|uyk|unk|a n|arm|rmi|h p|pur|akk|kim|san|ati|uti|uri| ar|sak|i a|hap|iyt|ayw|si |yar|las|lpa|ñaw|awp|wpa|i r",
    "mad": "an |eng|ban|ng | sa| ka|dha| ba|ren|ak |ang| se| ha|hak| dh|na | pa|adh|se |a s|aba|n s|ara|ngg|are|ha |aga|sa | or|sar|ore|asa|ana| ma|a k|aan|gi |ale| ag|gad|a b|n o|n k|ra |ala|eba|gan| ke|dhu|aja|ota|bas|man|dhi|n b|tab|ka |sab|ama|beb|abb|at |nga| ta|ggu|ako|pan|huw|uwi|wi | ot|san|a d|ata|eka|i h|bba|agi|ba |lak|hal|ong|kab|em |g a|lem|a o| pe| na|par|ane|ngs|nge|gar|a p|tan|gsa|a a|ran|ken|i s|guy|uy |k h|n p|n a|ada|al |apa| ga|on | an|g s|ta |kaa| e |e d|pon|nek|ssa|a m|kal|a e|e e| la|kat|ona|abe|nan|asi|jan|ate|lab|ri |sal|lan|i p|sad|aka|e a|a h|ari|ena| bi|oss|si |daj|i k| ng|har|gen|ton|e k|epo|ano|bad|car|n d|ar |era| be|nag|kon|g k|ase|nya|nos|n n|mat| kl|mas|ela| da| al|n t|uwa|wan|sae|pad|ggi| so|as |hi |adi|a n|i d|g e|k k|ne |oan|uan|k s|k a|e b|ah |ina|kla|ter|om |gap|le |koa|yat|per|neg|ega| ja|bi |abi|aha| ep|aon| as| mo|n h|i a|one| di|ma |kas|m p|di |aya|nto|int|n e|te |bat|epa|nda| ca|pam|e s|amp|to |dra|ann|oko|rga|nna|e p|g p|nta| ra|and|i b|nao|k d|pen|aen|ste|ila|yar|a t|mpo|ok |set|n m|k b|isa|kom|raj|arg|ika|bin|ant|ga |hid|idh|aju|i m|nas|kar|mos|ost| ho|lae|dil|t s|a l|das|rek|tad| a | po|ett|tto| to|bis| dr|jat|add| ko|ent|gam|e m|ndh|hig|iga|maj",
    "nya": "ndi|ali|a k|a m| ku| nd|wa |na |nth| mu|yen| al|ra |thu|se |hu |nse|di |a n|la | pa| wa|mun|unt|nga| la|a u|u a|e a| ma|za |ons|ace|ce | lo|iye|a l|idw|ang| ka|kha|liy|ens|li |ala|ira|pa |ene|i n|we |e m|era|ana|dwa|lo |hal|ulu|ko |dzi|iko|yo |o w| ci|a p|ga |chi| mo|o l|lu |o m|zik| um|moy|oyo|ufu|ner| an|and|iri|umo|ka |a a|dan|ena| uf|ful| nc|nch|hit|ito|to |a c|kuk|dwe| da|fun|wac| dz|e l|kap|ape|a z|e k|ti |u w|ere| za|lir|pen|aye|tha|kut|ro |mu |lid| zo|ofu|ing|i m|amu|mal|o c|kwa|mwa|so |o a|o n|i p|eza| mw|nso|iro|zo |i d|lin|ri |edw| a |i l| li|a d|kul|ati|uti|una|lan|i k|o k|ung|alo|dza|i c|o z|a b|uni|iki|lam|mul|ulo| ca|nkh|nzi|gan| na|ant|e n|san|tsa|wir|oli|u k|lon|dip|ipo|unz|yan|gwi|ca |ome| ko|aku|akh|pon|ngw|kir| po|uli|gwe|cit|mer|pan|kup|ame|mba|tsi|bun|ukh|ope|siy|iya| ya| am|han| bu|ama|bvo|vom|rez|lac| kw|men|u n|ao |pez| on|zid|osa|u o|i a|nda|e p|ne |ank|hun|o o|nik|ku |its|adz|u d|aka|diz| kh|ina|ezo|ndu|kho|okh|ya |awi|izo|ans|pat|eze|khu|zi |phu|kus|eka|o p| ad|mol|ets|sa |iza|kwe|wez| un|izi|oma|ma |oci|du |ula|ani|lok|haw|ika|ja |say|nji|jir|amb|ats|sid|mai|aik|mak|aph|i u|isa|lal|u m|ogw|no |oye|ukw|osi|sam| si|win| zi|ni |tse|si |e o|opa|emb| ba|ban",
    "zyb": "bou|aeu|enz|nz |eng|iz |ih |uz |uq |ing| bo|oux| di| ca|z g|dih|ux |ngh|cae|gen|euq|z c|ng |you|ung|ngz|ij | mi| gi|miz|aen| ge|z d| ci|gya| yi| de|ouj|uj | gu|cin|ien|ngj| mb|mbo|dae|zli|gij| se|j g|ang|z y|j d|ouz| cu| ba|nae|h g| da|yin|oz |de |z b|nzl|li |nj |x m|euz| cw| yo|iq |gz |q g|x b|yau|h c|vun|inh|ix | ga|cwy|wyo| nd|vei|nda| ro|rox|oxn|z m|i c|j b| si|wz |gh | gy|cun|gue|xna|unz|hoz|can|bau|ei |z h|yen| li|inz|dan|q c| hi|gj |uh | vu|faz|yie| bi|zci|hin|goz|uek| fa|gun|aej|ej |ya |nh | ae| go|au |ciz|den|h m|nq |ngq|ouq|gva|z s| do|ci | wn|q d|eix|h d|ekg|kgy|q s|hu |u d|j n|auj|j c|gai| ha|az |nhy|z l|gjs|jso|sou|ou |bin|sin|lij|h s|sev|eve|nei|q y|aiq|sen|h y| la|enj|ouh|i b|vih|din|q n|awz|j y|z r|enh|en |uen|bwn|wng|ozc|z n|anj|j s|liz|g g|g b|i d| ne|bae|awj|sei|eiq|hye|anz|oen|hix|zda|gak|ez |anh|u c|z v| ya|h f|x d|in |ghg|bie|enq|zsi|ghc|hci|siz|i g|n d|h b| du|cou|ngg|ngd|cuz|eiz| ho|dun|g c|law|j m| dw|env|nvi|dei|a d|ek |yaw|wn |giz|gzd|nzg|wnj|gda|ak |nde|auy|yuz|hgy| co|ujh|jhu|e c|hen|ujc|min|izy|g d|gzs|daw|aw |g y|ozg|ai |iuz|x l| na|iet|aih|gih|iuj|zbi|uyu|coz|sae|i m| he|zdi|dwg|q b| fu| ve|guh|iqg|qgy|yai|yoe| so|biu|vaq|aq |yun|izc| ra|cie|zge|n g",
    "kin": "ra | ku| mu|se |ntu|a k|tu |nga|umu|ye |li | um|mun|a n|unt|ira| n |ere|wa |we | gu|e n|mu |ko |a b|e a|o k|a u|a a|u b|e k|ose|uli|ro | ab|aba|gom|e b| ag|omb|ba |ugu|ang|o a|gu |mba| ib| ub|eng|ihu|za | bu|ama| by|hug| ba|o b|e u|kwi|ga |ash|ndi| ka|yo |e i|ren| cy| ak|iye| bi|re |ora|igi|gih|ban|ubu|di | nt| kw|gan|a g|aka|aga|nta|a m|iro|a i| am|ku |i m|ago|byo|ta |ka |cya|ibi|and|na |ali|uba|sha| bw|ili|yan|no |ese| ig|u m|o n|kan|ish|ana|sho|obo|era| we|ya |aci|i a|ura|wes|uko|e m|ran|o i|u w|uru|wo |kub|n a| im|ber|hob|bor|ure| no|ani|u a|gac|cir|o m|ush|bur|eke|ne |wiy|ara|nge|rwa|yos|e y| y |uga|bwa|ho |zo |ind|ane|mwe|iza|are|rag|ge |mo |bwo|bul|teg|ege|u k|u n|n i|ze |aha| uk|bye|anz| al| ki|bah|uha|ite|kug|gir|ngo|go |age|ger|u g|zir| ry|ugo|bih|akw|o g|guh|iki|bat|iby|gar|imi|mbe|y i|n u|ha |atu|mul|tan|eye|e c|kim| ni|shy|aho|tur|kir|ate|abo|je |bo | ng|u u|ata|o u|iko|gus| bo|bos| gi|a s|nir| ru|gek|i b|eza|i n|nzi|i i|rez|kur|ako|any| as|ung| se|bis|nya|o r|uki| ya|ngi|mat|eko|ugi| in|o y|kor|imw|rer|bak|yam|bit| ik|kar|ire|ige|shi|hin|ing|byi|nu |mug| at|yem|eme|gaz|irw|yer|rek|key|ihe|gen| ic|icy|hak|but|ets|tse|eze| ur| na|bag|awe|ubi| yi|i k|ezo|tek|ubw|rya|uza",
    "zul": "nge|oku|lo | ng|a n|ung|nga|le |lun| no|elo|la |wa |e n|ele|ntu|tu |gel|we |ngo| um|e u|thi|uth|ke |hi |ni |ezi|lek| ku|nom|ma |o n|onk|nke|pha|gok|a u|nel|ulu|unt|o l|kwe|oma|o e|ang|lul| uk|kul|a k|eni|uku| wo|kel|hla|mun| lo|ama| ne|ath|ho |umu|ela|won|elw|lwa|ban|a i|ule|zwe|ana| un|une|ing|lok|aka|elu|wen| kw|aba|tho|akh|khe|ala|gan|o y|enz|ko |thu|na |u u|a e|gen|i n|zin|kho|enk|kun|mal|alu|e k|lel| na|kat|e a|nku|eko|he |hak|lan|kwa| ez|o a|o o|kub|ane|ayo|yo |lwe|eth|obu| em|nzi| ok|okw|kut| ba|ile|ben|het|eki|nok|nye|ike|i k|so |isi|ise|esi| ab|mph|nhl| is|aph|fan|ga |isa|ini| ye|e i|nen|uba|ba |zi |hol|ka |ant| fu|fut|uhl|abe|and|do |ukh|kuk|eke|a a|kil|e w|the| ya|nda|za | im| in|olo|ekh|eli|ith|khu|eng|yok|nis|sa |kuh|o u|any|ye |e e|i w| ak|olu|ndl|a o| le|ne |ume|mel|eka|mth| ko|emp|isw|amb|emi|no |uny|iph|i i|zo |kuf|nay|ind|ezw|kuz|vik|alo|o w|hul|ebe|lin| yo|kan|eze|ndo|uph|hlo|yen|enh|phe|ufa|ake|ale|kug|fun|und|wez|li |seb|a l|ula|wam|din|ahl|nez|yez|nya|bus|bo |azw|o k|ink|kek|nan|i e|ola|izi|mbi|ili|han|kuv|ase|hel|hut|a y|kis|kuq|da |omp|swa|kup|nem|ano|phi| ol|azi|ubu|o i|kol|oko| el|e l|huk|ani|nje|sek|uke|lon|pho|kom|lak|kus|zis|ham|mba|izw|ulo|hun|i u|u n",
    "swe": " oc|och|ch |er |ing|för|ar |tt |en |ätt|nde| fö|rät|ill|et |and| en| ti| rä| de|til|het|ll |de |om |var|lig|gen| fr|ska|ell|nin|ng | ha|ter|as | in|ka |att|lle|der|und| i |sam|lla|fri|ghe|ens|all|ör |na |ler| at|ete|den| el| so| av|av |igh|r h|nva|la |r r|env|ga |tig|nsk|iga|har|t a|som| ut|tti|nge|t t|ion|a s|ns |a f| sk|a o|r s|män|an |är |isk|rna| st| si| vi| sa| al|t f|ra | be|a r| är| me|ati|n s|lan| va| an|med|tio|ern|nna|t e| un|äns|ta |nat|sta|ig | åt|ten|kli| gr|vis|t s| la|äll|one|änd|han| ge| li|ans|stä|ner|t i| må|gru|ver|rih|ihe| mä|sni|lik|n f| re|r a| na|må |ers|t o|ad |r e|da |det| vä|ent|run|rkl|kla|ri |h r|nom|kap|igt|gt |n e|dig|uta|tan|e s|dra|s f|ed |d f|lar|rin|ran|upp|erk|tta|ika|änn|r o|erv|rvi|kte|vid|a i|lag| på|g o|id |ari|s s|r u|lin| om|ro |a m|els|isn|del|sky|r d|e m|mot|ot |vil|på | mo|r m|str|örk|ndl|on |i o|nd |tni|n m|ber|nad|gan|örs|r f|kal|era|a d|dd |je |itt| up|sin|nga|täl|ras|n o|ärd|i s|r i|enn|a n|n a| hä|bet|ski|kil|n i|lse|rel|t b|g a|kyd|ydd|arj|rje|l v|s e|end|amt| fa|nas| så|inn|tat|per|t v|l a|int|tet|öra|e f|tra|r g|yck|r ä|vär|ege|arb|d e|re |nis|ap |ara|bar|l s|t l|lit|när|lke|h f|ckl|v s|rän|gar|ndr|mt |se |häl|h a|llm|lmä|ess|sa ",
    "lin": "na | na| ya|ya |a m| mo|a b|to | ko| bo|li |o n| li|i n| pe|i y|ngo|a n|a y|ki | ba| ma|kok|pe |la |a l|zal|oki|ali|nso|oto|ala|ons|so |mot|a k|nyo|eng|kol|go | ny|yon|nge|o e|ang|eko|te |o y|olo|oko|ma |a e|iko|e m|e b|lik|ko |o a|ako| ye|ye |ong|mak|si |isa| ek|aza|lo |sal|ama| te|o p|bat| az|e n|oyo|ani|ela|sen|o m|a p|ta |ban|i k|amb|ni | es|yo |aka|mba|osa| oy|mi |a t|eli|lis|i p|i m|ba |mok| to|mbo|bok|isi| mi|ing|lon|ato|o b| nd|ge |bot|ota| ez|nga|nde|eza|o t|kan|ka |gel|e k|bo |ese|sa |lam|koz|den|oba|omb| po|ga |mos|kop|oli|e e|yan|bon|oka|kob|lin|bik|po |kos| lo|sam|e a| ’t|’te|kot|ti |ngi| bi|e y|omi|esa|i b| el|elo|lok|gom|som|i t|ate|ika|kam|ope|a s|kat|ati|ata|wa |iki|i e|bom|tal| ka|oza|o l|bos|zwa|ola|pes| se|oke|bek|o o|ndi|bal|nda|nza|oso|omo|lak|bak|mis| at|bis|sus|usu|su |osu|lib|and|ozw|asi|ele|tel|mu |i l|e t|ase|mol|mob| nz|kel|ene|ne |mbi|ami|aye|nis|a ’|tan|le |obo|baz|pon|wan| ep|yeb|kum|sem|emb|mal|gi |nya|ote|e l|oku|bas| ta| ak| ti|tin|ina|gis|opo|ana|mab|bol|u y|mat|ebi|oti|mib|obe|a o|san| so|mbe|be | mb|ibo| et|ike|da | en|ben|za |yok|eni|tey|bwa|bi |kom|i o|gob|mik|umb|se |eba|e p|ibe|ale|lel|boy|eta|i a|bu |ime|sik|mon|ona|mel|ose|mwa|sol|geb|ebe",
    "som": " ka|ay |ka |an |oo |uu |da |yo |aha| iy|ada|aan|iyo|a i| wa| in|sha| ah| u |a a| qo|ama| la|ga |hay| dh|ma |aad| xa|ah |a d| da|qof|in |aa |iya|a s|a w| si| oo|isa|eey|yah|xaq| le|ku |lee|u l| ku|taa| ma|la |dha|ta |aq |q u|eya|y i|ast|sta|a k|ha |of | wu|wux|uxu|xuu|kas|sa |u x|ara|doo|wax| am|iis|ro |a q|inu|nuu|ala|a x|o a|maa|nay| sh| qa|o i| aa|kal|le | lo|loo|f k|o d|ana|a u|o x| xu| xo| ba| uu|yad|iga|a l|si |dii|a m|yaa|gu |ash|u d|ale|ima|adk|aas| ca|o m|do |lag|add|na |lo |o k|san| is| so|adi| mi| fa|xor|dka|aqa|iin| he|aar|had|rka|a o|ado|dad|soo|mid|kar|aro|baa|qaa| ha|nta|o h|ad |u k|aga|dda| ga|hii| sa|u s| ay|har|axa|mad|n k|eed|quu|haa|daa|o q|aal|o s|n l|xuq|uqu|n i|id |hel|aya| ee| ho|nka|i k|uuq|nim|ina|ihi|elo|waa|dan|agu|ays|a h|saa|mar|ark|ya |ank|o w|naa|gga|ee |ax | bu|uqd|qda|rri|riy|n a| no|u h|n s|oon|lka|u a|laa|o l|ab |haq|uur|int| gu|ida|iri|lad|dhi|yih|ysa|dah|to |aam|ofk| xi|arc|rci|eli|ood|ool|orr|alk|goo|ayn|e u|n x|h q|asa|sag|a c|sho|ami|i a|n q|siy| ug|kii|o u| ta| ge|gel|agg|a g| di|ido| ji|hoo|a f|al |jee|dal|ago|ii |a b|mo |iir|ooc|bar| ci|caa|xir|ra |aqo|sig| mu|aba|oob|oba|u q|aaq|aab|sad| ra|cad|dar|imo|ar |y k|fka| du|xay|y d|ras|o c|ari",
    "hms": "ang|ngd|gd |ib | na|nan|ex |id | ji|ad |eb |nl |b n|d n|ud | li|jid| le|leb| ga|ot |anl|aot|d g|l l|b l| me|ob |x n|ngs|gs |mex|nd |d d| ne|jan|ul | ni| nj|nja| gu| zh|lib|l n|ong| gh|gao|b j|b g|nb |l g| je|jex|gan|ngb| ad|end|el |gb |han| sh|ub | da|d j|t n|d l| nh|nha|b m|is |d z|x g| ya| wu|she|l j|oul|il |nex| ch|b y|d s|gho|gue|uel|wud| gi|d y|hob|nis|d b|s g| zi|lie| yo|es |it |nx |ies|aob|gia| de|eib|you|ian| hu|s j|d m| ba|zib|oud|b d|chu|ut |t j| do|ol |at |hud|nen|hen|s n|iad|ab |zha|t g|dao| go| mi|enl|x j|enb|b z|hei|eit|nt |b s| ze|d c|al |inl| xi| se| re|ren|hao|d h| fa|ngx|gx |anb|gua|yad| ho|x z|fal|b w|nib|ix |b h|and|had|t l|x m|gou|d x|bao|ant|don| xa|yan|d p|s z|hib|anx|zhe|ox |l d| pu| du|dan|gha|od |s m|sen|xin|lil|hui|uib|uan| we| di|b x|oub|t h|hub|zhi|t z| ju| ge| ng|t m|hol|xan|pud|x l| ma|jul|eud|hea|l s|enx|l z|jil|zen|aos|os |s l|d r|dei|ngt|gt | yi| he| si|nga|heb|zho|hon|did|d a| lo|b a|x c|dud|b b|lou| bi|dou|geu|b c|d k|x a|d w|wei|x b|l h|x d| qi|bad|t w| bl|blo|aod| nd|nia|deb| ja| sa|eut|ax |eab|s a| bo|lol|sat|ngl|gl | to|l m| pa|pao|b f|lia|x s|heu|t s|che| ca|can|s w|s y|sib|mis|zei|ux | pi|x r|gon|t p|jib|iel|d f| cu|ghu|unb|t c|inb| ko|x x",
    "hnj": "it | zh| ni|ab |at | sh|ang|nit|os | do|uat|ox |ax |nx |ol |ob | nd|t d|x n|nf |zhi|as | ta|tab|ef |if |d n|ad | cu| mu|cua|uax|mua|uf |b n|ib |s d|dos|id |enx|hit|nb | lo|f n|t l|ngd|gd |inf|us | go|ux |ed |she|b d|t n|b z| ho| yi|x z|aob|l n|t z|ong| zi|ix |nda|d z|yao|uab|enb|ut | de|f g| dr|dol| yo|zhe| le|euf|x d|inx| ne|nen|das|dro|ngb|gb | ge|d s|s n|f z|uef|hox|len|b g|il |ud |nd |gox| ua| na| du|x j|f y|oux|x c|han|ndo|of |f h| ja| gu| ny|zha|s z| da|uad|heu|lob|shi|ik | bu| ji|hai|ged|od |b h|t g| ya|ngf|gf | hu|ex |bua|you|rou|nil|hen|yin|zhu|out|ous|nya|is |f d|enf|b c|af |dou|lol|nad| re| ha| xa|uk |t s| id|xan|sha|hua|jai|b y|aib| qi| la|s s|d d|l m|ot |hue| xi|x g|x l|ren| kh| dl|ait| ba|aod| zo| ju|jua|zif| nz| ga| di|bao|x y|b s|x s|xin|aof| li|b b|x m|x t|eb |b l|ngx|gx |dax|b t|hef|gua| be|las|d j|s t|hed|nzh|l d|t y|hif| pi|f b|d l| ib|t h|f l|hou|dus|hun|und|s l|t r|el |uas|gai|ngt|gt |hab|aos| mo| zu| bi|f t| za|d y|x h|aik|k n|end|aid|ros| gh|zos|pin|ak |s x|d g|f s|s y| ao|k z|s b|due|mol| fu|dex|iao|x b|hik|x i|deu|l b| bo|b k|s m| lb|lb | hl|lan|uaf|d b|zho|al |eut| ro|ub |et |t c|d m|x x|d h| ch|d p|f x|t b| nt| su|uak|zis|shu|t t|gha|yua| we|oud|gon|d t",
    "ilo": "ti |iti|an |nga| ng|ga | pa| it|en | ka| ke| ma|ana| a | ti|pan|ken|agi|ang|a n|a k|aya|gan|n a|int|n t|ali|lin|a m|dag|git|a a|i p|teg|a p|nte| na|man|awa|kal|da |ng |ada|ega|nag|way|na | da|n i|sa |i k|n k|ysa|n n|al |a i|no |add|aba| me|eys|i a|nna|dda|ngg|mey| sa|ann|pag|ya |gal| ba|mai| tu|gga|ung|i s|kad|yan|tun|nak|wen| ad|aka|aan|enn|nan| ag|asa|i n|wan| we|nno|yaw|i t|l m|ata| ta|ami|a t|apa|ong| si|li |i m|kas|aki|ina|ay | an|n d|ala|a s|g k|gpa|mak|eng|ili|n p|et |ara|at |ika|ipa|dad|ama|nai|g i|yon| aw|in |ao |toy|oy |ta |on |aen|ag |bab|ket|aik|ily|lya|sin|tao|ani|agp| ki|a d|bal|oma|ngi|uma|g a|i i|kin|naa|bae|o k|y n|daa|gil|o t|iwa|ags|pad| am|syo|i b|kab|sab|ida| um|mil|aga|gim|ar |ram|yto|san|tan|min|pap|n m|eg |agt|o n|a b|aar|asi|ino|nom|nia|n w| wa| de|dey|pam|i e|sal|bag|saa|iam|eyt|day|kit|ak |ed |gsa|lak|t n|ari|nay|kan|nat|t k|i l|i u|sap| gi|g n|aw |sia|o p|o i|dum|i g|to |uka|agb|bia|aib|lub|ubo|ged| li|apu|pul|lan|imo|mon|y a|ma |pak|ias|sta|den|i d| id|bas|kai|gin|i w|kap|ita|asy|kni|kar|bon|abi|ad |umi|ban|agk|akd| ar|mid|din|sar|iba|nnu|inn|o m|ibi|ing|ran|akn|nib|isu|abs|maa|kda|aip|as | la|o a|t i|idi|nto|lal|amm|aad|or |adu|kua|ais|nal|w k|ulo|y i",
    "uig": "ish| he|ini|nin|ing|gha|ng |ili| we|we |sh |in |ni | ho|hoq|oqu|quq| bo|shi|lik|ush|qil|bol|en |shq|lis|qa |hqa|n b|hem| qi|ki | ad|dem|iy |ade|igh|e a|em |liq|han|et |ge |nda|uq |din| te| bi|idi|let|qan|nli|tin|ige|ash|ha |kin|iki|her|olu| ba|and| er|iti|an |de | dö|döl|aq |luq| ya|lus|me |öle|lgh|emm|mme| qa|erq|daq|erk|rki|shk|uqi|esh|iq |rqa|rim|ile|ik |er |i w| ar| be|ara|yak|aki|a h|men|hri|shu|uql|du |lar|hi |da |q h|inl|qlu|ime|i b|ehr| öz|nis| as|lin|etl|ler|ar |len|qi |ila| mu|e q| me|beh|asi|a b|ayd|rli|bil|q a|che|bir| sh|ke |bar| ké|ek |shl|h h|u h|tni|yet|éli|hke|e b|may|k h| ig|hli|isi|ali|ydu|ari|iri| qo|ida|e t|emd|e h|siy| al|tle|rni|lid|olm| tu|iqi|mde|anl|e e|iye|ip |lma|i k|tur|a i|raw|uru|r b| is|i a|özi|éti|kil|asa|ir |mus|hu |i h|ris|he |n q|qig|ima|alg|nun|bas| je|ett|awa|les|tes|sas|ti | xi|tid| él| ch| ji|adi| sa|arl|mni|hil|tis|i q|kér|ére|rek|uni| xe| xa|anu| hö|min|n h| bu|a a|dig|jin|rqi|y i|lig|siz|emn| ki|ani|niy|qti|xel|elq|p q|met| iy|iya|i y| ma|i s| qe|q w| de|ina|nay|tew|eli|arq|n a|ayi|si |i d| ti|tti|e i|i i|e m| ij|tim|i t|oli|chi|dil|n w| to|zin|hek|elg|tli|ati|gen|irl|ken|rin|ami|ern|éri|ide|she|rus|ewe|wer|ün |iz | gh|ghu|qar|üch|r a|hin",
    "hat": "ou | li|an |on |wa |yon| po|li |pou|te | yo|oun| mo|un |mou|ak | na|en |n p|tou|nan| dw|syo| to|yo | fè|dwa| ak| ki| pa|ki | sa|out| la| ko|ut | ge|gen|n s|se | de|i p|èt |asy|n d| so| a |n l|a a|fè |n k| se|pa |u l| re|e d|sa |ite| ch|kon|e l|n n|t p|ni |cha|nn |a p|ans|pi |t m|nm |man|i s|son|n m|fèt| an| ka| me|sou|e p|n a|swa|hak|òt |men|n y|e k| pe|i l|ote|epi|san|a l|eyi|i k|yen| ep| ap| si|n t|pey|je |yi |i a|k m| ni|e n|e a|lit|i t|e s|lib|al |ran|lè |enn|a f| lò|a s| pr|ns |anm|enm|t l|lòt|n e|ap |k l|kla| ma|e t|ay |e y|i m|a k| tè|ye |i g|aso|ali| lè|ant|è a| ba|u t|a y| os|a n| pw|pwo|n f| pè|ka | ta|nas|n g|osw|i d|dek|ras|u s|e m|bli|sos| vi| di|i n|la |a t|u y| te|o t| tr|i f|le |lwa|tan|ète|a c|a m|re |t k| pi|ete|ibè|bèt|lar|ara|ksy|tè |de |tis| fa|nal|res|osy|ati|ke |ons|i y|ze |nen|ekl| kò|aye| le|a d|e r|lal|alw|ini|o p| en|che|he | ok|oke|ken|way|kou|kal|ava|las|nje| no|van|onn|esp|sye|pra|u f|a g|isy|ta | za|k k|jan|esi|sya|lek|ret|pès|n v|ik |kot|a b|nou|è n|u k| as|wot|eks|òl |ist|iti|des|ib |ti | ne|tra|is |u d|y a|èso|è l|a r|i r|di |k a| ja|kòm|rit|ont| sw|ond|l l|sit|nsa|è s|ide|pat|t a|pòt|rav|vay|ri |viv|ab |ona|bon| ke| sè|k p|pre|n j|m m|òm |onj|ase",
    "aka": "sɛ |a a| sɛ|ne |ra |a n| wɔ| a |ara|an |eɛ |no | ne| bi| no| as|bia|iar|yɛ |mu |aa | an|ɛ s|e a|ma | ho|bi | mu|ho |deɛ|man|ɛ a|na | ob|a ɛ|obi|a b|e n|n a|so |o n|pa |ama|ɛ o|o a|nip|ipa|a w|naa| na|ɛ n|ana| so|ɛ ɔ| nn| ad|kwa|asɛ|ɛde|wan| on|oni|a ɔ| am|wɔ |sɛd|ɛyɛ| ah| ny|oɔ | n | mm|mma|nni|i a| kw|ie |wɔn|ɛ w| ɛy|de |ɔ n| ba|ase|i m|ɔ a|o b|a m|o s|iri|n n|uo |nyi|u n|di |e s|ni | yi|a o|ɔn |tum| ɛn|aho|nya| de|ɔma|i n|umi|mi |o k|ɛ ɛ|e m| ab|adw|die| yɛ|ɛm | ɛs| ma|a s| ɔm|yin|nam|o d| bɔ| at|n s|ua |pɛ |bɔ |ina|sɛm|ani|aso|mar|e h|adi|ya |a h|re |wum|uma|ba |ɔ h|rɛ |u a|ɔde|a k|n b|yi |fa |om |kuo|m n|ɔ b|m a| kɔ|dwu|erɛ|se | nt| sa|e b|orɔ|rɔ |ka | ɔd|ten|a y|hyɛ| bɛ|i s|ɛ b| nk|saa|am |ade|kor| ns|ene|ena|ban|i ɛ|nka|ane|ɛsɛ|ɛns|nsɛ| ku| fi|ɔtu|o m|i k| ko|fof| ɔt|gye| di|yɛɛ|ɛɛ |ano|im |kɔ | pɛ|kye|ye |ofo| ak|ko |ri |foɔ|amm|ete|yie|nti|i b|bir|abo|bom|a d|ɔne|nii|ɔ s| be|sua| da|asa|ɛ m|for|fir| ɛb|soɔ|ti |m k|e y|nod|isɛ| hɔ|e o|ber| ti|tir|seɛ| aw| dw| mf|u b|o ɛ|wa |n f| fo|ɔ m|u ɛ|sa | tu|hɔ |ɛ y|ans|nso|to |hwɛ|wɛ |i h|rib|ibi|ia |dwe|ofa|kab|odi|dis|ɛsi|sia|ian|wɔd|rim|dwa|aba|i y|ii |ɔ w|dua|ada|da | ka|ora|yer| gy| ɔn|mfa|wen|i d|any|som|m m|ɛbɛ| af|set|o w|i w",
    "hil": "nga|ang| ka|ga |ng | sa|an |sa | ng| pa| ma|ag |on |san|pag| an|ung|a p|kag|n s|a k|n n|a m|ata|kat| ta|gan|g p|ay |tar|g k|ags|ala|aru|run|gsa|tag|a s|g m| mg|mga|a t|n k|od |kon|g s|ing|a i|a n|g t|man|agp|tan|y k|n a| si|may|mag|gpa|hil|pan|ya |ahi|la |g a|sin|ana|ina|aya|gin| pu|ili|han|yon|nan|g i| in|gka|uko|way| uk|aha|ilw|lwa| gi|asa|apa|syo|kas|lin|ban|at |iya|n p| na|kah|o n|lan|in |a a|aba|ngk|pat|g n|ini| iy|agt|ali|pun|tao|o s|yan|a g|ngo|al |ngs|wal|kab|gba|agk|nag|o m| wa|aga|ano|i s|ni |abu|isa|kal|ong|dap|a h|a d| tu|agb|mat|aho| da|gso|sod|aki|no |pas|asy|ila|d k|n m|na |yo |lal|d s|til|di |agh| hi|gay|sal|s n| la|god|non|ati|a b|o k|ao |paa|una|o a|but|ama|asu|aan|uha| is|ka |ngb|ato|atu|aka|uga|bah|n u|i m|sil| du|aag|agi|gi |y s| ko|os |iba|nah|bat|uan|ulo| ba|pah|hay|yag| di|y n|ot |n d|oha| su|a l| pr|uta|tun|ida|gon|sta| al|pam|uli|lig| bi|bis|as |og |asi|pro|ksy|gtu|alo|sug|gua|k s|sul|lon|him|a e|do |n t|ton|ula|m s|lab|ron|n b|bot|aoh|hi |i a|tek|ika|lib|ugu|maa| ib|mak|ko |ind|ok |ghi|abi|hin| hu|n o| o |y a| bu|aro|gal|abo|ho |to |g e|lah| ed|rot|ote|eks|duk|inu|ibu|ubo|tum|uma|dal|gko|hat|kin|ad |g o|aay|iko|ndi|t n|tok|nda|i n|mo |ado|int|nta|kay|t s",
    "sna": "wa |a k|ro |ana|na | mu| ku|nhu|dze|a m|hu | zv|mun|oku|a n|chi|aka|dzi|che|zer|ero| ch|ka |se |unh|odz|kod|ra |zvi|rwa| pa| ne|kan| we| dz| no|va |ika| an|iri|o y|nyi|kut|yik|ese|nek|van|eko|zva|e a| ka|idz|ane|ano|ung|ngu|cha|eku|ake|ke | yo|ri |ach|udz|iro|u w|a z| va|wes|ech|ira|ang|nge|i p|yok|nok|eng|o i|edz|irw|ino|ani|uva|ich|nga|anh|ti |zir|sun|dza|wan|o n|rir|wo |tan|ko |ipi|dzw|hen|eny|asi|a p|vak|zve|kur|unu|ita|kwa|zwa|sha|a y| ya|nun|guk|e k|rud|ezv|a c|bat|a d|pas|uru|ta |o m|o c|uti|e n| kw|o k|ga |ara|uko| ma|si |uch|dzo|ata|ose|ema|hip|rus|kuv|hec|no |wak| rw|kus|omu|re |i z|ere|o r| po|kwe|yak|uta|mo |usu|za |sa |o a|e z|mwe|isi|twa|gar|pac|kuc|ete| in|we |o d|nem|pos| ye|hin|uka|tem|emo|zo |oru|vo |emu|pan|a i|get| ak|ari|hur|ong|erw|rwo|da | uy|uye|kub|and| ha|a s| se|nor|yo | ko|i m|a a|uba|kui|uit|vin|kud|sin|hak|wen|ura| ic|a u|mut|ava|pi |a r|eva|e m|zvo|adz|nez|mat|a w|u a|cho| hu|guv|fan|aan|pir|ute|han|enz|ina|asa|aru|ted|era|ush|ha | iy|uny|vis|ton|yor|ran|oko|i h|ngi|uri|ait|hek| ac|nen|muk|azv|uma| ny|ngo|o z|osh|kun|vem|a h|nid|mir|hok|aga|ing|nza|zan|o p|pam|zi |yew|ewo|u v|usa|a v|ama|i k|uwa|nir|i i|e p|sar|kuz|mum|kak|go |amb|ngw|gwa|vic|zid|i n",
    "xho": "lo |lun|oku|nge|elo|ntu|tu |e n|ele| ku|nye|ye |la |ung| ng|nga|lek|a n|o n|yo |o l|e u|nel|gel|a k|ko |ho |ulu|ke | ne| na|lul|we |le |wa | kw|ngo|ule| no|kub|onk|nke|a u| um| lo|o e|ela|kun|any|ama|unt|uba|ang|eko|elu|mnt|ezi| wo|eyo|lel|a i|alu|lwa|kwe|umn|ba |olu|kuk|ukh|won| uk|uku|une| un|gok|enz|nok|khu|e k|zwe| ok|the|ile|ane|eki|kan|uny|aph|aku|o z|lok|ley|oka| ez|ath|het|eth|akh|sel|o y|ala|kul|pha| in|kil|esi|enk|use|u u| yo|hul|o k|khe|ana|tho|obu|wen|o o|nku|kho|ban|e a|na |ise|gan|ni |a e|kel|ent|uth|nam|he |izw|elw|ing|hi |o w| zo|eng|eli|fun|lwe|za |fan|ya |ntl|ndl|kwa|isa|o a|hus|ayo|iph|uhl|eni|nzi|isw|ben|gen|aba|sa |phi|tha|und|ka |ink|thi|alo|ume|ha |o u| ba|azi|i k|bel|hla| lw|wan|e o|lal|i n|mfa|a a|man|ngu|pho|emf|swa| ab|e e|e i|bal|kut|zi |int|eka|o i|seb|ebe|mth|ziz|sek|lan|dle|sha|uph|mal|nee|een|yal|okw|ima|tya|lin|sis| se|zel|nen|tla|ase|ene|ike| ak| ko|wak|olo|do |nay| ub|ubu|ant|mfu|sid|oko|ulo|ezo|a o|isi|sen|zo |ga |nan| en|ma |kup|nak|imf| ol|aza|iba|kwi|wez|and|phu|u k|kuf|ube|ham|li | ph|zim| ul|eem| es|ety| ya| le|jik| im|nte|iso|o s|han|idi| so| nj|nje|jen|no | el|bo |a y|e l| ze|ufu|aka|hel|yol|kus| am|kuz|kuh|ale|yen|‐ji|urh|rhu|lum|men|ong",
    "min": "an |ak |ang| ma| da| ka| sa|ara| ha|yo |nyo|hak| ba|ran|man|dan|nan|ng | pa| di|kan| na|ura|ata|asa|ok |nda| pu|ala|pun|uak|ntu|k m|n d| ti|ah |o h|k u|n s| ur| un|n k|tua|n b|and|unt| ta|uny|n p|tio|iok|ama|pan|ek |jo |ban|n m|nga|ado|k h|k d|g p|aan|aka|tan|at |ind|dap|pek|o p|dak|tau|amo| at|uan|mo |ape|kat|au |sas|mar|di |ari|asi|ia |ngg|o s|bas|ika|o d|sam|lia|san|am |gan|sia|tar|anu| jo| su|n n|par|o t| in|gar|sua|lam|sar|k s|dek|o m| la|ana|ri |ai |asu|bat|ko |alu|o u|ant|iah|aga|lak|dal|rad|adi|i m|k a|n a|tu |eka|dok|k k|aro|usi|al |i d|mal|aku|mam|ian|ato|to |n u|um |o b| ne|neg|ega|beb|eba|si |a d|ro |uah|ila|mas|rat|ali|aba|uka|nus|ti |ard|kam|n t|ami|in |sa |dar|atu|lan|aha|amp|car|kal|das|so |rde|aca|ngs|gsa|un |kab|i k|uku|k n|ar | an|ka |aya|mat|sya|yar|ati|ras| ko|kum|sur|pam|u d|lah|mpa|kaa|i t|nta|o a|lo |kar|iba|dia|n h|lai|dil|k t| bu|any|ra |abe|aki| as|ili|u p|nny|k b|amb|sac|as |h d|huk|a n|i p|itu| li|lin|ndu|dua|raj|ajo|n i|o k|han|rik|a b|k p|uli| hu|ggu|ik | mu|sad|ngk|aso|gam|did|dik|bai|a a|nia|bad|ann|apa|jam|ain|i j|sal|i a| ad|ony|a s|ani|ada| pi|n l|arg|rga|ga |tik|sti|ans|ndi|sio|bak|ahn|hny|min|tin| um|awa| pe|per|l d|bul|bag|alo|uju| de|uni|adu",
    "afr": "ie |die|en | di| en|an |ing|ng |van| va|te |e v|reg| re|n d| ge|ens|et |e r| te|e e| be|le |ver|een| in|ke | ve|eg | he|lik|lke|n h|het|de |nie|aan|id |t d|nde|men| vr|eid|e o| aa|der|hei|of |in | el|om | op|e b|g v| ni|elk|and|al | me|er | to|g t|e w|ord| we|ers| of|ot | sa| vo|erk|n v|tot|asi|kee|ge |vry|sie| wa|ere| om|aar|sal|wor|dig|egt|gte|rdi|rd |nd |e s| de|at |ige|ede|n s| on|n a| ’n|’n |e g| wo|eni|e t|oor|ns |erd|ond|bes|aak|lle|se |is |ska|nig|ryh|yhe|ien|ele|eli|e m|vol|sta|esk|edi|ang|sy |ik |g e|r d|es | vi|vir|ir |kap|gel|ak |din|ewe|g o|e i|ker|ike|gem|nse|uit| st|el | is|op | hu|wer|eur|ur |nas|ale|nge|n o| al|eme|ap |e n|e a|e d| hi|hie|ier|rin|min|deu| so|del| as|as |wat|s o|n e|e h|d v|ten| sy|kin|re |ter|end|per|it | da|gin|oed|wet|ges|e k|s v|n w|nte|ger|ema|d t|d s|s e|ona|nal|d e|waa|ees|tel|red| na|ies| ma|soo|ite|man|ely|lyk|esi|hul|ske|sio|ion|eke|d o|rde|ese|nsk|ren|t e| gr|oon|ig |eri|n b|s d|n t|ind|voo|t v|all|n g|tee| pe|rso|hed|iem|yke|ard|ods|ort|ans|maa|g s|r m|ame|ent|voe|l g|erm|n m|lan|ndi|sia|n i|nli|ont|wee|rse|sek|r e|n ’|rkl|ari|taa|eem|daa|d w|t g|arb|n n|t a| ty|igh|ghe|nsp|l v|nsl|raa|opv|pvo|g a|gen|rmi|spr|sos|osi|ern|sen|gti|lin| sl",
    "lua": "ne |wa | ne|a m| ku|a k| mu|di | bu|a b| di|e b|tu |nga|bwa|ntu| bw|udi|a d|e m|i b| ba| ma|shi|adi|u b|a n|ons|la |mun|i n|nsu|ung|ga |ya |yi |unt|na | dy|idi|e k|buk|mu |ika|esh|su |ku |u m|nde| bi|lu |any|end|yon|dik|nyi|ba | ci|ang| ka|u n|u y| yo|we | mw|ka |tun|oke|i m|de |kes|hi |dya|e n|mwa|ban| kw|kok|sha|u d|ken|ha |kwa|ji |wen|dit| ud|a a|mwe| an|itu| pa| a | wa|le |kum|nji|kan|ibw|yen|bwe|ena|a c|ant|ish|ala|did|mba|e d|u u|bul|enj|mak|i a|nda|u a|ans|pa |ila|ako|umw|hin|nso|kal|amb|uke|ana|uko|i k|ele|bad|ela|u k|u w|aka|ind|ndu|du |kwi| mi| ns|ja |bu |sun|atu|mbu|bud|dil|ile|nan|nsh|ula|eng|bis| cy|enz|alu|kad|dib|kud|dye|bid| by|lon|i d|gan|ukw|u c|da |kub|aba|lel|so |a p|ye | na|dim|ilu|isa|sam|ngu|cya| aa|aa | bo|mat|aku|e c|ond|nge|kus|ulo| mo|kuk|mud|mus|mon|iki|man|bak|abu|omb|elu|ta |ngi|umb|und| ke|dis|uba|imu|mal|diy|umu|ush|gil|kwe|wu |ben|iku|wik|bon|wil|ma |ulu| me|uka|aci|mik|san|pan|gad|nza| be|iba|yan| tu|ong|o b|bya|ifu|ke |umo|uja|som|ale|ata|apa|kak|akw|utu|e a|a u|awu| um|cik|kup|upe|mum|iko|uku|kul|muk|and|iye|ona|ita|ima|amw|me |bel|ilo|cil|ike| ya|map|za |tup| lu|lum|pet| mb|kis|kab|ama|ane|bum|ine|wab|lam|ame|mbe|ole|nu |isu|upa| ad|fun|kon|kuy",
    "fin": "en |ise|ja |ist| ja|on |ta |sta|an |n j|ais|n o|sen|oik|ike|keu|lis| va|ell|n t|lla|uks| on|ksi| oi|n k|aan| ka|een|la |kai|lli|a j| ta|mis|sa |in | jo|a o|n s|ään|än |sel|kse|a t|tai|a k|us |tta|ans|den|kun|ssa|eus|tä |kan|nsa|nen|all|apa|ill|est|eis|ien| se|taa| yh|see|jok|n y|oka|n v|ttä|a v|vap|aa |ai |itt|aik|ett|ti |stä| ku|tuk|ses|ust|isi|sti| tu|n p|lai| tä|n m|unn|ast|n e|tää|sia|a s|tei|ä j|ine|per|ste|ude|si |ä o|ia |maa|äne|a p|ess| pe| mi|kä |ain|tam|yht|ämä| ju|jul|yks|a m|llä|hän|utt|sek|et |ide|stu|val| hä|ä t|hmi|lä | ke|n a|ami|ikk|täm|lle| ih|ihm|iin|tee|sä |euk|un |tav|ava|a h| ma|ten|lta|hte|isk|iss|dis| sa|n h|ois|ssä|mää|pau| si| ol|ekä|a y|sty| ei|alt| te|oll| ra|vat| jä|tet|toi|att|iel|kki|sal|a a|väl|at |isu|suu| mu|n l|mai| to|ää |iit|kie| su|sil|oma|tun|etu|vaa|muk|sku|nna|eid|tie|uli|a e|ei | yk| he|eru|rus|eli| ri|sii|uut|sko|a r|nno| ko|aut|tti|kaa|le |tur|sie|min|lin| yl|lei|aat|saa|lma|oli|oon|mie| ed| la|tus|na |urv|rva|vas|iaa|itä|ä m|ite|kää|eet|lii|uol|ama|avi|lit|omi|nee|suo|ä k| ki|paa|i o|jen|n r| al|joi|oit|ali|tyk|yle|ute|yhd|unt|eks|ä v|voi|ilm|rii| sy|usk|oim|ope|pet|oja|uom|äli|uud|vai| pu|ole|ala|hdi|ita|sit|ity|hen|ilö|i s|auk| om|ttu",
    "slk": " pr| a |prá|ráv| po|ie |ch |ost| ro|ho | na|vo |na |ani| ne|nos|ažd|kto|má | ka|kaž|ávo|né | má|om |ti |ebo| v | al|ale|leb|bo |o n| je|ždý|dý | za|ia |ých|mi |ova| sl|van|sti|nie|to |ne |áva|eni|rod|ého|slo|lob|tor|ý m|á p|o v|a p| zá| sp| kt|rov| sv|voj|nia|obo|bod| ná|je |ej | vy|a v|o p|a s|a z|áro|ať | sa|mu | ma|e a|svo|e s|spo|nár|a n|mie| by|kla|ovn|ľud| vš|iť |odn|roz|sa |by | ľu|vše|pre|oci|va |o a|néh|i a|nu |ov |o s|a m|ný |e v|u a|ený|ným|u p|pod|zák|a k|nes| do| k |ajú|eho|u s|byť|yť |áci|nýc|a r|šet|ými|stn|ran|jeh|pol|lad|tát|čin| sú|tre|vna|ému|pri|stv|e z|och|ny |edz|a o|kon|oje|štá|sť |ť s| ni|oré|u k|nak|uds|m a|etk|maj|é p|ým |med|hra|a a|ko | ob|e b|prí|i s|dov|esm|smi|osť| či|iu |du |ou |pro| ho|est|i p|e p|dsk|žen|vať|chr|jú | bo|bol|že | vo|bez| in|ť v|nom| ab|aby| št|ré |čen| de|rác| že|res|dom|aké| tr|nú |ky |ens|tné| vz|i k| oc| so|áln|dzi|ok |lne|ní | ak|ako|pra|rav|obe|kej|olo|por|ami| ta|áv |ikt|odu|slu|voľ|len|str|ké |stu|ákl|ože|ský|del|ivo|anu|ved|tvo| to|iál| me|é v|ené|oju|ju |kým| st|sta|é s|ach|cho|h p|kra|loč|očn| ži|dno|m p|de | os|inn|niu|v a|o d|i v|vyh|nik| kr|hoc|ím |júc|ci |ven| od|e n|é a|rís|tup|odi|ú p|soc|ciá|iná|oro|rom|y p|pov| pl",
    "tuk": "lar| we|we | bi|yň |ary|ada|da | he|de |yny|dam|an |kla| ha|er |yna| ad|na | ýa|dyr|ir |iň |r b|bir|ydy|ara|ler|am |ini|yr |lan|kly|lyd|r a| öz|öz |nyň|mag|gyn|her|ryn|aga|en |akl|ala|dan|hak|ne |eri|r h|ny |ar | de|ga |huk|uku|ili|ygy|li |kuk|nda|asy|len|a h|ine| ed|atl|bil|niň|edi| ga|lyg| hu|nde|dil|ryň|e h|eti|ukl|aza|zat|a g|a‐d|‐da|gin| bo|ly |tly| gö|lma|hem|ama| az|‐de|e d|ykl|dir|ýet|ýan|ile|ýa‐|a d|ynd|aýy|lyk| go|e a|ge |ünd|egi|sy |ni |ilm|aly|em‐|m‐d|lme|etm|any|syn|rin|tle| be| äh|den|y b| du|mak|a w|let|ra |n e|a ý|mäg|äge|meg|igi|im |bol| ýe|ele|ň h|iýa|ň w| et|deň|esi|in | ba|ek |ak |agy| je|r e| bu|bu |a b|etl| di|ril|p b| es|esa|sas|ähl|yly| sa|e g|y d| do|ard|e ö|mek|lik|ň a| ka|e b|ill| gu|e t| hi|n a|nma|mez|e ý|gal| ar|ýar|rla|ede|ola|n b|göz|y w|hal|end|mil|ram|mel|siý|anm| ma|ndi|iri|lig|i g|sin|gar|mal|rda|ň g|gor|al |n ý| öň|öňü|ňün| tu|tme|dal|yýe|my | ta|kan|gat|and|rle| mi|tla| ge|hiç|iç |ň ý|n h|lin| yn|e w|ýle|m h|y g|çin| me| er|erk|ora|alk|at |tut|tiň|umy|dur|irl|gur|eli| dö|döw|öwl|wle|ekl|asi|ere|nme|aýa|nam|eýl|gi |eň |baş|kim|a ö| ki|ýaş|up |ň d|kin|ry |z h|nun|z ö|n w| çä|ter| aý|tyn|aml|ras|beý|i ý|ip |inm| ol|ert| se|aşa|olm|hli|i h|lim|gör",
    "dan": "er |og | og|der| de|for|en |et |til| fo| ti|ing|de |nde|ret| re|hed|lig|il | ha|lle|den| en|ed |ver|els|und|ar |se | me| fr|lse|and|har|gen|ede|ge |ell|ng |nne|at | af|le |nge|e f|ghe|e o|es |af |igh| i |enn|ler| at|ske|r h|hve|e e|enh|t t|ne |ige|esk| be| el|ig |ska|or |tig|fri|nin|ion| er|e s|nhv|re |e a|men|r o| sk|ati| st| in|al |ens|med|tio|l a| på|ett|tti|del|om |end|r e|r f|g f|g o|r r|ke |eli|ns | an| so|på | al|nat|r s| un| ve|han|r a|nes|ere|r d|t f| si|lin|ter| he|ale|det|sam| ud|e r|lan|tte|e m|ent|rin|ndl|rih|ihe|ans|kal|t s|isk| na|erk|som|hol|old|lde|ren|ner|n s|kel|ind|e n|ors|e i|te |dig|vær| li| hv|ste|sni|sky| sa|d d|ene|s f|nte|ers|mme|all|ona|nal|vil|ger|ove|g a| gr|age|e h|s o|d o| om|arb|e t| væ|g t|tel|fre|ern|r u|g h|res|t o|e d|t d|r i|d e| la| da|kke|n m|run|rbe|bej|ejd|n f|rel|bes|ved|kab|t e|ilk|øre| fu|e b|sk |nd |str|rkl|klæ| må|ven|gru|t i| vi|g d|gte|ld |od |t m|ære| ar|vis|rt |nst|ærd|rdi| mo|t a|fun|tet|lær|æri|sta|dli|sig|igt| op|rho|g e| ge|mod|d h|rsk|ker|lem|em |e g|g s|ets|rem|ie |g u| fa| et|e u|orm|s s|per|emm|n h| no|des|da |gt |tal|l e| tr|erv|rvi|isn|l h|t b| bl|dt |kyt|ytt|t v|g i|gør|r k|rke|ken|hen|dre| of|off|ffe|rde|i s|må |lke|r t",
    "nob": "er | og|og |en | de|for|til|ing|ett| ti|et | ha| fo| re|ret|il |het|lle|ver|tt |ar |nne| en|om |ell|ng |har| me|enn|ter|de |lig| fr| so|r h|ler|le |den|av |and| i | er|hve| å |som|or |t t|els|ne | el|esk|enh|re |se | av|nge|nde|lse|e o|ke |ska|ghe|ete|gen|men|ten| st|fri|r s|ig | be|e e|igh|nhv|ske|r r|tte|te | ut| in| sk|al | på|t o|der|e s|sjo|jon|ner|på |rin|unn|e f|asj|han|sam|ed |ent|es |tig|g f|nes|ene| al|med|ge |tti|r e|ens|eli|r o|g o|nin| an| ve|isk| sa|lin|itt|t s|end|t f|nas|kal|lik|r f|rih|ihe|lan|mme|ns |nte|g s| si|e r|all|dig|r a|ige|ren|n s| gr|l å|erk|ere|und|e m|erd| na|kte|ste|r u| un|tel|res|inn|det|gru|ers|lær|arb|g e|ven|ekt|ale|t e|del|t i| la| bl| he|run| ar|rbe|bei|eid|g t|sky| li|e g|ans|sni|e d|e a|n m|kke|sta|rkl|klæ|æri|mot|e h|rt |ove|e b| mo|e t|tat|at |e n|m e|ot |n e|ker|ors|rel|bes|kap|jen|g r| et|sk |nn |r m| må|e i|str|one|t d| vi|n a| da|s o|g h|nnl|opp|vis|t a|ona|nal|g a|t m|bar|ger|ndi|dre|n o|r d|dis|i s|id |s f|per|ndl| no|da |rdi| om|bli|nse| op|hol|old|emm|l f|rit|kyt|ytt|eri|ære|ute| kr|ffe|g d|kra|tet|ore|set|n t|vil|nd |dom|m s|g b|tes| tr|me | hv|rvi|isn|å d|ser|r k|g i|lt | gj|l e|r b|gre| fa|å s|rav| di|må |ikk|d d| sl| at|n h|dli",
    "suk": "na | mu| bu| na|a b|hu |ya |a n|we | gu|nhu|a g| ba|a m|ili|wa | ya|li |unh| bo|ali|mun|bul|han|i m|bo |ilw|uli|ang|lil|la |i b|e n|ga | al|kil|mu | wi| se|u a|lwe|ose|le |sek|ekg|kge|ge |lo |ulu|bi |e y|kwe|e b|and|i n|ila|ng’|yo |a s|nga|ina|lin|aki| ns|nsi|si |abi|ban|se | ly|dak|lu | gw|ngi|a w|gil|akw|o g|anh|u b|ilo|ile|ka |a l|o n| nu|ubi|e g|ja |gan| ng|g’w|nul|lya| ma|ani|ndi|u m|wiy|iya|ada| ji|jo |lwa| ka|yab|e k| ad|gwi|o b|ing| ku|ika|o a|ho |ula|o l|gub|a i|dik|shi|u n|ayo|iha|biz|ha |o j| ja|gun| sh|lag|ma |ung|ele|wen|o s|mo |lan|gi |gul|ala|iwa|ji |ola|iki|a a|jil|yak|a k|iza| li|agi|nil|aha|man|bos|iga|ana|kuj| ha|za |win|oma|a y| gi|ki |iti| nd|uga| lu| ga| mh|uyo|gwa| mi|yos|sol|pan|iko|i a|aga|ong|u g|a u|iku|ene|ndu|o w|hay|mah|je | ab|i y|ibi|but|ida|nhy| il|abo|aji|nik|aya|u w|ujo| we|duh|uhu|nda|nya|e i|iji|nay|a j|ale|ba |o m|lon|lel|ubu|mil|lug|da |dul|bus|e a|lyo|ima|bud|uso|bal|g’h|wig|e m|gik| um|uma|wit|’we|nek|okw|twa|sha|e u|udu|ngh|any|mha|aka| ih|ne |gut|imo|hil|a h|nha|iso|som|’ha|wel|elo|bil|ita|ngu|uno|no |eki|u l|ulo|hya|yom|omb| ij|ije|u u|kub| uy|uto|e j|bak|ko |jiw|ule|lit| yi|ugu|o i|e l|’wi|inh| is|tog|kul|lik|upa|waj|umo|mbi|i g|o y|u i",
    "als": "të | të|dhe|he | dh|në |ë d|e t| e |et |ë t|imi|për| pë|dre|rej|ejt| dr| në|it |gji|sht|ve |jit|ë p| gj|ith| sh| i | li|het|e p| nj|t t|ër |in |me |jtë| ve|ë n|e n| ka|ara|e d|n e|ush|jer| pa|tet|hku|re |a t|ën |sh | ku|ë s|mit|kus|ë m|së |t d|lir|ka |jë |se |ë k| që| ba| si|etë|eri|ë g|që |si |ë b|nje|thk|eve|e k|jet|e s|bas|ohe|ose| mb|h k|ra | os|iri| nd|min|ash|shk|rim|një|ndë| me|e m|jta| du|anë|mi |es |eti|tar|rë |do |e l|t n| as|dër|tën|vet|end|hte|uar|und|duh|ësi|ave|tje|at |ndi|ri | ko|kom|uhe|i d|jes| ng|ë v|shm|ta |omb|i p|ar | kë| de|bar|ës |ë l|nga|ga | ar|e a|htë|hme|i n|en |ë e| pe|sim|ris|isë|art|tyr|cil|tim|ëm |tës|ime|ë i|ur |t a|gje| ma|or |ësh| ci|shë|r n|kët| je|are|ëta|e v|ë c|ish|i i|rgj|ë r|par| nu|nuk|uk |mar|ore| ës|tit|i t|t p| pu| së|lli|lim|per|ë a|lar|rat|atë|a e|mba|riu| po|e b|esi|hë | pr|ë j|edh|i s|a n|ite|ht |im |roh|ërk|irë|ërg|inë|ke |t s|ari|ven| an| fa|t i|tat|nal|tij|ij |igj|res|hëm|tav| tj|e q|otë|t e|lit|ik |k d|qër|asn|snj|ras|mun|ti |te |kla|nim| di|uri|ë q|ete|ë f|dis|ind|esë|ëzo|mbr|bro|roj|ojë|le |ror|r d|n p|det| ti| t |zim|shi|ive|erë| pl|ali|sho|hoq|oqë|ëri|a d| mu|vep|pri|r t| çd|çdo|shp|dek|ekl|asi|pun|tha|e f|je |iut|ut |idi|jen",
    "sag": "tî | tî|na | na| ng|a n|ngb|ngö|gö |nga|nî | lo|lo |zo |la |gbi|bi |ang| sô|sô |î l|gan|ö t|o n| wa| zo|a t|îng|i t|ngü|gü | al|lîn| nd|a l| kû|ê t|î n|äng| te|wal|ala|alî|î k|ë t|â t|î m|î â|ô a|kûê|ûê |ngâ|gâ |örö|î b| lê| mb|o k|a â|e n|î s| kö|ko |ter|köd|ödö|dör|a k|ï n|lêg|gë |ôko|mû |o a| pë|pëp|ëpë|êgë| ay|yek|eke|ke |ü t|î t|ê n|bên|o t|ra |rö |erê|rê |pëe|ëe |kua|aye| nî| ôk|tï |ua |a z|ä t| âl|ïng|â n|î d|âng|ö n|âla|ê a| am|ten|mbê|ênî|î z| yâ|û n|ene|ne |rä |a m|î g|a y| ku|bê |ga |a s|ëng|arä|ndi|diä|iä |amû| du| ân|dut|öng|yâ |utï|lï |oro|ro |a p|önî| gï|î a|ngô| sê|lë | âm|ndo|ndö|o s|i n|do |gba| mä|sâr|âra|ûng| bê|e t|e a|î p|ö k|ara|dö | âk|a a|yê | sï| gb|ba |a w|ï t|î w|war| tö|tön|zar|në | të|tën|ban|ndâ| sâ|ta |ana|sï |nzö|zön| lë|î f|ênd|a g|ënë| at|ate| za|îrî|o w|sên| da| nz| në|nën|o l|o ô|bâ | âz|ä s|kân|alë|a b| kâ|ë s|üng| ko| ma|bat|ata|ông|da | mû| kp|ô n|se |o p|fa |lê | po|erë|rë |gôi|ôi |gbï|ü n|gï |ibê| as|amb|tän|ë n|âmb|mbâ|bûn|mba|rös|ïgî|gî | af|mbë|bët|ëtï|ä n|hal|lëz|ëzo|ö w|kpä|päl|älë|kûe|ûe |e z|köt|ötä|tä |gän|mar|ö m|sor|dë | hï|hïn|ngä| yê|ê s|kod|odë|âzo| ad| ba|i s|bät|ätä|ngi|ö â|gïg|i p|afa| sä|sär|ärä|rän|bor| lï| bo|wâl|âlï|bïn",
    "nno": " og|og | de| ha|en |er |ar | ti|til|lle|ett|il |ret|om |et | re|le |har| me|enn| al|all| fr|ne |tt |re | i | å |and|ing|nne|ska| sk| fo|det|men|ver|den|for|ell|t t|dom| so|de |e s| ei| ve|ere| på|e o|e h|al |an | sa|sam|l å|fri|på | el|ler|leg|som|ei |ein|nde|av |or |dei| st|kal|esk|gje|ten|n s|r r|ske|je |tte|rid|eg |i s|te | gj|nes|r s|st |med|ido|e f| in|r f|nas|asj|sjo|jon|ke |ter|unn|kje|ed | er|t e|t o|ona|han|e t|ane|ast|ski|e m|g f|lan|tan| gr| av|ste|ge |der|å f| an|r k|g o| na|t s|nga| sl|n o|seg|ng |ern| ut|nte|at |na | si|arb|bei|eid| få|e a|g d|ame|e i|lik|gru|kil|r a|lag|g s|e d|a s|jen|rbe|n e| tr|r d|n m|nn |erd|e n|e r| må| bl|bli|me |run|ege|nin|ren|år | kr|kra| mo|n i| at|ins|nsk|frå| la|mot|ot |end|å a|in |t a| ar|nal|ale|få |e v|lov|t f|v p|rav|e k|int|sla|ome|sta|gen|å s| kv| li|itt|nle| lo| fa|nad|ld | se|kan|tta|id | ik|ikk|kkj|å v|r g|dig|r l|a o|ha |g t|inn|r m|var|kap|d a|g i|rna|god|n t|n a|ndr|dre|jel|g a| ka|ve |l d|ild|lin|ag |å d|g e|t h|ir |ige| om|t m|ig |ga |l h|tyr|ker|nnl|se |l f|rel|g g|rt |eve|e u|und|r o| då|då |e e|kår|n d|va |eld|d d|t i|i d|t d|gar| no|nok|oko|mål|da |nd |eig|nge|on |ta |lir|ad | be|øys|m s|g h|uta|vil|i e|sty|e p|opp|bar",
    "mos": " n |ẽn| a | se|a t|sẽ|̃n | ne|a s| ye| ta|e n| tɩ|n t| pa|tɩ | la| so|nin| ni| b | fã|fãa|ãa |ng |a n| bu| tõ|la |ẽ | te|ne |tõe|or |a a| ya|ye | to|ned|ed |tar|pa |õe |e t|em |tẽ|g n|ã n| ma|aan|n m|sor|buu|uud|n y|maa|a y|r n|ins|n p|ud |ra |d f|a b|paa| wa|ɩ n| na|me |n d|taa|ara|bã |sã |n w|n b|eng|aal|ɩ b|an |yel|gẽ|n n| ka|og |̃ng| tʊ|gã | bɩ|bɩ |ame|e b|na | yɩ|am |aam|wa |g a|ab |d b|mb |aab|aa |wã | bã| ba|a m|m n|ãmb|tog|ore|ga |a l|nsa|saa|yaa| wã|nd |ʊʊm| sõ|ãng|n s| sã|d s|tʊʊ| tũ|ngã|ba | da|el |seg|egd|re | me|ã t|b s|ɩ y|aoo|d n|dat|l s|dɩ |ã y|m t|g t|ing| kã|oor|a p|men|lg |b n|r s|dã | vɩ|vɩɩ|gdɩ|ã s|b y| le|n k|nga|ar |al |rã | bʊ|nge|ĩnd|gr | pʊ|pʊg|to |neb|ɩɩm|lem|yɩ |d a|̃nd|kao| we|a k| ke| mi|ɩ s|ilg|g s|bãm|b t|oog| ra|gam| ko|ngr| zĩ|ʊge|kẽ| wi|wil|m b|ã p| no|eb |b k|at | bũ|bũm|ʊmd|a z|wẽ|ren| yã|ʊm | yi|g b|sõn|õng|ã f|ɩm |m s|ya |ãad|noy|oy |da |ũmb|s n|le | f |go |o a|oga|i t|lag|te | sɩ|ɩ t|b p|tũ |ni | gã|soa|oab| ti|n g|ẽe|aor|age|gem|̃ n| yõ|r t|a g|ka |ag |aas|tũu|b b|in |a w|eg |a r|e y|ate|eem|ms |r b|s a|ã k|b w|too|ẽm|̃ms|mã |kog|o t|zĩn|e a|oa |ũ n|bao|bui|uii|iid| zã|neg|e s|e p|ik |ell|so |ao |aar|l b| ze|zem|d t|yẽ|wak|aka|kat",
    "cat": " de| i |es |de |la | la| a | pe|ent|per|ió |tat| se|nt |ret|ts |at |dre| el|ls | dr|men|aci|ció|a p|ona| co|a l|al |na |s d|que|en |el | to|s i|e l| qu| en|tot|ns |et |t a|ers| pr|t d|ons|er | ll|ion|ta |a s|a t|con| l’|s e|els|rso|res|als|cio|est| un|son| re|pro|cia|les| in|ita| o |ue | té|té |del|lli|ia |ame|ota|é d|sev|nac|i l|s p| al|a d|a i|a c|nal|ar |ual|ant| le|nci|i a|t i|ser|sta|ert|rta|va | d’|s n| no|re |l d|ats|eva|s a|e c|com| na|ues|rà | ca|és | so| es|ets|lib|ibe|ber|da |l’e|s l|no |una|r a|ter|sen|man|n d|l p|ure|t e|ran|des|i e| di| pa|cci|igu|s t|om |e e|e d|a a|tra|gua|ada|s s|l i|tre|i d|ect|ide|aqu|a u|s o|vol|ra |hum|uma|ens|ntr|nta|ial|ene|soc|oci|cla|cte| ni| hu| fo|erà|ble|ass|sse|eme|alt|era|ici|uni| aq|nte|cti|ali|lit|tes|pre|ess|o s| ig|ans|ote| és|mit|seg|ica| ma|us |rac| po|r s|se |un |a e|ssi|dic|l t|s h|tal|par|nit|hom|i i|egu|ir |r l|ènc|a m|i p|eta|t q| te|ten|ó d|ont| tr| mi| as|t t|nse|l’a|ist|eli|s f|ecc|ria|s c|n l|amb|ura|ltr|lic|an |ó a|int|n e| ac|act|e t|eix|qua|ing| ha|t s|ots|ndi|fon|lig|seu|rot|iva|mat|nam|liu|iur|olu|lle| am|a f|gur|rec|one|esp|e p|tiu|inc|lar|o p|n a|sid|nin|ngú|gú |ú n|e r|ó i|dis|ive|ll | fa|lia| ta|itj|pen|for|rom",
    "sot": " le|le |ng |ho | mo| ho| bo|a h| e |lo |ya |ba |e m|a l| ya| ts| ba|na |ong| ka|a b|tho|e t|sa |a m|elo|olo|ets| di|o e|la |mon|oth|tsa|o y|ka |a k|eng|oke|kel|a t|g l|tok|o t|ang|tla|mot| se|o l|e b| na| ha|wa |lok|e h| tl| a |aba|tse|o b|ha | o |e k|hab|tjh|jha|tso|a d| to|se |so |e e|oko|tsh|dit|pa |e l|apa|o n|loh| ma|kol|o m|a e|ana|ela|ele|a s|let|bol|ohi|a a|kap|tsw| ke|hi |g o|ohl|eo |ke |set|di |o k|o s|ona|e d| kg|aha| mm|bot|lan|o h|ito|bo |hle|moh|eth|ala|ats|ena|i b|lwa|abe|swa|atl|g k|ola|ane|bat|a n|phe|g m|ell|o a|hlo|ebe| me|mel| ph|tlo| th|g y|g t|etj|mat| sa|mol|lat|g b|nan|lek|the|she|seb| en|g h|boh|me |kgo|e s|hae|ae |edi|kga|wan|hel|ile|we |kan|ume|to |a f|han|otl|lao| hl|nah|ath|len|mme|bet|ire|rel|bel|aka|efe|swe|lel|oho|a p|shi|man|eha|nts|bon|ano|atj| ko|sen|its|g e|he |o f|eka|hal|all|kge|get| wa| fu|ban|het|ao |hat|lal|heo|a y|got|hon|o o|san|e y|mmo|thu|tha|lla|wal|ing|fum|uma|tlh|kar|ben|si |pha|hla|alo|e n| ef| he| ta| tu|tum|hil|lap|llw|ato|llo|lle|hen|tsi|oka|i m|mo |hir|tab|ama|din|elw| lo|dis|pan|nen|son| eo|ots|e a|i l|lwe|gat|fet|dik|adi|pel|hol|iso| fe|amo|isa|no |are|ret|emo|o d|i k|kop|opa|o p|hwa|fen|oll|ose|mab|ike|oba| nt|hut|uto|lam|ame",
    "bcl": "an | sa|in | na|ng |sa | pa|na |nin|ang| ka| ni| ma|pag| an| as|asi|sin|n s|ion|n n|a m|cio|on |ban|n a| de|ga |kan|a p| mg|mga|a n|ere|rec|os |der|ech|cho|n p|aci|aro|n m|man| la|o n|n d|a s|asa|n k|g s|kat|sar|ata|ay |o s|al |n l|ong|a a| o |igw|gwa|ho |a k|tal|amb|kas| ig|wa |mba|sai|ara|lam|agk|o a|ro |o i|gka|ali|apa|nac|san|g p|aba|iya|a d|ina|yan|may|lin|ing|aiy| ba|ink|nka|aka|a i| da|yo | in|abo|aha|ag |nta|tan|s n| ga|ini|agt|ad |ano|s a|hay|kai|og |ida|o m|hos| ta|ent|ia | hu|n i|iba|han|par|at |ant|nal|a b|g n|ron|g m|ayo|iri|dap|mag|nga| pr|sta|a g|no |aya| co|pat|ran|cia|l n|li |dad|es |g k|men|ala|lan|aki|pro|nte|mak|y n|gan|gab|bos|con|t n| si|o k|ta |nda|ona|n b|a l|do |g d|agp|a c|taw|awo|uli|aan|as |uha|n o|ags|tay|tra|g a|g o| so|ter|hul|kam|pan|anw|nwa|waa|i n|min|ado|kap|g i|bal|a o|bil|d a|ami|ra |res|ain|nag| di|o p|bas|kab|n e|ind|gpa|l a|gta|ika|ba |en |nan|n g|nes|ton| mi|pin|bah|ili| re|pak|tec|ecc|cci|ial| bi|om |imi|ana|ico|nci|ios|one|nid|a e| es|isa|agi|ast|ipa|paa|aag|gi |cri|rim| se|rab|ani|hon|n t|hal|sad|n c|agh|ici|rot|ote|int|ubo|bo |wo |rar| le|ley|ey |to |a t|s s|ibo|rin|i a|sab|sii|iis|say|y m|buh|yag|lar|gsa|sal|s h| fu|und|agb| ed|cac|ale",
    "glg": " de|os |de | e |ión| a |da |to |ció|ere|ón |der|ito|en |a p| co|ent|n d|eit| se|rei|ade|as |aci|dad|s d| pe|per|o d|e a|e d|s e|men| da|ers|nte|al |do | te| pr|rso|ida|es |soa|ten|oa | to| po|que|a t| o | in|a e| li|tod|cia|te |res| do|o a| re|tos|pro| es| ou|ra |est|dos|con|lib|o e|nci| na|a d|a a|e e|a s|oda|e o| pa| á |ber| qu|ue |e c|tra|com| sú|súa| en|nac| un|ou |ar |s p|ia |a c|nto|a o|ns |ser|er |se |is |ter|des|or |úa |óns| no|ado| ca|s n|sta|s s|rá |ibe|erd|rda|nal| as|ica|no |era|por|e n|eme|ais|e s| ni|e p|erá|sen|pre|das|ant|cci|ame|par|ara|o t|o p|o á|ona|io | di| so|nin|n p|cto|s t| me| os|cio|n e|ntr|enc|n c|unh|nha|ha |nta|n t|e i|ion|ect|n s|so |o s|ese|s o|á s|e l|ndi|dic|ont|e t|soc|oci|ici|nid|tad|tiv| ac| ig|igu|gua|eli|omo|o m| ma|l e|a l|rec|ing|cas|na |re |vid|ali|ngu|und|man|s i|s c|ria|lid|seu|ase|lic|on |uni|a n|o n|a u|cti|cla|rac| tr|ind|ori|ual| fu|fun|s a|nda|ial|dis|ste|ido| ó |act|tes|ta |ome|e r|iva|lo |mo |uma|n a|r d|o c|ecc|sti|tor|seg|egu|r o|esp|ca |n o|o ó|un |o o|r a|nde|cal|ada|med|edi|pen|tri| el|a i|hum|olo|ixi|á p|rot|ote|mat|ari| fa|ibr|bre|ena|gur|ura|spe|tar|cie|int|ren|ver|alq|lqu|uer|lar|guí|uín|ín |a f|ili| ta|tan|ist|rim|ma |ele",
    "lit": "as | ir|ir |eis| te|tei|s t|os |uri|ti |us |is |iek|ai | pa| vi|vie|tur| ki| tu|ri |žmo| žm|ien|ių |ės |ali|mog|ais|vis| ka| la|lai|ini|i t| į |s ž|isę|sę |s i|ena| pr| ne|kie|kvi| ta|pri| bū| jo|ekv|nas| su|mas|gus|tin|būt|ogu|s s|isv|mo |mą |isi|ant| ar|s k|ama|s a| ti|aci|ūti|kai|s v| sa|s n|s p|inė|cij|oki|tai|val|ar |ms |jo |sav| na|gal|i b|aus|imo|ę į| ap|nim|imą|i p|rin|sta|ina|ma |kur|men|i k|ima|mis|oti| nu| ku|lyg|dar|tas|r t|i i|kad|ad |tų |tik|jos|išk| at|je |arb|s b|aut| įs|nės|ijo|i v|eik| be|iam|asi|sin| re|isu|suo|li | va|sty| ly|tie|si |i s|lin|vo | ga|tuo|ą i| mo|rie|jų |r p|ara|isė|aik|pas|ybė|ntu|rei|mok|din|mos|aip|ip |i n|r l|pag|į t|tis|es |jim|įst|kit|ų i|uot|gyv| or|kia|tyb| sk| iš|nti|ek |gau|agr|ą k|aud|aug|o k|dam|avo|mų |nių|ų t|yve|ven|nac|kla|tat|neg|ega|als|i a|s j|oje|iki|omi|san|oga|io |uti|sau|tau| to|sva|ška|ito|mon|s g|ieš|tar|ia | ši|ios| as|kin|int|ją |usi|min|ver|r j|vę |o p|kim|r k|tim|tu | da| ji|o a|o t|tym|ymo|o n|aty|am |nt |kal|ati|ome|nuo|iai|lst| ve|elg|ava|ų s| ni|nie|eka|svę|lie|ygi|kio| ša|šal|alt|jam|oja|oma|gri| gy|ats|ter|tos|s š|e t|eny|ėmi|tok|kių|ran|paž|ing|avi|uom|ndi|amo|ų n|ksl|ipa|s d|nam| vy|yti|irt|a į|to |kas|nė |ies",
    "umb": "kwe|oku| ok|a o|nda| kw| om|da |e o|wen|a k|la |ko | ly|end|ka |nu |o l|oko|mun|omu|unu|kwa|wa | ko|a v|o y|omo|mok|ali| vy|eka|olo|i o|osi| yo|okw|si |mwe|lyo|we |o k|iwa|lo |i k|le |te |a e|ete|gi |sok|iso|ong|kut| ya|ang|vo |wet|a y|o o|ata| ey|ofe|fek|yok|ela|kuk| wo|owi|ilo|a l|oka|iñg|kul|nga| va|vyo|u e|ñgi|uli|kal|li |ta |u o|wat|eci|ngi|ye |so |ovo|yo |oci|wiñ|ing|ga | li| nd|nde|ala|ili|eye|ci |nge|kol|lon|e k|a a|isa|lom|vya|ako|ovi|avo|uka|go |pan| ol|akw|lya|yal|ngo|olw|o v|ti |ung|alo|uti|a u| ku|ge |eli|imw|i v|ati|wal|onj| al|ale|lis|sa |e l| ov|and| yi|yos|ukw|ele|lil|ika|val|ahe|he | oc|ikw|iha|omb|lin|lim|yov|aka|kok|apo| ye|yom|wav| vo| ka|i l|lik|vak|kov|tiw|ole|yow|yol|ama| ke|yi |cih|i w|o e|lof| ek|e y|a c| lo|su |aso|omw|e v|lwa|vik|ila|lyu|tav|ava|ñgo|upa| el| ce|ekw| on|tis|po | es|eso|iyo|wam| wa|ave|co | ak| la|e e|va |gis|gol|wil|yam|kup|nja|kwi|i y|epa|yav|tat|dec|upi|asi|kiy|yah|i a|eko|i c| ec|kan|lit|ita|lwi|e u|a n|asu|u c|win| yu|a w|lye|vel|lap|vos|lel|u y| os|ola|emb| ca|mak| ci|cit| uk|ayi| ha|kas| ow|yon|yim|tya|eyo|esu|has|wi |mat| of|iti| et|ya |usu|cel|ca |o w|ulu|sil|wom|o a|umb|anj|uva|ngu|o c| co|liw|vi |yuk|u l|mbo|kat|jan|ima|pis|yes",
    "tsn": " le|le |go | mo| ts|ng | go|lo | bo|we |ya | di|gwe| ya|ong|sa |ngw|olo|elo|a b|tsa|tsh| e |tlh|a l|o t|e t|a g|e m|wa |a t|o y|eng|na |e l| kg|wan|kgo|o n|tse|mo |a k| tl|ets| ba|ane|mon|dit|ele|shw|hwa|la |ka |a m|nel| na| ka|o l|e d| o |ba |o m|se |e g|e e|bot| a |a d| ga|di |ots|tla|otl| se|lol|o b|tho|so |o g|lho|tso|ang|got|e b|ga |lel|seg|o e|its|ho |gol|ose|e o|let|oth|ego|lha|hab|aba|e k|ano|a n| nn|los|eka| ma|g l|tšh|šha|alo|ela|ola|lhe|kan|aka|gat|sen|tsw| nt|mol|kga|o a|o o|o k|nng|atl|aga|o s|bat|tlo|yo |edi|g y|len|agi|e y| th|mel|to |a a| ja|e n|tir|dik|g m|lek|ana|bon|kwa|g k|gag|ire|rel|e s|mot|o d| yo|swe|i l|agw|he | te|a s|ats|i k|any|iwa|lao|itš|no |mai|ona|a e|ikg|ntl| sa|ale|she|shi| wa|tle|ao |hel|g t|lon|lwa|dir|log|ume|hir|iti| jw|jwa|itl|non|pe |set|a y|odi|hok|ira| ti|ath|e j|ko |hol|ala|a p| mm|gi |tet|bod|mog|tek|han| me|etl|g g|nya|re |the|lan|thu|hot|i b|adi| lo|oag| ko|nag|nna|i t|wen|gor|ore|nts|jal|ope|nyo|tha|oko|ogo|elw|gan|me |hut|o i| it|tum|wel|ing|nan|ame|amo|emo| ne|okg|pol|iro|ro |isi|lat|ile| ph| kw|heo|oga|diw|bo |o j| ke|ke |o f|are|gon|si |jaa|opa|pa |rag|gis| op|ate|rwa|din| fa|fa |ato|eo |mme|uto|okw|atš|bok|a f|nye|lot|kar|ago|mok",
    "vec": " de|de | ła|ła | e |ion| el|el |ar |sio|on |e ł|to | co| in|o d| pa|par|rit|łe | i |tà |e i|eri|a ł|der|a d|ga |asi| a | ga|ti |un |e d|a e|a s|con|te |he |ent|n e|ito|a p| on|onj|int| ch| re|nte|’l |che| pr| da|l d|e e| só|só |n c|na |e c|i d| łe|da |ałe|e a|o a|men| na|l g|art|sar|bar|ità|e o|nju|jun|e p|o e|sa |pro|i i|ta | o | łi|dar| se|i e|nas|e n|ens|ona|rà | l’|e’l|a c|ałi|ze | so|osi| ès|èsa|sta|tar|nji|e s|à d| po|łib|iba|nsa|nał|ars|rtà|arà|ame|se |n d|iti|sia|esi|man|nsi|ara|rso|i s|i p|nto|nta|a n|ond|tut|łi | ’s|’st|eze| un|ji |ro |res|à c| tu|ist|a i|e l|sie|ras|so |ita|nda|a g|isi| si|r d|tri|sos|ani|in |e r|o o|a a|io |var|ghe|i c|à p|ien|r ł| ze|sti|ste| ne|nes|tra|l p|sen| st|onp|usi| cu| di| me|nde|uma|ia |ri |dis|esu|sun| ma|ra |r e|ont|ntr|ni |ren|l s|ons| fa|ans|i g|rio|a’l|tes|ari|iał|pie|e f|esp|de’|o c|r i|pre|son|str|nca|ca |à e|anc|uti| um| fo|l m|o s|a r|n o|ver|go |co |o i|o p|est|ida|pen|nti|rim|or |fon|ten|r a| a’|i o|e m|ndo|n p|imi|l r|spe| al|ego|ega|e ’|à i|des|cla|sid| cr|do |r t|o n|npa|pod| an|re |l’i|dam|e t|ełi|ant|eso| vi|com|dez|ó d|eto|ne |età|ort| ca|oda|à è|poł|ina|pan|anj|ja |tro|cos|nse|nio|ind|a v|rte|rot|ote|i m|ó p|łit|o ł|rse|bił",
    "nso": "go | le|le | go|a g|lo |ba | di|ka |o y|ya | ka|ng | ya| ma|a m| mo| tš|elo|etš|a l|e g| bo|o l|a k|a b|na |e t|o t|wa |tok|a t|e m| ga|ang|la | ba| a | se|man|tše|oke|ša |o k|kel|dit|we |tša|tho|ele|o a|o b|a s|o g|a d|gwe|e d|ho |e l|ego|o m| na|tšh| to|šo |še |ga | o |oko|di |let| e |ong|olo| ye|ago|gob|oba| tl|tšw|e b|mo |re |ngw|g l|aba|swa|tšo|šha|hab|ane|tla|ona|o n|ela|ito| kg|ogo| th|oth|wan|eo |kgo|lok| sw|e k|ye |log|a n|ola|o d|g o|set|e s|se |hlo|kol|lel|eng|ao | wa|šwa|o s|eth| ts|mol|net|a y|ano| bj|o e|hut| ke|thu|šwe|ge |leg|itš| ge|ohl|to |ire|rel|nag|e e|ke |mog|kan|alo|eba|gag|a a|o w|bot|aka|are|pha|mot|aga|mok|gor|ore|ko |bat|ana| yo|gon|bon|agw|lwa|oka|no | wo|e r|tse|yo |šeg| ph|e y|din|bja| re|seb| sa|sa |ath|iti|utš|kge|get|odi|mel|nya|lao| me|wag|oph|wo |lat|ala| la|ato|edi|i g|a p|hir|o f|pol|phe|kar|ušo|šom|o o|g y| du| fi|tle|ume|ale|gwa|bo |the|wel|ile|bop|hel|emo|lek|eka|o š|atš|ta |pel|šhi|lon|elw|god|išo|tlh| lo|mae|aem|a w| ko|ban| mm|dir|lwe|weg|yeo|rwa|e n|gam|amm|mmo|i s|ntl|i l|hle|hla|len|ing| am|gel|ret|šon|kop|opa|pan|boi|jo |leb|i b|e a|kwa|mal|a f|boh|dum|uto|ahl|okg|kga|mon|adi|lef|ase|sen|ja |amo|oge|ape|tsh|oik|ika|bjo| nn|dik| nt|a e",
    "ban": "ng |an |ang| sa|ing|san| ma| pa|ane|rin|ne |ak | ha|hak| ka|n s| ri| ke|nga| ng|man|in |lan|a s|ara| ja|ma |n p|n k| pe|g s|g p|pun|asa|uwe|gan|n m|nin|sal|pan| la|iri|alu|sa |jan|lui|adu|a m|adi|ra |uir|kan|mad|wan|yan|g j|duw|tan|ur |we | tu|anm|nma|ika|awi|tur|ah |nge|ka |ban|ih |e h| ne|n n|un |nte|en |ngs|eng|anu|ani|ian|a p|ana|aya|beb|nan|ala|gsa|uta|bas|ngg| da|aka|da |gar|apa|eba|aha|asi| wa|ama|ten|lih|a n| ta|are| ut|ebe|han| wi|aje|aki|ent|ata|keb|oni|uni|nik|g n|wia|iad|aan|k h|saj|jer|ero|ron| pu|din|nus|a t|sak|pen| pi|dan|n w|ngk| ba|usa|e p|sam|i m|ant|ate|nen|n r|taw|wi |pat|e s|ami|iwa|ipu|neg|ega|atu|ina|mar|g k|kin|ran|sar|kal|aga|kat|arg|ndi|g r|tat|per|al |nya|ren|ksa|e m|ar |h p|ida|ntu|ado|ngu|ela|aks|wen|i k|ep |oli| se|at |gka|n l|dad|dos| ny|lak|h s|ena|n h|ali|upa|era|a k| sw|swa|ewa|rep| in|eka|nay|par|ung|eda|uku|eh |k p|a u|ras|e k|n t|nip|i n| mu|r p|um |dik|ayo|mi |mal|g m|nda|osa|pak| mi|wah|eri|n b|os |r n|n i| hu|huk|kum|na |ut |rga| su|k r|teh|h m| me|pin|tah|yom|sia|gi |ewe|lar|tuk|sti|ti |g h|car|n d|ari|awe|war|kew|tut|a w|r m|ira|end|uan|gay|ada|min|ta |gen|g t|a b|pag|ngi|n u|lah|on |h r|gaw|mak|e n|mba|pa |uka|ngd|gda|as |eta|sio|rap| an",
    "bug": "na |eng|ng | na| ri|ang|nge|nna|ngn|gng|ge |sen|a r| ma| pa| si| ha| ta|hak|ri |app|tau|a t|au |ddi|ak |ase|edd|a n|ale|nap|gen|len|ass|e n|pa |ai |ria|ega| ru|enn|upa|rup|ias|a a|inn|ing|a s|pun|ngi|nin|e p|ini|ga |nai|gi |lal|sin|are|ppu|ae | ye|ye |ana|sed|g n|ada|le |g r|a p|ama|i h| as|man| se|i r|una|ara|ra |di |pad|a m|ren|ssa|ban|ila|asa|e r| ke|ura|din|e a|san| la|ane| de|nas|e s|i a|ipa|ann|u n|pan|aji|ala|i l| ad|da | e |att|ole| pu|i s|pur|ong| ba|i p|lai|aga|lan|g a|ngs|gsa|g s|sal|ola|ppa|rip|a b|i n| we|asi|g m|a k|akk|mas|u r|i m|ril|wed| po| ar|reg|pas|sse|ung|g p| pe| ne|neg|gar|e m|k h|pol|ian|nar| te|map|ett|ena|ran| ja|jam|beb|eba|bas|unn|par|ttu|add|ain|aka|sib| mo|ngk| sa| al|keb|ebe|uru|gan| at|nen|iba|sa |i t|gka|kan|bbi|atu|nan|ata|uan|ton|de |e d|leb|rus|kun| wa|ell|k r|cen|ro |uwe|tu |mak|awa|wa |ssi|gag|e y|ebb|ire|tte|ta |a d|ece| to| ia| tu|sim|sae|mat|apa|o r|nat| hu|ma |nca|caj|pak|rel|dec|bol|lu |g t|la |ko | di|kel|ie |tur|huk|uku|ure|tta|e e|arg|rga|jaj|llu|kol|oe |ele|we |dan|rit|e h|kko|baw|deg|ter|bir|iti|sil|mul|ula|anc|ade|nga|lin|an |auw|pat|ari|ka |ekk|elo|iga|gau|u p|e w|a h|g y|use| me|aja|pen|ji |a y|sik|iko|per|dde|nre|anr|ten|a w|rek",
    "knc": " a |ro |be |nzə|ye |a a| ha| kə|abe| ka|akk|zə |adə|a n|a k|kki|hak|mbe| la| ad|ndu| nd|wa |ben|də |ma |en | ya|o a|ga |ə a|əbe|e a|əga|kin|inz|aye|əna|lar|lan|aro|rdə|yay|ard|ana| ga|əla|ji |kəl| mb|awa|bej|eji|kən|an | ba|du |uro| ku|anz| na|kal|nəm|e m| nə|dəg| sh|shi|na | du|amb|gan|n k|ara| su|so |wo |u y| ta|a d|kam|e h| sa|a s| ye|aso| au|au |sur|kur| da|a l|iwa|nyi| as|kar|dəb|e s|ada|iya|o k|ama|obe|kiw|u a|and|ta |n n|ima|aa |la |əgə| nz| ci|tə |əwa|ata|ba | ab|ənd|ndo|ya |nga| fa|ə n|ndi|in |a g|nza|nam|uru|ru |aya|ə k|təg|a b|am | fu|a t|inb|tən|nab|mga|al |ə s|baa|dəw|dun|ida|aar|e k|a h|awo|e n|dam| sə|o h|a y|gən|əra|taw|kat|gad|ade|o w|owu|nya|asa|ala|amg| wa|əmk|a f|dən| wo|i a| tə|iga|əli|zəg|o n|uny|zən|awu|wu |e l|din|za |i k|uwu|n a|wan|san|utu|on |wur|o s|u k|gay|tam|mka|de |da |nba| ng|yi |bem|ibe|gai|azə|gin|rad|adi|fut|taa|laa|u s| aw|liw|kun|i n|cid|aim|əgi| mə|mər| an|wak|yab|ali|wow|o t|nad|ayi|yir|alk|lka|mma|nan|zəb|tu |bed|edə|n y|ela|gal|uwo| yi|wum|dar|ndə|apt|do |any|rta|atə|n d|no | um|umm|uma|ema|iro|wal|a i| il|ilm|lmu|o g|ltə|bel|alw|zəl|iwo|m a|ə h|fuw|enz|ang| ho|how|e g|utə|raj|a m|kka|ən |ero|tin|mar| ny|o f|əny|bes|eso| ay|yaw|oso|dum|ebe",
    "kng": " ya|na |ya |a k| na|a y|a m| ku|a n|a b|u y| ba|and|ka | mu|yin|wan|tu |aka| lu| mp|ve | yi|la |ntu| ki|mpe|pe |nda|a l|si |yan|ana| ke|so |e n|ons|ndi|di |nso|da |i y|u n|lu |mun|alu|unt|ina|e y|nza|ala|luv| ma|uve|u m|ke |za |sal|ayi|o m|ndu|ban|ta |isa|ulu|kan|i m|amb|ma |fwa|u k|kim| ny|nyo|yon|du |ti |anz|ang|ama|i n|kus|o y| me|to |ins|nsi|wa |usa|i k| ko|kon|a d|uta| mo|end| bi|uka|sa | ve|mos|mbu|ika|mu |osi|uti|kuz|a v|e k|imp|und|e m|ind| fw|mpw|pwa|ila| to|ngu|bal|kuk|vwa|tin| sa|sam|mab|sik|len|adi|mba|ba | di|yay|yi |a t|mut|ant| ka|isi|kis| le|ata|olo|ula|lo |amu|o n| bu| at|su |dya|bu | nz| nt|usu|kut|ngi|abu|but|ni |dil|bak|e l|kul|e b|inz|nga|gu |lak|lus|awu|wu | ti| dy|imv|kat|bun|bay|i b|kak|utu|tal|ngo|o k| ng|esa|baw|nak|uzi|kin|iku|uza|bim|mvu|dik|mpa|ken|umu|nu |nta|dis|u f|sad|yak|ati|luz|tan|vuk|ank|nka|luk|ong|mak|ani|i l| mb|aba|ing|bis|kuv|ga |zwa|idi|zit|luy|uya|yal|ku |lwa|fun|nsa|swa|ufu|aku|uvw|uzw|mef| nk|iti|ibu|lam|kub| ni| ns|ela|uko|ndo|don|kol|uku|iki|atu|tuk|eng|i a|bam|fum|a s|twa|a a|mus|usi|u t|kun|met|eta|pam|luf|i t|i s|mvw|oko| nd| mf|mfu|nzi|uso|ola|anu|u b|uke|gid|kam|mbi|ilw|dus|sul|zo |tis|te |dib|bum|umb|gi |yam|ded|kot|lut|zin|zol",
    "ibb": " nd|ke | mm|me | ke|e u|ndi|o e| em|mme|de |en |e n|owo| en| ow|wo |i e|mi |ye |emi|nye| un|e e|edi|ene| ek|eny|yen| ed|e m|nen|une|ana|n e|e o|e i| ye| uk|et |n n|eke|na |e k| mb|em |ne | id| es|kpu|un |ede|iet|ndo|o k| nk|di |ukp|kpo|did|kie|an |nam|am |esi|kem| nt|o u|o n|idu|eme|t e|yun|no |mo | uf|ho |nyu|mmo| in|o m|o o|kpe|sie|oho|ie |ono| kp|do |din|kpa|m e|ri |nkp|on |dib|uke|e a|a k| ki| et|po |boh|ida|dut|m u|ked|ded|pur|uru|ru | of|ond|ut | ub|in |a u|du |eko|ina|iny|mbe|bet|man|n o| ot| ak|i o|ikp|idi|op |om |edu|kon|ade| us|puk| uw|uwe|wem|uan|a m|a n|oro|ro |ode|ak |a e|u o|n k|t m|akp|pan|te |ufo|ok |bo |dik|to |ini|ide|bio|i m|mbo|ofu|fur|uri|ban|ubo|n i|ema|iso|uto|o i|dom|omo|ni |fen| is|diy|m m| ny|n m|pem|tom|u u|dis|eto|usu|fin| nw|ed |dud| ik| as|nte|ibo| eb| ob|mde|ara| ut|o a|sua|i n|mok|oki|oto|m n|nwe|wed|nwa| an|m k| on|o y|kar|i u|t k|asa| or|pon|io |uka|i k|ama|nek|re |top|n y|ufi|se |k n|e y|ion|aha|t o|sun| mi|ere|a a| ef|i a|kor|ra |ian|mad|isu|mba|ka |k m| ey|ena|uk |ha |ko |obi|da |ti |dia|t i|aba| se|a o|dem|san|pa |u m| ab|tod|d e|ude|efe|fok|k u|p m|n u|he | od|pe |a y|nto|eye|son|nde|uku|dak|nti|nka|ibi|ebi|bie|ndu|anw|nda|tu |dit|so |mbu|dah",
    "lug": "a o| ok| mu|oku|mu |wa |nga| ob|ga |tu |ntu|a e|na |bwa|a a|ang|ra |aba| n |ba |a n|wan|a m| ng| ab|li |a k|obu|unt|era|ibw|a b|u n|oba|za |dde|la |mun|ali|ban|ka |emb|iri|bul|i m|ate|tee| ek|mbe| bu|uli|eek|u a|sa |edd| ku|ana|ant|eki|u b|be |n o|ama| eb|dem| om|omu|ira|e o|ye |amu|ala| am| ed| ki|gwa|nna| er|kuk|y o|kwa|eer| en|okw| ly|inz| ba|ula|kus|u e|kir| em|any| ky|eri| ye| wa|onn|uyi|n e|yo |awa|ina|bwe|eka| bw|ggw|kol|u k|usa|o o|ola|o e|kwe|bir|yin|u m|mus|e m|bal|i e|riz|ngi|ekw|nza|ebi|kub|kul|aga|ri | eg|ere|a l|we |e e|ko |kut|mat|a y|u o|e l|sin|aan|uso|nka|kan|ger|gir|no | at|gan|zes|a g|wo |isa|uku|ya |izi|zib|nge|egg|nyi|iza|i o|eby|ufu|lin|oze|esa|ako| ma|ebw|a w|wam|bon|wal|bee|eta|iko|rir|e b|yen|kug|de |tuu|zi |obo|uki|aka|ulu| te|kin|ino|e n|asa|kuy|taa|utu|imu|o n|y e|una|nsi|i y|o b|sob|ne |lye|enk|ma |gi |ku |si |lwa|ly | ol|wat|ata|usi|rwa|ing| by|uga|san|e k|nya| ag|uka|wen|kik|bun|o k| aw|umu|yam|kye|ubi|bye|sib|kis|by | al|boz|ani|muk|uko|awo|ngo|kit|uma| bo|i n|ong|ewa|ibi|ky |kyo|buy|eky|mbi|afu|ini|ni |add|i k|mag|ole|maw|ens|o a|gat|saa|lal|enn| og|kuu|uum|ung|kib|y a|tab|olw|end|and|ro |tal|w e|ulw|a t| gw|o g|mul|emu|n a|amb| ey|umb|aso|u g|wee",
    "ace": "ng |an |eun|ang| ha|peu|oe |ak |on |nya| ny|yan|ngo| ta|ung|gon|na |ah | pe|reu| ba| ng| ke|hak|meu|keu| me|eut|at |ure| na|ban| di|ee |teu|roe|ata| ur|ara| be|seu|han|a h| sa|am |dro|eur|um |tie|iep|n n| ma|nan| la|g n|ala|ut |a n|ong|ep | te|tan|tap| ti|jeu|eul|eug|eub|eu |eh |eum|euk| da|n p|ih |uga|ra |a t|n b|ai |e n| se|beb|eba|lam|om | ka|n t| at|awa|asa|a b|and|oh |eus|nyo|ka |ta |man|ana|p u|n d|e t|n k|h t|n h| pi|ape|dan|a s|neu|bah|ula|nda| si|yoe|t n| le|dum|e b|eng|e p|g d|sia|euh|ngs|h n|a k| pa|ndu| wa|g k|una|un |ran|lan|ma | ra|aba|n a|ia |n m|heu|ura|sa |a p|g s|lah|nga|asi|bak|und|kat| je| bu|wa | dr|k n|anj|beu|ek |k m|a m|ama|sya|yar|hai|ok |k a|k t|uny|aan|uta|di |h p|khe|g h|har|ue |aka|i n|uka|ari|sab|g p|a l|e d|uko| su|kan| li|gan|ya |t t| um|gsa|san|e s|e u|kom|ot |ina|ngg|aro|leu|ate|pat|uma|lee|n s|lak|n u|mas|oih|h d| ne|taw|bat|yat|nje|anu|soe|sid|t b|usi|ila| ja|et |aga|dek|aya|uh |aja|h m|n l|en |umu|rat|ute|si |m p|taa|sal|nus|idr| ji|dar|any|tam| as|gam|dip|lin|don|h b|adi|rak|ika|usa|a d|ube| hu|huk|g b|h h|ngk|ame|m n|bue|eka|gah|upa|ile|h s| in|‐ti|t h|mum| de| bi|sam|n j|euj|gar|eup|k h|pho|dil| ge|geu|tha|m b|hat|ieh|ant|ahe|h l|use|ie |ino",
    "bam": " ka|ni |a k|ka |an | ni|kan| bɛ|n k| la|i k|ya |la |na |ɔgɔ| ye|ye |bɛɛ|ɛɛ |li |sir|en |ɛ k|ama| ma|ira|a d|ali|ra |’a | da|man|a b|a n| i |ma | kɛ|mɔg|gɔ | wa|wal|ana|n n| ba| ja| mi|ɔrɔ| kɔ| mɔ| k’| si| jo|iya|dan|min|len|ko |’i | sa|aw |kɔn|i m|in |den| n’| o |ara|bɛ |i n|jam| na|ɛrɛ|ɔnɔ|a s|ani|i j|i d|a m|n b| fɛ|a l| an| tɛ|a y|kɛ |jos|osi| di|iri|ɛ b| ko| de|i t|ari|ila|nɔ | fa|tɛ |ɛ m| ha|ada|asi|ɛ s|a f|raw|a t|a j|ale|a i|aya|ɲa |i b|sar|riy|si |ɛn |tig|n y|dam|o j|ɔn |rɔ |ang|e k|a w|inn|nu |k’i|w n|nti|ade|nɲa|nnu|kal|ala|a a| a |i s|abi|bil|igɛ|had|mad|hɔr|i f|aba|olo|ɛ n|baa|aar|o b|a ɲ|ɛ j|aga|u k|kab|n’a|ɔ k| ta| hɔ| ti|ugu| se|ati|diɲ|ɔ m|k’a| cɛ|a h|rɛ |kun|n j|iɲɛ|lan| ɲɔ|ɲɔg|don|ɲɛ |bɔ | tɔ|i l|tɔn|ile|ga |inɛ|nɛ |i h|i y|ri |da |ɔ b|u b|gɔn|ili|lak|aka|nw |ɛ l|e m|maa|aay|o k| fo|go |nna|fɛn|n d|ant|n i| jɛ|un |rɔn|ɔnɲ|nin|fɛ |anb|o l|on |n’i|cɛ |nen|igi|ɛ t|ɔ s|w k|yɔr|n o|o f|nga|jo |o m| ku|ɲɛn|nka|’u |ɛmɛ|mɛn|e b|e f|ti |i ɲ|dil|ago| bɔ|nma|ɔ n|aju|n f| fi|ɛ d| sɔ| ɲɛ|n m|afa|a o|fan|ɛ y|uya| d’|d’a| ɲa|iir|gu |wol|lom|oma| du|n w| do|kar|n t|so |gɛ |e d| fu|fur|uru|bal|bag| u |amu|nni|w l|bɛn|riw|iwa| b’|ɛɛr|iim|imɛ|mɛ |be |atɔ|til| jɔ|n s|’o |taa|ɲan|ank",
    "tzm": "en |an | ye| d | n |ur |ad | ad|n i| s |agh|ḥe|n t| i |dan| ta| lh|lḥ|d y| gh|ell|ra |n a|i t|̣eq|s l|ett|eqq|mda|d t|n d|akk|la | ti|qq |hur| am| di|di |ghu|gh |r s|t i| is|in | na|nag|is |a y| te|yet|n g|ll |n n|a d|ara|ma |ghe| we|l a|n s| ar| wa|n l|it |sen| ak|edd| le|li |dd |ull|d a|kul| ur|erf|rfa|lla| id| ku| yi|as | se|amd|lli|men|a n| ma|zer|lel| im|a t|nt |t t|t a|fan|kkw|kw |a i| de|q a|rt |ar |n w|i d|eg |es |gar| ag|emd|ize| tl|lan|i l| as|ken|a a|d i|n u| dd|i w|deg|at |tta| tu|d u|er | tm|wem|wak|t n|sse|r a|n y|mur|ddu|w d|tle|tam|s t|yes|r i|wan| tt|gi |nen|na |tim|wen|kke|d l|wa |ttu|twa|ent|ame|a l|iḥ|s d|hel| u |win|ḍe|d n|hed| iz|ess|t d|mi |der|mga|arw|mad|agi|i n|i g|ḥu|s n|ane|ya |sef|msa|n m|iya|urt|uḥ|h d|un |rwa|s y|awa|̣en|em |i i|udd|idd|man| la|el |siy|lsa|mma|g w| ik|leq|qan|tag|ant|ili|i u| in|yen|tmu|len|err|q i|den|yed|r y|al |imi| ne|t l| lâ|til|asi|ef |ddi|tte|hla|l n|u a|ala| lq|iḍ|am |taw|aw | ya|wad|ṣe|̣er|ttw|edm|̣ud|dda| ss|tem|eln|lna|m a|ila|ert|tal|all|lt |ikh|̣ṛ|ray| il|chu| ll|tes|gha|i a|ana|way|med|gra|ghl|ni |nes|s k|lqa|anu|nun|awi|naw|duk|ukl|ren|khe| kr|kra|net|dde|eḥ|hul| an|r d|ezm|wer|eṛ|ṛr|yem|saw|aya|efk|k a| us",
    "kmb": "a k| ku|ya |la |ala| mu| ki|a m| o |u k|ni |o k| ni|kal| ky|mu | ya|lu |dya| dy|a o|ang|kya|a n|tok|i k|oso|so |kwa|nge|xi |na |nga|elu| kw| wa|wa |hu |a d|thu|kut|oka|uka|mut| ka|mba|a i|uth|ka |gel|ba |u m|u y|ku |kuk|ga |u n|ene|ixi|ban|wal|e k|i m|oke|kik| mb|kel|u w|ne |uto|ela|i y|ana| ng|iji|a y|ma | ji|kit|nda|ngu|ji |ulu|yos|kum|isa|and|und|i d| it|ong| mw| di|ika|wen|u i|iba|ila|ilu|sa |ye |ndu|kub|ten|ngo|a w|kil|ung|amb|aka|ena|olo|muk|sok|du |mox|oxi|lo |ke |o w|kus|ate|alu| wo|e m|gu |wat|u d|ita|ta | ph|ito|luk|wos|o m|kis|uma|a j|tun|a a|di |san|mwe|idi|e o|gan|uku|kul|nji|kye|kij|ula|wan|jix|i j|kan|imo|a t| ix|da | yo|o n|o i|ato|uta|kud| ja|adi|nu |u u|i n|lun|a u|tal|su |udi|ki |e y| ye|jin|we |go |a s|ikw|tes|wij|iki|itu|pha|hal|lak|fol|ing|yat|ele|kwe|o y|utu|kwi|eng|kyo|uba| uf| ke|yen| we|i o|yan| en|dal|kib|ite|ge |kat|atu|i w|vwa|esa|lel|ini|ute|kam|ja |lon| ik| se|uke|esu|jya|xil|eny|e n|dib|uki| im|i u|tan| ut|ukw|nen| a |uso|fun|u p|unj|u o|mun|mbo|i i|kim|ufo| ko|gon|han|ata|umu| il|o d|lan|i a| at|o a|nde|eka|jil|te |nyo|dit|tu |dis| un|tul|ilo|u j|ufu|usa| ib|ijy|exi|ote|ivw|kuz| ha|kos| os|ubu|bul|ama|se |mwi|sak| to|win|axi|lul| uk|imb| so|oko| tu",
    "lun": "la | mu|ng | ku|a k|tu |ntu|chi| ch|a n|aku|mun|di |ma |unt|a m|g a| a | na|ela|ndi| we|aka|ima|jim|shi|eji|u w|i k|ind| ni|i m|a w|wu |a i| in|hi |u m|awu|na |kul|wej|lon|cha| ja|sha| kw|a c|ala|nak|i n|mu |wa |kum|ing|ka |ung|ulo|him|mbi|a h|muk|u c| wa|iku|hak|yi | ha|nsh|bi |amu|wen|ewa|imb|kwa|ang|adi|kut|g o|ana|esh|idi|u j|ha |tun|ila|nik|ong|tel|kuk|han|u n| an| ov|ovu|vu |ate|kwi|kal|jak|a a|ula|u a|u k|ham|ilu| ya| he|a y|ond|uch|and|kus|eka|hel|nde|del|kew|hin|enk|zat|i j|uku|nke|uka|ach|lu |mon|ona|i a|nji|awa|nat|eng|udi|umo|ama|ins|a d|wak|i h| yi|ata|ta |ich|i c|uma|ina|ayi| ak|bul|ati|wan|mwi|itu|i y|nyi|sak|naw|nin|kin|wun|kuz|uza|ku | mw|u y|kud|mul|wal|muc|ni |ant|waw|ish|wes|uke|kad| di|uta|ika|da |i i|yan|kam|uki|akw|wit|ken|yid|mbu|ahi|eni| ko|nda|hik|iya|iha|dil|imu|ya |kuy|ule| ns|dik|kuh|kos|osi|si |atw|umu|li |any|his|kun|hih|dim|ush|ji |g e| ye|ja | ne|ney|eyi|wat|etu|amb|u h|twe|mwe|ash|tiy|nu |til|wil|kwe|nan|nga| wu|din|haw|tam|iwa|wah|g i|hu | ka|hid| ma|was|hit|iti|kay|yin|win|lem|jaw|iki|isa|jil|ubu|omp|mpe|che|wik|jin|mpi|eta|tan|hiw|usa|inj|nam|umb|eme| da| hi|ulu|ga |u e|dis| om|omw|hen|end|mba| ji|tal|kuc|pin| i |dic|emb| at|ale|ahu|iyi|lan| ny",
    "war": "an |ga |nga| ka| ng| pa| ha|han|pag| hi|in |ata|mga| an| mg| ma|kat|hin|a m|ay |ya |a p|a k|ung|gan|on |n h|n n|ug |n p|n k| ug|n m|da |a h|iya|ha |n i|adu|dun|tad|a n|sa |ada| ta| iy|ara| na| di|pan| o |may|a t|ud |ang|ana|n a|o h|ags|taw|o n|n u|y k|al |kad|yon|tag|asa|o p| ba|man|awo|gsa|wo |ag |a i|a a|a u|ina|syo| in|gad|od |a s|agp|ing|ala|ngo|nas|ali|asy|n b|ra |gpa|agt|g a|aha|aka|g h|was|san|a d|usa|n t|tun|ng |to |ad |iri|tan|nal| tu|kan|ahi| wa|war|ray|ini|dir|i h|ri | us|god|a b|nan|g p|gka|bal|o a|y h|i n|ida|kas|uga|hat|tal|pin|awa|nah|ni |buh|uha|bah| pi|aba|gud|o m| bu|g m|at |no |agi|d h|agk|atu|mo |d a|him|aya|ili| su|alw|lwa|kal|sya|uma|int|ano| ko|a o|hiy|l n|as |asu|sud|mag|ona|n d|iba| ki|lin|upa|o u|yo |agb| bi|did|g i|kon|pam|ho |n o|gin|uro|ira|d m|o k|os |amo| la|la |gtu|gba|ton|g k|hi |aag|gi | ig|gar|ami|tra|aho| sa|n g| ir| gu|aud|par|kau|ban|ati|ern|t h|abu|api|adt|dto|agu|mil|ama|it |ka |aga|aso|sal|rab|d n|lip|ika|mah|lau|tum|kin|non|dad|yan|tik|iko|ko |ak |rin| un|ras|a g|ila|i m|naa|y b| ag|n e|lig|s h|ro |sug| so|yal|nte|ihi|tub|bay| ti|una|lal|ba |lan|kah|aup|pak|n w|g n|mak|na |sam|oha|upo|pod|d i|gta|kaa|sak|ito|gat|d u|isi|nab|ani|duk|uka|nak",
    "dyu": "a’ | kà| ká|kà | ye|ye | à |ni |ya’| bɛ|kán|án |la |ya |ɔgɔ| la| ni|ɛɛ |ká |na |a k|bɛɛ| mɔ|mɔg| i |á k|n k|nya|ɔrɔ|’ k| mí| kɛ|’ l|mín|’ y|ín | mà|ɛ k|à k|’ m| ya|ma |à m| ní| jà| wá| be|be | ò |i y|ní |i’ |ra | lá|n n|iya|ɛrɛ|n’ | kɔ| há|te |àma|wál|a b| te|jàm|áli|à à|man|ima|mà |e k|ɔnɔ| kó|lim|hák|ɛn |n b|i k|ɔ’ |ana|gɔ |n y|e b|o’ | sà|’ n|kɛ |’ s|à l|ɛ y|rɔ |e à|àni|li’|a m|kɔn| dí|rɛ |aw |à b| bá|ɔ k|’ b|a à|e s|riy|gbɛ|nɔ |ákɛ|bɛn| ù | sɔ|a j| bɔ|kó |ara|à y|sàr| sí| fà|e m|à s| fɛ|en | sì| àn| là| dú|dún|úny|a n|an’|kɛr|a y|ɛya|àri| gb|in |n m| mì|mìn|ìna|ɔn |dí | ɲá|sɔr| cɛ|ali|na’|lá |gɔ’|à d| tá| yɛ|yɛr|’ t|e w|yaw|kan|nin|ama|gɔn|báa|i m|sìg|ìgi| tɔ|yɔr|nga| dà|w n|i à|áar|á d|ána|ɛ l|ɛra|ólo|i b|len|a d|à i|si |a h|a s|ɔ s|àng| sé|bɛr|bɔ |ra’|àra|den|’ f|à t|aya|’ d|u’ | ó | má|ɛ’ |gɔy|ɔya|a f| dɔ|kɛy|ógo|ɔny|ɔɔn| se|se |a t|ina|dén|kàl|lan|ili| a |ko |ma’| có|cóg|sí |ika| hɔ|hɔr|ɛɛɛ|n d| í |nna|i t|ɛ m|àla|i s|fɛn|li |’à |n s|ɔ à|e i|tá |e n|ga |an |a g|ò k|à n|a w|ànt|tig|rɔn| yé|yé |áki|i f|ò b|ati|ti |so’| dò|í i| na|rɔ’| lɔ|í à|e ò|kél| k’|k’à|ɔ b|w l|i n|e’ |go |í t| nà|min|dàn|igɛ|lik|kil|èn | wó|ò l|í y|gi |ɔ m|may| fú|fúr|úru|mad|’ h|díi|íin|dòn|òn |ɲán|ow ",
    "wol": " ci|ci | sa|am |sañ|añ | na| ak|ak |lu |it | mb| am|aa |na |ñu |al |ñ s|ne |te |mu | ne|pp | ko|m n| ku|i a| ñu| te| mu|ko |u n|u a|baa|mba|e a|a s|ay | wa| lu| do|ar | ni|oo |u m|épp|nit| ta|oom|t k|gu |ku |i b|u k| it|u y| ré|rée|éew|kk | aa|xal|i d| bu|doo|i w|u c| yi| bi|aay|war| xa|llu|loo| li| xe|fee|u j|ama| di| ya|yu |yi |on |taa|eex| bo| wà|wàl|àll| yo|xee|ew |boo|o c|en |mi |yoo|ir |nn | gu| më|mën|ul | du| so|dam|e m|een|u d|oon|oot|bu |okk|a a|i n|ara|eet|i m| ba|ata|uy |dun|und|enn| nj|aad|ada|aar|ala| ay|m a|r n| lé|ju |nam|axa|taw|ex | pa|k s| jà|di |u l| gi|igg|ral|aju|naa|ana|et |ën |ota|awf|wfe|u t|ma | se| dë| aj|ax |ti | ja| ke|ool|yam|gée|m c|see|i l|a m| yu| ng|ngu|li |bii|mbo| ye|ken|ee |laa|m m| lo|lig|bok| me|om |jaa|i t|p l|an |n w|i s| an|u x| mi|n t|w m| de|jàp|àpp|ekk|ggé|éey|amu|ndi|góo| jë|k c| su|lép|nd |ewa|gi | da|aam|k l|n m|a l|t y|tax|aax|a d|a y|kaa|p n|i j| jo|iir|nda|une|le |n n|o n|jàn|àng|a c|ñoo|i ñ|la |ant|e b|gir|n a|lee|ba |ey |k n|aat|ang|kan|m g|n c|l b|a n|k t|men|kun|omu| mo|opp|du |a b|ddu| së|e n|u w|l x|j a|g m|añu|njà|omi|i c|nee|k i|ali|ñ ñ|m r|are|nte|y d|l a|ok |i k|ngi|nan|aw |em |aan| ti|dox|oxa|a ñ|nek|soo|bir|i r|moo|y c",
    "nds": "en |un |at |n d| da| de| un|een|dat|de |t d|sch|cht| ee| he|n s| wa|n e| vu|vun|ht |rec|ech|er |ten| to|tt | si| re|ver|nne| ge|t w|n w|n h|ett|n v|k u|n u|gen| el|elk|lk |t u|ien|to |ch |wat| ve|sie|war|het| an|it |ner| mi| in|n f|ann|rn | fö|ör |r d| fr|t r|orr|hte| sc|för|ich|rie|eit|den| or|ege|nsc| up|t a|t g| st|rer|aar|fri| is|is |ll |nd |t e|rre|up |rt |chu|se |ins|all|lt |che|t h|n g|oon|on |daa|min|rrn| se| ma|nn |n a|ell|n i|len| na|t s|hei|n m|rd | we|nen|in | sü| bi|e s|ven|doo|ken|sse|e m|aat|ers|ren|lle|e g|n t|hen|t v|ik |kee|s d|arr|n k|ünn|n o|n b|t t|lie| al|heb|ebb|e a| dr|e v|he |ill| wi|men|ard| ok|ok |gel|llt|hn |tsc|cho| ke|sta|ehe|weg|ede|ie |r s|an | gr|ene|sün| do|ieh| dü|düs|üss|erk| dö|t m|raa|und|ats|drö|röf|öff|e f|ig | ün| gl|sik|e w|kt |dör|örc|rch|ahn|gru|ere|ünd|ff |ens|ert|der|st |nre|dee|enn|aal|al |mit|run|nat|hon| so|kan|unw|nwe| ka|ehr|eih|iht|lic|eke|hup|upp|pp |t n| fa|taa| be|e r|as |p s|bbt|bt |t f|e e|maa|nee| wo|el | me|hör|dde|inn|eve|huu|t o|nst|ste|mee|öve|ern| ni|ent|n n|n r|are|iet|iek| as|l d|arb|rbe|bei|na |n ü|r t|eer|utt| eh|hr |ame|uul|ul |ter|e d|t i|ach|lan|ang|pen|nic|one| ar|art|d d|t b|ite| ut|str|d u| ah|sül|a d|et |wen",
    "fuf": " e | ha| ka|de |ndi|al |and|han|he |di | no|nde|no |e d| ma|e n|o h|dyi|dhi|aa | dh|re |yi |dhe| bh|i e|eed| nd|bhe| ne|dho| wo|hi |un |ala|a n| dy|ko |maa|edd|ho |la |ka |gol|ddh|e h|won|kal|e e|ned|ii |taa|ann|e m|ni | le|o k|aad|eyd|ol |haa| ta| fo|ede|ley|nnd| mu|dan|aan|mun|e k|i k| ko|i n|en | sa|ond| fa|dya|e f| he|tta|aar|i m|e b| go|ee |are|gal|het|ett|taw|ndh|ow |ani|o n|nda| hu|ydh|na |tal|sar| fi|e t|dir|i d|e l|ita|bha|fii|faa|ira|a k|a d|adh|nga|naa|ina|aak|oni|ral|riy|iya|yaa|ydi|iid|idy|ana|fow|n n|uud|dyo|i h| wa|laa|ngu|ari| ad|hen|oo |i w|le |dha|dii|akk|ude| ng|in |ke |huu|ady|yan|ree|a e|goo|on |l n|ya |a h|e w|i f|aam|fot|e a|adu|ugo|ama|tan|ank| on|o f|dhu|i t|l e|n f| an|udh|oto|den|e g|der|er |dun|una|e s|ore|to |oot|awe|mak|kko| la|yam|an |l d|l m|o w|nta|dee|nan|waa|oll|a o|bhu|bhi| da|yee|udy|hun|n k|o e|ubh|n m| mo|n e|hin|a b|ant|wee|ere|ta | ho|hoo|ewa|ku |und| o | si|a t|o b| na|mo | ke| fe|n h|tor|oor|i b|awa|aaw| do|att|yng|ota|te |lle|nee|nya| ny|a l|aal|i s|i a|ndu|tin| ya|a m|amu|mu |a w|ake|ri |ire|ott|l l|awt|woo| bo|bon|l h|edy|nke| se| de|rew|a f|iin|oon|mii|lli|ma |ago|dud|l s|gur|ata|tii|int|onn| ku|ell|n d|guu|o a|kku|eyn| re| ti| su|bbh",
    "vmw": "tth|la |thu|a e|na |kha|a m|hu |we |ana| mu|a o|awe|ela|ni |ala|hal|edi| ed|to |ire|dir|eit|ito|ya |a n|rei|a w|mut|wa | wa| ni|akh|aan|u o| on|o y|okh|utt|haa|a a|wak| n’| wi|nla| ok| yo|ari| si| ot| sa|iya|iwa|ka |ne |lap|apo|ale|oth|the| oh|att|le |mul|kun|oha|aka| el|aku|unl|mwa|oni|ha |e s|o s|ott|tha|ele|ett|e m|e n|ene|e o| va| ya|hen|oot|e a|hav|o o|ihi|amu|ihe|iha|eli|ade|de |po |e w| aw|ra | at|hel|dad|wi |i m|lel|moo|ta |i a|e e|ula|o a| en|owa|o n| mo|ota|waw| ak|ina|sa | so|a s|han|anl|itt|aya|var|ri | kh|ara|a i|i o|n’a|her| mw|’we| et|nro|row|ika|i e|lan|nak|sin|elo|vo |lo |thi|a v|oli| ah|eri|a’w|u a|ida|n’e|u e|him|hiy|wan|era|onr|ona|riy|yar|liw|wal|aa |kan|lib|ibe|ber|erd|rda|nna|mih|avi|vih|hiw|hwa|i v|lei| ep|u y|kho|e k|ikh|sik|phe|ko |ntt|hun|una|aha|kel|iwe| an|khw|avo|riw|e y|ia |’el| na| ma|huk|laa|mu |ali|o e|upa|yot|tek|eko| it|wih| es|pon|i s|nid|ila|ath|uku|wel|wir|saa|ulu|lik|a y|i n|nkh|i w|ro |’at|mur|tte|nan|ira|ane|n’h| a |ani|nih|enk|tti|a k|hop|saw|yaw|ahi|uth| nn|ola| eh|ont|som|u s|inn|nnu|nuw|aki|ret|tel|ei |mak| il|kum|iri|ile|aph|ena| oo|ehi|nal|ope|pel|ohi|soo|ute|va |mpa| ek|ma | yi|khu|yok|hik|lih| pi|uwi|lal|kin| v’|ole|uni|nin|har|uma",
    "ewe": "me |ame|e a|le |wo |kpɔ| am|ɖe |ƒe | si| me| wo|be |si | le|sia|esi|la | la|e d| ɖe| kp|aɖe|pɔ |e l| be|e w| ƒe|e e|dzi|na |nye|a a| du|ye | ŋu| na|duk| dz|ukɔ|e s|e n| mɔ|ome| aɖ|kpl|gbe|nya|e b|e m|ple|ɔkp|ɔ a|pɔk|woa|nɔ |ɔ m|evi|kɔ |ŋu |ɔ l|ke | nu|mes|awo|e ɖ|ɔnu|iwo| o |ekp| ab|ya |u a|ɔwɔ| al|nu |e k|e ŋ|ɔme|ɖek|kpe|ia |zi |dze|o a|iny| ny|eme|o k|eƒe|o n|egb|iam|blɔ|mɔn| eƒ|i n|o d|o m|eke|wɔ |alo|lo |ɔɖe|siw|a m|e g| bu|bub|ubu|ɔ s|eny|ŋut|akp| ha|meg|enɔ|e t| ta| go|mek|abl|lɔɖ|eɖo|li |any|nɔn|to |ukp|a l| ey|etɔ|ɔ ƒ|e h|bɔ |ɔ ɖ|ɔe |nuk|gom|e x|anɔ|i s|ɖo |ɔnɔ|a k|e ƒ| to|tɔ |awɔ|mɔ |i w| es|ã | li|mev|ɖes|iaɖ|wɔw| ɖo|tso| xe| ƒo|o ƒ|i l| wò| ag|bu |bet| he|yen| ts| gb|agb|odz|a s|a e|o e| ka|ta |ewo|dɔw|i d|ele|ɔna|i a|peɖ|uti|ti | ma|oma| ad|se |ƒom|a ƒ| an|afi|ɔwo|vin|xex|exe|a ŋ|a n|ɔ b|eye|i t|vi |o l| dɔ|so |wɔn|ado|eɖe|oto|ɔ n|ben|xɔ | se|ɖev|gbɔ|nan|edz|ene| af|ɖod|zin|adz|wom|ɖok|ee |dzɔ|i b|a t| xɔ|i ɖ|a d|de | vo|uwo|o g| gɔ|gɔm|ɔ k|kat|e v|o ŋ| at|i m|i e|oɖo|sɔ |vov|ovo|ats|ɔ e|ne | ak| ne|eŋu|man|yi |a b|mee|uny|te | el|wòa|o s|da | as|asi|men|dom| sɔ|o t|ze | aw|u k|rɔ̃|tsi|ema|ata|ana|axɔ|ɖoɖ|ena|ded|ui |ɔ g|ie | en|ẽ |i o|met| eɖ|oku|kui|o ɖ|do |odo|heh",
    "slv": " pr|in | in|rav|pra|do |anj|ti |avi|je |nje|no |vic|ih | do| po|li |o d| za| vs|ost|a p|o i|ega| dr|ne | na| v |ga | sv|van|ja |ako|svo|ico|co |pri|i s|o p|e s| ka|stv|ali| im|sti|vsa| ne|ima|nos|sak|kdo|jo |dru|i d|akd|nih|o s|i p|nja|o v| al|ma |i i|e n| de|pre|red|ni |vo |i v|avn|vob|obo|ove| iz|neg|lov|ova|ki | bi|iti|na |a v| so|em |jan|a i| nj|bod|tva| te|se |oli|ruž| ra|ati| sk|e p|e i| čl|i k|i n| ob|eva| sp|aro| se|ko |drž|rža|a d|ena|sto|e v|žen| ki|di |imi|va |gov|var|ter| mo|i z|žav|nak|kak|ovo| en|mi | st|vlj|a s|jeg|ego|ve |voj|h p| z | je|nar|rod|pos|kol|n s|lja|člo|enj|n p|kat|ate|i o|er |pol|a z|del| ni|a n|jem|ed | ve|jen|odn| me|kon|en |e b|eni|sme| ta|čin|v s|nsk|ovi|elj|tvo|n v|lje|bit|ans|zak|nan|ic |ju | s |ji | sm|raz|da |sam|ene|šči|eko|sta|živ|ebn|ri |nim|so |vat|ev |ora|ičn|n n|me |za |o k|krš|a k|o z|ijo|vol|si |kov|vih|otr|uži| va|ski|kih|nst|la |med|i m|nju|h i|lju|rug|mor|odo|e d|aci|cij| da|sku|kup|o a|dej|eja|elo|avl|o o|dst|olj|ta | bo|čno|e m|vek|eme|mel|odi|dno|ars|rst|edn|rem|pno|ode|e o|itv|zna|spo|oln|vič|vne|u s|ov |ara|tak|nik|akr|ršn|bi |čen|boš|ošč|vni|vi |a b|mu |ljn|ver|ajo|ere|ose|bno|e z|ava|vez|n d|tev|užb|dov|kla| ko|dol|ice| ke|ker",
    "ayr": "apa|nak|aka| ja| ma|ata|ana|aña|asi|cha|aqe|aki|ñap|jha|mar|aw |kan|ark| ch|aru|una|paw|ti |jh |rka|jaq|pat| ta|hat|a j| ar|ama|ach|iw | wa|tak|ani|a m|a a|na |spa|kap|taq|ki | uk|jan|sa |pa |qe |kis|kas|ha |may|niw|ina|pan| kh|at | am|ati|i j| ya|iti| mu|ayn|t a|ka |as |ch |amp|a u|pjh|an |yni|mun|uka|ajh|ru |iña|w k|hit|h a|isp|is |ñan|ejh|has|e m|khi|isi|qen|nch|atä|sis|oqa|qha|han|rus|kañ|kam|mpi|siñ|ham| in|sin|asp|äña|hañ| uñ|ita|ñat| sa|qat|yat|yas|sti|sit|täñ|ska|kha|a t|tas|ma |ta |arj|asa|tha|nka|tap|iri|ara| ji|sna|a y|kat| ut|pas| as|ñja|apj|jam|tis|rjh|hap| ku|pi |tat|kaj|i t| ju|ans|sip|uñj|ukh|i u|a c|nin| ka|aya|asn|ura|nañ|noq|qas|aqa|w u|anc|i a|us |i m|api|kun|w j|jil|ili|lir|utj|tan|pac|ña |s a|ino|uya|isa|rak|kiw|kak|w m|ipa|njh|chi|hac|mas|pis| lu|amu|muy|nan| a |s j|way|ena|wa | ay|jas|w t|in |wak|upa|s m|nsa|ali|ink|tay|a k|tañ|ipj|t m|rin|khu|i c|che|heq|eqa|iru|ank|ayt|yt |anq|lan|mat|h j|en |lur|rañ|mp |yaq|aqh|qej|anj|usk|kar| aj|a w|awa|k a|tja|ayl|yll|llu|qpa|nip|uki|sap|wal|lin|run|pam|jhe| un|h k|inc|ast|isk|hus|jac|nap|uch|n j|n m|s u|tir|s w|ap |aqp|ni | pa|sar|h u|ath|ayk|ak |a i|naq|juc|sir|ri |war|arm|ist|i i|nir|hik|ika|i y|ask|ns |s c|man|nqh",
    "bem": " uk|la |uku|wa |a i|a u| mu|kwa|ali|shi|ya |a n|amb| na|sam| pa|ula|ta |nsa|fya| no|nga| ya|mbu|bu |ata| in|a m| ku|lo |nse|se | ba|ons|ntu|kul|ala|ang|ins|aku|li |wat|tu |mo |alo|a a|ngu|ili|nok|ika|na |ing|nan|a p|a k| al|sha|mu |gu |o n| ca|ila|oku|ikw|e a|yak|lik|ka | um|lin| ci|aba|yal|ana|ga |lwa|ish| fy|uli|ku |a b|u u|unt|kal| on|i n|lil|u y|ba |amo|ukw|hi |po |ulu|kan| sh|kup|aka|a c|ko |le |and|we |bal|ile|ama|ha |o u|kus|cal|umu|akw|u n|u m|nsh|o a| if|mul|kut|kub|nka|mbi|yo |apo|mun|uci|o b|ung|e n|any| ab|bul|cit|ne |u c|pa | bu|ton|u b| ka|abu|ndu|e u| ne|a f| fi| ng|u a|pan|ify|i u|cin|o i|ban|ant|cil|no |tun|gan|o c|kwe|nda| ns|kuc|ans|pam|fwa|o f|tan|ti |a l|ngw|du |nya|kum|wil|kuk| am|und|u s|lan| is|e k|bil|int|ush|wal|aya|fwi|bi |ubu| ic|ela|lam|ale|utu|ako|wab|twa|nta|afw|uko| ta|o m|gwa|kap|upo|a o|onk|i k|win|ma |way|apa|u k|imi|lul|ngi|gil|ilw|iti| ma|o y|a s|iwa|nde|de |e p|ind|pak| im|e b|uti|mba|ici| li|uka|pat|kuf|da |hiw|ine|eng|fyo| af|afu|imb|uma|kat|umo|bun|ont|nto|tul| ak|alw|e y|afy|usa|mas|til| ap|but|umw|eka|mut|bom|sa |i i|ita|kwi|atu|ubi|bik|nab| bw|kab|baf|ash|ifi|u f|ano|fik|aik|kon| wa|ute| bo|pal|lya|nak|cak|min|ina|ilo|bwa|ily|mak| ub|pok",
    "emk": " ka|a k|ka | la| a |la |an |kan| ma|a l|ni |ya |na |a a|ama|lu |n k| di|ɛɛ |di |a m| bɛ|ma | ja|ana|a b|aka|bɛɛ|man|iya|a d|ara|alu|dɔ |jam|en |a s| si| sa|ani| mɔ|mɔɔ| ye| dɔ|ye | tɛ|i a|den|i s| ba|riy|da |ɔɔ |tɛ |sar| al| ni| kɛ|a j|ila|ari| i |a t|n d|ɛn |ɲa |ra |ada|kak|ɛ k|i d|i k|len|n n|nna|ele|u d|sil| se|ade|n m| bo|olo| fa|ank|ɔ a|ɔdɔ|ɔn |aar|fan| kɔ|ɛ d|a ɲ|se | na|kel|lak|e k| da|bol|lo |aya|i m|a f| sɔ|baa|ɔnɔ|and|nda| ad|dam| ke| wo| ko|ala|ko | mi|mɛn|nu |a i|n s|ɛ s|i b|ɛ y|i l| wa|le |ɛ m|ɔ b|li |ɔya|ina| de| ha|mad| le|n a| mɛ|aba|nɲa|a n|kɔn|sɔd|dɔn|n b|han|u l|kɛ |ɔ s|ɔ m|dan|kar|nɔ |kɛd|ɛda| su|i j|in |a w|u k|ata|nnu| an|nka|a h|ɲɔɔ|aji|ɔ k|nin|olu|lat| gb|ban|ɛnn|ɔrɔ|asa|on |bɛn|don|ran|waj|jib|ibi| lɔ| ku|kun|u m|wo |a g|i t|ɛnɛ|i f|o m|ii |e m|e a|ɛ l|suu|usu|enn|ɛ b|mak|si | ɲi|ɲin|enɲ|u b|sii|a y| ɲa|nan|ti | hɔ|hɔr|rɔy|law| ɲɔ|nal|nad|nba|ati|u y|yan|n t|ɲɛ |taa|mir|iri|ɛdɛ|u s|bɔ |ba |u t|maf|afɛ|fɛn|bar|may|nki|kil|ili| fɛ|fɛ | fu|lɔ |e d|awa|sab| te|din|enb|bat| du|lɔn|ɔnn|nni|uus|su |ini| ta|ta |kol| do| dɛ|aam|gbɛ|o a|ɛ j| bɔ|nɛn|e f|ɛ a|kɔd|ant|ida|ɔɔl|ɔlu|ɔ j|i w|o y|min|te |wol| mu|tan|kad|fud|udu|du |lan|e w|bi |e b|ɔɔn|ɔɔy|biy|dah|aha|ɛbɛ| tɔ",
    "bci": "an |be | be| ɔ |un | i |ran|sra|wla| sr|kwl|in |la |n b| kɛ|kɛ |n k|n s| kw|n n| ng|lɛ |a b|le |n m| nu|a k|nun| a |i s|man|n i|ɛn |e k|ɛ n|kun|n ɔ|mun| ni| ti| mu|nin|nga|ti | n |ɛ ɔ|e n|ɔ f|ɔ n| su|ga | fa| ku| li|su |e s|a n|a s|a ɔ|ɛ b|e a|i n| sɔ|wa |sɔ |ɛ i|i k|ɔ k| ma| le|tin|ɔ l|fat|ata|ta | at| mɔ|di |ati|mɔ |akw|lik| sɛ|ɛ m|lak|e w|ndɛ|mɛn|dɛ | sa|i b|iɛ | yo| mm| kl|sɛ | nd| nv|nvl|vle| mɛ|a a|ba |und|ke | fi| wu|ɛ s|n a|ike| ka|liɛ|yo |mml|mla|ngb|i a|ɔ t|a m| an|e b|e t| si| bo| di|ɔ ɔ| yɛ|bo | ye|ndi|n t|o n|fin|sa |ɔ b|e y|e m|n f|dan|n y|fa | fɔ|i i|uma|yɛ | ny| ju|nan|ɔ i| na|wun| o |a y| wa|kan| b |b a| aw|i f|fɔu|ɔun|n l| tr|a w|klu|gba|e i|ka |uɛ |i w|ɛ a|ing|nge|ge |ɛ k|o m| fl|ɔ y|e f|awa|a i|jum|wie|ie |tra| wl|lo | ba|uan|ang|lun|ye | kp|i m| ak|e l| wi|alɛ| da|o i|kle|flu|luw|uwa| uf|flɛ|sie|nyi|kpa|ua |n w| bu|wan|ian|wlɛ|anz|nzɛ| bl|ika|o ɔ|ɔ s|e ɔ|wuk|bɔ | wo|wo |bu |anm|u i|nua|i t|zɛ |i l| ya|fuɛ|ɛ w|a t|ɔ d|te | af|bɔb|ɔbɔ|ufl|elɛ|aci|ci |u b| w |w a|a j|lu | ja|o b|afi|iɛn| bɔ|i ɔ|u m|ilɛ|n u| se|se |gbɛ|bɛn|unm|ɛ l|u s|nda|ko |u n|san|nma|o s|a l|kac|yek|eku|o y|anw|aka|anu|ɛ d| ko| yi|uka|n j|fiɛ|u a|ɔ w|fi |si |any|i j| e | jɔ| vo|vot|ote|nia|ngu",
    "bum": "e a|an |od | mo|e n|ne |mod|am |se |e m| me| ab| ai|ai | os|na |e e| na| an|a a| ng| ak|a n|ose| y | en|nna|y a| dz|d o|a m| be| nn|nam|le |i a|nde| a |ane|n a|iñ |i n|de |ie |ele|end| as|nyi|e d|bel|abe| ya| bo|li |a b|mve|ven|ya |ge |asu| et| ay|ki |be | bi|su |da |ngu|bia|i m| mi|gul|ul | e |ia |yiñ|m a|oe |ene|eny| ki|e b|dzi|ili|bod|ebe|yia|ian| mb|l y|ala|en |i e|oñ | mv|e y|og |ñ a|ege|dzo|la |nge|om |ayi|mem| nd|eti|ñ m| fi|fil|ve |a e| ek|d m|bog|nda| ma| te|bo |n e|e k| at|tob|emv|min|o a|ñ n|abo|m e|e v| ny|fe |ban|abi|ben|nga| wo|woe| se| si|u m|ga |g a| nt|uan|mbo| to|e f| fe|ulu|lu |beb|oan| ad|aye|zie| ve| da|lug|d b|k m|ñ b|a f|añ |a s|o e| al|ial|tie|zia|n b| ba|n m|zen|men|d a|eku|ato|n k|akō|kōk|ōk |di |noñ|óñ | vo|e t|u e|e o|ma |sie|ae |alu|ug |e s|em |obo|do | ze|te |ond|eñ |man|si |ese|m y|aka|i b| eb|gan|kua|ela|lad|ad |o m| nk|m m|me | ey|eyó|yóñ| no|inn|edz|m w|teg|vom| mf|bi |ye |mis|ali| fu|ako|dze|e z|u a|n y|i d|ama| es|n n|m o|kom|ñ d|tso|sog| el|to |oba| di|ses|esa|sal|zo |ndi|ol |i s|d e| so|l a| fa|fam|ing|uma| ev|s a|kal|is |s m|ii |any|voe|ndo|boa| ye|ete|ake|m n|dza|u n|ui |ñ e|nts|oga|mey|eyo| zi|ziñ|mam|ebi|dañ|med|ati|a y|nye|eki|i t|l n|bes",
    "epo": "aj | la|la |kaj| ka|oj | de|on |de |raj|iu | ra|as |ajt|o k| ĉi|e l|j k| li| pr|eco|aŭ |ĉiu|ia |jn |jto| es|est| al|pro|an | ki| ko|io |en |n k|kon|o d|j p| ti|co |ro | po|tas| aŭ|ibe|aci|toj|lib|ber| en|a p| ne|cio|ere| in|ta |to |do |o e|n a|j l| se|j r|ala|j e|j d|a k|taj| re|iuj|kiu|rec|n d|o a| pe|ado|ajn|ita|a a|lia|sta|ekt|nta|nac|iaj|uj |ter|per|eni|cia| si|ton|int|o ĉ| je|je | ha|a l|n p|al |stu|jta|sen| ho|hom| ri|hav|vas|tu | di|a e|nec|ali| so|nte|ent|ava|sia|igi|por|o p|a s|tra| na|tiu|a r|ega|s l|n l|or |soc|oci|j n|no | pl| aj|j ĉ|evi|j s|s r|ojn|kto|laj|lan| eg|gal|er |j a|igo|re |ke |u a|ers|pre| fa|rim|li |is |n j|u h|e s| ku| ju|ika|era|ata|ont|e a|pri|ioj|ntr|don|ian|el |go |n s|oma|ons|ili|u r|iĝo| su|o t|ebl|bla|raŭ|kla| ke|tat|un | el|ĉi |ne |moj|o r|a h|nda|men|con|ric|ice|cev|e p|tek|j i|ena|a d|u s|res|for|ĝi |art| un|nen|ara|ato|son|s e|ren|ple|coj|vi |j f|ame|ami|erv| vi|rot|ote| ma|ant|u l|sti|dis|ĝo |u e|ive|tan|r l| pu|unu|iĝi|n ĉ|n r|len| ag|tio|o n|ndo|olo|gno|a f|lab|abo|bor|laŭ| me| kr| ed|edu| pa|enc|duk|ern|lig|dev|kom|e e|imi|kun|tig|lo |niu| ŝt|ŝta|iel| ce|i e|ion|and|pol|oro|ces|mal|edo|n i|eli|ser|roj|j h|kad|par|j m|eri|ti |ra |na |jur| ek",
    "pam": "ng |ing|ang| ka|an | pa|g k| at|g p|ala|at |apa| ma|kar|lan| ki|ata|kin|pam|g m|ara|tan|pan|yan| a |pat| in| ba|aya|n a|g a|ung|ama|rap|g b|man| ni| di|nin|din|n k|a a|tin|rin|ami|a k| la|tun|n i|ari|asa|nga|iya|ban|ati| me| da|nan| sa| na|t k|gan|etu|bal|g s|mag|met|sa |a i|ant|la |kal| iy|a n|kap| mi|in |ya |aka|tau|n d| o |san|au |ana|yun|mak|lay|ika|a m|na |ipa|atu| al| ta|ran|n n|g l|ila|ti |kay|ali|nsa|aga|a p|g t|iti|par|al |ans|g i|nu |u m|iwa|t p|a d|t m|syu|sab|un |uli|anu|mil|mal|u a|mip|as |aba|aki|ra |abl|bla|ili|kat|t a|una| it|awa|ita|kas|g n|tas|lag|da |n l|lal|wa |i a|abi|dap|bat|ap | pr|mas| e |mik|li |ani|ad |sal|a b|nte|g d|lin|a r| an|kab|gal|ale| li|e p|ral|ira|nta|nti|lit|wal|ula|s a|lip|pro|te |ag |tu |upa|wan|ie |aku|o p| ya|ian|tek|yat|lat|iba|tul|usa|pun|it |alu|sas|g e|be |g g| bi|bie|n p|e m|l a|t i|lir|nap|kan|u k|bil|ngg|ily|eng|mam|rot|ote|eks|ksy|gga|liw|len|en |p a|ipu|pag|isa|lam| tu|u i|abe|e k|n o| ri|aul|pas|ema|dan|lab|lya|lak|are|tam| ar|ta |ail|uri| ul|inu|ags| pi|sar|ril|sak| re|ka | ra| pe|asi|rel|i i|o a|ina|mun|abu|mba|pak|art|i k|asy|gaw|mit| ke|mem|aru|mab|a o| nu|nun|e a|ndi| ag|agp|gpa|obr|bra| mu|aun|era|isi|lub|ga |am |gla|mis|anm",
    "tiv": "an | u | sh| na|nan|en | a |ha |sha|shi| i |er |a i| er|or | ma|ar |gh |n i|n u|a m|n s| ve|han| ci|u n| ke|man| lu|lu |yô |u a|n m|a u|n a|a k|r n|mba|in |ii | ha|ken|n k|kwa|na |hin|a a| mb|n n| kw|agh|cii| ga|ga |aa |a n| yô|nge|a s|ve |wag|r u|ba | gb|u i|ana| or|anm|nma|mao|aor|r i|ma |ity|a t| ta|gen|ir |oo |ren| kp|ang|i n|gba| ng|r m|e u|r s| ia|ere|ugh|ian| it|kpa|doo|ese|uma| la|n g|u k|ngu|gu |om |oug|on |ol |a h| he|tar|ior| ts|h u| ne|la |n t| ka|r a|se |e n| ku|hen|a v|aha|ge | de|i u|yol|mac|ace|ce |u t|o u|a e|hi | io|tom| do|ish|u u|i d|i m|iyo|a l|bar|igh|e a|ua |u s|ave| te|un |sen|r k|m u|n e|ev |ind|ene|a w|n c|ne |a o|ker|a g|paa|ndi| to| is|era|u v|ima|n h|di |de |ase|tya|yar| wo|e s|n y|end|ka |tyô|ee |him|tes|u m| mk|u h|ran| wa|u e|yan| mi|tin| mz|won| um|nen| za|i v| ig| in|hir|r c|hie|ie |e l|e k|mak|i a|a c| ya|i i|rum|kur|men|a d|eng|ves|i k| ik|i l|nah|e i|tse|i e|mzo|zou| vo|vou|mlu| iy|ôro|ron|oru|ura|a y|gbe|inj|nja|ô i|r t| zu|e e| as|u l| ml|em |ra |was|n l| fa|io |mi | ti|e m|ver|ci |kpe|wa |lun| ij|av |soo|wan|ant|vea|ea |nda|da |hio|civ|ivi|vir|zua|môm|ôm |see|r l|iji|u z|zan|l i| hi| so|ake|nta|ta |r g|hem| mt|ndo|do |ng |igb|e h|h s|a f|iky",
    "tpi": "ng |ong|lon| lo|im | ol| na|la | ma|pel|ela|ri |at | bi|ait|na | yu|gat|ol | ra|bil| ka|ilo|man|rai|t l|it |eri|mer| i |wan| o |umi|mi | wa|ing|yum|ta |t r|tin|olg|lge|get|eta|iga| ig| sa|ara|em |rap|i o|ap |anm|nme|in |ain|a m|an |ant|nar|ape|i n|m o|g o| no|g k|i i|mas|as |ini| me|n o|sim|tri|kai| ga|kan|ntr| pa|a s| st| ha|gut| wo|g y|yu |g s|ok |g w|wok|m n|ama|a l|i b|a k|i l|i m|g l|spe|sam| gu|sin|m l|kam|pim|amt|l n|mti|tpe|a i| in|g n|ts | la|utp|kim|isp|its|isi|aim|o m|lo |api|g b|a t|tai|p l| di|dis|a o|en |t w|map|lai|sem| lu|luk|tim|s b| ko|no |nog|ols|lse|sav|ave|ve | ki|nem|m k| ti|a p|g p|g t|nka|tu |i y|et | em|m y|sta|tap|aun|nim|nap| fr|n m|pas|asi|m g| tu|l i|un |aut|a n|fri|tok|oga|t n|ane| sk|i g|n s|kis|g g|nta|m i|kau|o i|sen| ba| to|ngt|gti|os |ik |ut |g r|l m|aik|ari|iki|a g|m s|a w|s i|i s|uti|sai|iti|anp|npe|usi|a h|o l|o b|s n| ta|a y| pi|kin|ni |lim| ye|yet|n b|k b|ili| we|ina|rau|a b|anw|nwa|aus|sap|pos|hap|ot |t o|ank|m m|str|n i|m w|nin|g m| si|uka|dau|ins|nsa|i w| ne|ese|o k|rid|ido|dom|m b|g d|kot|ple|les|es |apo|ali|ivi|vim| go|go |g h|ron|s s|sku|kul|pik|am |u y|o n|l l|n n|s o|a r|ti |s l|om |ksa|nis|ei | as|ip |hal|liv|g e|ati|m p|ul | po|g i",
    "ven": "na | na| vh|a m| mu|ha | u |wa |tsh|a n|a u|we |hu | ts|vha|nga| ya|ya |a v|lo |vhu|ṅwe| dz|ane|thu|ho |ana|o y| kh|shi|a t|ga | pf|e n|uṅw|elo| zw|sha|muṅ|a p|nel|ne |fan| ng|pfa|uth|edz|a k|kha|dza|u n|ele| a |mut|aho|zwa|a h| ha| ka| hu|a z|o n|kan|la |dzi| mb|vho|wo |za |zwi|ang|i n|fho|han|u v|hum|lwa|e u|ela|a d|u m|o d|mul|u t|aka|olo|ḓo |o v| wa|e a|ofh|hol|si |u s|no |gan|hi |mbo|zo |he |ano|ula|led|zi |hak|ka |shu|o k|low| ḓo|lel| sh|bof| ma|dzw|o m|hat| i |e k|o h|ngo|yo |owo|o t|tsi|rel|ath|elw|dzo|sa |hon| te|its|o i|a s|awe|go | nd| mi|mba|a i|isa|wi |hil|avh|umb|iṅw| lu|a l|ing|ni |unz|i h|e v|nah|and|ine|mis|e m|ṱhe|a ḓ|li |vel|one|i k|a y| ḽa|mbu|i t|swa|ush| si|lan| ḓi|alo|uts| fh|evh|dzh|hut|het| an|oṱh|nḓa|u k|ea |sir|ire|vhe|amb| it|eth|u a|wan|ḓa | sa|mo | bv|i m|nda|ri |tea|ila|o ḽ|o a|ndu|ulo|adz|khe|a ṱ|fun|she|i v|kon|ou |ayo| ur|uri|le |zan|ḽa |a a|umi|ivh|isw|e y|wah|fha|hus|hun|hul|hen|anḓ|hel|o w|zit|thi|ule|o u| ny|u h|ung|ura|hal|a f| ho|u w| ṱh|oni|i ḓ|pfu|kat|bve|lay|tel|u d|hav|iwa|nyi|uvh|du | ṱa| fa|huk| o |u ḓ|san|mbe| ko|mus|udz|hit|hin|zhi|u i| th|o z|zwo|alu| ḽi|hii|yi |u ṱ|lus|i y|ala|hir|mur|a w|hoṱ|i i|ṱho|eli|pha|nzo|ili|lis|win|usi|hed",
    "ssw": "nge|eku|a n|ntf| le|e n| ng|tfu|lo |la |nga| ku|fu | ne|o l|khe|tsi|nkh|le |he |unt|elo| lo|si |ele|a l|ni |ung|mun|ma |lun|lel|wa |lek|nom| um|eni|oma|hla|onk|kut| no|a k|e l|ent|ela|e k|gel| ba|ko |eli|ats| la|pha| em|o n|ang|ema|eti|nye|nel|ban|uts|ulu| na|aka|hul|e u|lan|tfo|oku|won|lok|esi|khu|lul|umu|a e|ala|ule|akh|ye |tse|ve |nek|i l|ane|ana|lil|na |aph|kwe| wo|ke |aba|nti|we |ndl|ale| ye|ilu|i n|ba |any|gek|lab|gan|hat| li|kel|len|gen|wen|ndz|tin|lwa|and|let|fo |e b|eko| ka| kw|nem|set|te |ne |ant|ka |phi|mal|alu| un| ek|u u|ing|une|ise|mph|uhl|o y|e e|nal|lal|kul|i k|ile|fan|‐ke|kub|kan|ako|ukh|ben|a b|sek| ti|nak|ive|eke|kat|sit|kha|kho|wo |yel|u l|alo|seb|les|ikh|lom|isa|o e|kus|elw|ini|ngu|e w|kwa|fun|eng|ahl|jen|sa |ebe|o k|iph| si|be |uph|isw|tis|etf|emb|lwe|abe| im|nan|e a|i e|uma|enk|ene|kun| se|ta |ume|ebu|omu|kuv|nen| in|hak|lin|dle|tel|ase|sen|sel|uba|nhl|e i|kuk|a i|tfw| wa|dza|lak|fut|int|sin|ti |kuf|mhl|bon|ula|hol|ali|ona|a a|ind|kuh|use|ete|yen|ave|a‐k|ngo|ze |to |gab|und|i w|lis|tsa|eki|nje|se |lon|i a|ike|swa|sim|its|a w|liv|cal|ma‐|gal|e t|ata|ili|ndv|sik|mel|fol|utf|bun|gap|han|uny|o m| ya|wem|ute|nta|oba|hi |alw|phe|i u|mbi|imi| fu| at| nj|yak|u n|ati",
    "nyn": "omu| om|ntu|tu | ku|a o|ra | ob|wa |obu|ari|a k|mun|a n|unt|mu |uri|nga| mu|ri |aba|a e| na|e o|ho |rik|gye|a a|ang|han|re |iri|ga |oku|bwa|aha| bu|bur|na |ka |ire|eki|iku|ndi|uga|ush|ban|ain|ere|kur|ira|we | ek|sho|u a| ni| ab|e k|a b|ine|ne |and|i m|u b|sa |iha|kir|e n|aho|ibw| eb|bug|be | ba|gir|ing|ura|ant|ye | ah|u n|ung|e b|kut|abe|i n| kw|kwe|uba|ba |ro | ok|ebi|iki|era| bw|gab| no|zi |u o|i k|bir|rwa|o e|o o|kub|mer|ama|end|ate|tee|eka|di |kug|rir|kuk|rin|ish|sha|bus|wah|ara| ai|bwe|ngi|u m|ha |i b|eek|kwa|baa| ka|kan|i a|za |eme|ngo|o g|ana|kuh|i o|o k|iin|iba|ash|nib|o b|zib|iro|she|go | gw|gan|oon|u k| or| ar|i e|uru|ya |nar|agi|mwe|ngy|hem|ona|bwo|oro|ora|hi |e e|o a|ute|egy|bar|isa| n | en|eir|uta|tar|kwi| ti| ki|shi|nda|da |ris|tek|ja |wen|aga|nsi|si | nk|rag| ha|yes|rei|mur|riz| am|o n|ki |obw|yen|ata|ugi|ija|mus|wee|bya|amb|bas|aab| ky|ikw| ne|a y|ind|kus|hob|gar|a g|eky|aar| we|aka|emi|ekw|ini| bi|kor|gwa|n o|yam|eih|naa|i y|dii|ibi|ham|gi |iza| by|ete|har|rih|iho| er|rer|bor|o m|ahu|uka|ika|but|ent|kye|tuu|nik| em|aas|asa|nis|aij|mut|amu|mag|eby|a r|iik|iko|ens|e a|hab|yaa|nko|u e|nka|nok|uku|mub|ani|uko|sib|ong| yo|eri|utu|irw|nde|der|obo|roz|ozi|bi |yo |azi|kat",
    "yao": "chi|ndu| wa|du | ch|a m|aku|akw|ni |kwe|und| mu|wak|wan|la | ku|mun|e m|wa |ulu|amb| ak|kut|u w|mbo|ali|lu |we |le | ma|ufu|ful|ila|a k|a n|bo | ni| ga|kwa|se |amu| na|nga|hil|ose|go |aka|ang|and| uf|na | pa|ete|kul|uti| jw|jwa|son|ngo|lam|e u|oni|ne |kam|e a| so|ele|u j|ti |ana|wal|a c| yi|isy|cha|te |gan|ya |mwa|wet|lij|che|ga |yak|pa | ya|e n|o s|jos|nda|ili|i m|ula|i a|ile|ijo|e k|a u|o c|li | mw|ich|mul|asa|uch|kas|o m|ala| ka|i w|ach|u a|ela|yin|ani|nam|i k|his|ind|sye|lan|yo |man|pe |sya|si |iwa|aga|gal|ule|a w|asi|ikw|o a|jil|ope|ma |hak|ika|kus|gak|kap|e w|mbi|ekw|aji|any|kum|mba|a y|uli|ase|ite|ape|u g|imb| al| ja|mas|mal|ja | ng|end|a p|lem|a j|o n|usi|anj|kup|pen|e c|ka |ye |ago|gwa|oso|ane|sop|hel|ama|ola|ako|mch|sen|eng|pel|lek| kw|ena|ine|him|och| mp|hik|u y|i y|gam|kol|ole|i u| mc|ons| li|awo|wo |nji|mpe|tam|e y|syo|wam|ati|ten|mau|auf|mka|kan|uma| ul|ngw|nag|kwi|je |ong|ene|muc|iga|i g|iku|da |cho|ano|pag|sa |upi|iya|apa|ale| ji|a l|kuw|uwa|jo |o k|bom| un|uni|ion|eka|esy|wu |emw|ipa|o w|i c|pan|i n|a a|nya|oma|yil|duj|ujo|lil|waj|one|jak|dan|mus|hiw|nja|tio|uku|pak|o g| m | yo|alo|e j|i j|apo|poc| wo|eje|ing|e p|lo |was|a s|upa|ata| bo|lig|he | mi|ung|nde|no |lic",
    "lav": "as |ība| un|un |tie|ies|bas|ai | ti|esī|sīb|ien| vi|bu |vie| ir|ir |ību|iem| va|em | pa| ne|am |s u|m i|šan|u u|r t|pie| ci| sa|ās | uz|vai| ka| pi| iz|brī| br|rīv|dzī|uz |ena|cij| ar|ar |s p|isk|es |nam| ap|ot | at|āci|viņ|inā| ik|ikv|kvi|s v|i i| no|vis|pār| ie|u a|ju |nu | pr|edr|vīb|iju|drī|īvī| st|cil|ilv|lvē|dar|ana|iņa|u p| la|s i|s t|īdz|n i|s s|tīb|kā |ija|i a|līd|ka |bai|iec|aiz|s b|īgi|vēk|cie|īgu|gu |ied|ībā|s n|jas|val|ām |tu |arb|zīb|ska| jā|umu|mu |u v|t p|als|lst|kum|vēr|stā|arī|aut|ama|a p|jot|gi |n v|s l|n p|st | tā|u n|s a| ai|izs|sta|ņa |ba |ojo|kas| ta|nīg|anu| da|u k|iev|cīb|u i|i u|mat|s d| so|a u|sav|jum|ā a|not|m u| kā|son|u t|ā v|stī|ēro|līb|pam|a s| dz|līt|rdz|nīb|pil|kat|i n|cit|s k|nāc|ned|rīk|īks|kst| pe|per|i v|u d|nāt|ajā|evē| pā|u s|os |t v| re|tau|i p|ma |a v|a a| li|ras|tis|bie|rīb|bā |evi|kur|ekl|jā |nev|t k|ieš|oša|uma| lī| be|bez|a t|eci|nas|zsa|sar|soc|oci|ciā|t s|atr|lik|iku|roš|enā|īša|mie|skā|abi|āda|ers|rso|būt|ais|kād| ve| je|jeb|ebk|n b|roj|lie|ēt |ecī|ts |du |na |paš|aul|ta |eja|izg|zgl|glī|ā u|ard|iet|iāl|tar|arp|īga|īst|tra|r j|tik|nod|isp|spā|ier|sab|ant|tot|pre|ret|eno|ikt|kt | ku|āt | de|tīt|tās|ja |pat| na|vu |atv| ga|nea|lau|ulī",
    "quz": "una|an | ka|nan|cha|ana|as |apa|pas|man|lla|aq |sqa|ta | ru|run|kun|ach|qa |pa | ll|paq|na |npa|chi|nta| ma|nch|aku|anp| ch|in |a r|ant|mi |hay|taq|ay |ama|asq|kuy|qan|tin|chu|a k|lap|yta|ata|a a|wan|ima|all|spa| wa|n k|ipa| ya|nin| ja|ina|aqm|qmi| ju|a m|his|pi |nap|iku|anc|kau|aus|usa|kan|pan|nak|aqa| mu|naq|kam| pa|aqt|i k|kay|kus|ank|may|nku|yku|isq|un |ati|ayn|a j|a l|ayt|a p|qta|aci| pi| al|lli|lin|ayk|uku| ri| at|n r|pip|ion|yac|han|ayp|n j|nac|qpa|yni|inc|s m|cio|say|uy |a c|mac|asp|laq|awa|tap| im|yoq|n a|mun| de|n m|a y| yu|has|asi|uch|s k|hu |nma|n c|int|oq | as|ari|q k|ypa| sa| na|q r|jat|atu|tun| tu|tuk|rim|yan|api|anm| ji|jin|nat|hik|tan|uya|a s|pac|nti|ash|k a|ura| su|mas|n p|n l| qa|lan|a q|unt|ypi|ech|is |q j|n y|yuy|yay|usp|kas|s w|inp| an|sin|a w| ta|ma | ay|ña |q a|upa|shw|hwa|uyt|der|ere|rec|uma|nam|s t|nmi| ni|n t|isp|a t|hur|sim|inm|kaq|pay|waw|t a|tiy|sap|ani|sta|nka|war|y r| un|kin| si|s j|qas|was|usq|imi|hin|nk |arm|rmi|rik|q c|i p|la |aqp|niy|iyo|maq| ti|ink|ha | ku|aym|yma|npi|pis|nal|nis|unc|hak|y s|juc|pap|s y| aj|i m|s p| re|qsi|q y|ita| qh|ayo|ku |ist|cho|os |mik|yqa|piq|iqp|n s|onq|ras|t i|muc| qe|kuk|n n| ki|lak|i l|y l|qti|eqs|jun|kup| pu|pat|iya",
    "src": " de|de |e s|os | sa|tu |tzi| su|one| a |sa |ne |ent| in| e |ion|der|su |zio|ere|as |a s|e d|u d|ret|es | cu|ess| pr| so|s d|men|ale| s |atz|ade|re |e c|sos|s i|in |chi|nte| un|ten|etu| pe|er |et |e e|ida| te|le |ene| is| ch|a p| es| si|are|u s|a d|dad|hi |pro|e t|zi |sse|te |tad| on|e i|s e|nt |sso|u a|onz|nzi| co|cun|ame|e a|tos|sas|na |a c|e p|ntu|at |net|nes|du |t d|son|n s| li|s a|ro | o |ber|pes|u e|zia|res|ia |nat|int|nu |un |i p| re|s p|era|per| po|ter|sta| di|t s|s s|rar|ser|e o| at|lib|ibe|s c|tra|ust|unu|u c|si |rta| to|da |nal|egu|ntz| na|cus|ant|adu|eto|und|a e|otu|ine|i s|u p|ona|est|a a| da| fa|t a|ist|ert|tot|iss|les|s o| ma|ra |ntr|pod|pre|ica|sua|dae|ae |una|man|con|nid|s n|ndi|sia|nta|o s|ada|ua |a i|a l|ide| ne|min| pa|nde|otz|ode|rat|iat|dis|ssi|e u|u t|ren|ali| as|pet|sot|o a|ime|ta |u o|a u|fun|nsi|epe|st |lid|eru|t e|unt|end|iu |us | fu|nda|a t|ial|ass|ner|s f|uni|das|ind| ca|dos|a n|a f| me| se| eg|gua|ual|nen|a b|s m|sti|sen|etz|ura|s ò|ont|com|lic|ghe|t p|pen|inn|òmi|a o|seg|nos|din|e f|des|ado|e n|sid| tr|ina|ena|for| òm|dep|ènt|ire|par|u i|suo|gur|u r|a m|ria| fi|pri|s u| no|cra|ara|e l|uns|det|tut|dam|eli|s t|e r|art|itu|cum|icu| bo|tar|emo|run|isp|agh",
    "sco": " th|the|he |nd | an|and| o |al | in|ae |in |es |ion|cht| ta|tio|or |t t|ric| ri|ich|tae|on |s a|is | aw|e a| be|s t|ati| he|ent|ht | co|e r|ts |er | na|bod| fr|hes|ody|dy |his| fo|e t|it |for|o t|ty |ng |n t| or|be |fre|ree|l a| hi|awb|wbo| sh|ing|sha|s o|nat|ter| on|nal|n a|an |r t| as|hal|e o|d t|tit| pe|y a|l b|y h|aw | re| ma|men|nt |air|ce | ti| a | pr|hts|e s|e f|le |ons|n o|e c|eed|edo|dom|man| wi|e w|res|sta|ed |d a|d f|t o|ona| it|ity|ar | de|as |ers|t i|at |her|nti|til|il |con|e p| st| di|und|nce| so|ns |e i|nte|e g|ony|ny |oun|ie |ith|ir |e e|ont|thi| fu|en |ly |pro|ne |y i|nin| me|lit|r a|com|ic |soc|oci|nae| un| fa|ess|ual|hum|uma|ame| wa|ear|e h| en|ane| is|r i|inc|uni|wi | eq|equ|qua| hu|rit|d o|hei| ha|d i|s f|o h|e m|ver|t n| no|cla|int|t a|ms |rsa| te| se|r h| le|ial| la|e d|ive|nit|iti|r o|y s|om |aim|dis|ld |s i|tha|hat|cti|ite|cia|s r|re |ali|cie| pu|rat|tat|rt |per|s h|n f|ntr|tri|fai|imi|r s|ild| ga|hau|din|lea|ist|elt|lt |l t|mai|g a|omm| we|eil|e b|d p|e u|s n|dec| ac|oms|mei|rie|ge |war|ors|art|eik|id |ten|n i| ge|nda|eli|iou|eir|y t|eme|era|s e|tel|lan|nor|law|ds |ral|s d|ate| gr|rou|g o|cou|ber|un | tr|d e|ces|sam|bei|e l|n s|ica|sec|rni|nta|d s|gar|s w",
    "tso": " ku|ku |ni |a k|hi | ni|a n| a |i k|ka |i n|wa | ya| ma|la |ya |na | hi|a m| ti|fan| sv|nel|hu |a t|ane|ela|iwa| ka|u n| na|svi|lo |nhu|a l|le |a h|ele|ndz|u k|va | xi|a w|mbe|vi |eli| à |elo| wu|wu |u y| mu|mun|i l|nga| va|umb|nfa|lan| le|kum|be |u h|li |u l|tik|aka|unh|iku|ihi| wa|liw|isa|a s| fa|i m|ma |anu|nu |han|u t| la| wi|wih| ng|yel|a a| ha|a x|lel| nf|i h|ana|ta |o y|e k|eni|i a|u a| nt|ga |any|ndl| li| ko| kh|amb|u v|van|u w|i t|sa |a y|ti |i w|pfu|in |lek|yi |e y|and|ati|ang| è |sva|i s|ani|mat|irh| nd|a v|eke|hin|isi|hla| ye|yen|mel| lo|n k|kwe|thl|hul|ulu|ava| mi| kw|tin|mah|wan|nth|à n|ko |u s|khu|à k|aye|kwa|inf|aha|tir|dle|i y|o l|lul|ule|mba|rhu|dzi| th|anh|end|è k|fum|xi |a f|kel|u f|may|we |eka|nye|gan| lè|tà |xim|thx|ham|vu |mis|dze|xa |aku|eyi| tà|ima|nti|hlo|vak|u p| si|ngo|eki| ta|lok|oko|lak|ke |lon|hak|a è|zis|u m|ngu|i à|o n|ume|vik|dza| y |ha |u x|a à|awu|les|esv|u à|za | là|n w|i f|ung|siw|rhi|i x|e n|e s|ths|mbi|e h|uma|kol|fun|ond|ola|mha|à m|sav|nya|kot|naw| dj|to |mu | lw|a u|lwe|ike|nis|ind| hl|e a| ts|nyi|u d|sun|xih|ong|ki |èli|xiw|wey|lum|sim|ba |o t|sek|ala|oni|imu|djo|jon|i v| yi|kar| pf|sel|wav|avu|sik|ave|iph|sin| hà|e l|zen|gul|ali|ile| xa",
    "rmy": " sh|ri | a |shi|hi |i s|ti |ea |ari|i a| ca|tsi|rea|i c| s |a a|ndr|câ |dre|tu |i n|rep|ept|ptu|li | di| nd| un|i u|a s|are|ats|ear|i l| la|la | li|lje|lui|ui |di |ati|a l| tu|tat|â s|ei |sea| ti| câ|un |jei|or |â t|caf|afi| lu| ar|ali|fi |i t|ilj|râ |bâ |a c|ibâ|lor|car| cu|nâ |i d|icâ|a n|s h| hi|hib|tâ |eas|u c|â a|si |tur|tul| in|â c|ber|u a|n a|cu | co|lib|ibe|tea|u s|lu |ul |tsâ|tse|int|i p|a p| pr|u p|i i|url|i m|lji|sti|min| pi|nal|sht| al|alâ|rar|ji |â n|â p|til| si|nat|sii|ii |ert|lâ |u l|sâ | nu|sta| ic|â l|a t|ili|i f|mlu|ist|ots|nu |rta|a d|pri|uni|its|â d| ts|tut|ura|i e|sia|al | ma| at|oml|gur| ân|anâ| na| de| po| st|ita| mi| ap|sh | as|ips|ând| so|can|nts|nit|oat|tsl| su| ea|ent|a i| lj|ona|ash|lip|sot|ate|rli|ilo|ina|poa|â i| ac|âts|i b|ril| om|t c|urâ|nji|bli|zea|con|iti|unâ| u | fa|tât|ind|par|hti|com|let|sig|igu|eal|ntr|pur|iil| ni|at |r s|ntu| eg|ega|gal|sin|atâ|ica|pse|chi|âlj|ia | ba|i v|apu|arâ|art|ast|asi|inj|ise|ral|ini| pu|uri|adz| sc|r a|ter|est|itâ|act| va|luc|ucr|rlo|rtâ|sun|unt|idi|tlu|a u|alt|rim|a o|nda|sa |ets|pis|ma |asc|scâ|pi |s l|era|ial|lit|imi| gh|tar|ead|ra | ta|va |uts| du|atl|umi|nea|ant|nde|oar|l l| fâ|fâr|ârâ| an|mil|sli|sâl| lo|ana|jea",
    "men": " ng|a n|i n|ɔɔ |ti | ti|i l| i | ma| nu|ngi| gb|a k|aa |gi |ia |ɛɛ | kɔ| na|ei | a |ma |hu | ye| ta|kɔɔ|na |a t| hu|a m| kɛ| nd|ya |gbi|bi |i y| lɔ|ɛ n|a h|ii |ɔny|nya|u g|i h|uu | kp|lɔn|i m|ngɔ|nga|la |kɛɛ|i t|lɔ |i k|ɔ t| mi|mia|a y| ji|nge|gaa|ee | hi|a a|gɔ |tao|ao |ind|ɔ i|ɔ n| le|num|umu|mu | yɛ|ung|hin|ye |nda|i g|hou|hug|a l|e n|ni |ugb|sia|ndɔ|a i|nuu|maa| ya|gba|ahu|oun|u k|mah|i w|le |da |ɔma|ɔlɔ| va|i j|eng| ɔɔ|va |i i|yei|li | sa|kpɛ|lei|yɛ |dɔl| la|isi|a w|u n|yil|bat| ki|ta | lo|e a|saw|ahi| wo|ɔ k|ɛlɛ|e t|uvu|ili|o k| ho|ji |gbɔ|pɛl|vuu| gu|aho|nde|ndu|nuv| ny|kpa| wa|kɛ |e m|ale|ɛ t|ge |nah|ɛi |ila|gbu|a g|awe|wei|e k| ii|atɛ|bua|nun|ie |yek|ɔ y|u t|awa|wa |hei|gul|ulɔ|ing|wot| tɔ|ani|kɔl|ɔle|ɛ k|tɛ |ga |gbɛ|i b|ekp|kpe|uni|ɔ g|taa|kpɔ|u i| ha|ein|ote|te |a v|ang|bɔm|ɛ g|lɛɛ|baa| ba|pe |tii|i ɛ|ɔ s| we|ɛ y|ɛ h| ɛɛ|u m|jif|ifa|fa |eke|kia|hii|ama|gen|u l|bu |a b|a j|lee|u w|aah|lɛ |e y| lɛ|ɛmb|lek|ui | wi| yi|u y|e h|bɛɛ|yan|nyi|uah|aal|ɔ m| he|yen|o g|u a|ngo|bɛm|akp|lii|lɔl|lon|ong|maj|ajɔ|jɔɔ|u ɔ| sɔ| bɛ|ɛ i|wu |nyɛ|e g|a p|ka |yee|e i|dun|uny|iti|lɔm|hi | ka|oyi|ɛng|nye|mbo|oi |nin|dɔɔ|iye|i a|ke |agb|wie|yaa|gua|i v|wat|ati|sɔɔ|ɛ b|uam| ga|ɔla|u h|ula|yɛi|ewɔ",
    "fon": "na | na| e | ɖo|ɔn |ɖo |kpo| kp|nu |o n| ɔ | nu| mɛ|mɛ | gb|po |do |yi |tɔn| é | si|gbɛ|e n|in | to| lɛ|lɛ | tɔ|nyi| al|wɛ | do|bo | ny|ɛtɔ|tɔ |e ɖ|ɖe | bo|okp|lo |ee |to |bɛt|ɖok|ɔ e| wɛ|a n|o t|sin| ac|acɛ|i ɖ|o a|ɛn |o e|bɔ |ɔ ɖ|ɛ b| bɔ|cɛ |ɔ n|a ɖ|ɛ ɔ| ɖe|n b|an |odo|nɔ |ɛ n|o ɔ|ɛ ɖ|ɛ e|ji | ɖɔ|ɖɔ |n n|lin|bi | en|o ɖ|n e|mɔ |pod|n a| bi|lɔ | mɔ|i n|ɛ k|nɛ | hw|mɛɖ|un |ɔ m|i e| ye|ɛɖe|enɛ| ji| ǎ |o s|kpl|alo|ɖee|a d|ɔ b|n m|ɔ é| nɔ|ɔ g|u e|alɔ|si |a t|n k|gbɔ| yi|jɛ |o m|sɛn|e m|e k| wa|nnu|e e| sɛ|é ɖ| jl|nun| hɛ|hɛn|n ɖ|é n|wa |a s|ɛ é|kpa|bɔn|ɔ t|unɔ| ee|e s|inu|ɔ w|i t|u k|zɔn|ɔ s|o g|bɛ |ɔ a|e j|o l|n t|a y|ma |ɔ k|u t|nuk|ɔ l|o b|a e|a z| zɔ|i k|jlo|kɔn|e ɔ| lo|eɖe|jij|o y| ka|hwɛ|six|ixu|xu |ali|n l| su|e w|sis|isi|dan|n ɔ|etɔ|nmɛ| ta|n d|u a|ukɔ|e g|a b|ɛ a|onu|su | we| ay|ayi|o j|n g|hwe| sɔ|sɔ |u w| bǐ|bǐ |ɛ g|i s|lɔn|n s|ɛ t|wem|ema|a m|o d|ɛ s|o h|ba |ye | az|azɔ|u m| jɛ|hun| ma|i l|tog|ogu|ɛ l|ple|o w|esu|wu | i |sun|ka |kan| ɖó|ɖó |ɛ w|gbe|n w|u g|ɖi | le|plɔ| li|oɖo|ɖè | hu| el|elɔ|o k|a l|ann|ɖes|ɔ y|u s| wu|ɛ m|gan| da|i w| ti|tii|iin|yet|i m|ɛnn|pan|zan|poɖ|a j| ɖi| tu|gun|a g|xo | fi|e b|ta |ijɛ|ɖev|evo|a w|i a| ga|e l|nuɖ|ɔ h|wen|obo|ya |kwɛ|vi | ɛ |ɛ h|lee",
    "nhn": "aj |tla| tl| ti|ej |li |j t|i t| ma|an |a t|kaj|tij|uan|sej|eki| no|chi|ma | ua|ij | to| te|j m| ki|noj| se|ika|lis|aka|j u|laj|tle|pa |j k|pan|ka | mo|ech|ali|amp|uaj|iua|j n|man|oj |och|tek|tli|kua|se |ili|a k| pa|ano|ise|tec|ual|mpa|n t|iaj|len|en |is | ue|a m|jto|pia| am|ajt|uel|eli| ni|oua|ya |j i|ni |kin|hi |tok|noc|one|lal|jki|nek|ani|ipa|oli|kit|ati|kam|ia |amo|j s|aua|tim|mo | ku|stl| ke| ik|ant|nij|opa|ama|ase|i m|imo|mej|tl |ijp|ijk|ist|tis|tik|mon|itl|ok |lak|par|ara|ra |n n|kej|tit|jpi|a s|ojk|ki |maj| o |nop| ka|jya|alt|cht|iti|a n|kiu|lat|uam|ijt|o t|leu|lau|ita|tep|kia|jka| ip|n m|ana|lam|nka|kij|tou|n s|til|i u|epa|i n|s t|e t| ak|nem|k t|lti|j a|nti|ntl|mat|emi|lan|nau|uat|ose|nit|jtl|uey|eyi|eui|kat|i k|kip| on|onk|oka|j p|ini|toj|kem|ema|pal|ale|ame|ats|ajy|iki|uik|mpo|n k|e a|ach|eua|ijn|mil|tot|oyo| sa|otl|ite|eka|atl|hiu|tol|ajk|yek|san|pam|uak|tia|ino|ate|tsa|uil|j o|jua|o o|oke|ipi|its|a i|a a|oju|oui|jne|tos|kui|yi |kol|n a|ote|ken|a u|i i|iko|jti|chp|tin| ne|as | ye| me|ank|ine|aui|xtl|ejk|kon|ko |you|kii|ojt|tsi|o k|nok|poy| ya|uas|yol|tst|las|ejy|hik|jke| si|siu|yok|hti| in|htl|pou|mac|sto|ak |nel|sij|axt|sek|ui | ax|kis|i a|jch|mel|ela|mot|nko|uis|kim",
    "dip": " ku|en |ic |ku | bi|bi | yi| ke|an |yic|aan|raa| ci| th|n e| ka| eb| ra|c k|c b|n a|ci |in |kua|th |ny |ka |i k|ŋ y|ben|i l|ebe|k e| ek| e |nhö|höm|öm |ai | al|kem| ye| nh|eme|m k|men|i y|t k|n k| la|c e|ith| er|alɛ|lɛ̈|thi|t e|ua |ɛ̈ŋ|ek | lo|ŋ k|ɔc | ep|u l|n t|̈ŋ |it |yen|de |kɔc|k k|at |a l|i r|epi|n b|pin|iny|n y|lau|u t|aai|au |ok | te|ken|aci| pi|e y|u k|oŋ |ath|ke |cin|a c| ac|ik |baa| ti|uat|ui |u n|a t|tho|hii|yit| lu|h k| lö|n c|kek|e r|thö|m e|h e|ɛŋ |te | lɛ|l k|hin|n r|n l|i t|ëk | mi| et|era|eŋ |ekɔ|e w|i b|pio| ny|iic|nhi|ak |i e|el |a k|nde|k a| ba|ye |eba|köu|lɛŋ| en|ök |e k| aa|ŋ e|iim|im |kak|u b|e c| pa| le|eth|i m|r e| el|y k|ioc|oc | kɔ| kö|öŋ |e l|ŋ n|rot|ot |c t|la |loo|iit|hok|ëŋ |ut |m b|pir| tu|uny| li|u e| ey| ro|thɛ|k t| we| wi|wic|tha|e t|i p|pan|oi |yii|enh|ën |ɛ̈ɛ|uc | ak|and|y b|lui|any| aw|eu | dh|bik|mit|ir |öun|u c|nyn|ynh|loi| ec|wen|n w|ɛt |y e| tö|tö |hök|̈ɛ̈|k c|eny| ya|kut|aku|e e| ko|leu|u y| ma|l e|thë| ew|u m|tic|tii|iek|i d|t t|nyo|den|höŋ|am |ɛ̈k| të|cɛ̈|ɛ̈n|awu|öt |n p|hëë| ed|bai|k y|t a|kic|eri|rin|tue|uee|i n|cii|cit|ooŋ|h t|a p|hoŋ|hai|i c| bɛ|nho|hom|om |̈k |hɛ̈|ö e| cö|öi |wuc|eyi|löi|k r|tik|yan|ëëk|ien|c n|eku|i a| ri| ga|gam",
    "kde": "na | na| va| wa|la |nu |a k| ku|a w|wa |ila|a v|chi| mu|unu|e n|mun|van|a m|a n|ya |le |ele|sa | ch|asa|amb|ana|was|lam|ave|mbo|ohe| vi|ne |bo |aka|e v| n’|u a|a u|u v|e m| li|ke |anu|vel|ve |ala|ake| pa|ile|hil|a l| av|ng’|ene|ing|he |ela|ili|ika|ngo|vil| di|any|uku|vak|wun|ali|a i|a a|mbe|uni|lan|ama|emb|bel|go |wak|nda| ma|e a|kuw|nya| mw|a d|den|lem|ola|mbi|kol| il|g’a|nji|ji |lil|ma |ulu|kan|a c|o v| au|au |dya|kuk|uwu|umi|’an|din|o l|kum|eng|lik|ong|ula|and|ane|no |ye |voh|an’|a p|lew|ach| ak|kal|mad|mwa|e w|n’n|nil|ilo|ale|va | lu|ond|hi |kut|ava|e k|wen|kul|o m| vy|hel|aya|ang| la|hin|apa| al|lin|ani|uko|ole|pan|uva|ewa| in|kam|ton|ndo|da |ka |ia |nan|dan|u l|we |lov|ove|o c|cho|u m|idy|dye|li |n’t|kav| dy|lel|ade|bi |u i|aha|e l|lim| ya| kw|tuk|hev|ni |und|nga|niw|i v|ata|dil|’ch|o n|mil|u n|eli|lia| an|kay| ul| um|hoh|uli|kwa| ly|umb|wav|uwa|ako|nje|mba|ba |val|hih|kil|mu |i w|yik|i n|hum|mwe|e u|uma|vya|she|’ma|pal| ka|ulo|lon|ino|anj|u c|wal|nde|iwa|mal|lek|e p|kuv|a y| ki|dol|imu|vyo|yoh|lun|ihu|vin|inj|awa|n’c|kup|a s| m’|e i|ima|e c|’ni|o u|jel|i l|i d|o a|mak|iku|lya|bil|ha |mah| vo|evo|awu|vav|yen|hap|lit|hon|i a|yac|uka|itu|ga |yak|ita|taw|utu|n’m|m’m|lu |una|atu",
    "snn": " ba|ye |bai| ye|ai |e b| ca|ai̱|ia |ji | ne| si|i̱ | go|goa|sia|i n|e c|a y|i y|̱ b| ja|se |aye|a b|i j|e g|jë |iye|re |oa |hua|yë |quë| gu|hue|u̱i|e̱ |gu̱|ne | ma|̱i |je̱|eo | hu|e s|bay| ña|ñe |o y|ja |ajë|to |aij|a i| ñe|deo|ayë| ji|ba |e j|i s| de| be|beo|cat|a ñ|mai|e e|bi | co| e |ña |uë |i g|ato|e ñ|i b| iy|eba|ë b|cha|na |e y|̱je| ts|coa|ja̱|reb| ti|ue |ach|e i| i |i t|i c|e t|oac|ni | re|a ë|a̱j|je |aiy|eoj|oji|oye| ë |cay|ë t|ija|ico| qu|ihu|a c| sa|ere|i d|ca |ua |iji|ahu| to| yë|a h| se|ë s|ase|aca|uai|ues| ai|ese|e d| tu|tut|utu|ë c|caj|asi|mac| na|e m|ti |cai|yeq|equ| i̱|a a|tu |yeb|ebi|ani|ë g|e n|eje|co̱|a m|ije|toy|oya|̱ t|sic|eoy| a |a t| te|eso|a s|ehu|haj|añe|i m|are| da|oas|cah| do|i r|e r|yer|o b|neñ|i i|ëay|huë|a g|jai|a j|ibë|ë y|aje| o | jë|tsi|ë d|aco|doi|oi |ë j|ëca|aja|a o|bëa|yij|aña|ari|sai|coc|oca|eñe|̱ g|cas|hay|ea |sos|jëa|̱ni| yi| me|si |ñes|yaj|teo|o h|co |ë m|dar|rib|uaj|o s|̱ c|ose|̱re|ëhu|nej|jab|osi|o̱u|̱uë|i h|ma |nij|̱ñe|e a|ama|a̱ |ë i|aqu|nes|uëc|ëco|i̱r|e o|i̱h|̱hu|ëja|oja|oe | je|go̱|o̱a|ta |tsë|sëc|cab|me |abë|o̱c|̱ca|ire|eye|̱ a| cu|tia|ñe̱|año|bë |ë r| ro|a d|sih| oi| bi|ñaj|ore|o c| ëj|ned|jay|tso|soe| yo|yo |jam|aih|seh|huo|o̱n|ohu",
    "kbp": "aa | pa| se|se |na |nɛ | nɛ| yɔ| wa|yʊ | ɛy|ɛ p|ɖɛ |a ɛ|aɖɛ|a w|ɛna|ɛwɛ|ala|yɛ |ɛ s|ɔɔ |ɛ ɛ|yɔɔ|paa| ɛ |e ɛ|ɩ ɛ|e p|ɛyʊ|aɣ | ɛw| pɩ|a p|waɖ|ʊʊ |a n|yɔ | ta|yaa|wɛn|yɩ |la |a a|ʊ w| tɔ|taa|ɔ p|ɛya| ɩ | kɩ|ɩyɛ|ʊ ɛ|a t|wɛɛ|a k|tɔm|ɔm |ɛ t|wal|ʊ n|ɛ n| wɛ| tɩ| ŋg|ɛ k|maɣ|zɩ |kpe|ɛ ɖ|ʊ t| an| pʊ|ɛ y|nɩ |ɩɣ | tʊ|ɛyɩ| pɔ|anɩ| we|a s|ɩ y|ɩ t| pɛ| ɛs|wɛ |pa |ɛɛ |ama|ya |gbɛ|kpa| nɔ|nɔɔ|ʊ y| kʊ|daa|pal|ɩ p|mɩy|ɩna|tʊ |ayɩ| ɛl|ʊ p| mb|ɔ s|ŋgb|ɔ ɛ|tɩ | ɖɩ|ɩma|ɩ n| ɛk|a y|mbʊ|bʊ |ɔɖɔ| kp|ʊ k| ɛj|ɛja|ɖɩ |ɩ ɖ|i ɛ|tʊm|alɩ|nda|ɩ s|paɣ|kɛ | ye| ɖɔ|ɣ ɛ|ɖɔ |ɛyɛ| ke|ɔɔy|fɛy| na|jaɖ| ya|kɩ |ɛla|lɩ |kɩm|yi |ɖɔɖ|aŋ |jɛy|bɛy|pee|ʊmɩ|ʊyʊ|ŋ p| fa|ɩ ɩ|lab|eyi| ñɩ|a l|ʊma|aʊ |a ɩ|ɩzɩ|ɛzɩ|sɔɔ|ekp|pe |ɔyʊ|pak|akp|laa|ʊ s|sɩ |ɩm |ɩsɩ|li |iya|kan|and|day|ɣ p|ɔyɔ|wey| lɛ|ɩfɛ|ɣtʊ| kɛ| sa|sam|ma | aj|ajɛ|ʊ ŋ|ɩ k| ɛt|ɔŋ |ɔɔl|ɔ k| ɖe|ɔ y| kɔ|sɩn|kul|uli| pe|pɩf|aɣt| ha|ndʊ| sɔ|eek|naa|yee|ee |ɣ s|abɩ|maŋ| ɖo|m n|akɩ|e e| la|ɖʊ |yaɣ|eki|a ñ|ɣna|maʊ|pɩz|ŋga|ga |m t|ŋgʊ| a |hal|le |dʊ |tɩŋ|ɖe |ɛ a|ɛɛn|lak|asɩ|ɛhɛ| ca|pɩs|ñɩm| ɛɖ|ba |pʊ | ɛd|aka|ɛsɩ|ñɩn| nʊ|nʊm| le|lɛ |ina|a m|ʊ ɖ|ɣ t|a ɖ| ɖa|ɛpɩ|zɩɣ|ana|dʊʊ|ked|gʊ |pad|ada|pɛw|alʊ|ɔ t|ɣzɩ|ɛkɛ|aɣz|e t|lɩm|bɩ |zaɣ|ɛ l| ɛp|zʊʊ|i p|e w|uu |ɩwɛ|ɛɛk|m p|aaa|pɩw|aba|ɛda|ɩlɩ|ɩkɛ",
    "tem": "yi | yi| ka| tə|a ʌ|uni|ni |wun| ɔ | aŋ| wu|ka | kə| kʌ| ʌŋ|nɛ |tək|kə | ʌm|əkə|ɔŋ | ɔw|mar|a k|ma |i k|wa | a |i t| mʌ|ɔwa|ri |thɔ| th| ma|ari|i m|a a|aŋ |ʌma| ba| o |tha| kɔ|ba |a y|‐e |ŋ k|ɔm | rʌ|kɔ |i ɔ|o w|lɔm|kom|ʌnɛ|mʌ |te | ŋa|i o|hɔf|ɔf |əm |ɔ b|alɔ|om |a m|aŋf|kəp|ɔ y|fəm|hal| mə|ʌth|a t| tʌ|ŋfə|a r|ŋ y| ʌt|ŋth|ŋa |ɔ k|e ɔ|ɛ t|th | ye|yem|ema| ro| gb|wan|ank| mɔ|nko|m a|kət|kʌm| sɔ|ʌwa|ɔ t|ʌmʌ|rʌw|anɛ|ʌŋ |hɔ |a ɔ|ʌte| bɛ|ʌŋt|ki |ʌme|me |m k|ar |m ʌ|əth|ŋ ɔ|yɛ |ɛ ʌ|i a|əpe|pet|et |thi|ŋe | ʌk| ta|ta |pa | ŋɔ|ŋɔŋ|i ʌ| te|ə k|ra |i r| yɔ|ʌ k|ɛ k|e a|kʌt| rə|rʌ |bɛ | yɛ|akə|thə|a‐e|ɔ ʌ|ɔ m|kəl|a w|əpa|ro |e t|ə b|yɔ |mɔ |ŋ t|ə t|bot| ak|e m| bo|ʌŋe|əŋ |m r|e y|ɛ a|gba|mʌs|ʌ a|wop|təm|nʌn|ŋ b|ələ|ləŋ|sɔŋ|ot |tʌt|kəs|ru | ko|ŋ a|ɛ ŋ|sɔt|ɔth|li |ath|ə y| ra|ə s|ʌse|sek|ekr|t k|gbʌ|e w| wo|tə |tɔŋ|ma‐|e k|ɛth| po|po |ʌrʌ|m ŋ|tʌŋ|ɛ m|m t|i y|ʌlə|ər |op |sɔ |hən|ɔkɔ|rʌr|ʌru|nth|ʌyi|ʌ ʌ| pə|əyi|gbə|rʌn|ŋgb|ʌkə|iki|ɔ a|ləs|f ʌ|hi |ɛ r|ənʌ|o ɔ| tɔ|ith|kar|ant|r k|mə |mʌy|rək|f t|bəl|əli|ʌy |nka|ʌ t|ɔ ɔ|yik| ʌr|əs |ti |ran|thʌ|mʌl|mɔŋ|eŋ |ʌgb|kʌs|ayi|lɔk|pan|pi | wa|kʌ |na |kʌr|mət| to|to |i‐e|tho|tət|mʌt|krʌ|thɛ|ɔ r|o t|ɛŋ |aŋk|ə g|bas|mʌn|ʌke|roŋ|oŋ |bʌp|ʌp |aŋe|əmʌ|nsh| ʌl|ʌlɔ|dɛr",
    "toi": " ku|a k|wa | mu|a m|la |ali|ya |tu |i a|a a|aku|e k|ula|ntu|ang| al|kwa|lim|lwa|aan|mun|mwi|de |ulu|ngu|wi |imw|gul|luk|na |ele| ak|kub|ons|unt|kul|oon| oo|nse|se |ant|gwa|zyi|si | ba|ba | lw|uli|ela|zya|a b| ci| zy|waa| ka| kw| an|and|ili|ala|uki|nyi|eel|uba|kid|ide| ma|kut|isi|kun|uny|i m|i k|cis|kuk| ul|ka |yin|li |nga| ya|a l|kus|laa|ina|wab|mul|wee|nte|tel|ila|nda|izy|led|ede| am|amb|ban|da |lil|ana|e a|kwe|we | bu|aka|bwa|o k|ukw|o a|ilw|bil|yan|ati|uci|awo|uko|ko |i b|bo |bul|amu|a c|mbu|law|wo |ti |kak|abi|e m|u o|akw|umi|u b|ale|sal|kuy| bw|bel|wak|ung|o l|asy|e u|ga |kal|lan|lo | mb|usa|a n|ule|ika|asi|aam|bi |kup|u k|muk|igw|egw|bun|u a|cit|mbi|aci|yi |ubu|kka|kum|wii|yig|mas|yo |a z| mi|ku |le |ene|ne | wa| ab|no |i c|a y|syo|abo|ukk|aya|uta|lem|mal|eya|ind|ndi|aba|kuc|len|o y| lu|mbo|uka|mo |lik|eka|ama|ita|mil|bal|syi|int|abu|mu |liz|u m|bam|zum|u z|yak|ta |nzy|upe|ndu| ca|ani|was|i n|uti|e b|cik|uum|nzi|ube|ley|lii|iib|iba|iin|kab|ezy|ile|iko|du |twa|lek|tal|alw|buk|azy|oba|u u|lwe|o m|imo| nk|uku|sya|umu|kwi|muc|min|zye| aa|i z|yik|kon|onz| nc|o c|gan| we|di |yoo|peg|mba|yee|mi |zil|usu|sum|ump|mpu|o n|uya|i o|a u|ano|end|nde|del|ngw|imb|e c| ng|zi |ako|pat|isy|kan",
    "est": "sel|ja | ja|se |le |ust|ste|use|ise|õig|mis|gus| va|ele|igu|te |us |st |dus| võ| õi| on|on |e j| in|ini|nim|ma |el |a v|iga|ist|al |ime|või|da |lik| te| ig|mes|adu|end|ami|l o|e v|e k| ka|est| ra| se| ko|iku|õi |vab|aba|tus|ese|a k|ud |l i| ku|lt |gal|tsi|es |ema|n õ|a i|ida|ks |lis|rah|atu|sta|ast|tam|s s|e t| mi|ta |val|stu|ga |ole|bad| pe| ta|ne |ine|nda|ell|a t|ava|ali|a p|ada|e s|ik |kus|ioo|ahe|tes|ing|lus|a s|a r|vah|a a|t k|kon| ol|ahv| ei|ei |tud|vas|as |is |kõi|t v|s k|sus|e e|i v|e a|eks|sio|oon|oni|s t|kul|mat| om|oma|e p| pi| ni|min|gi |dad|igi|tel|s v|aja|dse|uta|ndu|lle|vus|a j|aal|dam|e o|ni |ees|ete|tse|i t|ats|et |i s|lma|t i|its|sli|des|iel|pea|nin|dis|pid|e õ|ühi|nen|de |teg|lev|eva|nis|ilm|abi|võr|õrd|elt| kõ|ait|usl|ses|sed|tem|ab |ili|ng | ki| ne|ul | üh| ee| põ|ega|i m|sek| et|i k|ata| ab| vä|rds| sa|sil|ari|asu|s j|ad |töö|ots|ed |si | tä|eli| al|nni|nna|nud|põh| ri|s o| su|õik|aks|saa|imi|s p|rid|set|a o| so|hvu|koh|na |täi|eab|uma|e m| ke|a e|eis|e n|a ü| ül|onn|i e|s e|and|e r|isi|sik|emi|d k|ara|ade|rit|dum|mus|äär|een|lii|tum|umi| si|lem|ita|har|idu|kai|vad|hel|teo|sea|ead|sa |kor|kin|isk|nde| kä| mõ|rii|ale|üks|rat|mas|a n|sse| ve|etu|jal|ite| sü|asa",
    "snk": "an | a | na|na |a n| ga|ga |en | su|re |a a| ka|su |a k|a s| ta|un |ta |ma | se| i |ama|do |e s|ere|aan|ser| do|nan|nta|n s| ra| ma| ki| ja|jam| da|taq|a g|ne | ya|a d|n d|ri |ana| ku|u k|ren|ni | si| nt|n ŋ|ŋa |e k|wa |maa| ŋa|ndi|ane|aqu| ba|a r|ra |oro|tan|raa| sa| ke|n t|i s| xa|oxo|di |a f|a b|gan|and| be|aax|i k|ti |iri|aaw|awa| go|kit|ya |sir|ini|ara|a i|xo |axu|tta|a t|me | du|ran|gol|oll|e d|a j|on |n g|i a|be |a m|nde|aar|e m|ari|u n|lli|ron| ti| so|aad|n n|o a|axa|qu | fa| ña|a y|din|nu | ko|ke |lle|dan|man|sor|enm|xar|i g|ada|are| wa| no|baa|i t|u r|kuu|kan| ha|de |i n|xun| an|yi |o k|qun|i x|haa|dam|n k|att|da |o s|ang|fo | mo| re|nme|n y|i m|len| fo|u b|aba|kat|pa |li |ayi| fe|ant|e t|i d|o g|mox|kap|app|ppa| di|ure|e y|yan|a x|xa |u t|n b|ond|e n| xo|i i|xu |ind| me|anu|nga|n x|ell|iti|a ñ|u d|uud|udo|du |taa|aga|ye |itt|o b| yi|u a|anŋ|nun|nox|eye|n f|ku |ite| bo|dun|oor|ore|e b|ro | ro|saa|nma| mu|mun|ken|sar|riy|sel|ill|le |o n|tey|fed|edd| wu|bur|iin|aay|ka |ban|nen|u m|ira|te |ene|nmu| tu|faa|den|ina|inm|lla|la |o t|ña |o d| te|ñaa|o i|ono|xoo| ni|a w|u s| o |e g|bag|i r|sig|igi|ire| bi|kor|a h|und|no |gu |laa|iba|n ñ|i j|een|n w|xon|uur|yu |kaf|o m|kil|una|aqi",
    "cjk": " ku|a k|yi | ny|nyi|la |wa |a c| ci|a n|we | mu| ha|i k|nga|ga |a m|kul|uli|esw|sa |ana|ela|ung|ha |a h|tel|ze |swe| ka|a u|mwe| wa|ci |ate|kwa|mbu|ya | ya|ma |uci|han|kut|u m| mw|mut|nat|e m| ul|e k|uth|mu | ca| ma|aku|ang|lit|thu|na |ca |ka |nji|i m|pwa|hu |kup|wes|kan|ji |i n|e n|ina|asa|li |ali|mba|e a|a i|amb|ifu|fuc|ize| mb|anj|ing| kw|ita|bun|cip|uta|i u|muk|i c|awa|a y|naw|kus|imb| na| ak|lin|ila| ce|upw| an|ite|ta |ula|ong|ulu|esa|ba |wo |ukw|u c|ngu|lim|kha|a a|cif| xi|kuh| un|umw|nge|ulo|lem|emu|o k|umu|xim|kun|wik|aka|ala|ama|o m|has|mwi|ikh|tam| es|ule|uka|a w|o n|ku |lo |ipw|utu|imw|te |wil|aci|usa|i y| ng|ili|no |kum|ko | ye|kuk|bu |ufu|o w|e u|mo |pwe|cim|e c|ulw|yes|aze|ngi|swa|ciz|akw|uha|e h| mi|mil|imo|e w| in|lon|yum|eny|ika|o y|mbi|iku|so |e y|isa|lwi|kat|umb|tan| iz|e i| ja| li|aco|cik|nda|u k|i a|uze|was|a x|fun|uni|aha|o c|i h|wak|uma|nal|apw|a e|uso|wam|kwo|lum|una|co |o u|ngw|tum|kal|pem|ema|yul|nyu|lik|ile|zan|ata|sak|wen|kwe|le |wan|waz|umi|nin|iki| ik| uf|bi |ja |ces|gul| up|ge |tal|da | cy|ngo|go |o l|i w|cin|kuz|ges|man|i i|ele|aso|gik|hak|wac| if|mah|iso|hal|uvu| um|yoz|oze|cyu|and|mul|ise|kuc|cen|ne |kol| uk|lul|eka| ut|ikw|u i|mun| it|ipe|upu|vul",
    "ada": "mi |nɛ | nɔ| nɛ| e | he|he |nɔ | a |ɔ n| kɛ|kɛ |i k| ng|a n|aa |i n|e n| bl|blɔ|ɛ n|ɛ e|ngɛ|gɛ |e b|lɔ | ma| mi|ɛ h| ts| ko|hi |ɛ a| ɔ |ko |e h|tsu| ni|ɛɛ |ɔ k|a m|i h|ma |a k|emi| ny|ami|a h| be|be |i a|ya | si|e m|e j|ɛ m|si | ka|ɔ f| je|nya| kp|ni |loo|oo |o n| hi|laa|a b| fɛ|fɛɛ|a t|e k|je | pe| ye|mɛ |pee|umi|a a| ha|ɔ m|kpa|ɔ e|i t|ɔmi| wo|omi|ɛ ɔ|e s|ɔ h|i b|ke |ɛ k| lo|ha |bɔ |maa|mla|i m|ɔ t|ahi|e p|ɔ́ |kaa|o e| gb| sa|sum| na|nɔ́|lɔh|ɔhi|ɔ a|e ɔ|ee | ji|yem|e a|i s|ɛ s| ml| hɛ|sa |ɔɔ |alo|ɛ b| lɛ|u n|a s| bɔ| to| ku| jɔ|lɛ |i l|a j|sua|uaa|o k|ɛ y| ad|ade| su| fa|imi|ɛmi|eɔ | al|ne |des|esa|ihi|ɛ t|ɛ j|ake|ji |a e|jɔm|e e|o a|kak|eem|e y|ngɔ|i j| ke|ane|e g|ia |ɔ y| ya| bu|him|suɔ|mah|tom|o b|e w|́ k|wo |wom| we|san|ba |gba| gu|hia| bi|suo|uo | hu| tu|ue |pa |e t|uu |o m|e f|ɔ s| ja|tsɔ|gɔ |a p|kuu|ɛ p|ɛ g| ab|a l| sɔ|sɔs|isi|jam|ɔ b|ye |fa |hu |tue|na |hɛɛ|i ɔ|a w|abɔ|ɔsɔ| hl|hla|sis|gu |li |a y|ɔ l| ba|uɔ |sɔɔ|o h| ju|ɛ w|ti | kɔ|nyu|asa|i w|pe |sɛ |kpe|sɔɛ|ɔɛ |yɛm|o s| nu|to |pak|akp| ɔm|ɔmɛ|u ɔ| yi|uɛ |kpɛ|pɛt|ɛti|a g| wa|o j| sɛ|ɔ w|hɛ |nih| mɛ|e l|sem|su |se |u k| pu|guɛ|kul|ula|lam|eeɔ|le |we |naa|uam| yo|yo |bi |hiɔ| fi|nyɛ| fɔ|kas|ase|bim|imɛ|usu|i p| ní|níh|íhi",
    "quy": "chi|nch|hik|una| ka|anc|kun|man|ana|aq |cha|aku|pas|as |sqa|paq|nan|qa |apa|kan|ikp|ik |ech|spa| de|pa |am |der|ere|rec|cho| ru|an | ch|kpa|asq| ma|ta |na |nam|nak|taq|a k|qan|ina|run|ach|lli|nap|pi |mi |yoq| ll|ima|asp|hay|hin|nku|aqa|ant|oyo|ayn|hoy| im| hi|cio|nta|q k|iw |api|wan|nas|kuy|liw|kay|aci|ion|ipa|lla|oq |npa|kas|ay | na|nac|a m|ari|all|ama|inc| ya| hu|anp|i k|pip|chu|nin|qmi|hon|w r|awa|a c|ata|in |ota|yku| wa|yna|has|iku|a d|a h|a l| li|ich|may| ha| pi|onc|pan|a r| qa|ku |onk| ot|ank|a p|qta|aqm| mu|mun|n h|anm|nma|hu |pap|isq|yni|ikm|ma |kaw|aws|wsa|lib|ibr|bre|nqa| al|lin|n k|ayk|usp|e k|nat|yta|yac|war|ara|kma|chw|hwa| sa|huk|was|kus|uwa|re |q m|m d|yan|a i|kin|kpi|q l|tap|a a|ikt|kta| re| ca|ask| tu|uku|uy |qaw|aqt|i c|a s|ris|qsi|cas|tin|q h|ski|uch|sak|sic|pak|a y|s l|nmi|mpa|tuk|k c|q d|naq|ypi|pun|ien|a q|req|eqs|ayt|aqp|qpa|uma| am|ayp|n c|q c|i h|haw|qaq|law|qap| ni|ruw|anq|yma|tar|aya|n r|huñ|uñu|ñun|s m| pa|amp|par|k h| le|nni|map|ern|sun|isu| ri|u l|k l|n p|a t|ten|say|esq|arm|igu|rim|n a|qku|naw|s y|ura|s c|aru|qar|oqm|w n|ley|ita|onn|awk| va|val|his|a f|rma|s o|ier|s i|nya|nit|ici|sti|kac|m r|i r|uyk| pe|ya |isp|qay|nti|ene|hak| ig|gua|ual|lap|m m|ast",
    "rmn": "aj |en | te|te | sa| le|aka|pen| e | si|el |ipe|si |kaj|sar| th|and| o |sav|qe |les| ma|es | ha|j t|hak|ja |ar |ave| an|a s|ta |i l|ia | aj|nas|ne | so|esq|sqe|imn|mna|nd |tha|haj|e t|e s|e a|asq|enq|man|kan|e m| ja| i |the| ta|mes|cia|bar|o s|utn|as |qo |hem|isa|kas|s s|ark| na|i t|vel| me|est| ba|s h|rka| pe| bi|ard|avo| di|ika|lo | ak|a a|e r|qi |e p| pr|e k|a t|ima|mat|anu|nuś|r s|o t|n s|e d| av|orr| ka|n a| re|re |avi|o a|sqo|e o|aja|sti|l p|d o|õl |vor| ov|nqe|ere|so |dik|no |n t|ove|e b|rel|ve |but|rre|len|ari|àci| pa|ren|ali|de | de|res|o m|tim|i a|ana|ara|sqi|ver|vip| va|rip|e z| ra|rak|akh|rim|i s|a e|e l|eme|vi |ker|ang|or |ata|na |o p|ane|ste|kar|rin|la |a p|e h|j b|tne|er |ni |nip|ti | ke|ind|r t| ph|khi| bu|e n|uśi|l a| je|kon|are|ndo|aća|ćar|rab|aba|dõl| zi|śik|àlo|o k|on |al |ano|lim| śa|śaj| ko|tar|jek|ekh| ni|ven|rde|khe|dor|ri |ća |som| po|uti|i p|ikh|a l|mut|tni|j s|ast|n n| pu|uni|naś|l s|a m|i d|enć|nća|kh |erd|kri|ris|ndi|nik|nge|o b|rdõ|pes|del|j m|soc|śka|emu|ani|nda|o z|do |j p|alo|amu|uj |pe |e e|nis|men|ala|a d|aśt|śti|tis|ate|o j|hin|ran|nqo|i b|ro |cie| vi|ziv|khl| as|oci|maś|aśk|ing|da |l o|i r|rdo|pal|rea|mam|muj|j e|pri|kla|l t|a j| ze|zen| st|śa ",
    "bin": "e o|ne | ne|be |an |en |vbe| o |n n|mwa|wan|e e|emw|evb|mwe|in |na |e n| em| na|e a|omw|n e|e i| vb| ke|re |gha|gbe|wen|ie | gh|wee| om|e u| kh| ir|bo |hia|ha |o k|tin|nmw|n o|vbo|he |ia |eti| we| ev|kev| et|win|ke |ee |o n| hi|a n|a r|o r|gie|ran|ira| ya|mwi|a m|a g|ghe| mw|eke| re| a | og|ogh| uh|n k| no|ro |ye |khe|hek| ye|nog|ogi|een|a k|unm|rri|ya |egb|ere| mi|mie|de |hun|mwu|wun|a e| rr| ar|a o|n y|e v|ra |un |o g| gb|uhu| ok| ot|ien|e k|a v|n i|rhi|a y|khi|n a|i n| ru|e y|u a|n m|oto|ovb|ian|hie|arr|ba |ru | eg| ra|o m|hi |kpa|e w|and|nde|yan|to | ni|o e|o h|we |n h|on |e r|hae|dom|n g|ugb| iy| rh| er| ik|ene|se |aro|ben| or|ren|n w|rue|a i|rio|iko|o y|u e|aen| do| ov|ehe|i k|uem|kug|okp|iob|oba|otu| uw|o o|a u| ma| ug|ue | iw|n v|rie|ae |iru|rro|tu |wu |ugi|ma |ugh|ze | al| eb|inn|nna|o w|gho|agb|pa |iye| ay|aya|uwu|khu|onm|a w| se|rre|ho |yi |gba|nii|ii |aku|gbo|hin| um|umw|mwo|won| ek|obo|bie|ebe|e d|iwi| la|uhi|da |beh| uy|uyi|ai | ag|ode| ak| i |i r|o v|u o|bon|a a|egh| eh|eem| kp|irr| ow|owa|o a|ghi|a d|i e| bi|mo |ieg|n u|kha|yin|oda|yen|kom|aan|anm|a t|nre|kho| az|aze|a h|a b|oro|lug|wa |mu | ku| yi|ese|vbi|bi |enr|e g| as|gue|ero| ka|hoe|oe |n r|lel|ele|le |aa | od",
    "gaa": "mɔ | ni|ni |kɛ |ɛ a| ak|lɛ |i a|ɛ m| he|akɛ| lɛ| ko|gbɛ|ɔ n| mɔ|ɛɛ | kɛ|yɛ |li |ɛ e|ko |ɔ k|i e|aa | yɛ|bɛ | ml|shi|ɛ h|egb|mli| gb|ɔɔ | fɛ|fɛɛ|nɔ |heg|a a|aŋ |oo |i n| nɔ|i k|he |ɛ n| am| es|ɔ y| sh|ɛ k| ma|ji |esa|loo|amɛ|maŋ|emɔ|ɔ f| al| ek|fee|ɛi |ɔ m|ii |bɔ |e n|ɔ a|alo|amɔ|ɔ l| eh|naa|hi |ɔmɔ|ee | en|kon|oni|o n|i m|aji|i y|sa |o a| hu| bɔ|yel|eli|umɔ|hu |tsu| ah|eem| nɛ|nɛɛ|o e|mɛi| an|nii|sum|tsɔ|baa|yɔɔ| as|gbɔ|i h|na |eye|aaa|ɛ g|eɔ |ana|ɛji|ena|eko| at|ŋ n|ɔ e| ts|o h|i s|i l|maj|kom|kwɛ|a l|ome| kp|ku |efe|kɛj|bɔm|a n| sa|ha |a m|ehe|toi|saa|kpa| ku|hew|ane|gba| mɛ|i f| na|e e| hi|hiɛ|san|ne | ej| ay|e a|aka|its| ey|ye |e k|mla| kr|ɛ t|hey|ash| je|ats|ŋ k|bɛi|iaŋ| ab|a e|ɔ b|a h|ɛ y|anɔ|nit| af|ɛ b|kro|jeŋ|eŋm|ŋmɔ|ɛ s|aan|any|esh|shw| et|ets|ɔ g|ŋŋ |a k|ekɛ|usu|suɔ|uɔ |iɔ |oko|i j|ŋma|u l|o k| ba| yɔ|ewɔ|wɔ |ŋ a|hwe|mɔɔ| ad|la | ag|agb|o s|aye|ŋ h|tsɛ|sɛ |ehi|ɛ j| ji|ai | aw|afe|rok| to| bɛ|e s| yi|oi |aŋm|ish|o m|nyɛ| ef|ɔ h|jɛ |ahe|eni|ŋmɛ|e b| ny|akw|sɔ | ja|mɛb|bii|hik| di|diɛ|iɛŋ|ɛŋt|ŋts|eŋ |awo|aha|ate|paŋ|his|u k| lo|o y|i b|alɛ|kɛn|asa|saŋ|ŋ m|u n|me |nyɔ| eg|ade|des| su| eb|ɔ j|wɛ |ɔ s|teŋ|jia|sem|yeɔ|mef|ɛ l|o l|wal|ɛni| aj|e g|sus|u e|hih|ihi|hil|ilɛ|ɛŋ |ɔŋ ",
    "ndo": "na |oku|wa | na|a o|a n|ntu|ka | uu|tu |uth| om|e o|mba|ong|omu|ba | ok|uut| ne|he |the|ang|hem|emb|unt|o o| wo|a u|nge|kal|ehe| iy| no|a w|o n|no |e n|nga|mun|ko |lo |oka|lon|o i|we |ulu|a m| ke|ala|la |a k|u n|gwa|ku |han|osh|shi|ana|ngu|ilo|ngo|keh|ano|nen| mo|ga |man|ge |ho |tha|gul|luk|u k|eng|a y|ha |elo|a e|uko|ye |li |hil|uka|wan|ath|go |thi|uun|dhi|wo | pa| ta|kwa| sh|ya |a p|lwa|nka| ko|mwe| os|ta |oma|ema|sho| ka|e m|wok|o w| yo|ika|po |sha|e p|pan|ith|onk|a i|hik|gel|opa|hi |aan|iya|le |o e|una|a a|kuk|nok|alo|o g|ndj|a s| li|yom|men|i n|waa|a t|pam|gam|umb|lat|yuu|ond|ame|o k|and|aka|kan|ash| po|aa |ele|ilw|ing|kul|ane| gw|mon|o y|iil|igw|olo|gan|amw|nin|ike|o m|adh|oko| ye| ku| el|iyo|kut| on|a g|aye|yeh|eko|ne |mbo|lyo|ome| ng|opo| ga|kug| yi|yok| go|iye|wom|eho|him|i k| dh| a |wen|ene| oy|ulo| we| e |e e|non|omo|mok|ina| me|und|ndu|ant|wat|e g|ila|kat|alu|oye|yop|ngw| op|nek|ota|ima|ela|o u|o l| ly|epa|yon| th|taa| ay|iyu|meh|pok|dho|omb|ili|uki| wu| ni|pau|uni|a l| ii|i m|mo |ke |e t|oon|eta|enw|ekw|lwe| mb|nom|aku|yaa|okw|ula|yi | nd|o a|yo |kom|lun|lol|ola|a h|nwa|hok|ono|bo |i o|naw|awa|ank|u t|ndo|o s|lak|nem|aal|pwa|ukw|djo|ali|ung|mit|udh|kun|kil|e k|i t|vet"
  },
  "Cyrillic": {
    "rus": " пр| и |рав|ств| на|пра|го |ени|ове|во |ани| ка|ть | по| в | об|ия |лов| св|сво|на | че|о н|ело|ост| со|чел|ие |ого|ния|ет |ест|аво|ажд|ый | им|век|ние| не|льн|име|ова|ли |ать|т п|при|каж|и п| ра|или|обо|жды| до|ых |дый|ек |воб|бод|й ч|его|ва |ся |и и|мее|еет|но |и с|аци|ии |тва|ой |лен|то | ил|ных|к и|енн|ми |тво| бы| за|ию | вс|аль|о с|ом |о п|о в|и н|ван|сто|их |ьно|нов|ног|и в|про|ако|сти|ий |и о|бра|пол|ое |дол|олж|тор| во|раз|ти |я и|я в| ос|ным|нос|жен|все|и р| ег|не |ред|тел|ель|ей |сно|оди|о и|а и|чес|общ|тве|щес| ко|ним|има|как| ли| де|шен|нно|е д|пре|осу| от|тьс|ься|вле|нны|аст|осн|а с|одн|ран|бще|лжн|быт|ыть|сов|нию| ст|сту|ват|рес|е в|оль|ном|чен|иче| ни|ак |ым |что|стр|ден|туп|ду |а о|ля |зов|ежд|нар|род|е и| то|ны |вен|м и|рин|нац|вер|оже|ую | чт|она|обр|ь в|й и| ме|аро|ото|лич|нии|бес|есп|я п|х и|о б|ем |е м| мо|дос|ьны|тоя|еоб|ая | вы| ре|и к|кот|ное|под| та|жно|ста| го|гос|суд|ам |ава|я н| к |ав |авн|ход|льс|нст| бе|ово|и д|ели| дл|для|ной|вов|ами|ате|оро|дно|ен |печ|ече|ка |еск|ве |уще|в к|нен|мож|уда|о д|ю и|ции|ког|вно|оду|жде|и б|тра|сре|дст|от |ьст|е п|нал|пос|о о|вны|сем|азо|тер|соц|оци|циа|ь п|олн|так|кон|ите|обе|изн| др|дру|дов|е о| эт|х п|ни |еди|дин|му ",
    "ukr": "на | пр| і |пра|рав| на|ння|ня | за|ого| по|го |ти |люд| лю|во | ко| ма|юди|льн|их |аво|о н| не|анн|дин| св|сво|кож|ожн|пов|енн|жна| до|ати|ина|ає |а л|ува|не | бу|обо|аці|має| як| ос| ви|є п| та|аль|або|них|ні |ть | ві|ови| аб|бо |а м|ере|і п|без|вин|при|о п|ног|іль|ми |ом |та |ою | бе|ста|воб|бод|до |ост|ті | в | об|ва |о в| що|ий |ся | сп|і с|від|нов|кон|и п|ств|инн|нан|ван| у |дно|она|ват|езп|пер|но |ій | де|ії |ідн|и і|сті|під|ист|нні|ако|ьно| мо|бут|ути|ід |род|і в|що |ава|тис|а з|вно|ну |и с|ої |і д|ду |а в|ів |аро| пе|ний|а п|му |соб|яко|спр|і н| рі|рів|чи |ним|ля |нар|лен| ін|у в|нен|ому|нац|ися|и д|ова|ав |і р| ст|ові|нос| пі|ють|сть|ово|про|одн|у п|віл|овн|вни| ро| її|її | вс|ном|і з| ра| су|мож|чен|ві |буд|іст|івн|оду|а о|ни |сно|ими|а с| со|ьни|роз|и з|зна|я і|о д|х п|е п|о с|и в|дер|ерж|им |чин|рац|ції|і б| од|а н|сі |сту|тер|ніх|ди |їх |нна|так|о з|я н|заб|зпе|у с|спі| ні|е б|ржа|осо|я п|в і|кла|то |а б|осн|рим|сві|віт| дл|для|тва|ами|зах|рес| ре|ков|тор|соц|оці|ціа|і м|ки |тан|абе|печ|ког|ага|гал|ту |ї о|е м|оже|же |удь|ніс|ара|руч|авн|и щ|ною|я в|всі|кої|ини|ь п|осв|і і|ахи|хис|іал|а і|оди|тво|жен|нь |нал|ваг|аги|ги |інш|лив|х в|заг|роб|піл|в я|ком|об |о у|жав|і о",
    "bos": " пр| и |рав| на|пра|на |да |ма |има| св|а с|а п| да| по|а и|је |во |ко |ва | у |ако|о и|но | за|е с| им|аво|ти |сва|ава|о н|и п|ли |или|и с|вак|ост| ко|их |не |а у| сл|вањ| не| др|ње |кој|ије|ња |и д| би|ств|им |у с|јед| ил|сло|лоб|обо|бод| је| ра|при|ање|вје| об|а д|ом |се | су|е и|ју | се|сти|и и|а б|дру| ос|е п|вој|циј|у п|о д|а о|раз|су |ања|а н|ује|ова|у и| од|и у|ло |едн|ни |у о|ово|аци|ити|о п|а к|оје|жав|нос|дје|е о|бра|пре|шти|а ј|про|и о| ка|них|бит| тр|тре| бу|буд|у з|ог |ста|ја |држ|ржа|е д|миј|сво|реб|авн|ија|и н|е б|ђи |пос|ту |аро|род|ред| ње|ба |а з|ка |де |ем |ају|ива|ве |е у|јер|бил|ило| из|ени|ду | до|а т|за |еђу|нар|тва|одн|њег|гов| са|ним|м и|вим| ни|у д|јел|о к|оји| см|дна|уђи| ст|алн|ист|и м|еба|ран|ичн|вно| дј|у н|ода|нак|е к|ан |нов|сно|сту|нст|ено|чно|ани|ном|е н|тив|нац|аве|и б|сми|чов|овј|осн|а р|нап|ови|анс|дно|оја|ног|м с|еди|ара|ој |ну |кри| кр|оду|ико|рад|ник|туп| чо|јек|тво| вј| ми|тељ|обр|жив|заш|ашт|тит|уна|его|под|сам|о о|руг|ји | мо|ву | ов|х п|уду|рив|ење|дст|те | те|а ч|вни|сви|и в|ина|и т|ра |ите|у у|иту|међ|ак |дни|ниц|њу |нич|одр|вољ|ави|г п| оп| та|рим|кла|е т|ао | вр|акв|тно|мје|дуђ|она|ада|сто|оби|едс|то |оди|о с|ку |риј|у м|од |ичк|вен",
    "srp": " пр| и |рав|пра| на|на |ма | по| св|да |има|а п|а и|во |ко |ва |ти |и п|ако| у |а с| да|аво|ост|и с| за|о и|сва| им|вак|је |е с|ава| сл|о н| ко|ња |ом |но | не|не |ли |у с| др|или|сло|обо|кој|их |лоб|бод|им |а н|сти|ств|а о|ју | ил| би|при|а у| ра| је|ог |јед|ње |е п|у п|ни |а д|и у|едн|ити|нос|а к|о д|ање|ова|про| су|и и| ос|вањ|ста|дру|е и|циј|се |род| об|и о|ања|ају|е о|ове| де|аци| ка|ово|ја | ни| од|ве | се|и д| ст|м и|авн|и н|ује|ени|ија|дна|жав|у и|ред|су |нов|оди|вој|тва|е б|оја|што|у о|ара|а б|држ|ржа|одн|ним|ран|пош|ошт|а ј|ка | ов|у у|ду |аве|осн|сно|шти|аро|раз|бит|а з|у з|ења|де | из|них|о п|у д|е д|пре|ву | тр|ту |еђу|нар|гов|без|ичн|за |вно|ло |у н|оји| са|то |ан |нак| ме| ње|чно|сво|вим|нац|ода|ји |ани|ме |ико|ник|ика|е к|пос| кр|тре|реб|нст|сту|е у|ку | до|ашт|тит|алн|дно|њег|ном|ног|м с| вр|о к|ој |чов|анс|ови|о с|бра|те |тав|туп|ено|жив|заш|ем |и м|дни|вар|рив|руг|вољ|ави|штв|е н|као|ао | ли|ст |ило|њу |сме|о ј| см| чо|оду|вре|дст|од |а т|кри| бу|буд|и в| ве|вер|а р|дел|тво|међ|оје|м п|ављ|его|под|ена|уги|ла |пор| оп|руш|ушт|ком|еди|ба |кла| мо|и б|как|акв|рад|ну |век|рим|гла|јућ|уде|вни|еба|е р|сви|м н|иту|тер|ист|а ч|пот|рем|ниц|у в|х п|ива|сам|о о| он|езб|збе",
    "uzn": "лар|ан |га |ар | ва| би|да |ва |ир | ҳу|ига|уқу|бир|ҳуқ|қуқ|ган| ҳа|ини|нг |р б|иш |ни | та|лик|инг|ида|а э|или|лиш|ари|нин|иши| ин|инс|он |ади|нсо|сон|ий |лан| ма|дир|кин|и б|ши | бў|ҳар|бўл| му|уқи|дан|ила|қиг|р и|қла| эг|эга| ўз|а б| эр|эрк|кла|қил|оли|ки |гад| ол|нли|лга|и ҳ|рки|лиг|иги| қа| ёк|ёки|иб |н м| ба| қи|н б|ри |ара|атл| бо|ҳам|лат|бил|ин |р ҳ|а т|ала|лаш|бош|ик |инл| эт|ш ҳ|а ҳ|и в|ниш|тла|эти|тил|мас|а қ|и м|оси|им |ат |уқл|арн|рни|қар|ани|а и|ўли|ги | да|н ҳ|риш|мла|ли |и т| ха|арч|рча|ча |бар|аси|ўз |а а|рла| бу|а м|лин|ати|ият|либ|таъ| ту| ас|тиб|аро|а о|ун |тга|р в|икл| бе|мум|н қ|али| те|сид|ш в|мат|амд|мда| ке|лла|шга|н э|дам|амл|хал|ола| қо|ири|ирл|илл|а ш|рга|иро| шу|тиш| де|умк|мки| эъ|тен|енг|а ў|рда| са|гин|имо|тар|а ё|ур |рак|алқ| ки|аза|к б|ода|сий|а к|тни|ўлг|н в|нда|шқа|зар|н о|и қ| ми|мил|р т| си|ак | ша|ор |кат|ера|сиз|ам |асо|сос|н ў|шла|н т|нид|ошқ|й т|ана|ти |рин|асл|бу |син|дав|илг| со|ас |нга|лак|ино|ъти|муҳ|а в|аш |бор|лим|уни|лли|н и|си |и э| ка| то|а д| жа|ами|қон|на |риг|лма|кер|авл|вла|и а|дек|екл|ят |ака| эм|эма|эът| ҳе|ҳеч|еч |ким|икд|кда|сит|лад|и ў| ни|ник|ага|и о|и с| уч|учу|чун|аъл|ъли|анл|аёт| иш|а у|ўзи|диг|ай |ада|оий|мия|тда|а с",
    "azj": " вә|вә |әр |лар| һә|ин |ир | ол| һү|һүг|үгу| би|гуг|на |ләр|дә |һәр| шә|бир|ан |лик| тә|р б|мал|лма|асы|ини|р һ|ән |шәх|әхс|гла|ары|а м|дир|али|аг |угу| ма|илә|ын |уна|јәт| ја|ара|икд|ар |әри|әси|р ш|рин|әти|дән|нин|н һ| аз|јјә|син| мү|тин|ни |зад|ијј| мә|әрә|мәк|үн |нда|әт |и в|ыны|нын|ндә|ә а|аза|рын|гун|олу| ет| га|лыг|илм|кди|лә |ә ј|әк |лмә|ына|инд|олм| ин|хс |мас|сын|лун|ә б|да |н т|әми| бә|адл|длы|н м|нә |г в|ја |тмә|бәр| он|ә һ|әја|сы |нун|етм|дан|инә|маг|ун |раг|ә в| ва|н а|н б|рлә|ә м|си |әра|н и|ынд| өз|аны|нма|инс|ама|ры |ығы|ли |ил | ал|ала| ди|ә д|ик |ирл|ләт|а б|бил|ыг |мүд| сә|ә и|ны |нла|әлә|дил|алы|ә е|унм|н в|ола|аси|үда|или| дә|нса|сан|угл|ә о|хси| һе|уг |әтл|һәм|әни|ејн|у в| да|тәр|мин|јин|кил|дыр| бу|лан|иш | һа|мәс| ки|ми |лығ|ә г|г һ|и с|даф|афи|фиә|р в| иш| әс|сос|оси|сиа|хал|алг| та| ас| ед|бу |һеч|еч |рә |јан|ы һ|ким|ији|ы о|ина|сиј|әса|сас|а г|јар|лы |түн| ис|ист| со|ал |н ә|ифа|әмә|ә т|мил|илл|лыд|ыды|ыр |әдә|ыгл|лиј|тлә|а һ|мәз| бү|бүт|үтү|ија|иә | үч|үчү|чүн|т в|дах|ахи|хил|р а|ылы|ман|сил| се|сеч|адә|иал|ону|өз | ҹә|миј|әји|н е|еди| ми| нә|а в|мән|рил|әз |илд|раб|абә|шәр|ғын|аја|зам| ни|улм| ха|тәһ|әһс|һси|и һ|сти|гу |вар|ад |там|уғу|з һ|ган|рәф|н д",
    "koi": "ны |ӧн | бы|да | пр|пра|лӧн| мо|рав| да|быд|лӧ |орт|мор|ӧм |аво|ӧй | ве|нӧй|ыд |ыс | не|сӧ |ын |тӧм|во |сь |эз |льн|ьнӧ|тны| ас|д м|ыны|м п| и |сьӧ| по| ӧт|то |бы | эм| кы|тлӧ|эм | от|аль|н э|вер|ртл| кӧ|ӧ в| ко|ерм|ств|воэ| до|тшӧ|ола|ылӧ|вол|ӧс |ы с|ліс|ісь|а с|ас |кыт|тво|кӧр| се|нет|ето|шӧм|ӧдн| ме|мед| ол|злӧ| вы|ӧ д|ӧ к|та |аци|ӧ б|вны|лас| на|з в|ӧрт| во|на |а в|ась|ыдӧ| сы|едб|дбы| вӧ|лан|рмӧ| оз|оз | сі|ытш|оэз|ӧтл|ы а|оти|тир|с о|олӧ| чу|ись| эт|ция|рты|тыс|ы б|кол|ы п| го|сет|кӧт|тӧг|ост|тӧн|н б| со| сь|рті|ӧтн|н н|дз | ке|кер|о с|мӧ |ӧ м| мы|ис |а д|ӧг |дӧс|ест|нӧ |пон|онд|ы н|сис|нац|итӧ|н п|суд| уд|удж|выл| ви|эта|н м| эз|ана|ӧны|с с|ть |орй|йын|сси|рре|рез|ьӧр|ті |сыл|ысл|нда|мӧд|з к|а п|с д|ӧр |чук|укӧ|рны|ӧмӧ|кин|рт |овн|ӧт |она|нал| об|ӧ о|отс|лӧт|й о| тӧ|тӧд|дны|асс|кон|слӧ|ы д|скӧ|с в|с м|ытӧ|езл| ло|быт|осу|эзл|кӧд| ум|умӧ|мӧл|ӧ п|асл|тра| ст|ь м|сьн|ьны|ь к| ов|код|сть|а н|ы к|тла|а к|ӧтч|дор|иал|а о| пы|н к|оль| за|аса| дз|нек|а м|н о|етӧ|ӧ н|ерн| сэ|ы м| де| чт|что|йӧ |ы ч|еки|поз|озь|езӧ|вес|ськ|исӧ|ӧтк|тко|рйӧ|ион|ннё|з д|ӧмы|тсӧ|са |кыд|енн|соц|оци|циа|й д|пыр|зын|нӧя|ӧя |зак|ако| мӧ| а |еск|а б|ан |тӧ |гос|уда|дар|арс|рст|рлӧ|ӧ с| ли|эсӧ|оля|мӧс|ӧсь|дек",
    "bel": " і | пр|пра|ава| на|на | па|рав|ць |ны |або|ва | аб|ацы|ае |аве| ча|анн|льн|ння| ма| св|ала|сва|не |чал|лав|ня |ых |ай |га | як|век|е п| ад|а н| не| ко|ага|пры|кож|ожн|а п| за|жны|ы ч|дна|бод|а а|цца|ца |ваб| ў |мае|ек |і п|ных|нне|пав|а с|асц|бо |ам |ста| са|ьна|ван| вы|одн|го |аць|наг|він| да|дзе|ара|мі |цыя|оўн|тва| ра|і а|то |ад |ств|аві|лен| ас|і с|най|аль|енн|і н|ці |аро|аво|рац|сці|пад|к м| яг|яго|іх |ама| бы|рым|род|і і|ым |энн|што| та|я а|нан|ана|нас| дз|ні | гэ|гэт|а ў|інн|а б|ыць|чын|да |оў | шт|ыі |а і|агу|які|ным|дзя|я п|цыі|і д|ьны|нар| у |ўна|оль| ўс|х п|нац|ыя |ах | ус|ымі|ля |амі|ыма| ні| гр|воў|ў і|адз|эта|іна|ход|о п| ка| ін|ы п|зна|нен|аба|быц|рад|ўле|чэн|ь с|чы |сам| ст|асн|і р|ду |аў |ера|ры |нал|жна|уль|рам| су|аны|кла|аюч|ючы|оду|ую |а р|ўны|маю|ука|кац| дл|для|ь у|пер|е і|нае|ако|і з|гра|адс|ыцц|яўл|і ў|яко|а з|кан| ро|роў|нст| шл|адн|ода|аса|аду|нав|вы |ы і| пе|і м|кі |але|х і|авя|алі|раб|мад|дст|жыц|раз|зе |нна|ані|х н|е м|ада|нні|ы ў|о н|дзі|я я|люб|аюц|бар|дук|ахо|а в|сац|авы|так|я ў|тан|зак|чна|заб|бес|я і|ваг|гул|ім |ган|зяр|ярж|ржа|жав|ве |е а|м п|ацц|од |ены| дэ|ну |у ш|нах|вол|а т|ога|о с| бе|інш|ака|усе|яна|ека|ка |сно|рас| рэ|ь п|ніч|чац|се |і к",
    "bul": " на|на | пр|то | и |рав|да | да|пра|а с|ва |ств|та |а п|ите|но |во |ени|а н|е н| за|о и|ото|ван| вс|не |ки |те | не|ове|о н| по|а и|ава|чов|ия |ане|ни | чо|ие |аво| св| об|а д|е п|век|ест|сво| им|има|и ч|ани|ост|и д|ние|все|тво|или|ли |и с|вот|а в|ма | ра|ват|и п|сек|еки|ек |а о|и н| в |е и| ил|ова|при| се|ето|ата|аци|воб|обо|бод|к и|пре|ат |оди|раз| съ| ос|а б| бъ|ред| ка| ко|лно|ния|о д|бъд|о п|се | от|за |о в|ъде|ята| е | тр|и и|о с|тел|и в|от |ран|е с|нит| де|ка |бра|ен |общ|де |алн|и о|ява|ият|ция|про| до|нег|его|а т|нов|ден|как|ато|ст | из|а ч|тря|ряб|ябв|бва|а р|а к|вен|о о|щес|а з|ено|гов|тве|нац|дър|ърж|ржа|е д|нос|лен|ежд|род|е о|и з|вит| та|зи |акв|ез |она|обр|нар|нот|иче|о т| ни|кат|т с| с |йст|авн| бе|осн|сно|вни|пол|рес|аро|кой|зак|е в|тва|нен|е т|ува| ли|ейс|жав|едв|стр| ст|без|вси|сич|ичк|чки|вид|си |жен|под|еоб|нст| те|ди |ри |сто|ган| дъ|а е|и к| че|ода| ср|сре|ака|чес|и р|и м|т н|одн|о р|лич|елн| ре|бще|ник|ели|че |дви|еме|ира|жда|кри|лни| си|са | то|ой | ме|оет|гра|ход|дру|ичн|еди|дос|ста|дей|я н| къ|ан |ико|чре|й н|ави|нал|пос|тъп|ра |азо|зов|рез|той| со|меж|тно|т в|и у|нет|нич|кон|клю|люч|нео|чит|ита|а у|а м|дно|оят|елс|лит|ине|таз|ази| мо|що |т и|изв|тви|чен",
    "kaz": "ен |не | құ|тар|ұқы| ба| қа|ға |ада|дам|құқ|ық | ад| бо|ына|ықт|қта| жә|ар |ың |ылы|жән|әне|мен| не|лық|на |р а|де |ін |ары|а қ| жа|ан | әр|қыл|ала|ара| ме|уға|н қ|еме|ның| де|іне|ам |асы|тан|лы |әр |да |ста|нды|еке|ығы| өз|ған|анд|ын | бі|мес| қо|бол|бас|ің |ды |етт|ып |ілі|н б|нде|ері|е қ|қық|бір|лар|алы|нем|есе|се |а ж|ы б| ке|тын| ар|е б|бар|ге |ост| ти|тиі|олы|ік |інд| та|аты|сы |е а|дық| бе|ы т|нда| те|ры |ғы |бос|ғын|луы|иіс|сын|рде|рын|еті|қығ|алу|іс |рін|іні|е ж|дар|ім |егі|н к|қар| ер|тті|н ж|ыры|аны|лға| са|уын|ынд|ыны|ы м|рға|ген|ей |тік|тер|нің|ана|уы |аза| от|нан| на|е н|гіз|тық|мыс|ы ә|мны|м б|өзі|сқа|қа |е т|ң қ|еге|ке |ард|нег|луғ|лан|амн|кін|і б|асқ|рал|ті |ру |айд|тта| же|а б|р м|рды|кет|аса|ді |өз |ама|дей|н н|тыр|ауд|ігі|лып| мү| ал|зін|лік|дай|мет|жас|бер|тең|арқ|рқы|а о|е ө|қам|елі|рлы|ы а|а т|дер|біл|р б|еле|қор|ден|тін|уда| тү| жү|кел|і т|ір |лге|ы ж|ең |а д|тты|оны|гін| ха|ркі|лде|е м|н т|түр|оға|ікт|кті|зде|жағ|уге|ауы|рыл|ұлт|лтт| ос|осы| то|ция|ы е|н а|ау | ау|ені| ел|н е|оты|шін|ыс |қты|імд| да|сіз|лма|кім|ң б|лім|қат|зі |орғ| әл|хал|ерк|ек |құр|тте|е д|ағд|ғда|елг| ас|ірі| ұл|ағы|амд|тал| со|рып|ылм|лін|ным|мас|сыз|дан|із |ірд|ай |гі |сты|ым‐|ң ж|с б",
    "tat": " һә|лар|әм |һәм| ке| хо|хок|оку|кук|еше| бе|ләр|кеш|га |әр |ан |рга|кла|ар | бу|нең|ең |гә | то| ба|да |ргә| ти|ене|һәр|бер|ырг|ен |ән |р к|бул|укл|дә |ары|а т| үз|на |тор|ире| ал| ка|ә т|ара|ган|нә | ит|ы б| дә| ир|ын |ше |рын|енә|лык|екл|тие|бар|н т|ына|иеш|еле|а х|н б|елә|ка |кы |ала|кар|рек|ә к|нда| та|лән|еш |укы|бел|шен|лан|ле |тә |ите|ез |лы |ерг|үз |н и|тел|а к|ә б|клә|лыр| ха|алы| га|е б|әрг|ы һ|не |ның|ың |тен|ынд|а б|м и|әрн|рне|дан| як|улы|а а|ләт|сә |лга|ел |иге|гез| са|лек|аны|р б|ә х|орм|рлә|асы|а һ|ем | яи|яис|ш т|сез|ә һ|чен|р һ|м а|сен|сын|тәр|мәт|әт |рмы|мыш|шка| ни|үлә|исә| эш|ә и|үзе|ять| ту|н м|илл| ки|ны |ылы|ып |тан|уга|лу |алу|акы|ль |рен|н к| тә|мас|кә |бу | тү|гын|әве|штә|баш|р а|тын|а я|рдә| мә| би|гән|клы|кле|ть |зен| җә|ыш |әре|ерл| ми|мил|лер|ди |әүл|ер |түг|гел|тот|стә| рә|рәв|веш|ешт|улг|ек |ык | ан|лем|ң т|а и|рак|е х|хал|м т|ни |аль|итә|орг| аш|кән|ә д|шел| де|ция|кка|үге|оты| җи|еге|әне|н д| кы| да|кер|лә |шла|ры |арт|ш б| тө|лау|рел|айл|ард|рда|әсе|ндә|ый |н я|якл|уры|кта|та |соц|оци|циа|ерә| за|кон|шыр|ләш|шкә|ллә|әтл|тлә|р о|ге |нин|инд|нди|аци|а д| ко|нна|н а| ил|ген|ң б|тиг|л һ|ану|үгә|ашк| оч| мө|рас|лыш|ыны|уда|бир|ыкл| сә|әте|н һ|мгы|гыя",
    "tuk": " би|лар| ве|ве |да |ада|ары| хе|ир | ад|дам|бир|ер |кла|ың |р б| ха|ара|лан|га |ен |ыны|или|ам |дыр|ала| бо|хер|р а|лы |ан |лер|ыр |иң |ыды|бил|акл|р х|нда|клы| өз|ны |ага|ери| ху|хук|уку|лыд|не |хак|ине|ына|на |лен|де |‐да|ин |өз |рын| эд|атл|маг|лыг|ынд|асы| де|е а|кук|алы|дан|бол|лма|ини|ар |е х| я‐|я‐д|а х|ге |иле|ети|ыгы|ама|ли |гын| ба| га|лиг|укл|ере|ден|лик|ни |ның|зат|тлы|лык|нде|сын|мак|дил|ры |аны|эрк|кин|иги|п б|хем|а г|әге| эс|эса|сас| эр|ола|а д|мек|мал| ма|рин|екл|аза|ыкл|мәг|айы|сы |баш|ы д| хи|ы б|н э|эди| аз| гө|а в|ашг|шга| до|йда|ыет|дак|ы в|мез|гин|йән|чин|а б|ниң|рки|хал|гал| җе|ылы|тме| та|ак | гу|гда|хич|ич |лет|кы |ян | эт|этм|үнд|еси|им |ән | го|ал |ги |и в| ка| се|ип | яг|ягд|дай|ы г|рың|а а|тле|акы|н м|илм|лме|дең|м х|ң х|илл|рил|е д|дир|ң д| ал|н а|е м| со|ра |дол|ң а|ик |кан|лин| ми|мил| ге|ы х| дө|е г| бе|н х|ели|е в|сер|ең |и б| үч|үчи| са|н в|н б|кли|чил|кле|рма|айд|гар|дөв|ция| ме|е б| дү| дә|уп |нме| әх|лим|кда|н г| он|уң |гор|соц|оци|циа|алк| ди|дал|мы |еле|лип|гур|ири| иш|олм|а я|үни|дәл| ту|гөз|нли|сиз| ни|сыз|ыз |ник|емм|әхл|хли|и х|м э| ар|а с|ону|нуң|ора|алм|ып |тин|ң э|ы ө|еги|з х|аха|олы|ерт|гы |ы ү|ек |ану|нун|тар|рап|ы а|рле|рам|өвл|вле",
    "tgk": "ар | ба| ҳа| да|ад | ва|ва |он | та|дар|ти | ин|ба | ки| бо|аро| до|ои |дор|ки |ард|бар|д ҳ| як|уқу|ҳар|и о|ин | на|ора|и м| ма|як | ҳу|ни |инс|нсо|сон|аи |и б|и ҳ|рад| му|р я|ҳуқ|қуқ|ҳои|ҳақ|ии |к и| ша|и д|и и| аз| оз|анд|нд |қ д|яд |аз |озо|зод|ояд|д б| ка|она|ият|да |ақ |амо|а б|ди | ё |ат |дан|оди|ҳам|гар|моя|рда|нам| ху|бо |дон|и т|ст |қи | он|уда|ан |н ҳ|и с|ода|н б|и х|мил|худ|аст|они|боя|ава|бош|оша|ро |а ҳ|имо| ме|и а|ила|оми|д в|н д|оба|ида|а ш|ҳо |таҳ|лат|кар| ас|ри |и н|яти| ди|ӣ в| ми|рои|шав|д к|рдо|е к|шад|ошт|о д|оси|та |роб|уд |ми |тар|мон|ли |вад| бе|кор|иҳо|а в|ӣ ё|р м|ати|нҳо|ара|т б|таъ|иро|шар| со|а д|дав|ят |ани|мин|дош|на |ист| са|ама|лӣ |а м|раф|даа|оти| фа|ор |р ҳ|шуд|д а|зар|н м| су|вар|и к|и ш|и ӯ|д т|ига|н в|и ҷ|фи |р к|диҳ| эъ| шу|т ҳ|р в| ақ|одо|а а| ҳи|ари|а т| иҷ|наз| ӯ |р б|диг|рон|а о|мум|асо|шта|р д| қа|авр|ино| ни|яи |уқи|кас|уни| во|сти|тҳо|уна|и қ|ун |бот| ҷа|лал|еҷ |або|авл|вла|онҳ|аза|уқ |н к|сар|и з|оҳ |ояи|ӣ б|ори|дӣ |чун|ран|д д| ис|атҳ| ко|тав|ахс|н и|р а|маҳ|тир| қо| ҳе|қар|фар|оли|қу |у о|сос|сӣ |ири|н н|киш|и п|ӣ ҳ|уди| за|рӣ |нда|оят|ҳим|оян|янд|оӣ |рии|иҷт|ҷти|тим|ию | зи|ону|ҳти|қон| од|наи|рат|офи|али|ид |ҳеҷ|рра|ами|ъло|лом|мия",
    "kir": " жа|на |ана|жан| би|уу |га |уку|бир| ук|ен |ар |луу|тар|укт|кук| ка|ын | ад|ада|ууг|дам| ме|уга|ык | ар|мен|ене|нен|олу|ан |ары|ин |ам | бо|ган|ир | ал|бол|ара|туу|р б|н к|нда|н ж| ба|анд| же|р а|кта|кту|ына|ард|үн |да |эрк|н б|н э| эр|нди|а т| ко|рды|дык|н а|рки|а ж|кин|инд|а к|аны| өз|а а|ала|лар|үү |алу|тер| та|а у|алы|ийи|а э|же |ук | ти|тий|иш | ма|кыл|гө |нын|улу|йиш|ке |н т|бар|или|у м|кар|иги|рын|рга| кы|а б|үгө| ту|ун |дик|е а|етт| ээ|у а|баш|дар|н у|тта|им |гин|тур|лык|нды|дын|ушу|рүү| са| эл|гон|өз |алд|нан| мү| эм|икт|лга|үүг| бе|ры |үчү|диг| ан|он |ери|р м|ул |кте|дай|ерд|еги|тук|ка |үнү|лук|лды|ынд|үнө|у б|атт| не|еке|амд|кан|рди|к м| ки|дин| со|к ж|кам|күн|рин|ине|не | эч|м а|мда|кет|ого|ээ |чүн|нег|гиз|уп |өзү|сыз|ыз |руу|н м|эме|мес|эч | то| де|ция|ылу| иш|угу|ыгы|ге |бил|лим|н н|кор|орг|олг|лго|лде|ашк|шка|ы м|у ж|рал|к т|ыкт|түү|тын|кен| ул|лут|утт|ес |мам|алг|ө ж| тү| ке| те|рде| ди|тык|акт| эс| кө|рго|нүн|нуу|мсы|иле|ктө|зүн|уну|мак|ч к|е к| уш|аци|тал|ди |кат|ага|дыг|е ж|к а|айы|оо |ү ж|енд|ү ү|е б| үч|ирд|дей|ей |зги|ске|лан|ер |соц|оци|циа|ыны|тол|өнү|кал|рма|амс|з к|жал|ылы|тан|аты|а м| мы|раб|абы|ген|ект|ири|е э|ай |лек|уна|шул| жо|к к|айд|гун|лоо|ркы|өсү",
    "mkd": " на|на | пр| и |во | се|то |ите|рав|та |те |а с|пра|ува|да | да| не|ва |а п|а н|и с|ата|о н|еко|а и|но | по|кој|ој | со| за| во|ање|ств|ње |ја | им|аво|ни |ма |от |е н|е п|вањ|ат |ост|а д|о с|е и|се |ова|и п| сл|ија|има|а о|сек|ото|сло|ли |о д|ава|обо| би|и н|о и| ил|или|лоб|бод|бид| од|ред|ен |при|вот|ста|а в|иде|и и| об|и д|пре|нос|ст |ове| ќе|е с| ни|аат|аци|ј и| ра|ќе |тво|ови|про|со |ест|што|акв|т и| де|раз|нег|его|гов|ани| ко|едн|ако|циј|бра|а з|о п|е б|и о|а б|од |ват|ето|как| е | др|ваа| си|алн|ено|одн| чо|чов|ди | шт| ка|т с|ени|де |ран|е о| ја|нит|вен|а е|а г|оди|лно|јат|и з|сно|ви |нот| ед|тит|род|осн|век|кон| ос| до| оп|и в|нац|дна|е д| ст|сто|т н|ден|о о|еме|сит|обр|дно|опш|пшт|ј н|ние|еди|за |ара|д н|нов|жив| ме|аро|тве|дру|вни|ед |ште|ие |а к| ов|јќи|ќи |без|ки |ков|шти|и м|нар|дни|чно|о в| вр|иот|дат|ели|бед|ко |а р|ема|ода|ник|зем|нак|а ч|еду|нив|ивн|ашт|ичн|чув|нст|руг|т п|ка |тес|луч|не |држ|деј| це|цел|аа | зе|лас|раб|або|бот|ез | бе|нув|дув| из|го |вит|заш|пор|а м|ело|њет|под|он |авн|нио| ре|еде|тен|нет|дин|ине|ење|дек| су|емј|кри|вре|нем|олн|аѓа|рем|кот|дос|азо|зов|ван|им | жи| го|нап|ита|н и|меѓ|еѓу|уна|о к|е в|дел|иту|лит|оја|ејќ|ико|иви|гла|ика|ги |рип|ипа",
    "khk": " эр|эрх| хү|ний|н б|эн |тэй|ийг|х э|эй |хүн| бо| бү|йн |ан |ах | ба|ийн|бол| ха|ий |уул|бай|рх |оло|й х|йг |гаа|эх |бүр|гүй|үн |аар|он | бу|рхт|үнд|хтэ|үр |лэх|ар |н х| за|лах| хэ|й б|өлө|эр |н э|лөө| үн|ын | ул|эл |аа |хий|үй | ор|улс| ту|үлэ|ула|үүл|н т| чө|чөл|лон| ни| ху|ндэ|сэн|р х|өөр|гээ|сан| гэ| нь|нь |ны | ёс| нэ|эд | тө| тэ| ч |оро|лаг|ох |г х|дэс|лс |үни|ээр|хам|лд | дэ| ша|р э|д х|х ё|н а|лго|ай |тай|төр|лий|ээ |хан|гуу|эг |бую|уюу|юу |ж б|рга|ыг | то|дсэ|хар| эд|й э| ал|х б|лга|ал | тү|рэг|өөт| хө|арг| са|ад | зо|ага|л х|айг|гэр|ава|рол| өө|ол |л б|өтэ|н н|йгэ|н з|гий|г б|нд |лла|дэл|эрэ|й а| үз|аал|алд|н у|бус|н д|гэм|аг |хуу|рла|н ү|нэг|х ч| ол|эни|өр |хэн| ял| мө| ам|рий|амг|мга|той| га|өрө| ар|ард|айх|сон|ана|луу|хүү|үү |лал| би|эс | эн|гла|аса|х т|йх |олг|ин |эгт|д н|рхи| ав|тгэ|лов|аан|эдэ|йгм|мий|ой |үрэ|тэг|дээ|х н|арл|лын|с о|нха|үйл|оо |хэр|н г|р т| хо|ч б|үүн|лэн|вср|хүр|өх |хээ|гөө|өн |га |ура|бүх|г н|ори|рон|бие|өөг|өг |али| аж| яв| үй| хи| мэ|л т|дал| шү|шүү|ээн|айл|вах|ааг|ата|й т| ад|ади|дил|л н| та|лаа|овс|гох|өри|н ш|эж | со|лж |гми|эгш|гш |а х| да|дар|х а|д б|үх |х ү|тоо|эгд|йгу|лан|длэ|энэ|р ч|агл|г ү|олц|лох|үзэ|зэл|ули|раа|ил |мөр|гтэ|шгү|рүү| эс",
    "kbd": "гъэ|ыгъ| къ| ху|ыху|ныг| зы|эм |ну |хуи|хуэ|ъэ | и |уит|эхэ|гъу|къы|тын| зэ|э з|ӏых|ым |ъэр|хьэ|эр | цӏ|цӏы|хэм|эху|ъуэ|э и|агъ|ыны|иты|нэ |зы |къэ|уэ | дэ|м и|эгъ|эу |эну|энэ|эны|рал|эщ |эра|хъу|м х|этх|тхэ|ӏэ |дэт|хэн|у х|э х|игъ|ы ц|щхь|зэх| гъ| хэ|кӏэ|рэ |ыну|ъэх|у з|ум | щы|хэр|уэф|щӏэ|эдэ|іэ |хум|ми |лъэ|ъун|уэд|хэт| ик|мрэ|ъэм|уэн|хуа|э щ|эмр|э к|м к| нэ|и х| е | иі|иіэ|лъы|экӏ|псо| мы| я | лъ|зэр|ъэп|фащ|ащэ|р з|къу|у д|эры|щіэ|ри |уэх|іэщ|ти |ӏи |эти|ауэ|эфа|ал |алъ|э г|экі|у к|кіэ|езы| щӏ|зых|ъэщ| хъ|уну|ъым|ӏуэ|м щ|ншэ|ху |ъых|алы| пс|зым|эщӏ|икӏ|кӏи|щэх|ъыщ|бзэ|у и|укъ|іуэ| щх|и к|м е|уне|ней|эгу| ха|абз| гу| ун|ьэн|у щ|умэ| ез|ӏэщ|ыхэ|ъум|щыт|эпэ|эпс|нук|хаб| иӏ|иӏэ|лым|шэу|ъэк|и ц|риг|эри|ыхь|ъыт|щӏы|хъэ|зэг|и з|эн |ъэж|сэн|у п|ъэз|уу |нэг| ам|ама|мал|эхъ|эщх| ду|дун|ейп|йпс|пхъ|мы |дэ |ъэу|щіа| щі|хур|э е|ьэх|эсэ| ці|ціы|іых|мэн|ту |ыщы|уэщ|э я|эжы|м з|алх|лхэ|уна|ьэп|ьэ |ылъ|э д|дэу|псэ| зи|хэг|ынш|и л|жьэ|н х|ъэс|сом|ъуа|лъх|жын|и д|апщ|пщӏ|нэх|со |ызэ|ыкӏ|эты|и н|эщі|апх|энш| те|ъэг|ыр |и щ|э л|эзэ|иту|ыт |м я|тэн|хуе|псы|егъ|кӏу|ным|пкъ|и и|м д|ам |э п|джэ|р и|гуп| ир|афэ| за|и у|ыкъ|сэх|оми|ыты|раг|ур |ужь|жьы|ытэ|ын |уэм|къе|пса|ыдэ|уэт| іу|у е|щ з|наг|сэу|хэк"
  },
  "Arabic": {
    "arb": " ال|ية | في|في |الح| وا|وال| أو|ة ا|أو |الم|الت|لحق|حق |كل |لى |ان |ة و|الأ| لك|لكل|ن ا|ها |ق ف|ات |مة |اء |ما |و ا|ون |ته |الع|أن |ي ا|ي أ|شخص|ة ل|الإ| عل| أن|م ا|حري|الا|من |على|حقو|قوق|ت ا| شخ|لا |ق ا| لل|فرد|رد | أي|أي |رية| كا|د ا| ول| من| إل|خص |ا ا|وق |نسا|ل ف|ا ي|ه ا|ة أ|كان|ن ي|امة|جتم| حق|الق|ام |دة | لا|ل ش|إنس|سان|ين |ة م|اية|ن ت|ا ل|ذا | فر|ن أ|هذا|لة |اً | عن|ى ا|لتع|اسي| دو| حر|ع ا|ه ل|لك |ه و|ترا|له |ماع|د أ|ي ح|إلى|الج|الد|، و| با|ن و|ي ت|نون|لعا|مع | هذ|ة ع|لحر|يات|عية|ص ا| وي|لإن|لأس|أسا|ساس|سية|بال|ي و|حما|ماي| إن|الف|انو|ير |رام|ا و|عام|دول|مل |الو| مت| له|الب|ساو|ة ب|هم |ع ب|علي|ك ا|لقا|قان|تما|ة ت|ى أ|ول |ة ف|ا ب|اد |الر|ل و|ل ا|انت| قد|لجم|لمي|لتم|تمت|اعي|ليه|لمج|ه أ|ا ك|ال |لأم|لمت|لإع| يج|لدو|ق و|ريا|يه |رة |ن ل|دون|تمي|كرا|يد |ذلك| يع|ر ا|تعل|عال|تسا|لاد|اة |قدم|متع|تع |اجت| كل|مان|غير|اته|م و|مجت|تمع| مع|مم |لان|يجو|جوز|وز |عمل|دم |فيه|الض|ميي|ييز|متس| عا|أسر|ن م|معي|لات| مس|لاج|عن |ي إ|ليم|يم | أس| تع|يز |مية|جمي|ميع|الش|اعا|ة، |الس|شتر|لمس|لما|ني |لي |يها|ملا|ود |تي |لضم|ضما|اعت|ر و|اق |ي م|ي ي| بح| تم|تنا|أمم|تحد|حدة|إعل|علا|ه ع| جم|عة |م ب|ولم|الن|ل إ| به|ب ا|اوي|قد |أية|قيد|د ب|اك |وية|إلي|لزو|د م|مست|كاف|وله|ه ف| ذل| وس|لحم|نت | أم| مر|مرا| وأ| وع",
    "urd": "ور | او|اور|کے | کے| کی|یں | کا|کی | حق|ے ک|کا | کو|یا |نے | اس|سے |ئے |کو | ہے|میں| می|ے ا| کر| ان|وں | ہو|اس |ر ا| شخ|شخص|ی ا| جا| سے|حق |ہر |خص |ے م|ام | یا|ں ک|ہیں|سی | آز|آزا|زاد|ادی|ائے|ہ ا|ص ک|ا ح|جائ|ہے |کہ |ر ش|ت ک| پر|ی ک|م ک|۔ہر|پر |ا ج|ان |دی |س ک|ق ہ|ہے۔|ر م|ں ا|ی ح|و ا|ار |ری |ن ک|کسی|حقو|قوق| مع|ے گ|ی ج|وق | ہی|ر ک|سان|نی |کرن| حا| نہ|تی |ی ت| جو|ئی |انس|نسا| کہ|اپن|ل ک|جو | اپ|ے ب|یت |نہ |ہ ک| مل|ہو |می |ل ہ|رے |ی ش|رنے|ے ل|ے ہ| کس| ای|ا ا|۔ ا|حاص|اصل|صل |معا|نہی|ی م|وہ |یں۔| تع|انہ|ق ک|د ک|ی ب|ات |ملک|ایس|ی ہ| بن| قو|قوم|کیا|ے، |عاش|اشر|ر ہ| گا| دو|یہ |وام|دہ |ں م|ا م| من|بر |انی|ے۔ہ|ر ب|دار|ے ج| وہ| لئ|لئے| عا|اقو|قوا|مل |ائی|علا|اد |ی س| جس|ر ن|ے ح|ہ م|کر |و ت|لیم| و | قا|انو|ا ہ|جس |یوں| یہ|لک |ریق|ے۔ |نیا|تعل| گی|گی |ر پ|دوس|ی آ|یم |، ا| اق|وئی|یر |پنے|ے پ|م ا|گا۔|یاد| رک|علی| مس|ی، |ین |ن ا|انے|وری|ی ن|لاق|ر ع|ون |خلا| با|ا س| سک| دی| چا|رائ|ومی|ہ و|نا |اری| بر|رکھ|ندگ|دگی|ر س|رتی| بی| شا|س م|ق ح|ادا| مم| ہر|ا پ|و گ|وسر|سب | پو|قان|نون| بھ|ے خ|اف | اع| مر|یسے| پی|غیر|ے س|ال |ت ا|، م| مح|ں، |بنی| ذر|ذری|ریع|ہوں| عل|تما|مام|ونک|نکہ|دان|پنی|ر ح| ام|من |عام|پور| طر|ے ع|ائد|بھی|ھی | مت| مق|د ا| خل|لاف|اعل|کوئ| لی|و ک|ے ی|ا ک|ر آ|دیو|اں |چون|، چ|یاس|برا|کرے|ی ع|ر ج",
    "fas": " و | حق| با|که | که|ند | در|در |رد | دا|دار|از |هر | از|یت | هر|ر ک|حق |د ه|ای |ان |د و| را|ود |ین |یا |ارد|کس |ی و|را | یا| کس| بر|باش|د ک|ه ب| آز|آزا| خو|ه ا| اس|د ب|زاد|ار | آن|ق د|شد |حقو|قوق|ی ب|ه د|ده |وق |ید |ی ک|ر م|خود|ور |و ا|رای|اشد|ام |تما| اج|ری |ادی|س ح|دی |اید|است| ان|نه |و م|د ا|ر ا| بی|با |انه|ی ا|د، |ون | تا| هم| نم|ات |مای|ا ب|ایت|ر ب| بش| کن|انو|اسا| مر|ست | مو| مل|برا|وان|این|جتم| می|ورد| شو| ای|ن ا| اع| به|ت و|، ا|اجت|ماع|عی |ا م|ائی|ئی |و ب|نی |ملل|ت ا|و آ|آن |بشر| زن|ی، |کند|ن م|ن و|بای|شود|ی ی|های| من|شور| مس|کار|ت ب| بد|دان|اری|اعی|د آ|مل |ز آ|یگر|ی ر|ت م|مور| گر|گرد| مق|توا|ی م|علا|یه |ن ب|میت| شد| کش|کشو|ه و|ق م|د ش| مج| اح|ن ت|و د| حم|لی | کا|ت ک|هٔ |نون|مین|دیگ| عم|انی|ر خ|ه م| مت|ن ح|ی د|لام|رند|اه |نجا|بعی|نوا|ساس|ساو|د م| آم|ادا|وی |گی |هد |ا ک|اد |ی ح| مح| قا|قان|می |یده|مقا|لل |ر ش|ق و|اعل|ا د|شده|ع ا| بع|اسی|د ت|همه|سان|شر | عق|ر و|دگی|حما|ا ه|خوا|‌ها|ه‌ا| او|او |اده|اً |ر ت| دی|ومی| شر|نمی|بر | هی|هیچ|یر |ز ح|مند|بین|تی |جا |عقی|یتو|م و|مسا|و ت|سی |اوی|بهر|م م|ر د|انت|زش |ارن|زند|ندگ|و ه|رفت|رار|واه|ا ر| بو|تأ|أم|ٔمی|ران|عمو|موم|ی ن|اند|ل م|ردد|ه ح|عیت| فر| بم|دیه|ا ا|نما|آنج|کلی|احد|حدی|مال| تع|و ح|مرد|ت، |ملی|ق ا|واد|م ا|د د| خا| ار|اشن|شند",
    "zlm": " دا|ان |دان| بر| او|ن س|له | ڤر|كن |ن ك|دال|ن ا|ن د|رڠ |حق |يڠ | كڤ|ارا| يڠ|أن |تيا|ڤد |ورڠ|ڠن |اله|ياڤ| تر|ولي|ن ڤ|اور|كڤد|برح|رحق|ين |ستي|اڤ |را |ليه| ات|ه ب| ست|يه |اتا| عد|عدا|ن ب|تاو|ڤ ا|او |ن ت|بيب|يبس|سي | كب|ه د|ن م| من| سو| سا| حق|ق ك|اسا|سام| تي|ن ي|الم|لم | اي|ن، |رن |اتو| ما|د س| با|باڬ|نڬا|ڬار| مم|كبي|بسن|سن |اين|ڠ ع|ڽ س|چار| سب|ي د|ندق|د ڤ|اڽ |اڬي|سبا| ڤم| د |نسي|ا ڤ|هن |قله|يند|تا |ي ا|ام | بو|ڬي | نڬ|اون|تن |وان|ا س|مأن|أنس|ڠ ب| كس| سم| سچ|سچا|ا ب|بول| مأ|سيا|ساس|اسي| ڤڠ|بڠس| دڠ|دڠن| ڤو|ڤا |ت د|رتا| هن|هند|دقل|ي م| اس|ادي|نڽ |ات |تره|رها|هاد|ادڤ| لا|تي |ڤرل|مان|، ك|بار|ارڠ|ق م|ڤون|ون |، د|اي |اول|ق٢ |٢ د|ڠسا|تو |يكن|وين|ن ه|اكن|يأن|وڠن|دڤ |وا |ا د|ن٢ |نتو|وق | سس|ماس|اس |ه م|مرا|ندو| ان| بي| مڠ|ڠ٢ |ائن|رات|يك |حق٢|برس|اد |ي س| كو|مڤو|ري | مل|وات|واس|ڤمب|، ت| سر|سرت|امر|سمو|اڬا|رلي|لين|دوڠ|ل د|تار|ڠ م|، س|وند|ي ك|لوا|سوا|ارك|تيك|ڤري|رسا|ياد|ريك|ا، |ونت|ڠ ت|ترم|ڤرا|سأن|اڤا|ي ڤ|ا ا| در|رأن| ڤن|سوس|ورو|ڠ س|لائ| بڠ|٢ ب|توق|دير|يري|وكن|جوا|هار|ندي|ارأ|وه |كرج|ڠڬو|ي، |موا| كأ|اجر|جرن| به|بها| مر|راس| كم|و ك|نن |ڤرك|ندڠ|دڠ٢|ا م| سڤ|ا٢ |سات|ق ا|ڤ٢ |شته|تها|سال|ينڠ|سسي|وهن|مول|منو|وبو| دل|وار|كور|د ك|ا ك| ڤل|لاج|ڠ ا|مبي|نتي|تيڠ|وسي|يال|ال |انت|نتا|بس |هڽ |ن ح|ه ا|كڤر|ڠ د|م س",
    "skr": "تے |اں | تے|دے |دی |وں | دا| کو| حق|کوں|ے ا| دے|دا | دی|یاں| کی|ے ۔|یں |ہر | ۔ | ہے|ہے | وچ|کیت| ان|وچ | شخ|شخص|ال |ادی| حا|اصل| نا|ے م|خص |ں د|حق |حاص|صل |یا | ای|ل ہ|اتے|ق ح|ے و| ات|ں ک|سی |ہیں| مل|ی ت|نال| از|ازا|زاد| او|حقو|قوق|ار |ا ح| ۔ہ|۔ہر|ر ش|ے ج|ص ک|وق |دیا|نہ |یند|ندے| یا| کر|ئے | جو|کہی|ی د|انس|نسا|سان|وند|ی ا|یتے|و ڄ|ڻ د|یسی| وی|ا ا|ملک|ے ح|ے ک| ہو|ے ب|ں ا|ا و|ئی |ر ک|تی |آپڻ|وڻ |ندی| نہ|ویس| آپ| جی|اون| کن|انہ|ن ۔|جو |ی ن|ان | کہ|ری | تھ|ے ہ| ڄئ|۔ ا|ے ن|ی ۔|ڻے | ہر|ام |دہ |ں ت|ں و|ں م|تھی| من|کو |ی ح|کنو|نوں|ہاں| بچ|ے ت|رے |ون |ی ک|ور |ہکو|نی |یاد|ت د|یتا|ی ہ|نہا|ن د|اری|تا |لے |ڄئے|ے د| ہک| قو|پڻے|می |ی م|قوا|وام| ون|ق ت|اف |ل ک|اے | تع|ین |چ ا|خلا|ل ت|لک |ہو |ارے| و |انی|جیا|ے س| سا|ن ا|دار|یت |ی ج|ئو |ی و| اق|علا|کرڻ|ونڄ|ات | اے|ر ت|ق د|الا|ہوو| چا| رک|بچئ|چئو|وری| وس| لو| پو|پور|قنو|نون|ہ د|ے خ|ایہ|و ا|این| ڋو| خل|لاف|ڻ ک| جا| ۔ک| عز|عزت|ا ک| مع|ے ع|یر |قوم|ں آ|او |اد |ب د|ریا|مل |رکھ|وسی|سیب|یب |کاں| قن|اقو|رڻ |وئی|ں ج|ا ت|ل ا|زت |ت ت|ر ا| سی|لا |وے |ہی |ا م|ے ر|تعل|ں س| سم|یوڻ|ر ہ|ڻی |اوڻ|لوک|م م| مت|متح|تحد|حدہ|ایں| اع|ے ذ| جھ|جھی|کوئ|کار| کھ|ہ ا|ھین|م ت| کم| ہن|ہن |ی، |ں ب|د ا|سار|ن ک|علی|لیم|نڄے|ڄے |ی س|یہو|ھیو|ائد|و ک|ائی|ے ق| مط| سڱ|سڱد| ذر|ذری|ھیا|نے |کیو",
    "pbu": " د | او|او |په | په| چې|چې | حق|ي ا|ره |ې د|نه |و ا|و د|ه ا|هر |ه و| څو|ه د|ري |حق |ي چ| کښ|څوک|وک |وي | شي|له |غه |کښې|ښې | سر| لر|لري|و پ|ه پ|ټول|لو |يت |سره|کړي|ي۔ه|ه ک|ي، |ر څ| ټو|ق ل| له|يا | هغ| از|۔هر|د م|ازا| کړ|دي |هغه| کو|نو |د ا|حقو|قوق|زاد|ه ت| پر| وا|ولو|خه |ه ه| وي| څخ|يو |ه م| يا|ول |د د|څخه| دي|ه ش|کول|ي د|ته |ه ب|ګه |و ي|ړي |اد |و م|ونو|شي۔|د ه|دې |خپل|واد| مل| هي| نه| تر| تو|د پ|ک ح|ې پ|ان |ولن|ني |ه ح|يوا|تون| با|ادي| هر| يو| مس|ي و|ې ا|لي |ې و|ي پ|د ت|يد |امي|وقو|شي |ړي۔|دان|انه|وګه| عم|هيو| دا| دغ|قو |ي۔ |ه چ|ار | خپ|بشر|توګ|اند|هغو|لني|باي|ايد| ده|ه ن|وي،|و ه|، د|ي ح| بر|غو | تا|ين |ايت| شو|شوي|دغه|مي |م د|دهغ| من|و ح| لا| ډو|ډول|بعي|پل | بش| ته|اوي|ه ګ|د ب|نيز|پر |ده |و ت|انو|نون|ون |ومي|رو |هيڅ|يڅ |ي ت|علا|ه ي|ه ل|وم |کار|ساو|تر |وند|ونه|يه |ن ک|مين|موم|و ک|اتو| اع|اعل|لام|اره| ځا|مسا| ان|د ټ|ټه | ګټ|ي ش| بي| مح|قان| پي|و ر|اخل|تو |اسي|سي | وک|ديو|ځاي|عقي| ور|لان|ل ت|ه س|ې چ| وس|و س|وون| ژو|ژون|يز |وکړ|کي |ن ش|ندې|ک د| اس| قا| نو|عمو|لتو|و ب|پار|ولے|لے |ې ک| عق|۔هي|څ څ| را|بل | بل|وسي|ت ا|ر د| ار| هم|هم |دو |ي م|مان|اسا|رته|شري|ا د|ر م|ښوو| رو|ګټه| غو|ونک| وړ|مل | شخ|شخص| اج|د ق|تام|وق |ملت|و ن|من |و څ|ا ب|ن ا|قيد| چا|ل ه| تب|تبع|ر پ|حما| کا|د خ|ر س|اني|نځ ",
    "uig": " ئا| ھە|ىنى|ە ئ|نىڭ|ىلى|ىڭ | ۋە|ۋە | ئى| بو| ھو|ھوق|وقۇ|قۇق|نى |بول| ئە|لىك|قىل|ىن |لىش|شقا|ەن |قا | قى|ن ب|ھەم|ى ئ|ئاد|دەم|ىشى|ادە|كى |لىق|غان|ىي |ىغا|گە |دىن| بى|ىدى|تىن| تە|ندا|كىن|نلى|ىكى|ەت |ۇق |ەم |لەت|قان|ىگە|ىتى|ىش |ھەر|ولۇ| با|ئەر|غا | دۆ|دۆل|اند|لۇش|مە | ئۆ|اق | يا|لۇق|ان |دە | قا|ۆلە|ەرق|ەرك|ركى|ەمم|ممە|ا ئ|ۇقى|ىق |رىم| بە|ىلە|ارا|رقا|داق|لغا|ەر |ى ۋ|اكى|ىشق|مەن|ئار|ياك|ا ھ|ۇقل|دۇ |لار|ق ئ|ىنل|ى ب| ئې|ىمە|ن ئ|ئۆز|شى |ڭ ئ|لىن|ق ھ|قلۇ|ەھر|نىش|ىك |ەتل|لەر|ار |ھرى|لەن|ىلا| مە|بەھ| ئۇ|ئىي|اسى|ە ق|رلى|بىل|، ئ| ئو|بىر| مۇ|بار|ۇشق|ى، |ش ھ|ۇ ھ|شكە|ە ب|ايد| كې|ەك |م ئ|ا ب|ىسى|الى|يەت|رنى|ېلى|كە |ك ھ|ارى| قو|ىدا|ەمد|مائ|انل|ەشك|تنى|ئال|تلە|لىد|ولم|ماي|يدۇ|ا، |ر ئ|ۇشى|ي ئ|ئىگ|ائى|ە ھ|مدە|راۋ|ش ئ|دا |ىيە|لما| تۇ|ىقى|ە ت|ۆزى|قى |كىل|سىي|ر ب|ى ك|ىرى|ن، |ېتى|ىر |ىپ |ادى|منى|انى|ن ق|قىغ|ىما| خە|اشق|شلى|ەتت|اۋا|لەش|اسا|ساس|تى | خى|ى ھ|ۇرۇ| جى|رقى|چە | سا|ئىش|ارل|ى ق|كېر|ېرە|رەك|تۇر|ۇنى|الغ| خا|انۇ|نۇن|باش| ھۆ| جە|مۇش|شۇ |ۇش |تىد|ئېل|جىن|ەلى|ايى|سىز| كى|تىش|اش |نىي|خەل|ەلق|ىشل|پ ق|مەت|كەن|تەش|ئاس|مىن| ما|ق ۋ|ېرى|رىش|دىغ|ىنا|ناي|تەۋ|ارق|ەمن|كىش|شىل| تى|ك ئ|تتى|قتى|ە م|تىم|ولى| تو|زىن|ەلگ|ىيا|ئاش|ى ي|ىرل|امى| قە|ن ھ| بۇ|سىت|ەرن| دە|ىدە|ەۋە|اۋە|ۋەر|ىيى|ىز |دا،| شۇ|قار|سى | سۈ|ۈرۈ|رۈش|ڭ ب|ئىل"
  },
  "Devanagari": {
    "hin": "के |प्र| के| और|और |ों | का|कार| प्|का | को|ं क|या |ति |ार |को | है|िका|ने |है |्रत| अध|धिक|की |अधि|ा क| कि| की| सम|ें |व्य|्ति|क्त|से | व्|्यक|ा अ|में|मान|ि क| स्| मे|सी |न्त|े क| हो|ता |यक्|ै ।|क्ष|त्य|िक | कर| या|्य |भी | वि|रत्|ी स| जा|र स|्ये|येक|ेक |रों|स्व|िया|ा ज|त्र|क व|र ह| अन|्रा|ित |किस|ा स|िसी|ा ह| से|ना |र क| पर| सा|गा |देश| । | अप|ान |समा|्त |े स|्त्|ी क|ा प| ।प|वार| रा|न क|षा |अन्|।प्|था |ष्ट| मा|्षा|्वा|ारो|तन्| इस|े अ|ाप्|प्त|राष|ाष्|्ट्|ट्र|्वत|वतन| उस|राप|त ह|कि | सं|ं औ|हो | दे|किय|ा ।|े प|ार्| भी|करन| न |री |र अ|जाए|क स|ी प|िवा|सभी|्तर|अपन| नि| तथ|तथा|रा |यों|े व|ाओं|ओं |पर |सम्|्री|ीय |सके|व क| द्|द्व|ारा|िए | ऐस|रता| सभ|िक्|ो स|रक्|र प|माज|्या|होग|र उ|ा व|रने| जि|ं म|े म|ाव |ाएग| भा|पने| लि|स्थ|पूर|इस |त क|ाने|रूप|भाव|लिए|े ल|कृत|र्व|ा औ|ो प|द्ध| घो|घोष|श्य|ेश |। इ| रू|ूप |एगा|शिक|े ब|दी | उन|रीय|रति|ूर्|न्य|्ध |णा |ी र|ं स|र्य|य क|परा| पा|े औ|ी अ|ेशो|शों|ानव|ियो|म क| शि| सु|तर्|जो |्र |तिक|सार|चित| पू|ी भ|जिस|ा उ|दिय|राध|चार|र द|विश|स्त|ारी|परि| जन|वाह|नव | बु|म्म|ले |्म |र्ण| जो|ानू|नून|िश्|गी |साम|ोगा|रका|्रो|ोषण|षणा|ाना|ो क|े य| यह|चूं|ूंक|ंकि|अपर|कोई|ोई |ाह |ी म| ।क|ी न|ा ग|ध क|े ज|न स|बन्|निय|याद|ादी|्मा| सद|जीव|हित|य ह|कर |ास |ी ज|ाज |ं न|्था|ामा|कता",
    "mar": "्या|या |त्य|याच|चा | व |ण्य|प्र|कार|ाचा| प्|धिक|िका| अध|च्य|अधि|ार | आह|आहे|हे |ा अ| स्|्रत|स्व|्ये|ा क| कर|्वा|ता |ास | त्|ा स|त्र|ा व|िक |यां|ांच|वा |मान| या|्य | अस| का|रत्|ष्ट|येक|ल्य|र्य|र आ|ाहि|क्ष| सं| को|कोण|ामा|ाच्|ात | रा|ा न|ेका| सा|ून |ंत्| मा|चे |तंत|राष|ाष्|्ट्|ट्र|ने |े स|वात|करण| कि|किं|िंव|ंवा|व्य|ा प|कास|ना | मि| सम|क्त|ये |मिळ|समा|र्व|ातं|्र्|े प| जा|यास|व स|ोणत|ीय |ा आ|रण्|काम| दे|ांन|े क|ा म|रां| व्|्यक|हि |ान | पा|्षण|िळण| आप|ार्|ही |े अ|ा द|ली |ळण्|े व|ची | आण|ंच्| वि|ारा|्रा|ाही|मा |ा ह|द्ध|्री| नि|णे |ला | सर|सर्| नय|नये|ाचे|ी अ|्व |ंना|षण |आपल|ले |माज|बंध|ी प|्त |त क|लेल| हो|ील | शि|शिक|ध्य|ी स|आणि|णि |े ज|देश|न क|ानव|पाह|हिज|िजे|जे |रीय|क स|व त|यक्|ा ज|यात|िक्|त स|े आ|रक्|पल्|वी |संब|ंबं|न्य| ज्|ज्य|स्थ| के|्वत|असल| उप|य अ|क व|त्व|ीत |त व|केल|ाने|य क|णत्|ासा|रति|भाव|े त|व म|ेण्|िष्|साम|क आ|सार|कां|याय|साठ|ाठी|ठी |े य|ंचा|करत|रता|र व|्ती|ीने|याह|र्थ|च्छ|ी आ|स स|ोणा|संर|ंरक|त आ|ंधा|ायद|ी व|ेशा|ित | अश|जाह|हीर|तील|ा ब| अथ|अथव|थवा|ी म|स्त|ा त|ती |नवी|ाची|िवा|देण|याव|ांत|ण म|व आ|य व| हक|हक्|क्क|ा य|ेत |वस्|पूर|ूर्|ारण|द्य|ंचे|ेले|ेल्|कृत|शा |तीन| अर|अर्|्थी|थी |्रद|राध|यत्|ाला|तिष|ष्ठ|श्र|ण स|रून| आल|्ध |सले|े म| शा|्रक|रका|तिक|ाजि|जिक|्क |ाजा| इत|इतर|तो |साध",
    "mai": "ाक |प्र|कार|धिक|िका|ार | आʼ|आʼ |्रत|ेँ |्यक|क अ|िक |्ति| अध|व्य|अधि|क स| प्| व्|क्त|केँ|यक्|तिक|हि | स्|न्त|क व|मे |बाक| सम|मान|त्य|क्ष| छै|छैक|ेक |रत्|स्व|त्र|्ये|येक| अप|ष्ट|सँ |र छ|ैक।| वि| एह|वा |ित |ति |िके|ट्र| जा|्त्|राष|ाष्|्ट्| हो| सा| रा|्य | अन|अपन| कर|।प्|कोन| अछ|अछि|क आ|्वत|वतन|तन्| पर|था | को| वा|ताक|ार्|एहि|पन |ा आ|नहि| मा|्री|समा|नो |रता| दे|्षा|रक |देश|क प| नि| नह| कए| का|छि |न्य|्त |ि क| सं|ोनो| तथ|तथा|्वा|ारक|ान्|ल ज|ा स|ान |िवा|क ह|ीय |र आ| आ |्या|ँ क|वार|ता |ना |जाए| जे|करब| एक| आओ|आओर|ओर |ानव|परि|ँ अ|रीय|ा प|धार|ारण|स्थ|माज|साम|ामा|्रस|र्व|कएल|घोष|अन्|्तर|त क|स्त| सभ|्रा|रण |ँ स|द्ध|एबा|नक |ा अ|िक्|षा |रक्|क।प|ʼ स|चित|पूर|ʼ अ|यक |ाहि|रबा|क ज|कर | घो|ोषण|सम्|र प| हे|हेत|ेतु|तु |शिक|त अ| उप| अव|ूर्|एल |िमे|एहन|हन |षणा|ाधि|सभ |च्छ|अनु| शि|ेल |रूप|क क|भाव|प्त|्ध |ि ज|वक | सक|र अ|रति|निर|िर्|जाह|हो |ँ ए|े स|होए|चार|ण स|र्य|ि आ|सभक|्रक|ाजि|जिक|ाप्|र्ण|त स|क उ|रा |त आ|एत।|त ह| जन|ैक |विव|ोएत|वाध|क ब|री |न प| भा|य आ|राप| ओ |न व|ʼ प|्ण |न अ|कृत|िश्|ा व|कान|ारा|ि स|हु |रसं| उद|उद्|श्य|ाएत|िसँ|जे |ि घ|जेँ| कि|कि |ेश |केओ|ेओ |त्त|सार|क ए|रिव|वास|य प|्थि|विश|ओ व|यता|पर | भे|क ल|नवा| बी| सह|िष्|ि द| रू| ले| पए|पएब| अथ|अथव|थवा|क र|न स|हिम|ास |ए स|ि अ| दो|षाक| पू| द्|द्व|धक ",
    "bho": " के|के |ार |े क|कार|धिक|िका|ओर | आओ|आओर| अध|अधि|े स|ा क|े अ| सं|र क| हो| मे|में|ें |र स|िक | कर|र ह|ा स| से|मान| सम|न क|रा |से |क्ष|े ब|नो |वे | चा|ता |्रा| रा|ति |खे |चाह|ष्ट| सा|राष|ाष्|प्र| का| मा|्ट्|ट्र|े आ| प्| सक| स्| जा| बा|पन |था |त क|ि क|कौन|ौनो|करे|होख| कौ|ेला|्त |ाति|ला |तथा| आप| ओक|आपन|रे |र म| तथ|सबह| हव|हवे|र आ|कर |ोखे|जा |े ओ|तिर|िर |बहि| ह।|ही |सके|केल|ना |हे | और|त्र|ान | खा|खात|।सब| पर|े म|े च|ा आ|षा |ावे|र ब|न स|ओकर|ी क| लो|ाहे|ल ज| सब|्षा|संग|ं क|ित |माज|मिल|े ज|रक्|हिं|िं |ा प|वे।|े ह|ाज |और |स्व|ंत्|ला।|ो स| नइ|नइख|इखे|हु |ानव|िया|्र |लोग|क स|समा|कान|क्त| जे|करा|्रत|े। | ओ |ी स|े न|्री|रीय|पर |े उ|ाही|ानू|नून|स्थ|े व|ाम |्वत|वतं|तंत|रता|केह|या |े ख|। स| सु|प्त| दे|े त|साम|र अ|ीय |र प|बा।|ा।स|सभे|भे | वि|योग|दी | आद|ून |ा म|्य |व्य|ए क|ेहु| या|री |र न| बि|राप|ाप्|ु क| मि|यता|आदि|दिम|मी |नवा|ाधि|े द|चार|ले | नि| पा|ोग | ही| दो|ादी|हि |तिक|पूर| इ |ा ह|्ति|ल ह|खल |ाव | अप| सभ|िमी|देश|ुक्| सह|शिक|िक्|ि म|जे |षण |ाजि|जिक|क आ|्तर|े प| उप|जाद|े भ|्या| जर|म क|ेकर| अं|े र|।के|न आ|सब |साथ|ंगठ|गठन|ठन |रो | जी|ा। |्म |ी ब|हो |न ह|े ल|न म|वाध|निय|ेश | शि|ज क| ले|ने |बा |संर|ंरक|्षण|ामा|य क|ास |उपय|पयो|दोस| आज|आजा| भी| उच|चित|र व| पू| घो|घोष| व्| शा|िल |ा।क| कई| को|होए|्थि",
    "nep": "को | र |कार|प्र|ार |ने |िका|क्त|्यक|धिक|व्य| गर| प्|्रत|अधि|्ति| अध| व्|यक्|मा |िक |ाई |त्य|न्त|लाई|मान| सम|त्र|गर्|र्न|क व|्ने| वा|वा | स्|रत्|र स|्ये|येक|ेक |छ ।|तिल|हरू|क्ष|ो स| वि|ा स|्त्|िला| । |स्व|हुन|ति | हु| मा| रा|ले |र छ| छ |ष्ट|समा|वतन|तन्|्ट्|ट्र| सं|ो अ|राष|ाष्|्वत|नेछ|ुने|ान |े अ|ता | का|्र |हरु|गरि|ाको|िने| अन|ना | नि|े छ| सा|क स|तिक|ित |नै |र र|रता|रू |था |ा र|कुन|ुनै|ा अ|स्त|्त | छै|छैन| तथ|तथा|ा प|ार्|वार| पर|ा व|एको|्षा|परि|रक्|। प|माज|रु |द्ध|का |्या|ो प|ामा|्रा|सको|ेछ | ला|धार|नि |ाहर|देश| यस|र ह|िवा|सबै|र म|भाव|्य |र व|रहर|रको|न अ|सम्|े र|संर|ंरक|अन्|ताक|्रि|्वा|ा भ|त र| कु| त्|री |ो व|न स|रिन|लाग|ारक|ानव| सब| शि|शिक|िक्|ै व|रिय|रा |ा न|पनि|ारा|श्य|ा त|्यस|यस्|ाउन|्न | अप|चार|ाव | भए|ारम| सु|ुद्|षा |ि र|रूक| सह|बाट|्षण|साम|्तर|िय |रति|ो आ|र प|ो ल|कान|द्व|ुक्|ान्| उप|द्द|ुन |ैन |ेछ।|ैन।|ारह| भे|ागि|गि |निज|वाह|्ध |र्य| आध|रमा|ा म|नको|बै |न ग|ाट |।प्|ाजि|जिक|त्प|िको|ाय |र त|ात्| उस|ूर्| अभ| अर|जको|स्थ| आव|त स|ित्| पन|िएक|्तो|तो | पा|ा ग| भन|ानु|परा|राध| छ।| मत|अपर|भेद|ि स|रुद|ो ह|रिव|रका|न्य| जन|यता|े स|र्म|ारी| दि|क अ|नमा|ूको|हित|ा क|क र|र अ|ा ब|उसक|पूर|त्व|र्द|सार|णको|युक|।कु|विध| घो|घोष| सक|भएक|नुन|्यह|ि व|ो भ| पु| मन|नी |विच| दे|राज|विर|िरु|काम|र न|यहर|िश्"
  },
  "Myanmar": {
    "mya": "င့်|င်း|ိုင|ုင်|ောင|သည်|ကို|့် |ွင့|ည်း|ခွင|ာင်|်းက|တို|သော|ို |ြစ်|နို|ျား|မျာ|င် |လည်|ြင်| အခ|ကော|ို့|းကေ|ရေး|ဖြစ|် အ|း၊ |နှင|ှင့|ရှိ|းကိ|်း၊|ည်။|်ခွ|် လ|ောက|မှု|်း |ွင်|ခြင|တွင|ော |ည့်|င်ခ| လူ|လွတ|ွတ်|်စေ|မ်း|တ်လ|ာက်|လပ်|ှိသ|င်ရ|ိသည|ော်|်းမ|်လပ|အခွ|့်အ|အရေ|်သေ|ကြေ|စွာ|့် |ူတိ| လွ|လူတ| ဖြ|ထို|ွာ |်၊ |မည်|်အရ|စ်စ|ား |်လည| ထိ|ိုး| မိ|ည် |းတွ|ရန်|ြား|ားက|ုပ်|ြင့|းမျ|က် |န် |အား|ဖြင|ဆို|းနှ|်းတ|င်င|်ငံ|ွက်|်စွ|ြည်|့်ရ|စေရ|ိမိ|ုံး|်ရှ|ာ်လ|။လူ|န်း|ေ၊ |မိမ|ပြု|်သည| လည|ြော| နိ| သေ|ာ အ|ပ်စ|ပြည| ပြ|းသည|်မှ|ေးမ|အခြ|စေ၊|ပို|ုတ်|် မ|ဝင်|စား|းဖြ|း အ|း မ|်းသ|ရမည|ွယ်|် ပ|်။လ|ိုက|အပြ|၊ အ|် ဖ|ခြာ|ိမ်|လုပ|းမှ|သို| ရှ|ဖွဲ|ွဲ့|်ခြ|့ အ|၊ လ|တစ်|် ရ|စည်|ျက်|်နိ|းခြ|တ် |ာင့|ု လ|ခံစ|်ပြ|် က|်းပ|းကြ|ု အ|သား|် န| အာ|ေး | ခံ|င်သ|ပြင|ားသ|ားန|ပ်ခ|်ဖြ|အတွ|ြီး|မဟု|ဟုတ|်သိ|က်သ|ပ်သ|ေးက|်။ |တည်|အဖွ|က်မ|်ရွ|်းခ|် သ| သိ|၊ မ|်ရာ|ုက်|လို|ဥပဒ|ပဒေ|ားဖ|ည်သ|မျှ|်မျ|စ်သ|ားလ|သင်|ပညာ| ကြ|မှ |ကွယ|းချ| အက|ျို|တရာ|ရား|်ချ|ြေည|ေညာ|းတိ|တွက|၊ က|ဆော|ပြစ|ားခ|်မြ|ု့တ|သက်|်ရေ|်ကိ|် ထ|်နှ| အပ|ရာ |လူ့|ာ လ|ခြေ|်ရန| အဆ| တူ|တူည|ူညီ|လုံ| တိ|်းန|ပေး|ွေး|ှု |၊ သ|ားရ|လူမ|ံစာ|ားစ|ေရန|ေးခ|တ်ခ|ျင်|၊ န| အတ|သိမ|ှော|ာ သ|်းအ|စ်မ|ားပ| မျ|ားတ|်းလ| နှ|မိ၏|၏ အ|ိုသ|းသေ|င်၊|်သူ| အလ|ထား|ပ် |် ခ|င်မ|ဂ္ဂ|ူမျ|က်စ|ု သ| ကိ|ရွက|့တည|းမဟ|ပေါ|ဒေအ|် စ|ှင်|င်က|်ကြ|ချင",
    "shn": "င်ႈ|ၼ်း|လႆႈ|င်း|ုၼ်|်း |ူင်|ူၼ်|ဝ်း|ၼ်ႉ|ွင်|ိူင|ၼၼ်|်ႇလ|ၼ်ႇ|ူဝ်|်ႈလ|ႇလႆ|မ်ႇ|မိူ|်းၵ|ၵူၼ|င်ႇ|ၢင်|သုၼ|ုင်|တႃႇ|တ်ႈ|ဢမ်|လႄႈ|မီး|တ်း|ၼႆႉ|လွင|ိူဝ|ႆႉ |မ်း|ဢၼ်|်ႈ |ဝ်ႈ|ၼ် |ၵေႃ|ိုင|်းလ|ဵၼ်|ႈ တ| လွ|်းၼ|ုၵ်|ၢၼ်|ွတ်| တႃ|ႄႈ |ၵ်း|ုမ်|ႆႈ |လႅဝ|ႅဝ်|ယူႇ|လွတ|ဵင်|းသု|ၵူႊ| တေ|ၵၼ်|ေႃႉ|်းတ| ဢၼ|ၵ်ႇ| မီ|ီးသ| လႄ|်ႉ |်ႈမ|်ႈၵ|ၸႂ်|ိုၼ|ပဵၼ|မ်ႈ|သေ |ႈ လ|ွၼ်|ပိူ|ၵ်ႈ|းၵူ|်ႇပ|်းပ|ၸို|်းသ|်းမ|်ႈတ|ႃႉၼ|ဝ်ႇ|်းၸ|်၊ |်ႇ |တီႈ|ူႊၵ|ႈမိ|ႈလႅ|ႊၵေ|ိုဝ|ုဝ်|်ႈပ|တင်|ပ်ႉ|်ႈၸ|ၶဝ်|်ႇၼ|်ႇမ|ူႇ။|ႉၼႆ|ႂ်ႈ|ၼ်ႈ|ႉ မ|ၼ်ၵ|းၼၼ| ၵူ|ေဢမ|ၵၢၼ|ိင်|ႉ တ|ၼ်လ|တေႃ|င် |ၢႆး|်းႁ|်းယ|း လ|ႁဵတ|ဵတ်|် လ|လႂ်|ႃႈ |ၢဝ်|ပၼ်|်းၶ|။ၵူ|ိူၼ|ႇပဵ|ေႃႇ|သင်|ႈလွ|ပို|မၼ်|ႁႂ်|တ်ႇ|ူၺ်|တေလ|ေလႆ|်ႉတ|ႃႇ |်ႈၼ|ဝ် |ၾိင|းမိ|ေႃႈ|ႇၼၼ|်ႇႁ|်ၼၼ|်ႇၵ|်ႉလ|ထုၵ|လုမ|်ႈႁ|ၢမ်|ႈသင|တေဢ|း ဢ|ၵ်ႉ|တၢင|ွမ်|ၼႃႈ|ၼင်|းပိ|ႈတႃ| ဢမ|သၢင|ၼ်ပ|ၼ်ၽ|ပၢႆ|် တ|ၽဵင|်ႈဢ|ႄႈသ| သု|်ၵူ|်ၼႆ|ၢႆႇ|း၊ |ၸွမ|ႃႇၶ|်ႈယ|ၵဝ်|ၺ်ႈ|ႁပ်|ႆႈတ|းလွ|ၼ်ၼ|်ႉယ|ထို|်သေ|လုၵ|ၸုမ|ႈ ဢ|ူမ်|် ဢ|ပ်း|်ႉႁ|ႇ။ၵ|်ႇၸ|ႈလႆ|ၸိူ|လိူ|ႈၸိ|ဢဝ်|ၢတ်|်းဢ|ၼႂ်|ႂ်း|လူၺ|ၼ်ဢ|ၼ်မ|်ၸိ|ဝ်ႉ|ဝ်ၼ|်း၊|၊ လ|ွၵ်|်ႇတ|ၼ်တ|ပဵင|်ႇၽ|ဝႆႉ|်ႉၵ|းၼႆ|ႂ်ႉ|ၶွင|ႉ လ|်းထ|ႆႈမ|ႃႇၵ|ႃႇလ|်ႉသ|ၾၢႆ| ပိ|းလႅ|ႉယူ|းသေ|်ႇၶ|ဝႃႈ|တို|င်၊|း ၸ|ႁို|ၼ်သ|ႈမီ|ႅင်| လု|င်သ| မိ|ႆႈသ|ႆႈပ|ႈ ပ|ၵိူ|င်ၸ|ႇၶဝ|ႁူမ|တူဝ|ပွင|ိၵ်|ီးလ|ႅတ်|ယမ်|ႈၵူ|ႇၵၼ| ၾၢ|ႇ လ|းၵၢ|ူပ်|း တ|ႁၼ်|ၼ်ၸ|ူၵ်|င်ႊ| ၼႂ|်တေ|ႃႇတ|ူတ်|ႂ်ႇ|ယဵၼ| တီ|်ႇဝ|းတေ|ႈလု|်ႈၾ|ႈၾႃ|ၾႃႉ|၊ တ|းသၢ"
  },
  "Ethiopic": {
    "amh": "፡መብ|ሰው፡|ት፡አ|ብት፡|መብት|፡ሰው|፡አለ|፡ወይ|ወይም|ይም፡|ነት፡|አለው|ለው።|ንዱ፡|እያን|ያንዳ|ንዳን|ዳንዱ|ዱ፡ሰ|፡እን|ት፡መ|፡የመ|።እያ|እንዲ|፡ነጻ|፡የተ|ም፡በ|ው፡የ|ም፡የ|ና፡በ|፡የሚ|ን፡የ|፡የማ|ና፡የ|ነጻነ|፡አይ|ው።፡|ት፡የ|ው፡በ|ሆነ፡|ቶች፡|ትና፡|ኀብረ|፡በሚ|ው።እ|፡መን|ትን፡|ውም፡|ንም፡|፡አገ|፡ያለ|እኩል|ብቻ፡|መብቶ|፡ለመ|ማንኛ|ንኛው|ኛውም|ም፡ሰ|፡እኩ|ሆን፡|ለት፡|በት፡|ራዊ፡|፡በተ|ረት፡|ት፡በ|፡ለማ|መንግ|ወንጀ|።ማን|ማንም|ጋብቻ|፡ልዩ|ም፡እ|ኩል፡|ጠበቅ|ጻነት|ሰብ፡|ደህን|ህንነ|ዎች፡|ብቶች|ፍርድ|ርድ፡|በትም|ው።ማ|ማግኘ|ግኘት|ትም፡|ል፡መ|ር፡ወ|ነጻ፡|።፡እ|ሥራ፡|፡በመ|፡ደህ|፡የሆ|ች፡በ|፡በሆ|፡ሁሉ|ይነት|ተግባ|ፈጸም|፡ድር|ት፡ወ|ሕግ፡|፡ወን|ቱን፡|ም።እ|ልዩነ|ዩነት|ብ፡የ|የማግ|ኘት፡|፡ደረ|ደረጃ|፡መሠ|መሠረ|ሃይማ|ይማኖ|፡በኀ|በኀብ|፡ሥራ|ንና፡|ነትና|ቸው፡|፡ጊዜ|በር፡|ማኀበ|፡ኑሮ|፡ነው|ነው።|ችና፡|ሁሉ፡|ጻነቶ|ነቶች|፡ዓይ|ዓይነ|ግባር|ባር፡|ም፡መ|፡በሕ|ገር፡|፡ከሚ|ትም።|ን፡ወ|፡ይህ|እንደ|ብሔራ|ሔራዊ|ረግ፡|ሎች፡|ች፡የ|ት፡እ|ቤተሰ|፡አስ|ር፡የ|ሆኑ፡|ነቱ፡|ንዲጠ|ዲጠበ|ና፡ለ|የመኖ|በቅ፡|፡መሆ|መሆን|ን፡አ|አለበ|ለበት|በት።|ትምህ|ምህር|ህርት|ርት፡|ት፡ለ|፡አላ|፡እያ|ው፡ከ|የሚያ|፡የኀ|የኀብ|ል።እ|ሌሎች|ን፡መ|ብረ፡|ውን፡|ንነት|ትክክ|የሆነ|፡ብቻ|ተባበ|ሩት፡|ት፡ድ|፡መሰ|በሆነ|ይገባ|፡ማን|ጸም፡|ንግሥ|ድርጅ|ርጅት|፡ቢሆ|ቢሆን|በሕግ|ንጀል|ጀል፡|አይፈ|አገር|ዜግነ|ፈጸመ|፡ጋብ|ት፡ይ|፡በግ|፡ሆኖ|ሆኖ፡|ነቱን|አገሩ|ገሩ፡|።፡ይ|ህም፡|ር፡በ|ር፡አ|ንግስ|ው፡ያ|አንድ|ንድ፡|ስት፡|ም፡ከ|መው፡|ንነቱ|፡መጠ|ቅ፡መ|አላቸ|ላቸው|፡በአ|፡ይገ|፡የአ|ረጃ፡|ሰብዓ|ብዓዊ|ዓዊ፡|ረታዊ|ታዊ፡|ንዲሁ|ዲሁም|ሁም፡|ማኖት|ኖት፡|መኖር|መጠበ|ው፡ለ|፡ትም|ረ፡ሰ|ሰቡ፡|ንስ፡|፡የሃ|ች፡እ|ደረግ|ኢንተ|ንተር|ተርና|ርናሽ|ናሽና|ሽናል|ናል፡|ሙሉ፡|ብረሰ|የሚፈ|፡በነ|በነጻ|ምበት|ት፡ጊ|ጊዜ፡|ችን፡|፡ገብ|ገብነ|ብነት|ነትን|፡ማኀ|ኑሮ፡|ክክለ|ክለኛ|ፈላጊ|ና፡ነ|፡በማ|፡ሁኔ|ሁኔታ|መሰረ|ነ፡መ|ዚህ፡|፡ውሳ|ሉ፡በ|፡ውስ|ውስጥ|ስጥ፡|ጥ፡የ|ም፡ዓ|፡ተግ|ን፡ለ",
    "tir": " መሰ| ሰብ|ሰብ | ኦለ|ትን |ኦለዎ|ናይ | ናይ| ኦብ|ዎ፡፡|ሕድሕ|ለዎ፡|ኦብ |ድሕድ|ሕድ |ውን |መሰል|ሰል |ድ ሰ|ይ ም|ል ኦ|፡፡ሕ|፡ሕድ|ካብ | ወይ|ወይ | መን|ን መ| ነፃ|ዝኾነ|፡፡ |ነት |ታት |ብ ዝ| ካብ|ን ነ|መሰላ|ነፃነ|ብ መ|ኦዊ | እዚ|ታትን| እን|ብ ብ|ን ም|ዊ መ|ት ኦ|መንግ|ንግስ|ሰላት|ን ኦ|ሰብኦ|ብኦዊ|እዚ |ኾነ | ምር|ን ን| ዝኾ|ኹን | ንክ|ን፡፡| ሃገ|ምርካ|ርካብ|ሕጊ |ራት | ኦይ| ይኹ|ይኹን|ይ ብ|ማዕሪ|ሎም | ብሕ| ንም|ነ ይ| ከም|ራዊ |ን ብ|ርን | ፣ |ማሕበ| ዝተ|ብ ኦ|ብ ሕ|ላትን|፣ ብ| ኦድ|’ውን|ዕሪ |ታዊ |ን ዝ| ማዕ|ት መ|ግስታ|ስታት|ነታት| ስለ|ስራሕ|ኩሎም| ማሕ|ሕበራ|ዓለም|ን ሰ|ኦት |ነትን| ድን|ድንጋ|ንጋገ|ፃነታ|ት ወ|ብን |ፃነት| ብም|ሃገራ|ዋን | ስራ|ን ሓ|ለዎም|ም፡፡|መሰሪ|ትምህ|ምህር| ኩሎ|ዓት |ነቱ |ካልኦ|ልኦት|ተሰብ|ብሕጊ| ውድ|ውድብ|ድብ | ሕቡ|ሕቡራ|ቡራት|፣ ኦ|ዚ ድ|ም መ| ዘይ| ገበ| ምዃ|ከምኡ|ምኡ’|ኡ’ው|እንት| ብዘ|በራዊ| ሓለ|ሓለዋ|ዎም፡|ት ብ| ትም|ህርቲ|ርቲ |ት፣ |ን ዘ|ነፃ |ቱ ን| ዓለ|ራሕ |ኸውን| ብዝ|ጋገ |ኾነ፣|ነ፣ |ላት |ስለዝ|ለዝኾ|ሃገሩ|ገሩ | ምስ|በን |ይ ኦ| ክብ| ህዝ|ዕሊ |ን ና|እንተ| ብማ|ሰሪታ|ሃይማ|ይማኖ| ስር|ስርዓ|ርዓት|ት ና|ልን | ሕብ|ሕብሪ|ብሪተ|ሪተሰ|ባት |ን ተ| ሰባ|ሰባት|ለምለ|ምለኻ| ሕጊ| ደቂ|ደቂ | እዋ|እዋን|ተደን|ት እ|ምዃኑ|ዃኑ | ብሃ|ለኻዊ|ኻዊ | ሕድ|፣ ን|ኦድላ|ባል |፣ ከ|ት ስ|ሕን |ቤተሰ|ናን | ልዕ|ብዘይ|ዊ ክ| ብሓ| ሃይ| ምሕ| ክኸ|ክኸው|ምን |ዊ ወ|ታውን|ን ስ|ሪጋገ|ነፃን|ፃን |ን ካ| ካል|ት ን|ሓደ |ብ ዘ|ር፣ |እን |ን እ|ግስቲ|ገ እ|ም ን|ህዝብ|ዝብታ|ብታት|ም ሰ| ነዚ|ነዚ | ክሳ|ክሳብ|ሳብ |ገበን|ገራት|ትዮን|ዮን | ዜግ|ዜግነ| ምም|ሪ መ|ይፍፀ|ብ እ|ጊ ካ|ዝተደ|ደንገ|ንገገ|ገገ |ገ ስ| ወፃ|ወፃኢ|ፃኢ | እም|እምነ|ዚ መ|ል እ| ምእ|ቲ ክ|ዚ ብ|ምስ |ስቲ |ዘይ |ኦድል|ድልዎ|ልዎ |ድ ኦ|ክብሩ|ድላዪ|ላዪ | ኦባ|ኦባል|ብ ና| ፍት|ፍትሓ|ን ክ| ቤተ| ደሪ|ደሪጃ|ዊ ኦ|ልዕሊ"
  },
  "Hebrew": {
    "heb": "ות |ים |כל |ת ה| כל|דם |אדם|יות| של| זכ|ל א| אד|של |ל ה|אי |ויו|י ל|כאי|ת ו|זכא| ול|לא |רות| וה|ית |זכו|ירו|ין | או|ם ז| הח| לא|או | וב| הא| המ|חיר|ון |יים|רה |ת ל|ת ש|ם ל|ת ב|את | לה|נה |ו ב|ותי|ו ל|ה ש|כוי| הו|ת א|ם ו|תו |ם ב| את|לה |ני |דה | במ|אומ|ה ה|ם ה| על|על |וך |ה ב|א י|הוא|ה ו|ואי|ת כ|בוד|וד |נות|ה א|יה |י ה|שוו|ינו|ם א|ם ש|ו כ|ו ו| שו| שה|כות|ן ה|החי|וה | בי|ה מ|בות|לאו|דות|וא |ה ל|לית|ה כ| לפ| הי| בכ|החו|ל ב|בחי|ן ש|לו |ור | לב|ת מ|הכר|פלי| אח|ן ל|בין|חינ|ירה|ומי|מי | יה|חוק|ליה|חבר| בנ|ן ו|יבו| לע|ולה| חי| הז|רוי|עה |י א|נו |ווה|האד| הע|נוך|ו א| חו|חופ|ופש|יו |ל מ|כבו| הד|י ו| הכ|בני|מדי|וק |רצו| הפ| בע|ם כ|אחר|הגנ|ל ו|יפו|יסו|סוד|רך |ילי|הם |פי |חות| אי|איש|אלי|כלל|לם |בזכ| אל|תיה|האו|מות|זש |זו |איל|ו ה| בא|דינ|ר א|יל |תי |משפ|פני|ללא|להג|ן ב|ודה|דו |שוא|אין| לח| בש|ה פ| לכ| דר|דרך|ליל|חיי|רבו|המד|ל י|מנו|וצי|ובי|י ש|היה|לפי|ך ה|נתו| לו|שית|שיו| בח|לת |וי |שות|לל |תוך| בז|ונו|ומו| זו| למ|היא|יא |עול| מע|מעש|שה |תם | לק|ל ז| בה| מש| ומ| שר|שרי| אר|ארצ|א ה|עם |ולא| עב|ם נ|עבו|ת ז|פול|גנה|לכל|ידה|חה |לחי|היס|יהם| סו|סוצ|ציא|יאל|בו |יהי|חרו|ונה|פשי|ישי|ותו| יו|תיו|גבל| יח|יחס|ד א|הכל| בת|ולם|הן |המא|מאו|וחד|ום | לי|שהי|א ל|הזכ|עות|הפל|אל | פל|אים|מה |ריר|ו ע|החב|ה ח| לל",
    "ydd": " פֿ|ון |ער |ן א| אַ|דער|ט א| או|און|אַר|ען |פֿו| אי| אױ|ן פ|ֿון|רעכ| דע| רע|עכט|ן ד|פֿא|כט | די|די |אַ |אױף|ױף |ֿאַ| זײ|אַל| גע|אָס| אָ| הא|ונג|האָ|זײַ| מע|אָל|נג |ַן |װאָ|אַנ|רײַ| װא| יע|יעד|באַ|ניט|ָס |עדע|אָר|אָט|ן ז|יט |ר א|זאָ|ָט |מען| בא|ײַן|פֿר|טן |ן ג|אין|ין |נאַ|ן װ|ֿרײ|ר ה| זא|לעכ|ע א|אָד|אַצ|ענט|ַ ר|אָנ| צו|ַצי|מענ|ָדע| װע|יז |ַלע|ן מ|איז|בן |ָל |טלע| פּ|ר מ| מי|מיט|טער|ײט |עכע|לע |ַנד|געז|עזע|אַפ|ַפֿ|ע פ|לאַ|ראַ| ני|רן |ײַנ|כע |טיק|נען|ן ב|פֿע|יע |נטש|ײַה|ַהײ|הײט|ט ד|שאַ|פֿט|לן |ן נ|ר פ|קן | װי|דיק|ט פ|טאָ| זי|רונ| דא|ַרב|ף א|אָב|יקן|ות |ערע|כער|פּר|י פ|ר ג|קער|אַק|קט | גל|ציא|יאָ|עם |ישע| קײ|ן ק|צו |ציע|סער|יט־|גן |טאַ|ונט|לײַ|ָנא|ענע|נגע|יק |יקט|יקע|ַרא| טא|שן |עט |ס א|ט־א|־אי|ַנע|דאָ|װער|י א|ן י|נטע|ײנע|ָר |זיך|יך |־ני|װי |ערן|ָבן|נדע|ֿעל|אױס|ָסע|ער־|ר־נ|גלײ|אָפ|נד |ט צ|ראָ|ן ה| נא| כּ|ג א|זעל|עלק|לקע|ר ד| גר| צי|ט װ|דור|עס |ן ל|שע |ר ז|רע |קע |גען|קײט|ֿט |קלא|פּע|ג פ|ײטן|יות|קײנ| לא| דו|ײַכ|ר װ|ים |ַרז|בעט|ָפּ| הי|אַמ|ל ז|אינ|ײַ |י ד|ע ר|נטל|אַט|עלש|לשא|ן ש| שו|ף פ|יטע|ס ז|נט |היו|ת װ|בער| שט|ורך|רך |כן |גער|שפּ|רבע|אומ|נער|רט |ערצ|יונ|ך א|פֿן| לע|סן |ליט|ּרא|לער|ם א|ט ז|י ג|אַש|ע מ|רעס|ן כ|ן צ|עפֿ|נעם|מאָ|ום |גרו|נעמ|עמע|טעט|ז א|שטע|װעל|ם ט|יבע|אַן|טרא|ַרע|ישן|ן ר"
  }
}

},{}],37:[function(require,module,exports){
// This file is generated by `build.js`.
module.exports = {
  cmn: /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FEF\uF900-\uFA6D\uFA70-\uFAD9]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/g,
  Latin: /[A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB64\uAB66\uAB67\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A]/g,
  Cyrillic: /[\u0400-\u0484\u0487-\u052F\u1C80-\u1C88\u1D2B\u1D78\u2DE0-\u2DFF\uA640-\uA69F\uFE2E\uFE2F]/g,
  Arabic: /[\u0600-\u0604\u0606-\u060B\u060D-\u061A\u061C\u061E\u0620-\u063F\u0641-\u064A\u0656-\u066F\u0671-\u06DC\u06DE-\u06FF\u0750-\u077F\u08A0-\u08B4\u08B6-\u08BD\u08D3-\u08E1\u08E3-\u08FF\uFB50-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFD\uFE70-\uFE74\uFE76-\uFEFC]|\uD803[\uDE60-\uDE7E]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB\uDEF0\uDEF1]/g,
  ben: /[\u0980-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09FE]/g,
  Devanagari: /[\u0900-\u0950\u0955-\u0963\u0966-\u097F\uA8E0-\uA8FF]/g,
  jpn: /[\u3041-\u3096\u309D-\u309F]|\uD82C[\uDC01-\uDD1E\uDD50-\uDD52]|\uD83C\uDE00|[\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D]|\uD82C[\uDC00\uDD64-\uDD67]|[㐀-䶵一-龯]/g,
  kor: /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/g,
  tel: /[\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C77-\u0C7F]/g,
  tam: /[\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BFA]|\uD807[\uDFC0-\uDFF1\uDFFF]/g,
  guj: /[\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AF1\u0AF9-\u0AFF]/g,
  kan: /[\u0C80-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2]/g,
  mal: /[\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4F\u0D54-\u0D63\u0D66-\u0D7F]/g,
  Myanmar: /[\u1000-\u109F\uA9E0-\uA9FE\uAA60-\uAA7F]/g,
  ori: /[\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B77]/g,
  pan: /[\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A76]/g,
  Ethiopic: /[\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u137C\u1380-\u1399\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E]/g,
  tha: /[\u0E01-\u0E3A\u0E40-\u0E5B]/g,
  sin: /[\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4]|\uD804[\uDDE1-\uDDF4]/g,
  ell: /[\u0370-\u0373\u0375-\u0377\u037A-\u037D\u037F\u0384\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03E1\u03F0-\u03FF\u1D26-\u1D2A\u1D5D-\u1D61\u1D66-\u1D6A\u1DBF\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u2126\uAB65]|\uD800[\uDD40-\uDD8E\uDDA0]|\uD834[\uDE00-\uDE45]/g,
  khm: /[\u1780-\u17DD\u17E0-\u17E9\u17F0-\u17F9\u19E0-\u19FF]/g,
  hye: /[\u0531-\u0556\u0559-\u0588\u058A\u058D-\u058F\uFB13-\uFB17]/g,
  sat: /[\u1C50-\u1C7F]/g,
  bod: /[\u0F00-\u0F47\u0F49-\u0F6C\u0F71-\u0F97\u0F99-\u0FBC\u0FBE-\u0FCC\u0FCE-\u0FD4\u0FD9\u0FDA]/g,
  Hebrew: /[\u0591-\u05C7\u05D0-\u05EA\u05EF-\u05F4\uFB1D-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFB4F]/g,
  kat: /[\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u10FF\u1C90-\u1CBA\u1CBD-\u1CBF\u2D00-\u2D25\u2D27\u2D2D]/g,
  lao: /[\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF]/g,
  zgh: /[\u2D30-\u2D67\u2D6F\u2D70\u2D7F]/g,
  iii: /[\uA000-\uA48C\uA490-\uA4C6]/g,
  aii: /[\u0700-\u070D\u070F-\u074A\u074D-\u074F\u0860-\u086A]/g
}

},{}],38:[function(require,module,exports){
'use strict'

/* Load `trigram-utils`. */
var utilities = require('trigram-utils')

/* Load `expressions` (regular expressions matching
 * scripts). */
var expressions = require('./expressions.js')

/* Load `data` (trigram information per language,
 * per script). */
var data = require('./data.json')

/* Expose `detectAll` on `detect`. */
detect.all = detectAll

/* Expose `detect`. */
module.exports = detect

/* Maximum sample length. */
var MAX_LENGTH = 2048

/* Minimum sample length. */
var MIN_LENGTH = 10

/* The maximum distance to add when a given trigram does
 * not exist in a trigram dictionary. */
var MAX_DIFFERENCE = 300

/* Construct trigram dictionaries. */
;(function() {
  var languages
  var name
  var trigrams
  var model
  var script
  var weight

  for (script in data) {
    languages = data[script]

    for (name in languages) {
      model = languages[name].split('|')

      weight = model.length

      trigrams = {}

      while (weight--) {
        trigrams[model[weight]] = weight
      }

      languages[name] = trigrams
    }
  }
})()

/**
 * Get the most probable language for the given value.
 *
 * @param {string} value - The value to test.
 * @param {Object} options - Configuration.
 * @return {string} The most probable language.
 */
function detect(value, options) {
  return detectAll(value, options)[0][0]
}

/**
 * Get a list of probable languages the given value is
 * written in.
 *
 * @param {string} value - The value to test.
 * @param {Object} options - Configuration.
 * @return {Array.<Array.<string, number>>} An array
 *   containing language--distance tuples.
 */
function detectAll(value, options) {
  var settings = options || {}
  var minLength = MIN_LENGTH
  var only = [].concat(settings.whitelist || [], settings.only || [])
  var ignore = [].concat(settings.blacklist || [], settings.ignore || [])
  var script

  if (settings.minLength !== null && settings.minLength !== undefined) {
    minLength = settings.minLength
  }

  if (!value || value.length < minLength) {
    return und()
  }

  value = value.slice(0, MAX_LENGTH)

  /* Get the script which characters occur the most
   * in `value`. */
  script = getTopScript(value, expressions)

  /* One languages exists for the most-used script. */
  if (!(script[0] in data)) {
    /* If no matches occured, such as a digit only string,
     * or because the language is ignored, exit with `und`. */
    if (script[1] === 0 || !allow(script[0], only, ignore)) {
      return und()
    }

    return singleLanguageTuples(script[0])
  }

  /* Get all distances for a given script, and
   * normalize the distance values. */
  return normalize(
    value,
    getDistances(utilities.asTuples(value), data[script[0]], only, ignore)
  )
}

/**
 * Normalize the difference for each tuple in
 * `distances`.
 *
 * @param {string} value - Value to normalize.
 * @param {Array.<Array.<string, number>>} distances
 *   - List of distances.
 * @return {Array.<Array.<string, number>>} - Normalized
 *   distances.
 */
function normalize(value, distances) {
  var min = distances[0][1]
  var max = value.length * MAX_DIFFERENCE - min
  var index = -1
  var length = distances.length

  while (++index < length) {
    distances[index][1] = 1 - (distances[index][1] - min) / max || 0
  }

  return distances
}

/**
 * From `scripts`, get the most occurring expression for
 * `value`.
 *
 * @param {string} value - Value to check.
 * @param {Object.<RegExp>} scripts - Top-Scripts.
 * @return {Array} Top script and its
 *   occurrence percentage.
 */
function getTopScript(value, scripts) {
  var topCount = -1
  var topScript
  var script
  var count

  for (script in scripts) {
    count = getOccurrence(value, scripts[script])

    if (count > topCount) {
      topCount = count
      topScript = script
    }
  }

  return [topScript, topCount]
}

/**
 * Get the occurrence ratio of `expression` for `value`.
 *
 * @param {string} value - Value to check.
 * @param {RegExp} expression - Code-point expression.
 * @return {number} Float between 0 and 1.
 */
function getOccurrence(value, expression) {
  var count = value.match(expression)

  return (count ? count.length : 0) / value.length || 0
}

/**
 * Get the distance between an array of trigram--count
 * tuples, and multiple trigram dictionaries.
 *
 * @param {Array.<Array.<string, number>>} trigrams - An
 *   array containing trigram--count tuples.
 * @param {Object.<Object>} languages - multiple
 *   trigrams to test against.
 * @param {Array.<string>} only - Allowed languages; if
 *   non-empty, only included languages are kept.
 * @param {Array.<string>} ignore - Disallowed languages;
 *   included languages are ignored.
 * @return {Array.<Array.<string, number>>} An array
 *   containing language--distance tuples.
 */
function getDistances(trigrams, languages, only, ignore) {
  var distances = []
  var language

  languages = filterLanguages(languages, only, ignore)

  for (language in languages) {
    distances.push([language, getDistance(trigrams, languages[language])])
  }

  return distances.length === 0 ? und() : distances.sort(sort)
}

/**
 * Get the distance between an array of trigram--count
 * tuples, and a language dictionary.
 *
 * @param {Array.<Array.<string, number>>} trigrams - An
 *   array containing trigram--count tuples.
 * @param {Object.<number>} model - Object
 *   containing weighted trigrams.
 * @return {number} - The distance between the two.
 */
function getDistance(trigrams, model) {
  var distance = 0
  var index = -1
  var length = trigrams.length
  var trigram
  var difference

  while (++index < length) {
    trigram = trigrams[index]

    if (trigram[0] in model) {
      difference = trigram[1] - model[trigram[0]] - 1

      if (difference < 0) {
        difference = -difference
      }
    } else {
      difference = MAX_DIFFERENCE
    }

    distance += difference
  }

  return distance
}

/**
 * Filter `languages` by removing languages in
 * `ignore`, or including languages in `only`.
 *
 * @param {Object.<Object>} languages - Languages
 *   to filter
 * @param {Array.<string>} only - Allowed languages; if
 *   non-empty, only included languages are kept.
 * @param {Array.<string>} ignore - Disallowed languages;
 *   included languages are ignored.
 * @return {Object.<Object>} - Filtered array of
 *   languages.
 */
function filterLanguages(languages, only, ignore) {
  var filteredLanguages
  var language

  if (only.length === 0 && ignore.length === 0) {
    return languages
  }

  filteredLanguages = {}

  for (language in languages) {
    if (allow(language, only, ignore)) {
      filteredLanguages[language] = languages[language]
    }
  }

  return filteredLanguages
}

/**
 * Check if `language` can match according to settings.
 *
 * @param {string} language - Languages
 *   to filter
 * @param {Array.<string>} only - Allowed languages; if
 *   non-empty, only included languages are kept.
 * @param {Array.<string>} ignore - Disallowed languages;
 *   included languages are ignored.
 * @return {boolean} - Whether `language` can match
 */
function allow(language, only, ignore) {
  if (only.length === 0 && ignore.length === 0) {
    return true
  }

  return (
    (only.length === 0 || only.indexOf(language) !== -1) &&
    ignore.indexOf(language) === -1
  )
}

/* Create a single `und` tuple. */
function und() {
  return singleLanguageTuples('und')
}

/* Create a single tuple as a list of tuples from a given
 * language code. */
function singleLanguageTuples(language) {
  return [[language, 1]]
}

/* Deep regular sort on the number at `1` in both objects. */
function sort(a, b) {
  return a[1] - b[1]
}

},{"./data.json":36,"./expressions.js":37,"trigram-utils":42}],39:[function(require,module,exports){
module.exports = [
    {"name":"Abkhaz", "local":"Аҧсуа", "1":"ab", "2":"abk", "2T":"abk", "2B":"abk", "3":"abk"},
    {"name":"Afar", "local":"Afaraf", "1":"aa", "2":"aar", "2T":"aar", "2B":"aar", "3":"aar"},
    {"name":"Afrikaans", "local":"Afrikaans", "1":"af", "2":"afr", "2T":"afr", "2B":"afr", "3":"afr"},
    {"name":"Akan", "local":"Akan", "1":"ak", "2":"aka", "2T":"aka", "2B":"aka", "3":"aka"},
    {"name":"Albanian", "local":"Shqip", "1":"sq", "2":"sqi", "2T":"sqi", "2B":"alb", "3":"sqi"},
    {"name":"Amharic", "local":"አማርኛ", "1":"am", "2":"amh", "2T":"amh", "2B":"amh", "3":"amh"},
    {"name":"Arabic", "local":"العربية", "1":"ar", "2":"ara", "2T":"ara", "2B":"ara", "3":"ara"},
    {"name":"Aragonese", "local":"Aragonés", "1":"an", "2":"arg", "2T":"arg", "2B":"arg", "3":"arg"},
    {"name":"Armenian", "local":"Հայերեն", "1":"hy", "2":"hye", "2T":"hye", "2B":"arm", "3":"hye"},
    {"name":"Assamese", "local":"অসমীয়া", "1":"as", "2":"asm", "2T":"asm", "2B":"asm", "3":"asm"},
    {"name":"Avaric", "local":"Авар", "1":"av", "2":"ava", "2T":"ava", "2B":"ava", "3":"ava"},
    {"name":"Avestan", "local":"avesta", "1":"ae", "2":"ave", "2T":"ave", "2B":"ave", "3":"ave"},
    {"name":"Aymara", "local":"Aymar", "1":"ay", "2":"aym", "2T":"aym", "2B":"aym", "3":"aym"},
    {"name":"Azerbaijani", "local":"Azərbaycanca", "1":"az", "2":"aze", "2T":"aze", "2B":"aze", "3":"aze"},
    {"name":"Bambara", "local":"Bamanankan", "1":"bm", "2":"bam", "2T":"bam", "2B":"bam", "3":"bam"},
    {"name":"Bashkir", "local":"Башҡортса", "1":"ba", "2":"bak", "2T":"bak", "2B":"bak", "3":"bak"},
    {"name":"Basque", "local":"Euskara", "1":"eu", "2":"eus", "2T":"eus", "2B":"baq", "3":"eus"},
    {"name":"Belarusian", "local":"Беларуская", "1":"be", "2":"bel", "2T":"bel", "2B":"bel", "3":"bel"},
    {"name":"Bengali", "local":"বাংলা", "1":"bn", "2":"ben", "2T":"ben", "2B":"ben", "3":"ben"},
    {"name":"Bihari", "local":"भोजपुरी", "1":"bh", "2":"bih", "2T":"bih", "2B":"bih", "3":"bih"},
    {"name":"Bislama", "local":"Bislama", "1":"bi", "2":"bis", "2T":"bis", "2B":"bis", "3":"bis"},
    {"name":"Bosnian", "local":"Bosanski", "1":"bs", "2":"bos", "2T":"bos", "2B":"bos", "3":"bos"},
    {"name":"Breton", "local":"Brezhoneg", "1":"br", "2":"bre", "2T":"bre", "2B":"bre", "3":"bre"},
    {"name":"Bulgarian", "local":"Български", "1":"bg", "2":"bul", "2T":"bul", "2B":"bul", "3":"bul"},
    {"name":"Burmese", "local":"မြန်မာဘာသာ", "1":"my", "2":"mya", "2T":"mya", "2B":"bur", "3":"mya"},
    {"name":"Catalan", "local":"Català", "1":"ca", "2":"cat", "2T":"cat", "2B":"cat", "3":"cat"},
    {"name":"Chamorro", "local":"Chamoru", "1":"ch", "2":"cha", "2T":"cha", "2B":"cha", "3":"cha"},
    {"name":"Chechen", "local":"Нохчийн", "1":"ce", "2":"che", "2T":"che", "2B":"che", "3":"che"},
    {"name":"Chichewa", "local":"Chichewa", "1":"ny", "2":"nya", "2T":"nya", "2B":"nya", "3":"nya"},
    {"name":"Chinese", "local":"中文", "1":"zh", "2":"zho", "2T":"zho", "2B":"chi", "3":"zho"},
    {"name":"Chuvash", "local":"Чӑвашла", "1":"cv", "2":"chv", "2T":"chv", "2B":"chv", "3":"chv"},
    {"name":"Cornish", "local":"Kernewek", "1":"kw", "2":"cor", "2T":"cor", "2B":"cor", "3":"cor"},
    {"name":"Corsican", "local":"Corsu", "1":"co", "2":"cos", "2T":"cos", "2B":"cos", "3":"cos"},
    {"name":"Cree", "local":"ᓀᐦᐃᔭᐍᐏᐣ", "1":"cr", "2":"cre", "2T":"cre", "2B":"cre", "3":"cre"},
    {"name":"Croatian", "local":"Hrvatski", "1":"hr", "2":"hrv", "2T":"hrv", "2B":"hrv", "3":"hrv"},
    {"name":"Czech", "local":"Čeština", "1":"cs", "2":"ces", "2T":"ces", "2B":"cze", "3":"ces"},
    {"name":"Danish", "local":"Dansk", "1":"da", "2":"dan", "2T":"dan", "2B":"dan", "3":"dan"},
    {"name":"Divehi", "local":"Divehi", "1":"dv", "2":"div", "2T":"div", "2B":"div", "3":"div"},
    {"name":"Dutch", "local":"Nederlands", "1":"nl", "2":"nld", "2T":"nld", "2B":"dut", "3":"nld"},
    {"name":"Dzongkha", "local":"རྫོང་ཁ", "1":"dz", "2":"dzo", "2T":"dzo", "2B":"dzo", "3":"dzo"},
    {"name":"English", "local":"English", "1":"en", "2":"eng", "2T":"eng", "2B":"eng", "3":"eng"},
    {"name":"Esperanto", "local":"Esperanto", "1":"eo", "2":"epo", "2T":"epo", "2B":"epo", "3":"epo"},
    {"name":"Estonian", "local":"Eesti", "1":"et", "2":"est", "2T":"est", "2B":"est", "3":"est"},
    {"name":"Ewe", "local":"Eʋegbe", "1":"ee", "2":"ewe", "2T":"ewe", "2B":"ewe", "3":"ewe"},
    {"name":"Faroese", "local":"Føroyskt", "1":"fo", "2":"fao", "2T":"fao", "2B":"fao", "3":"fao"},
    {"name":"Fijian", "local":"Na Vosa Vaka-Viti", "1":"fj", "2":"fij", "2T":"fij", "2B":"fij", "3":"fij"},
    {"name":"Finnish", "local":"Suomi", "1":"fi", "2":"fin", "2T":"fin", "2B":"fin", "3":"fin"},
    {"name":"French", "local":"Français", "1":"fr", "2":"fra", "2T":"fra", "2B":"fre", "3":"fra"},
    {"name":"Fula", "local":"Fulfulde", "1":"ff", "2":"ful", "2T":"ful", "2B":"ful", "3":"ful"},
    {"name":"Galician", "local":"Galego", "1":"gl", "2":"glg", "2T":"glg", "2B":"glg", "3":"glg"},
    {"name":"Georgian", "local":"ქართული", "1":"ka", "2":"kat", "2T":"kat", "2B":"geo", "3":"kat"},
    {"name":"German", "local":"Deutsch", "1":"de", "2":"deu", "2T":"deu", "2B":"ger", "3":"deu"},
    {"name":"Greek", "local":"Ελληνικά", "1":"el", "2":"ell", "2T":"ell", "2B":"gre", "3":"ell"},
    {"name":"Guaraní", "local":"Avañe'ẽ", "1":"gn", "2":"grn", "2T":"grn", "2B":"grn", "3":"grn"},
    {"name":"Gujarati", "local":"ગુજરાતી", "1":"gu", "2":"guj", "2T":"guj", "2B":"guj", "3":"guj"},
    {"name":"Haitian", "local":"Kreyòl Ayisyen", "1":"ht", "2":"hat", "2T":"hat", "2B":"hat", "3":"hat"},
    {"name":"Hausa", "local":"هَوُسَ", "1":"ha", "2":"hau", "2T":"hau", "2B":"hau", "3":"hau"},
    {"name":"Hebrew", "local":"עברית", "1":"he", "2":"heb", "2T":"heb", "2B":"heb", "3":"heb"},
    {"name":"Herero", "local":"Otjiherero", "1":"hz", "2":"her", "2T":"her", "2B":"her", "3":"her"},
    {"name":"Hindi", "local":"हिन्दी", "1":"hi", "2":"hin", "2T":"hin", "2B":"hin", "3":"hin"},
    {"name":"Hiri Motu", "local":"Hiri Motu", "1":"ho", "2":"hmo", "2T":"hmo", "2B":"hmo", "3":"hmo"},
    {"name":"Hungarian", "local":"Magyar", "1":"hu", "2":"hun", "2T":"hun", "2B":"hun", "3":"hun"},
    {"name":"Interlingua", "local":"Interlingua", "1":"ia", "2":"ina", "2T":"ina", "2B":"ina", "3":"ina"},
    {"name":"Indonesian", "local":"Bahasa Indonesia", "1":"id", "2":"ind", "2T":"ind", "2B":"ind", "3":"ind"},
    {"name":"Interlingue", "local":"Interlingue", "1":"ie", "2":"ile", "2T":"ile", "2B":"ile", "3":"ile"},
    {"name":"Irish", "local":"Gaeilge", "1":"ga", "2":"gle", "2T":"gle", "2B":"gle", "3":"gle"},
    {"name":"Igbo", "local":"Igbo", "1":"ig", "2":"ibo", "2T":"ibo", "2B":"ibo", "3":"ibo"},
    {"name":"Inupiaq", "local":"Iñupiak", "1":"ik", "2":"ipk", "2T":"ipk", "2B":"ipk", "3":"ipk"},
    {"name":"Ido", "local":"Ido", "1":"io", "2":"ido", "2T":"ido", "2B":"ido", "3":"ido"},
    {"name":"Icelandic", "local":"Íslenska", "1":"is", "2":"isl", "2T":"isl", "2B":"ice", "3":"isl"},
    {"name":"Italian", "local":"Italiano", "1":"it", "2":"ita", "2T":"ita", "2B":"ita", "3":"ita"},
    {"name":"Inuktitut", "local":"ᐃᓄᒃᑎᑐᑦ", "1":"iu", "2":"iku", "2T":"iku", "2B":"iku", "3":"iku"},
    {"name":"Japanese", "local":"日本語", "1":"ja", "2":"jpn", "2T":"jpn", "2B":"jpn", "3":"jpn"},
    {"name":"Javanese", "local":"Basa Jawa", "1":"jv", "2":"jav", "2T":"jav", "2B":"jav", "3":"jav"},
    {"name":"Kalaallisut", "local":"Kalaallisut", "1":"kl", "2":"kal", "2T":"kal", "2B":"kal", "3":"kal"},
    {"name":"Kannada", "local":"ಕನ್ನಡ", "1":"kn", "2":"kan", "2T":"kan", "2B":"kan", "3":"kan"},
    {"name":"Kanuri", "local":"Kanuri", "1":"kr", "2":"kau", "2T":"kau", "2B":"kau", "3":"kau"},
    {"name":"Kashmiri", "local":"كشميري", "1":"ks", "2":"kas", "2T":"kas", "2B":"kas", "3":"kas"},
    {"name":"Kazakh", "local":"Қазақша", "1":"kk", "2":"kaz", "2T":"kaz", "2B":"kaz", "3":"kaz"},
    {"name":"Khmer", "local":"ភាសាខ្មែរ", "1":"km", "2":"khm", "2T":"khm", "2B":"khm", "3":"khm"},
    {"name":"Kikuyu", "local":"Gĩkũyũ", "1":"ki", "2":"kik", "2T":"kik", "2B":"kik", "3":"kik"},
    {"name":"Kinyarwanda", "local":"Kinyarwanda", "1":"rw", "2":"kin", "2T":"kin", "2B":"kin", "3":"kin"},
    {"name":"Kyrgyz", "local":"Кыргызча", "1":"ky", "2":"kir", "2T":"kir", "2B":"kir", "3":"kir"},
    {"name":"Komi", "local":"Коми", "1":"kv", "2":"kom", "2T":"kom", "2B":"kom", "3":"kom"},
    {"name":"Kongo", "local":"Kongo", "1":"kg", "2":"kon", "2T":"kon", "2B":"kon", "3":"kon"},
    {"name":"Korean", "local":"한국어", "1":"ko", "2":"kor", "2T":"kor", "2B":"kor", "3":"kor"},
    {"name":"Kurdish", "local":"Kurdî", "1":"ku", "2":"kur", "2T":"kur", "2B":"kur", "3":"kur"},
    {"name":"Kwanyama", "local":"Kuanyama", "1":"kj", "2":"kua", "2T":"kua", "2B":"kua", "3":"kua"},
    {"name":"Latin", "local":"Latina", "1":"la", "2":"lat", "2T":"lat", "2B":"lat", "3":"lat"},
    {"name":"Luxembourgish", "local":"Lëtzebuergesch", "1":"lb", "2":"ltz", "2T":"ltz", "2B":"ltz", "3":"ltz"},
    {"name":"Ganda", "local":"Luganda", "1":"lg", "2":"lug", "2T":"lug", "2B":"lug", "3":"lug"},
    {"name":"Limburgish", "local":"Limburgs", "1":"li", "2":"lim", "2T":"lim", "2B":"lim", "3":"lim"},
    {"name":"Lingala", "local":"Lingála", "1":"ln", "2":"lin", "2T":"lin", "2B":"lin", "3":"lin"},
    {"name":"Lao", "local":"ພາສາລາວ", "1":"lo", "2":"lao", "2T":"lao", "2B":"lao", "3":"lao"},
    {"name":"Lithuanian", "local":"Lietuvių", "1":"lt", "2":"lit", "2T":"lit", "2B":"lit", "3":"lit"},
    {"name":"Luba-Katanga", "local":"Tshiluba", "1":"lu", "2":"lub", "2T":"lub", "2B":"lub", "3":"lub"},
    {"name":"Latvian", "local":"Latviešu", "1":"lv", "2":"lav", "2T":"lav", "2B":"lav", "3":"lav"},
    {"name":"Manx", "local":"Gaelg", "1":"gv", "2":"glv", "2T":"glv", "2B":"glv", "3":"glv"},
    {"name":"Macedonian", "local":"Македонски", "1":"mk", "2":"mkd", "2T":"mkd", "2B":"mac", "3":"mkd"},
    {"name":"Malagasy", "local":"Malagasy", "1":"mg", "2":"mlg", "2T":"mlg", "2B":"mlg", "3":"mlg"},
    {"name":"Malay", "local":"Bahasa Melayu", "1":"ms", "2":"msa", "2T":"msa", "2B":"may", "3":"msa"},
    {"name":"Malayalam", "local":"മലയാളം", "1":"ml", "2":"mal", "2T":"mal", "2B":"mal", "3":"mal"},
    {"name":"Maltese", "local":"Malti", "1":"mt", "2":"mlt", "2T":"mlt", "2B":"mlt", "3":"mlt"},
    {"name":"Māori", "local":"Māori", "1":"mi", "2":"mri", "2T":"mri", "2B":"mao", "3":"mri"},
    {"name":"Marathi", "local":"मराठी", "1":"mr", "2":"mar", "2T":"mar", "2B":"mar", "3":"mar"},
    {"name":"Marshallese", "local":"Kajin M̧ajeļ", "1":"mh", "2":"mah", "2T":"mah", "2B":"mah", "3":"mah"},
    {"name":"Mongolian", "local":"Монгол", "1":"mn", "2":"mon", "2T":"mon", "2B":"mon", "3":"mon"},
    {"name":"Nauru", "local":"Dorerin Naoero", "1":"na", "2":"nau", "2T":"nau", "2B":"nau", "3":"nau"},
    {"name":"Navajo", "local":"Diné Bizaad", "1":"nv", "2":"nav", "2T":"nav", "2B":"nav", "3":"nav"},
    {"name":"Northern Ndebele", "local":"isiNdebele", "1":"nd", "2":"nde", "2T":"nde", "2B":"nde", "3":"nde"},
    {"name":"Nepali", "local":"नेपाली", "1":"ne", "2":"nep", "2T":"nep", "2B":"nep", "3":"nep"},
    {"name":"Ndonga", "local":"Owambo", "1":"ng", "2":"ndo", "2T":"ndo", "2B":"ndo", "3":"ndo"},
    {"name":"Norwegian Bokmål", "local":"Norsk (Bokmål)", "1":"nb", "2":"nob", "2T":"nob", "2B":"nob", "3":"nob"},
    {"name":"Norwegian Nynorsk", "local":"Norsk (Nynorsk)", "1":"nn", "2":"nno", "2T":"nno", "2B":"nno", "3":"nno"},
    {"name":"Norwegian", "local":"Norsk", "1":"no", "2":"nor", "2T":"nor", "2B":"nor", "3":"nor"},
    {"name":"Nuosu", "local":"ꆈꌠ꒿ Nuosuhxop", "1":"ii", "2":"iii", "2T":"iii", "2B":"iii", "3":"iii"},
    {"name":"Southern Ndebele", "local":"isiNdebele", "1":"nr", "2":"nbl", "2T":"nbl", "2B":"nbl", "3":"nbl"},
    {"name":"Occitan", "local":"Occitan", "1":"oc", "2":"oci", "2T":"oci", "2B":"oci", "3":"oci"},
    {"name":"Ojibwe", "local":"ᐊᓂᔑᓈᐯᒧᐎᓐ", "1":"oj", "2":"oji", "2T":"oji", "2B":"oji", "3":"oji"},
    {"name":"Old Church Slavonic", "local":"Словѣ́ньскъ", "1":"cu", "2":"chu", "2T":"chu", "2B":"chu", "3":"chu"},
    {"name":"Oromo", "local":"Afaan Oromoo", "1":"om", "2":"orm", "2T":"orm", "2B":"orm", "3":"orm"},
    {"name":"Oriya", "local":"ଓଡି଼ଆ", "1":"or", "2":"ori", "2T":"ori", "2B":"ori", "3":"ori"},
    {"name":"Ossetian", "local":"Ирон æвзаг", "1":"os", "2":"oss", "2T":"oss", "2B":"oss", "3":"oss"},
    {"name":"Panjabi", "local":"ਪੰਜਾਬੀ", "1":"pa", "2":"pan", "2T":"pan", "2B":"pan", "3":"pan"},
    {"name":"Pāli", "local":"पाऴि", "1":"pi", "2":"pli", "2T":"pli", "2B":"pli", "3":"pli"},
    {"name":"Persian", "local":"فارسی", "1":"fa", "2":"fas", "2T":"fas", "2B":"per", "3":"fas"},
    {"name":"Polish", "local":"Polski", "1":"pl", "2":"pol", "2T":"pol", "2B":"pol", "3":"pol"},
    {"name":"Pashto", "local":"پښتو", "1":"ps", "2":"pus", "2T":"pus", "2B":"pus", "3":"pus"},
    {"name":"Portuguese", "local":"Português", "1":"pt", "2":"por", "2T":"por", "2B":"por", "3":"por"},
    {"name":"Quechua", "local":"Runa Simi", "1":"qu", "2":"que", "2T":"que", "2B":"que", "3":"que"},
    {"name":"Romansh", "local":"Rumantsch", "1":"rm", "2":"roh", "2T":"roh", "2B":"roh", "3":"roh"},
    {"name":"Kirundi", "local":"Kirundi", "1":"rn", "2":"run", "2T":"run", "2B":"run", "3":"run"},
    {"name":"Romanian", "local":"Română", "1":"ro", "2":"ron", "2T":"ron", "2B":"rum", "3":"ron"},
    {"name":"Russian", "local":"Русский", "1":"ru", "2":"rus", "2T":"rus", "2B":"rus", "3":"rus"},
    {"name":"Sanskrit", "local":"संस्कृतम्", "1":"sa", "2":"san", "2T":"san", "2B":"san", "3":"san"},
    {"name":"Sardinian", "local":"Sardu", "1":"sc", "2":"srd", "2T":"srd", "2B":"srd", "3":"srd"},
    {"name":"Sindhi", "local":"سنڌي‎", "1":"sd", "2":"snd", "2T":"snd", "2B":"snd", "3":"snd"},
    {"name":"Northern Sami", "local":"Sámegiella", "1":"se", "2":"sme", "2T":"sme", "2B":"sme", "3":"sme"},
    {"name":"Samoan", "local":"Gagana Sāmoa", "1":"sm", "2":"smo", "2T":"smo", "2B":"smo", "3":"smo"},
    {"name":"Sango", "local":"Sängö", "1":"sg", "2":"sag", "2T":"sag", "2B":"sag", "3":"sag"},
    {"name":"Serbian", "local":"Српски", "1":"sr", "2":"srp", "2T":"srp", "2B":"srp", "3":"srp"},
    {"name":"Gaelic", "local":"Gàidhlig", "1":"gd", "2":"gla", "2T":"gla", "2B":"gla", "3":"gla"},
    {"name":"Shona", "local":"ChiShona", "1":"sn", "2":"sna", "2T":"sna", "2B":"sna", "3":"sna"},
    {"name":"Sinhala", "local":"සිංහල", "1":"si", "2":"sin", "2T":"sin", "2B":"sin", "3":"sin"},
    {"name":"Slovak", "local":"Slovenčina", "1":"sk", "2":"slk", "2T":"slk", "2B":"slo", "3":"slk"},
    {"name":"Slovene", "local":"Slovenščina", "1":"sl", "2":"slv", "2T":"slv", "2B":"slv", "3":"slv"},
    {"name":"Somali", "local":"Soomaaliga", "1":"so", "2":"som", "2T":"som", "2B":"som", "3":"som"},
    {"name":"Southern Sotho", "local":"Sesotho", "1":"st", "2":"sot", "2T":"sot", "2B":"sot", "3":"sot"},
    {"name":"Spanish", "local":"Español", "1":"es", "2":"spa", "2T":"spa", "2B":"spa", "3":"spa"},
    {"name":"Sundanese", "local":"Basa Sunda", "1":"su", "2":"sun", "2T":"sun", "2B":"sun", "3":"sun"},
    {"name":"Swahili", "local":"Kiswahili", "1":"sw", "2":"swa", "2T":"swa", "2B":"swa", "3":"swa"},
    {"name":"Swati", "local":"SiSwati", "1":"ss", "2":"ssw", "2T":"ssw", "2B":"ssw", "3":"ssw"},
    {"name":"Swedish", "local":"Svenska", "1":"sv", "2":"swe", "2T":"swe", "2B":"swe", "3":"swe"},
    {"name":"Tamil", "local":"தமிழ்", "1":"ta", "2":"tam", "2T":"tam", "2B":"tam", "3":"tam"},
    {"name":"Telugu", "local":"తెలుగు", "1":"te", "2":"tel", "2T":"tel", "2B":"tel", "3":"tel"},
    {"name":"Tajik", "local":"Тоҷикӣ", "1":"tg", "2":"tgk", "2T":"tgk", "2B":"tgk", "3":"tgk"},
    {"name":"Thai", "local":"ภาษาไทย", "1":"th", "2":"tha", "2T":"tha", "2B":"tha", "3":"tha"},
    {"name":"Tigrinya", "local":"ትግርኛ", "1":"ti", "2":"tir", "2T":"tir", "2B":"tir", "3":"tir"},
    {"name":"Tibetan Standard", "local":"བོད་ཡིག", "1":"bo", "2":"bod", "2T":"bod", "2B":"tib", "3":"bod"},
    {"name":"Turkmen", "local":"Türkmençe", "1":"tk", "2":"tuk", "2T":"tuk", "2B":"tuk", "3":"tuk"},
    {"name":"Tagalog", "local":"Tagalog", "1":"tl", "2":"tgl", "2T":"tgl", "2B":"tgl", "3":"tgl"},
    {"name":"Tswana", "local":"Setswana", "1":"tn", "2":"tsn", "2T":"tsn", "2B":"tsn", "3":"tsn"},
    {"name":"Tonga", "local":"faka Tonga", "1":"to", "2":"ton", "2T":"ton", "2B":"ton", "3":"ton"},
    {"name":"Turkish", "local":"Türkçe", "1":"tr", "2":"tur", "2T":"tur", "2B":"tur", "3":"tur"},
    {"name":"Tsonga", "local":"Xitsonga", "1":"ts", "2":"tso", "2T":"tso", "2B":"tso", "3":"tso"},
    {"name":"Tatar", "local":"Татарча", "1":"tt", "2":"tat", "2T":"tat", "2B":"tat", "3":"tat"},
    {"name":"Twi", "local":"Twi", "1":"tw", "2":"twi", "2T":"twi", "2B":"twi", "3":"twi"},
    {"name":"Tahitian", "local":"Reo Mā’ohi", "1":"ty", "2":"tah", "2T":"tah", "2B":"tah", "3":"tah"},
    {"name":"Uyghur", "local":"ئۇيغۇرچه", "1":"ug", "2":"uig", "2T":"uig", "2B":"uig", "3":"uig"},
    {"name":"Ukrainian", "local":"Українська", "1":"uk", "2":"ukr", "2T":"ukr", "2B":"ukr", "3":"ukr"},
    {"name":"Urdu", "local":"اردو", "1":"ur", "2":"urd", "2T":"urd", "2B":"urd", "3":"urd"},
    {"name":"Uzbek", "local":"O‘zbek", "1":"uz", "2":"uzb", "2T":"uzb", "2B":"uzb", "3":"uzb"},
    {"name":"Venda", "local":"Tshivenḓa", "1":"ve", "2":"ven", "2T":"ven", "2B":"ven", "3":"ven"},
    {"name":"Vietnamese", "local":"Tiếng Việt", "1":"vi", "2":"vie", "2T":"vie", "2B":"vie", "3":"vie"},
    {"name":"Volapük", "local":"Volapük", "1":"vo", "2":"vol", "2T":"vol", "2B":"vol", "3":"vol"},
    {"name":"Walloon", "local":"Walon", "1":"wa", "2":"wln", "2T":"wln", "2B":"wln", "3":"wln"},
    {"name":"Welsh", "local":"Cymraeg", "1":"cy", "2":"cym", "2T":"cym", "2B":"wel", "3":"cym"},
    {"name":"Wolof", "local":"Wolof", "1":"wo", "2":"wol", "2T":"wol", "2B":"wol", "3":"wol"},
    {"name":"Western Frisian", "local":"Frysk", "1":"fy", "2":"fry", "2T":"fry", "2B":"fry", "3":"fry"},
    {"name":"Xhosa", "local":"isiXhosa", "1":"xh", "2":"xho", "2T":"xho", "2B":"xho", "3":"xho"},
    {"name":"Yiddish", "local":"ייִדיש", "1":"yi", "2":"yid", "2T":"yid", "2B":"yid", "3":"yid"},
    {"name":"Yoruba", "local":"Yorùbá", "1":"yo", "2":"yor", "2T":"yor", "2B":"yor", "3":"yor"},
    {"name":"Zhuang", "local":"Cuengh", "1":"za", "2":"zha", "2T":"zha", "2B":"zha", "3":"zha"},
    {"name":"Zulu", "local":"isiZulu", "1":"zu", "2":"zul", "2T":"zul", "2B":"zul", "3":"zul"}
];

},{}],40:[function(require,module,exports){
var data = require('./data');

var langs = {
    all:   allLanguages,
    has:   hasLanguage,
    codes: getCodes,
    names: getNames,
    where: findBy
};

module.exports = langs;

// allLanguages :: -> Language[]
function allLanguages() {
    return data;
}

// hasLanguage :: String, String -> Boolean
function hasLanguage(crit, val) {
    return void(0) !== findBy(crit, val);
}

// getCodes :: String -> String[]
function getCodes(type) {
    if (isValidType(type)) {
        return forAll(data, function getCodesIterator(row) {
            return row[type];
        });
    }
}

// getNames :: Boolean -> String[]
function getNames(local) {
    return forAll(data, function getNamesIterator(row) {
        return local ? row.local : row.name;
    });
}

// findBy :: String, String -> Language
function findBy(crit, val) {
    for (var i = 0; i < data.length; i++) {
        if (val === data[i][crit]) {
            return data[i];
        }
    }
}

// forAll :: Array, Function -> Array
function forAll(arr, fn) {
    var out = [], i;
    for (i = 0; i < arr.length; i++) {
        out.push(fn(arr[i], i));
    }

    return out;
}

// isValidType :: String -> Boolean
function isValidType(type) {
    var types = [1, 2, 3, '1', '2', '2B', '2T', '3'];
    return -1 !== types.indexOf(type);
}

},{"./data":39}],41:[function(require,module,exports){
'use strict'

module.exports = nGram

nGram.bigram = nGram(2)
nGram.trigram = nGram(3)

// Factory returning a function that converts a value string to n-grams.
function nGram(n) {
  if (typeof n !== 'number' || isNaN(n) || n < 1 || n === Infinity) {
    throw new Error('`' + n + '` is not a valid argument for n-gram')
  }

  return grams

  // Create n-grams from a given value.
  function grams(value) {
    var nGrams = []
    var index

    if (value === null || value === undefined) {
      return nGrams
    }

    value = value.slice ? value : String(value)
    index = value.length - n + 1

    if (index < 1) {
      return nGrams
    }

    while (index--) {
      nGrams[index] = value.slice(index, index + n)
    }

    return nGrams
  }
}

},{}],42:[function(require,module,exports){
'use strict'

var trigram = require('n-gram').trigram
var collapse = require('collapse-white-space')
var trim = require('trim')

var has = {}.hasOwnProperty

exports.clean = clean
exports.trigrams = getCleanTrigrams
exports.asDictionary = getCleanTrigramsAsDictionary
exports.asTuples = getCleanTrigramsAsTuples
exports.tuplesAsDictionary = getCleanTrigramTuplesAsDictionary

// Clean `value`/
// Removed general non-important (as in, for language detection) punctuation
// marks, symbols, and numbers.
function clean(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return trim(
    collapse(String(value).replace(/[\u0021-\u0040]+/g, ' '))
  ).toLowerCase()
}

// Get clean, padded, trigrams.
function getCleanTrigrams(value) {
  return trigram(' ' + clean(value) + ' ')
}

// Get an `Object` with trigrams as its attributes, and their occurence count as
// their values.
function getCleanTrigramsAsDictionary(value) {
  var trigrams = getCleanTrigrams(value)
  var index = trigrams.length
  var dictionary = {}
  var trigram

  while (index--) {
    trigram = trigrams[index]

    if (has.call(dictionary, trigram)) {
      dictionary[trigram]++
    } else {
      dictionary[trigram] = 1
    }
  }

  return dictionary
}

// Get an `Array` containing trigram--count tuples from a given value.
function getCleanTrigramsAsTuples(value) {
  var dictionary = getCleanTrigramsAsDictionary(value)
  var tuples = []
  var trigram

  for (trigram in dictionary) {
    tuples.push([trigram, dictionary[trigram]])
  }

  tuples.sort(sort)

  return tuples
}

// Get an `Array` containing trigram--count tuples from a given value.
function getCleanTrigramTuplesAsDictionary(tuples) {
  var index = tuples.length
  var dictionary = {}
  var tuple

  while (index--) {
    tuple = tuples[index]
    dictionary[tuple[0]] = tuple[1]
  }

  return dictionary
}

// Deep regular sort on item at `1` in both `Object`s.
function sort(a, b) {
  return a[1] - b[1]
}

},{"collapse-white-space":23,"n-gram":41,"trim":43}],43:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}]},{},[22]);
