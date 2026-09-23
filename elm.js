(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.aO.am === region.aX.am)
	{
		return 'on line ' + region.aO.am;
	}
	return 'on lines ' + region.aO.am + ' through ' + region.aX.am;
}



// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.bz,
		impl.bK,
		impl.bJ,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		aG: func(record.aG),
		aP: record.aP,
		aL: record.aL
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.aG;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.aP;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.aL) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.bz,
		impl.bK,
		impl.bJ,
		function(sendToApp, initialModel) {
			var view = impl.bL;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.bz,
		impl.bK,
		impl.bJ,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.aM && impl.aM(sendToApp)
			var view = impl.bL;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.g);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.Y) && (_VirtualDom_doc.title = title = doc.Y);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.bC;
	var onUrlRequest = impl.bD;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		aM: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.ba === next.ba
							&& curr.a$ === next.a$
							&& curr.a7.a === next.a7.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		bz: function(flags)
		{
			return A3(impl.bz, flags, _Browser_getUrl(), key);
		},
		bL: impl.bL,
		bK: impl.bK,
		bJ: impl.bJ
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { bx: 'hidden', br: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { bx: 'mozHidden', br: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { bx: 'msHidden', br: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { bx: 'webkitHidden', br: 'webkitvisibilitychange' }
		: { bx: 'hidden', br: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		bg: _Browser_getScene(),
		bk: {
			bm: _Browser_window.pageXOffset,
			bn: _Browser_window.pageYOffset,
			bl: _Browser_doc.documentElement.clientWidth,
			a_: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		bl: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		a_: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			bg: {
				bl: node.scrollWidth,
				a_: node.scrollHeight
			},
			bk: {
				bm: node.scrollLeft,
				bn: node.scrollTop,
				bl: node.clientWidth,
				a_: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			bg: _Browser_getScene(),
			bk: {
				bm: x,
				bn: y,
				bl: _Browser_doc.documentElement.clientWidth,
				a_: _Browser_doc.documentElement.clientHeight
			},
			bv: {
				bm: x + rect.left,
				bn: y + rect.top,
				bl: rect.width,
				a_: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.j.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.j.b, xhr)); });
		$elm$core$Maybe$isJust(request.s) && _Http_track(router, xhr, request.s.a);

		try {
			xhr.open(request.p, request.l, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.l));
		}

		_Http_configureRequest(xhr, request);

		request.g.a && xhr.setRequestHeader('Content-Type', request.g.a);
		xhr.send(request.g.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.o; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.r.a || 0;
	xhr.responseType = request.j.d;
	xhr.withCredentials = request.bp;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		l: xhr.responseURL,
		ay: xhr.status,
		bI: xhr.statusText,
		o: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			bH: event.loaded,
			bh: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			bF: event.loaded,
			bh: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}


function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$List$cons = _List_cons;
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.h) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.k),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.k);
		} else {
			var treeLen = builder.h * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.n) : builder.n;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.h);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.k) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.k);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{n: nodeList, h: (len / $elm$core$Array$branchFactor) | 0, k: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {aZ: fragment, a$: host, a5: path, a7: port_, ba: protocol, ad: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $elm$json$Json$Decode$field = _Json_decodeField;
var $author$project$Types$GotUser = function (a) {
	return {$: 6, a: a};
};
var $author$project$Types$Home = {$: 0};
var $author$project$Types$Login = 0;
var $author$project$Types$NotAsked = {$: 0};
var $author$project$Types$emptyForm = {aE: '', aI: '', ax: '', bb: true};
var $author$project$Types$emptyPasswordForm = {aU: '', aD: '', a: _List_Nil, aw: '', f: false, ag: $elm$core$Maybe$Nothing};
var $author$project$Types$emptyProfileForm = {aE: '', a: _List_Nil, aI: '', f: false, ag: $elm$core$Maybe$Nothing};
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 2};
var $elm$http$Http$Receiving = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$Timeout_ = {$: 1};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Maybe$isJust = function (maybe) {
	if (!maybe.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$http$Http$Header = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$header = $elm$http$Http$Header;
var $elm$http$Http$Request = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {bd: reqs, bi: subs};
	});
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (!cmd.$) {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 1) {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.s;
							if (_v4.$ === 1) {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.bd));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.bi)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (!cmd.$) {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					bp: r.bp,
					g: r.g,
					j: A2(_Http_mapExpect, func, r.j),
					o: r.o,
					p: r.p,
					r: r.r,
					s: r.s,
					l: r.l
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{bp: false, g: r.g, j: r.j, o: r.o, p: r.p, r: r.r, s: r.s, l: r.l}));
};
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Api$errorDecoder = A2($elm$json$Json$Decode$field, 'error', $elm$json$Json$Decode$string);
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $author$project$Types$User = F3(
	function (id, name, email) {
		return {aE: email, av: id, aI: name};
	});
var $elm$json$Json$Decode$map3 = _Json_map3;
var $author$project$Api$userDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Types$User,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'email', $elm$json$Json$Decode$string));
var $author$project$Api$userExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error.');
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err('Not authorized.');
					}
				default:
					var body = response.b;
					var _v2 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'user', $author$project$Api$userDecoder),
						body);
					if (!_v2.$) {
						var user = _v2.a;
						return $elm$core$Result$Ok(user);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$me = F2(
	function (token, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$userExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'GET',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/me'
			});
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$init = function (flags) {
	var model = {
		P: $author$project$Types$NotAsked,
		m: $elm$core$Maybe$Nothing,
		U: $elm$core$Maybe$Nothing,
		as: !_Utils_eq(flags.d, $elm$core$Maybe$Nothing),
		b: $elm$core$Maybe$Nothing,
		v: $author$project$Types$NotAsked,
		e: $elm$core$Maybe$Nothing,
		A: $author$project$Types$NotAsked,
		H: $elm$core$Maybe$Nothing,
		w: $elm$core$Maybe$Nothing,
		x: $elm$core$Maybe$Nothing,
		D: $elm$core$Maybe$Nothing,
		N: $elm$core$Maybe$Nothing,
		a: _List_Nil,
		u: $author$project$Types$emptyForm,
		I: false,
		ab: 0,
		an: $elm$core$Maybe$Nothing,
		F: $author$project$Types$emptyPasswordForm,
		z: $author$project$Types$emptyProfileForm,
		q: $author$project$Types$Home,
		aN: false,
		f: false,
		c: $elm$core$Maybe$Nothing,
		d: flags.d,
		L: $elm$core$Maybe$Nothing,
		G: $elm$core$Maybe$Nothing,
		M: $elm$core$Maybe$Nothing
	};
	var _v0 = flags.d;
	if (!_v0.$) {
		var t = _v0.a;
		return _Utils_Tuple2(
			model,
			A2($author$project$Api$me, t, $author$project$Types$GotUser));
	} else {
		return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
	}
};
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $author$project$Types$DismissedToast = {$: 64};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $author$project$Types$EscapePressed = {$: 65};
var $elm$json$Json$Decode$fail = _Json_fail;
var $elm$browser$Browser$Events$Document = 0;
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {a6: pids, bi: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (!node) {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {aY: event, a1: key};
	});
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (!node) {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.a6,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.a1;
		var event = _v0.aY;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.bi);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onKeyDown = A2($elm$browser$Browser$Events$on, 0, 'keydown');
var $author$project$Main$escapePressed = $elm$browser$Browser$Events$onKeyDown(
	A2(
		$elm$json$Json$Decode$andThen,
		function (key) {
			return (key === 'Escape') ? $elm$json$Json$Decode$succeed($author$project$Types$EscapePressed) : $elm$json$Json$Decode$fail('not escape');
		},
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string)));
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {a9: processes, bj: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 1) {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$time$Time$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 1, a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.a9;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.bj);
		if (_v0.$ === 1) {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				function () {
				var _v0 = model.c;
				if (!_v0.$) {
					return A2(
						$elm$time$Time$every,
						4000,
						function (_v1) {
							return $author$project$Types$DismissedToast;
						});
				} else {
					return $elm$core$Platform$Sub$none;
				}
			}(),
				((!_Utils_eq(model.b, $elm$core$Maybe$Nothing)) || ((!_Utils_eq(model.w, $elm$core$Maybe$Nothing)) || ((!_Utils_eq(model.e, $elm$core$Maybe$Nothing)) || ((!_Utils_eq(model.x, $elm$core$Maybe$Nothing)) || ((!_Utils_eq(model.m, $elm$core$Maybe$Nothing)) || ((!_Utils_eq(model.H, $elm$core$Maybe$Nothing)) || model.I)))))) ? $author$project$Main$escapePressed : $elm$core$Platform$Sub$none
			]));
};
var $author$project$Types$AlertError = 0;
var $author$project$Types$AlertSuccess = 1;
var $author$project$Types$ClosedActivityForm = {$: 46};
var $author$project$Types$ContactDetail = function (a) {
	return {$: 2, a: a};
};
var $author$project$Types$Contacts = {$: 1};
var $author$project$Types$DealDetail = function (a) {
	return {$: 4, a: a};
};
var $author$project$Types$Deals = {$: 3};
var $author$project$Types$Failure = function (a) {
	return {$: 3, a: a};
};
var $author$project$Types$GotAuth = function (a) {
	return {$: 5, a: a};
};
var $author$project$Types$GotChangedPassword = function (a) {
	return {$: 59, a: a};
};
var $author$project$Types$GotDeletedActivity = function (a) {
	return {$: 53, a: a};
};
var $author$project$Types$GotDeletedContact = function (a) {
	return {$: 25, a: a};
};
var $author$project$Types$GotDeletedDeal = function (a) {
	return {$: 43, a: a};
};
var $author$project$Types$GotLogoutAll = function (a) {
	return {$: 63, a: a};
};
var $author$project$Types$GotMovedDeal = function (a) {
	return {$: 39, a: a};
};
var $author$project$Types$GotSavedActivity = function (a) {
	return {$: 49, a: a};
};
var $author$project$Types$GotSavedContact = function (a) {
	return {$: 21, a: a};
};
var $author$project$Types$GotSavedDeal = function (a) {
	return {$: 36, a: a};
};
var $author$project$Types$GotUpdatedProfile = function (a) {
	return {$: 56, a: a};
};
var $author$project$Types$Loading = {$: 1};
var $author$project$Types$RequestedCloseContactForm = {$: 14};
var $author$project$Types$RequestedCloseDealForm = {$: 31};
var $author$project$Types$Settings = {$: 7};
var $author$project$Types$Success = function (a) {
	return {$: 2, a: a};
};
var $elm$http$Http$jsonBody = function (value) {
	return A2(
		_Http_pair,
		'application/json',
		A2($elm$json$Json$Encode$encode, 0, value));
};
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $author$project$Api$statusExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error. Check your connection.');
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err('Request failed.');
					}
				default:
					var body = response.b;
					var _v2 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'status', $elm$json$Json$Decode$string),
						body);
					if (!_v2.$) {
						var s = _v2.a;
						return $elm$core$Result$Ok(s);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Api$changePassword = F4(
	function (token, current, next, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'currentPassword',
								$elm$json$Json$Encode$string(current)),
								_Utils_Tuple2(
								'newPassword',
								$elm$json$Json$Encode$string(next))
							]))),
				j: $author$project$Api$statusExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'POST',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/me/password'
			});
	});
var $author$project$Types$contactToForm = function (c) {
	return {aB: c.aB, at: false, _: false, aE: c.aE, a: _List_Nil, aF: c.aF, aI: c.aI, ac: c.ac, aK: c.aK, af: c.af, f: false, az: '', aQ: c.aQ, Y: c.Y};
};
var $author$project$Api$activityFormPayload = function (af) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'kind',
				$elm$json$Json$Encode$string(af.bA)),
				_Utils_Tuple2(
				'title',
				$elm$json$Json$Encode$string(af.Y)),
				_Utils_Tuple2(
				'body',
				$elm$json$Json$Encode$string(af.g)),
				_Utils_Tuple2(
				'occurredAt',
				$elm$json$Json$Encode$string(af.bB)),
				_Utils_Tuple2(
				'dealId',
				$elm$json$Json$Encode$string(''))
			]));
};
var $author$project$Types$FieldErrors = function (a) {
	return {$: 0, a: a};
};
var $author$project$Types$GenericError = function (a) {
	return {$: 1, a: a};
};
var $author$project$Types$Activity = F9(
	function (id, contactId, dealId, kind, title, body, occurredAt, createdBy, createdAt) {
		return {g: body, aC: contactId, au: createdAt, bs: createdBy, bt: dealId, av: id, bA: kind, bB: occurredAt, Y: title};
	});
var $author$project$Api$andMap = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $author$project$Api$optString = function (field) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, field, $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('')
			]));
};
var $author$project$Api$activityDecoder = A2(
	$author$project$Api$andMap,
	$author$project$Api$optString('createdAt'),
	A2(
		$author$project$Api$andMap,
		$author$project$Api$optString('createdBy'),
		A2(
			$author$project$Api$andMap,
			$author$project$Api$optString('occurredAt'),
			A2(
				$author$project$Api$andMap,
				$author$project$Api$optString('body'),
				A2(
					$author$project$Api$andMap,
					A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string),
					A2(
						$author$project$Api$andMap,
						A2($elm$json$Json$Decode$field, 'kind', $elm$json$Json$Decode$string),
						A2(
							$author$project$Api$andMap,
							$author$project$Api$optString('dealId'),
							A2(
								$author$project$Api$andMap,
								A2($elm$json$Json$Decode$field, 'contactId', $elm$json$Json$Decode$string),
								A2(
									$elm$json$Json$Decode$map,
									$author$project$Types$Activity,
									A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string))))))))));
var $elm$json$Json$Decode$keyValuePairs = _Json_decodeKeyValuePairs;
var $elm$json$Json$Decode$dict = function (decoder) {
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$Dict$fromList,
		$elm$json$Json$Decode$keyValuePairs(decoder));
};
var $author$project$Api$fieldErrorDecoder = A2(
	$elm$json$Json$Decode$map,
	$elm$core$Dict$toList,
	A2(
		$elm$json$Json$Decode$field,
		'fields',
		$elm$json$Json$Decode$dict($elm$json$Json$Decode$string)));
var $author$project$Api$savedActivityExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Bad URL: ' + url));
				case 1:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Request timed out.'));
				case 2:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Network error. Check your connection.'));
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$fieldErrorDecoder, body);
					if (!_v1.$) {
						var fields = _v1.a;
						return $elm$core$Result$Err(
							$author$project$Types$FieldErrors(fields));
					} else {
						var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
						if (!_v2.$) {
							var msg = _v2.a;
							return $elm$core$Result$Err(
								$author$project$Types$GenericError(msg));
						} else {
							return $elm$core$Result$Err(
								$author$project$Types$GenericError('Could not save activity.'));
						}
					}
				default:
					var body = response.b;
					var _v3 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'activity', $author$project$Api$activityDecoder),
						body);
					if (!_v3.$) {
						var a = _v3.a;
						return $elm$core$Result$Ok(a);
					} else {
						var err = _v3.a;
						return $elm$core$Result$Err(
							$author$project$Types$GenericError(
								'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err)));
					}
			}
		});
};
var $author$project$Api$createActivity = F4(
	function (token, contactId, af, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$author$project$Api$activityFormPayload(af)),
				j: $author$project$Api$savedActivityExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'POST',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/contacts/' + (contactId + '/activities')
			});
	});
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(0),
				entries));
	});
var $author$project$Api$contactFormPayload = function (cf) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'name',
				$elm$json$Json$Encode$string(cf.aI)),
				_Utils_Tuple2(
				'email',
				$elm$json$Json$Encode$string(cf.aE)),
				_Utils_Tuple2(
				'company',
				$elm$json$Json$Encode$string(cf.aB)),
				_Utils_Tuple2(
				'title',
				$elm$json$Json$Encode$string(cf.Y)),
				_Utils_Tuple2(
				'phone',
				$elm$json$Json$Encode$string(cf.aK)),
				_Utils_Tuple2(
				'location',
				$elm$json$Json$Encode$string(cf.aF)),
				_Utils_Tuple2(
				'stage',
				$elm$json$Json$Encode$string(cf.af)),
				_Utils_Tuple2(
				'tags',
				A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, cf.aQ)),
				_Utils_Tuple2(
				'notes',
				$elm$json$Json$Encode$string(cf.ac))
			]));
};
var $author$project$Types$Contact = function (id) {
	return function (name) {
		return function (email) {
			return function (company) {
				return function (title) {
					return function (phone) {
						return function (location) {
							return function (stage) {
								return function (lastContact) {
									return function (owner) {
										return function (tags) {
											return function (notes) {
												return function (createdAt) {
													return {aB: company, au: createdAt, aE: email, av: id, a2: lastContact, aF: location, aI: name, ac: notes, ao: owner, aK: phone, af: stage, aQ: tags, Y: title};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Api$ContactCore = F8(
	function (id, name, email, company, title, phone, location, stage) {
		return {aB: company, aE: email, av: id, aF: location, aI: name, aK: phone, af: stage, Y: title};
	});
var $elm$json$Json$Decode$map8 = _Json_map8;
var $author$project$Api$contactCoreDecoder = A9(
	$elm$json$Json$Decode$map8,
	$author$project$Api$ContactCore,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'email', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'company', $elm$json$Json$Decode$string),
	$author$project$Api$optString('title'),
	$author$project$Api$optString('phone'),
	$author$project$Api$optString('location'),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'stage', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('Lead')
			])));
var $author$project$Api$ContactExtras = F5(
	function (lastContact, owner, tags, notes, createdAt) {
		return {au: createdAt, a2: lastContact, ac: notes, ao: owner, aQ: tags};
	});
var $elm$json$Json$Decode$map5 = _Json_map5;
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Api$optStringList = function (field) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				field,
				$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed(_List_Nil)
			]));
};
var $author$project$Api$contactExtrasDecoder = A6(
	$elm$json$Json$Decode$map5,
	$author$project$Api$ContactExtras,
	$author$project$Api$optString('lastContact'),
	$author$project$Api$optString('owner'),
	$author$project$Api$optStringList('tags'),
	$author$project$Api$optString('notes'),
	$author$project$Api$optString('createdAt'));
var $author$project$Api$contactDecoder = A3(
	$elm$json$Json$Decode$map2,
	F2(
		function (core, extras) {
			return $author$project$Types$Contact(core.av)(core.aI)(core.aE)(core.aB)(core.Y)(core.aK)(core.aF)(core.af)(extras.a2)(extras.ao)(extras.aQ)(extras.ac)(extras.au);
		}),
	$author$project$Api$contactCoreDecoder,
	$author$project$Api$contactExtrasDecoder);
var $author$project$Api$savedContactExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Bad URL: ' + url));
				case 1:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Request timed out.'));
				case 2:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Network error. Check your connection.'));
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$fieldErrorDecoder, body);
					if (!_v1.$) {
						var fields = _v1.a;
						return $elm$core$Result$Err(
							$author$project$Types$FieldErrors(fields));
					} else {
						var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
						if (!_v2.$) {
							var msg = _v2.a;
							return $elm$core$Result$Err(
								$author$project$Types$GenericError(msg));
						} else {
							return $elm$core$Result$Err(
								$author$project$Types$GenericError('Could not save contact.'));
						}
					}
				default:
					var body = response.b;
					var _v3 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'contact', $author$project$Api$contactDecoder),
						body);
					if (!_v3.$) {
						var c = _v3.a;
						return $elm$core$Result$Ok(c);
					} else {
						var err = _v3.a;
						return $elm$core$Result$Err(
							$author$project$Types$GenericError(
								'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err)));
					}
			}
		});
};
var $author$project$Api$createContact = F3(
	function (token, cf, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$author$project$Api$contactFormPayload(cf)),
				j: $author$project$Api$savedContactExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'POST',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/contacts'
			});
	});
var $elm$json$Json$Encode$float = _Json_wrap;
var $elm$core$String$toFloat = _String_toFloat;
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Api$dealFormPayload = function (df) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'title',
				$elm$json$Json$Encode$string(df.Y)),
				_Utils_Tuple2(
				'contactId',
				$elm$json$Json$Encode$string(df.aC)),
				_Utils_Tuple2(
				'value',
				$elm$json$Json$Encode$float(
					A2(
						$elm$core$Maybe$withDefault,
						0,
						$elm$core$String$toFloat(df.aR)))),
				_Utils_Tuple2(
				'stage',
				$elm$json$Json$Encode$string(df.af)),
				_Utils_Tuple2(
				'closeDate',
				$elm$json$Json$Encode$string(df.aA)),
				_Utils_Tuple2(
				'owner',
				$elm$json$Json$Encode$string(df.ao)),
				_Utils_Tuple2(
				'notes',
				$elm$json$Json$Encode$string(df.ac))
			]));
};
var $author$project$Types$Deal = function (id) {
	return function (title) {
		return function (contactId) {
			return function (contactName) {
				return function (value) {
					return function (stage) {
						return function (closeDate) {
							return function (owner) {
								return function (notes) {
									return function (createdAt) {
										return {aA: closeDate, aC: contactId, aV: contactName, au: createdAt, av: id, ac: notes, ao: owner, af: stage, Y: title, aR: value};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Api$DealCore = F5(
	function (id, title, contactId, contactName, value) {
		return {aC: contactId, aV: contactName, av: id, Y: title, aR: value};
	});
var $elm$json$Json$Decode$float = _Json_decodeFloat;
var $author$project$Api$dealCoreDecoder = A6(
	$elm$json$Json$Decode$map5,
	$author$project$Api$DealCore,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string),
	$author$project$Api$optString('contactId'),
	$author$project$Api$optString('contactName'),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$float),
				$elm$json$Json$Decode$succeed(0)
			])));
var $author$project$Api$DealExtras = F5(
	function (stage, closeDate, owner, notes, createdAt) {
		return {aA: closeDate, au: createdAt, ac: notes, ao: owner, af: stage};
	});
var $author$project$Api$dealExtrasDecoder = A6(
	$elm$json$Json$Decode$map5,
	$author$project$Api$DealExtras,
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'stage', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('Lead')
			])),
	$author$project$Api$optString('closeDate'),
	$author$project$Api$optString('owner'),
	$author$project$Api$optString('notes'),
	$author$project$Api$optString('createdAt'));
var $author$project$Api$dealDecoder = A3(
	$elm$json$Json$Decode$map2,
	F2(
		function (core, extras) {
			return $author$project$Types$Deal(core.av)(core.Y)(core.aC)(core.aV)(core.aR)(extras.af)(extras.aA)(extras.ao)(extras.ac)(extras.au);
		}),
	$author$project$Api$dealCoreDecoder,
	$author$project$Api$dealExtrasDecoder);
var $author$project$Api$savedDealExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Bad URL: ' + url));
				case 1:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Request timed out.'));
				case 2:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Network error. Check your connection.'));
				case 3:
					var metadata = response.a;
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$fieldErrorDecoder, body);
					if (!_v1.$) {
						var fields = _v1.a;
						return $elm$core$Result$Err(
							$author$project$Types$FieldErrors(fields));
					} else {
						var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
						if (!_v2.$) {
							var msg = _v2.a;
							return $elm$core$Result$Err(
								$author$project$Types$GenericError(msg));
						} else {
							return $elm$core$Result$Err(
								$author$project$Types$GenericError(
									'Could not save deal (HTTP ' + ($elm$core$String$fromInt(metadata.ay) + ').')));
						}
					}
				default:
					var body = response.b;
					var _v3 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'deal', $author$project$Api$dealDecoder),
						body);
					if (!_v3.$) {
						var d = _v3.a;
						return $elm$core$Result$Ok(d);
					} else {
						var err = _v3.a;
						return $elm$core$Result$Err(
							$author$project$Types$GenericError(
								'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err)));
					}
			}
		});
};
var $author$project$Api$createDeal = F3(
	function (token, df, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$author$project$Api$dealFormPayload(df)),
				j: $author$project$Api$savedDealExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'POST',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/deals'
			});
	});
var $elm$core$String$fromFloat = _String_fromNumber;
var $author$project$Types$dealToForm = function (d) {
	return {
		aA: d.aA,
		at: false,
		aC: d.aC,
		_: false,
		a: _List_Nil,
		ac: d.ac,
		ao: d.ao,
		af: d.af,
		f: false,
		Y: d.Y,
		aR: $elm$core$String$fromFloat(d.aR)
	};
};
var $author$project$Api$deletedActivityExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error. Check your connection.');
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err('Could not delete activity.');
					}
				default:
					var body = response.b;
					var _v2 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'deleted', $elm$json$Json$Decode$string),
						body);
					if (!_v2.$) {
						var id = _v2.a;
						return $elm$core$Result$Ok(id);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$deleteActivity = F3(
	function (token, id, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$deletedActivityExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'DELETE',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/activities/' + id
			});
	});
var $author$project$Api$deletedExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error. Check your connection.');
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err('Could not delete contact.');
					}
				default:
					var body = response.b;
					var _v2 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'deleted', $elm$json$Json$Decode$string),
						body);
					if (!_v2.$) {
						var id = _v2.a;
						return $elm$core$Result$Ok(id);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$deleteContact = F3(
	function (token, id, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$deletedExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'DELETE',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/contacts/' + id
			});
	});
var $author$project$Api$deletedDealExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error. Check your connection.');
				case 3:
					var metadata = response.a;
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err(
							'Could not delete deal (HTTP ' + ($elm$core$String$fromInt(metadata.ay) + ').'));
					}
				default:
					var body = response.b;
					var _v2 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'deleted', $elm$json$Json$Decode$string),
						body);
					if (!_v2.$) {
						var id = _v2.a;
						return $elm$core$Result$Ok(id);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$deleteDeal = F3(
	function (token, id, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$deletedDealExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'DELETE',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/deals/' + id
			});
	});
var $author$project$Types$emptyActivityForm = {g: '', a: _List_Nil, bA: 'note', bB: '', f: false, Y: ''};
var $author$project$Types$emptyContactForm = {aB: '', at: false, _: false, aE: '', a: _List_Nil, aF: '', aI: '', ac: '', aK: '', af: 'Lead', f: false, az: '', aQ: _List_Nil, Y: ''};
var $author$project$Types$emptyDealForm = {aA: '', at: false, aC: '', _: false, a: _List_Nil, ac: '', ao: '', af: 'Lead', f: false, Y: '', aR: ''};
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Types$GotActivities = function (a) {
	return {$: 44, a: a};
};
var $author$project$Api$activitiesDecoder = A2(
	$elm$json$Json$Decode$field,
	'activities',
	$elm$json$Json$Decode$list($author$project$Api$activityDecoder));
var $author$project$Api$activitiesExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error.');
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err('Could not load activity.');
					}
				default:
					var body = response.b;
					var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$activitiesDecoder, body);
					if (!_v2.$) {
						var as_ = _v2.a;
						return $elm$core$Result$Ok(as_);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse activity: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$fetchActivities = F3(
	function (token, contactId, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$activitiesExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'GET',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/contacts/' + (contactId + '/activities')
			});
	});
var $author$project$Main$loadActivities = F2(
	function (model, contactId) {
		var _v0 = model.d;
		if (!_v0.$) {
			var t = _v0.a;
			return _Utils_Tuple2(
				_Utils_update(
					model,
					{P: $author$project$Types$Loading}),
				A3($author$project$Api$fetchActivities, t, contactId, $author$project$Types$GotActivities));
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Types$GotContacts = function (a) {
	return {$: 9, a: a};
};
var $author$project$Api$contactsDecoder = A2(
	$elm$json$Json$Decode$field,
	'contacts',
	$elm$json$Json$Decode$list($author$project$Api$contactDecoder));
var $author$project$Api$contactsExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error.');
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err('Could not load contacts.');
					}
				default:
					var body = response.b;
					var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$contactsDecoder, body);
					if (!_v2.$) {
						var cs = _v2.a;
						return $elm$core$Result$Ok(cs);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse contacts: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$fetchContacts = F2(
	function (token, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$contactsExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'GET',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/contacts'
			});
	});
var $author$project$Main$loadContacts = function (model) {
	var _v0 = model.d;
	if (!_v0.$) {
		var t = _v0.a;
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{v: $author$project$Types$Loading}),
			A2($author$project$Api$fetchContacts, t, $author$project$Types$GotContacts));
	} else {
		return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
	}
};
var $author$project$Types$GotDeals = function (a) {
	return {$: 26, a: a};
};
var $author$project$Api$dealsDecoder = A2(
	$elm$json$Json$Decode$field,
	'deals',
	$elm$json$Json$Decode$list($author$project$Api$dealDecoder));
var $author$project$Api$dealsExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error.');
				case 3:
					var metadata = response.a;
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err(
							'Could not load deals (HTTP ' + ($elm$core$String$fromInt(metadata.ay) + '). Is /api/deals implemented on the backend?'));
					}
				default:
					var body = response.b;
					var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$dealsDecoder, body);
					if (!_v2.$) {
						var ds = _v2.a;
						return $elm$core$Result$Ok(ds);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse deals: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$fetchDeals = F2(
	function (token, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$dealsExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'GET',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/deals'
			});
	});
var $author$project$Main$loadDeals = function (model) {
	var _v0 = model.d;
	if (!_v0.$) {
		var t = _v0.a;
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{A: $author$project$Types$Loading}),
			A2($author$project$Api$fetchDeals, t, $author$project$Types$GotDeals));
	} else {
		return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
	}
};
var $author$project$Types$AuthResponse = F2(
	function (token, user) {
		return {d: token, L: user};
	});
var $author$project$Api$authResponseDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Types$AuthResponse,
	A2($elm$json$Json$Decode$field, 'token', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'user', $author$project$Api$userDecoder));
var $author$project$Api$authExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err('Bad URL: ' + url);
				case 1:
					return $elm$core$Result$Err('Request timed out.');
				case 2:
					return $elm$core$Result$Err('Network error. Check your connection.');
				case 3:
					var metadata = response.a;
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
					if (!_v1.$) {
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					} else {
						return $elm$core$Result$Err(
							'Request failed (' + ($elm$core$String$fromInt(metadata.ay) + ').'));
					}
				default:
					var body = response.b;
					var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$authResponseDecoder, body);
					if (!_v2.$) {
						var res = _v2.a;
						return $elm$core$Result$Ok(res);
					} else {
						var err = _v2.a;
						return $elm$core$Result$Err(
							'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err));
					}
			}
		});
};
var $author$project$Api$loginPayload = F2(
	function (email, password) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'email',
					$elm$json$Json$Encode$string(email)),
					_Utils_Tuple2(
					'password',
					$elm$json$Json$Encode$string(password))
				]));
	});
var $elm$http$Http$post = function (r) {
	return $elm$http$Http$request(
		{g: r.g, j: r.j, o: _List_Nil, p: 'POST', r: $elm$core$Maybe$Nothing, s: $elm$core$Maybe$Nothing, l: r.l});
};
var $author$project$Api$login = F3(
	function (email, password, toMsg) {
		return $elm$http$Http$post(
			{
				g: $elm$http$Http$jsonBody(
					A2($author$project$Api$loginPayload, email, password)),
				j: $author$project$Api$authExpect(toMsg),
				l: '/api/login'
			});
	});
var $author$project$Api$logoutAll = F2(
	function (token, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$emptyBody,
				j: $author$project$Api$statusExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				p: 'POST',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/me/logout-all'
			});
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $elm$core$Basics$not = _Basics_not;
var $author$project$Types$profileFromUser = function (u) {
	return {aE: u.aE, a: _List_Nil, aI: u.aI, f: false, ag: $elm$core$Maybe$Nothing};
};
var $author$project$Api$registerPayload = F3(
	function (name, email, password) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'name',
					$elm$json$Json$Encode$string(name)),
					_Utils_Tuple2(
					'email',
					$elm$json$Json$Encode$string(email)),
					_Utils_Tuple2(
					'password',
					$elm$json$Json$Encode$string(password))
				]));
	});
var $author$project$Api$register = F4(
	function (name, email, password, toMsg) {
		return $elm$http$Http$post(
			{
				g: $elm$http$Http$jsonBody(
					A3($author$project$Api$registerPayload, name, email, password)),
				j: $author$project$Api$authExpect(toMsg),
				l: '/api/register'
			});
	});
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$core$Maybe$destruct = F3(
	function (_default, func, maybe) {
		if (!maybe.$) {
			var a = maybe.a;
			return func(a);
		} else {
			return _default;
		}
	});
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $author$project$Main$storeToken = _Platform_outgoingPort(
	'storeToken',
	function ($) {
		return A3($elm$core$Maybe$destruct, $elm$json$Json$Encode$null, $elm$json$Json$Encode$string, $);
	});
var $elm$core$String$trim = _String_trim;
var $author$project$Api$updateContact = F4(
	function (token, id, cf, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$author$project$Api$contactFormPayload(cf)),
				j: $author$project$Api$savedContactExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'PUT',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/contacts/' + id
			});
	});
var $author$project$Api$updateDeal = F4(
	function (token, id, df, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$author$project$Api$dealFormPayload(df)),
				j: $author$project$Api$savedDealExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'PUT',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/deals/' + id
			});
	});
var $author$project$Api$updateDealStage = F4(
	function (token, id, newStage, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'stage',
								$elm$json$Json$Encode$string(newStage))
							]))),
				j: $author$project$Api$savedDealExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'PATCH',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/deals/' + (id + '/stage')
			});
	});
var $author$project$Types$ProfileUpdateResponse = F2(
	function (user, token) {
		return {d: token, L: user};
	});
var $author$project$Api$profileUpdateDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Types$ProfileUpdateResponse,
	A2($elm$json$Json$Decode$field, 'user', $author$project$Api$userDecoder),
	A2($elm$json$Json$Decode$field, 'token', $elm$json$Json$Decode$string));
var $author$project$Api$profileUpdateExpect = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		function (response) {
			switch (response.$) {
				case 0:
					var url = response.a;
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Bad URL: ' + url));
				case 1:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Request timed out.'));
				case 2:
					return $elm$core$Result$Err(
						$author$project$Types$GenericError('Network error. Check your connection.'));
				case 3:
					var body = response.b;
					var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$fieldErrorDecoder, body);
					if (!_v1.$) {
						var fields = _v1.a;
						return $elm$core$Result$Err(
							$author$project$Types$FieldErrors(fields));
					} else {
						var _v2 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$errorDecoder, body);
						if (!_v2.$) {
							var msg = _v2.a;
							return $elm$core$Result$Err(
								$author$project$Types$GenericError(msg));
						} else {
							return $elm$core$Result$Err(
								$author$project$Types$GenericError('Could not update profile.'));
						}
					}
				default:
					var body = response.b;
					var _v3 = A2($elm$json$Json$Decode$decodeString, $author$project$Api$profileUpdateDecoder, body);
					if (!_v3.$) {
						var res = _v3.a;
						return $elm$core$Result$Ok(res);
					} else {
						var err = _v3.a;
						return $elm$core$Result$Err(
							$author$project$Types$GenericError(
								'Could not parse response: ' + $elm$json$Json$Decode$errorToString(err)));
					}
			}
		});
};
var $author$project$Api$updateMe = F4(
	function (token, name, email, toMsg) {
		return $elm$http$Http$request(
			{
				g: $elm$http$Http$jsonBody(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'name',
								$elm$json$Json$Encode$string(name)),
								_Utils_Tuple2(
								'email',
								$elm$json$Json$Encode$string(email))
							]))),
				j: $author$project$Api$profileUpdateExpect(toMsg),
				o: _List_fromArray(
					[
						A2($elm$http$Http$header, 'Authorization', 'Bearer ' + token),
						A2($elm$http$Http$header, 'Content-Type', 'application/json')
					]),
				p: 'PUT',
				r: $elm$core$Maybe$Nothing,
				s: $elm$core$Maybe$Nothing,
				l: '/api/me'
			});
	});
var $author$project$Types$EmailField = 1;
var $author$project$Types$NameField = 0;
var $author$project$Types$PasswordField = 2;
var $author$project$Types$Register = 1;
var $author$project$Main$validate = F2(
	function (form, mode) {
		var passErr = ($elm$core$String$length(form.ax) < 8) ? _List_fromArray(
			[
				_Utils_Tuple2(2, 'Password must be at least 8 characters.')
			]) : _List_Nil;
		var nameErr = ((mode === 1) && $elm$core$String$isEmpty(
			$elm$core$String$trim(form.aI))) ? _List_fromArray(
			[
				_Utils_Tuple2(0, 'Please enter your name.')
			]) : _List_Nil;
		var emailErr = (!(A2($elm$core$String$contains, '@', form.aE) && A2($elm$core$String$contains, '.', form.aE))) ? _List_fromArray(
			[
				_Utils_Tuple2(1, 'Please enter a valid email.')
			]) : _List_Nil;
		return _Utils_ap(
			nameErr,
			_Utils_ap(emailErr, passErr));
	});
var $author$project$Types$activityKinds = _List_fromArray(
	['note', 'call', 'email', 'meeting', 'task']);
var $author$project$Main$validateActivityForm = function (af) {
	var titleErr = $elm$core$String$isEmpty(
		$elm$core$String$trim(af.Y)) ? _List_fromArray(
		[
			_Utils_Tuple2('title', 'Title is required.')
		]) : _List_Nil;
	var kindErr = A2($elm$core$List$member, af.bA, $author$project$Types$activityKinds) ? _List_Nil : _List_fromArray(
		[
			_Utils_Tuple2('kind', 'Pick a kind.')
		]);
	var allErrors = _Utils_ap(kindErr, titleErr);
	return _Utils_Tuple2(
		_Utils_update(
			af,
			{a: allErrors}),
		$elm$core$List$isEmpty(allErrors));
};
var $author$project$Main$validateContactForm = function (cf) {
	var nameErr = $elm$core$String$isEmpty(
		$elm$core$String$trim(cf.aI)) ? _List_fromArray(
		[
			_Utils_Tuple2('name', 'Name is required.')
		]) : _List_Nil;
	var emailErr = $elm$core$String$isEmpty(
		$elm$core$String$trim(cf.aE)) ? _List_fromArray(
		[
			_Utils_Tuple2('email', 'Email is required.')
		]) : ((!(A2($elm$core$String$contains, '@', cf.aE) && A2($elm$core$String$contains, '.', cf.aE))) ? _List_fromArray(
		[
			_Utils_Tuple2('email', 'Please enter a valid email.')
		]) : _List_Nil);
	var allErrors = _Utils_ap(nameErr, emailErr);
	return _Utils_Tuple2(
		_Utils_update(
			cf,
			{a: allErrors}),
		$elm$core$List$isEmpty(allErrors));
};
var $author$project$Main$validateDealForm = function (df) {
	var valueErr = function () {
		var _v0 = $elm$core$String$toFloat(df.aR);
		if (!_v0.$) {
			var v = _v0.a;
			return (v < 0) ? _List_fromArray(
				[
					_Utils_Tuple2('value', 'Value can\'t be negative.')
				]) : _List_Nil;
		} else {
			return $elm$core$String$isEmpty(
				$elm$core$String$trim(df.aR)) ? _List_fromArray(
				[
					_Utils_Tuple2('value', 'Deal value is required.')
				]) : _List_fromArray(
				[
					_Utils_Tuple2('value', 'Enter a valid number.')
				]);
		}
	}();
	var titleErr = $elm$core$String$isEmpty(
		$elm$core$String$trim(df.Y)) ? _List_fromArray(
		[
			_Utils_Tuple2('title', 'Title is required.')
		]) : _List_Nil;
	var allErrors = _Utils_ap(titleErr, valueErr);
	return _Utils_Tuple2(
		_Utils_update(
			df,
			{a: allErrors}),
		$elm$core$List$isEmpty(allErrors));
};
var $author$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			switch (msg.$) {
				case 65:
					if (model.I) {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{I: false}),
							$elm$core$Platform$Cmd$none);
					} else {
						if ((!_Utils_eq(model.m, $elm$core$Maybe$Nothing)) || (!_Utils_eq(model.H, $elm$core$Maybe$Nothing))) {
							var $temp$msg = $author$project$Types$ClosedActivityForm,
								$temp$model = model;
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						} else {
							if ((!_Utils_eq(model.b, $elm$core$Maybe$Nothing)) || (!_Utils_eq(model.w, $elm$core$Maybe$Nothing))) {
								var $temp$msg = $author$project$Types$RequestedCloseContactForm,
									$temp$model = model;
								msg = $temp$msg;
								model = $temp$model;
								continue update;
							} else {
								if ((!_Utils_eq(model.e, $elm$core$Maybe$Nothing)) || (!_Utils_eq(model.x, $elm$core$Maybe$Nothing))) {
									var $temp$msg = $author$project$Types$RequestedCloseDealForm,
										$temp$model = model;
									msg = $temp$msg;
									model = $temp$model;
									continue update;
								} else {
									return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
								}
							}
						}
					}
				case 0:
					var field = msg.a;
					var value = msg.b;
					var current = model.u;
					var newForm = function () {
						switch (field) {
							case 0:
								return _Utils_update(
									current,
									{aI: value});
							case 1:
								return _Utils_update(
									current,
									{aE: value});
							default:
								return _Utils_update(
									current,
									{ax: value});
						}
					}();
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A2(
									$elm$core$List$filter,
									function (_v1) {
										var f = _v1.a;
										return !_Utils_eq(f, field);
									},
									model.a),
								u: newForm
							}),
						$elm$core$Platform$Cmd$none);
				case 1:
					var value = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								u: function (f) {
									return _Utils_update(
										f,
										{bb: value});
								}(model.u)
							}),
						$elm$core$Platform$Cmd$none);
				case 2:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{aN: !model.aN}),
						$elm$core$Platform$Cmd$none);
				case 4:
					var newMode = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{U: $elm$core$Maybe$Nothing, a: _List_Nil, u: $author$project$Types$emptyForm, ab: newMode}),
						$elm$core$Platform$Cmd$none);
				case 3:
					var errs = A2($author$project$Main$validate, model.u, model.ab);
					if (!$elm$core$List$isEmpty(errs)) {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{a: errs}),
							$elm$core$Platform$Cmd$none);
					} else {
						var cmd = function () {
							var _v3 = model.ab;
							if (!_v3) {
								return A3($author$project$Api$login, model.u.aE, model.u.ax, $author$project$Types$GotAuth);
							} else {
								return A4($author$project$Api$register, model.u.aI, model.u.aE, model.u.ax, $author$project$Types$GotAuth);
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{U: $elm$core$Maybe$Nothing, a: _List_Nil, f: true}),
							cmd);
					}
				case 5:
					var result = msg.a;
					if (!result.$) {
						var token = result.a.d;
						var user = result.a.L;
						var storeCmd = model.u.bb ? $author$project$Main$storeToken(
							$elm$core$Maybe$Just(token)) : $author$project$Main$storeToken($elm$core$Maybe$Nothing);
						var modelWithAuth = _Utils_update(
							model,
							{
								U: $elm$core$Maybe$Just(
									{bA: 1, aG: 'Welcome, ' + (user.aI + '!')}),
								v: $author$project$Types$NotAsked,
								q: $author$project$Types$Home,
								f: false,
								c: $elm$core$Maybe$Nothing,
								d: $elm$core$Maybe$Just(token),
								L: $elm$core$Maybe$Just(user)
							});
						return _Utils_Tuple2(
							modelWithAuth,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										storeCmd,
										$author$project$Main$loadContacts(modelWithAuth).b,
										$author$project$Main$loadDeals(modelWithAuth).b
									])));
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									U: $elm$core$Maybe$Just(
										{bA: 0, aG: message}),
									f: false
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 6:
					var result = msg.a;
					if (!result.$) {
						var user = result.a;
						var modelWithUser = _Utils_update(
							model,
							{
								as: false,
								L: $elm$core$Maybe$Just(user)
							});
						return _Utils_Tuple2(
							modelWithUser,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$loadContacts(modelWithUser).b,
										$author$project$Main$loadDeals(modelWithUser).b
									])));
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{as: false, d: $elm$core$Maybe$Nothing, L: $elm$core$Maybe$Nothing}),
							$author$project$Main$storeToken($elm$core$Maybe$Nothing));
					}
				case 7:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{P: $author$project$Types$NotAsked, m: $elm$core$Maybe$Nothing, U: $elm$core$Maybe$Nothing, as: false, b: $elm$core$Maybe$Nothing, v: $author$project$Types$NotAsked, e: $elm$core$Maybe$Nothing, A: $author$project$Types$NotAsked, H: $elm$core$Maybe$Nothing, w: $elm$core$Maybe$Nothing, x: $elm$core$Maybe$Nothing, D: $elm$core$Maybe$Nothing, N: $elm$core$Maybe$Nothing, u: $author$project$Types$emptyForm, I: false, ab: 0, an: $elm$core$Maybe$Nothing, F: $author$project$Types$emptyPasswordForm, z: $author$project$Types$emptyProfileForm, q: $author$project$Types$Home, c: $elm$core$Maybe$Nothing, d: $elm$core$Maybe$Nothing, L: $elm$core$Maybe$Nothing, G: $elm$core$Maybe$Nothing, M: $elm$core$Maybe$Nothing}),
						$author$project$Main$storeToken($elm$core$Maybe$Nothing));
				case 8:
					var route = msg.a;
					var seededProfile = function () {
						if (_Utils_eq(route, $author$project$Types$Settings)) {
							var _v6 = model.L;
							if (!_v6.$) {
								var u = _v6.a;
								return $author$project$Types$profileFromUser(u);
							} else {
								return $author$project$Types$emptyProfileForm;
							}
						} else {
							return model.z;
						}
					}();
					var clearedModel = _Utils_update(
						model,
						{P: $author$project$Types$NotAsked, m: $elm$core$Maybe$Nothing, b: $elm$core$Maybe$Nothing, e: $elm$core$Maybe$Nothing, H: $elm$core$Maybe$Nothing, w: $elm$core$Maybe$Nothing, x: $elm$core$Maybe$Nothing, I: false, F: $author$project$Types$emptyPasswordForm, z: seededProfile, q: route, G: $elm$core$Maybe$Nothing, M: $elm$core$Maybe$Nothing});
					var needsContacts = (_Utils_eq(route, $author$project$Types$Contacts) || _Utils_eq(route, $author$project$Types$Home)) && _Utils_eq(clearedModel.v, $author$project$Types$NotAsked);
					var contactsCmd = needsContacts ? $author$project$Main$loadContacts(clearedModel).b : $elm$core$Platform$Cmd$none;
					var needsDeals = (_Utils_eq(route, $author$project$Types$Deals) || _Utils_eq(route, $author$project$Types$Home)) && _Utils_eq(clearedModel.A, $author$project$Types$NotAsked);
					var dealsCmd = needsDeals ? $author$project$Main$loadDeals(clearedModel).b : $elm$core$Platform$Cmd$none;
					var finalModel = _Utils_update(
						clearedModel,
						{
							v: needsContacts ? $author$project$Types$Loading : clearedModel.v,
							A: needsDeals ? $author$project$Types$Loading : clearedModel.A
						});
					return _Utils_Tuple2(
						finalModel,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[contactsCmd, dealsCmd])));
				case 9:
					var result = msg.a;
					if (!result.$) {
						var items = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									v: $author$project$Types$Success(
										{
											a0: items,
											ad: function () {
												var _v8 = model.v;
												if (_v8.$ === 2) {
													var d = _v8.a;
													return d.ad;
												} else {
													return '';
												}
											}()
										})
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									v: $author$project$Types$Failure(message)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 10:
					var q = msg.a;
					var _v9 = model.v;
					if (_v9.$ === 2) {
						var data = _v9.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									v: $author$project$Types$Success(
										_Utils_update(
											data,
											{ad: q}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 11:
					var contact = msg.a;
					var modelWithContact = _Utils_update(
						model,
						{
							P: $author$project$Types$NotAsked,
							q: $author$project$Types$ContactDetail(contact.av),
							c: $elm$core$Maybe$Nothing,
							G: $elm$core$Maybe$Just(contact)
						});
					return A2($author$project$Main$loadActivities, modelWithContact, contact.av);
				case 12:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $elm$core$Maybe$Just($author$project$Types$emptyContactForm),
								N: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 13:
					var contact = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $elm$core$Maybe$Just(
									$author$project$Types$contactToForm(contact)),
								N: $elm$core$Maybe$Just(contact.av),
								c: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 14:
					var _v10 = _Utils_Tuple2(model.b, model.w);
					if (!_v10.b.$) {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{w: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					} else {
						if (!_v10.a.$) {
							var cf = _v10.a.a;
							return (cf._ && (!cf.f)) ? _Utils_Tuple2(
								_Utils_update(
									model,
									{
										b: $elm$core$Maybe$Just(
											_Utils_update(
												cf,
												{at: true}))
									}),
								$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
								_Utils_update(
									model,
									{b: $elm$core$Maybe$Nothing, N: $elm$core$Maybe$Nothing}),
								$elm$core$Platform$Cmd$none);
						} else {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					}
				case 15:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{b: $elm$core$Maybe$Nothing, N: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 16:
					var _v11 = model.b;
					if (!_v11.$) {
						var cf = _v11.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $elm$core$Maybe$Just(
										_Utils_update(
											cf,
											{at: false}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 17:
					var field = msg.a;
					var value = msg.b;
					var _v12 = model.b;
					if (!_v12.$) {
						var cf = _v12.a;
						var updated = function () {
							switch (field) {
								case 'name':
									return _Utils_update(
										cf,
										{aI: value});
								case 'email':
									return _Utils_update(
										cf,
										{aE: value});
								case 'company':
									return _Utils_update(
										cf,
										{aB: value});
								case 'title':
									return _Utils_update(
										cf,
										{Y: value});
								case 'phone':
									return _Utils_update(
										cf,
										{aK: value});
								case 'location':
									return _Utils_update(
										cf,
										{aF: value});
								case 'stage':
									return _Utils_update(
										cf,
										{af: value});
								case 'tagInput':
									return _Utils_update(
										cf,
										{az: value});
								case 'notes':
									return _Utils_update(
										cf,
										{ac: value});
								default:
									return cf;
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $elm$core$Maybe$Just(
										_Utils_update(
											updated,
											{
												_: true,
												a: A2(
													$elm$core$List$filter,
													function (_v13) {
														var f = _v13.a;
														return !_Utils_eq(f, field);
													},
													updated.a)
											}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 18:
					var _v15 = model.b;
					if (!_v15.$) {
						var cf = _v15.a;
						var tag = $elm$core$String$trim(cf.az);
						return ($elm$core$String$isEmpty(tag) || A2($elm$core$List$member, tag, cf.aQ)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $elm$core$Maybe$Just(
										_Utils_update(
											cf,
											{az: ''}))
								}),
							$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $elm$core$Maybe$Just(
										_Utils_update(
											cf,
											{
												_: true,
												az: '',
												aQ: _Utils_ap(
													cf.aQ,
													_List_fromArray(
														[tag]))
											}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 19:
					var tag = msg.a;
					var _v16 = model.b;
					if (!_v16.$) {
						var cf = _v16.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $elm$core$Maybe$Just(
										_Utils_update(
											cf,
											{
												_: true,
												aQ: A2(
													$elm$core$List$filter,
													function (t) {
														return !_Utils_eq(t, tag);
													},
													cf.aQ)
											}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 20:
					var _v17 = _Utils_Tuple2(model.b, model.d);
					if ((!_v17.a.$) && (!_v17.b.$)) {
						var cf = _v17.a.a;
						var token = _v17.b.a;
						var _v18 = $author$project$Main$validateContactForm(cf);
						var validated = _v18.a;
						var ok = _v18.b;
						if (!ok) {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										b: $elm$core$Maybe$Just(validated)
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							var cmd = function () {
								var _v19 = model.N;
								if (!_v19.$) {
									var id = _v19.a;
									return A4($author$project$Api$updateContact, token, id, validated, $author$project$Types$GotSavedContact);
								} else {
									return A3($author$project$Api$createContact, token, validated, $author$project$Types$GotSavedContact);
								}
							}();
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										b: $elm$core$Maybe$Just(
											_Utils_update(
												validated,
												{f: true}))
									}),
								cmd);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 21:
					var result = msg.a;
					var wasEdit = !_Utils_eq(model.N, $elm$core$Maybe$Nothing);
					var verb = wasEdit ? 'Updated ' : 'Added ';
					if (!result.$) {
						var contact = result.a;
						var freshModel = _Utils_update(
							model,
							{
								b: $elm$core$Maybe$Nothing,
								N: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Just(
									_Utils_ap(verb, contact.aI)),
								G: function () {
									var _v21 = model.q;
									if (_v21.$ === 2) {
										return $elm$core$Maybe$Just(contact);
									} else {
										return model.G;
									}
								}()
							});
						return _Utils_Tuple2(
							freshModel,
							$author$project$Main$loadContacts(freshModel).b);
					} else {
						if (!result.a.$) {
							var fields = result.a.a;
							var _v22 = model.b;
							if (!_v22.$) {
								var cf = _v22.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											b: $elm$core$Maybe$Just(
												_Utils_update(
													cf,
													{a: fields, f: false}))
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						} else {
							var message = result.a.a;
							var _v23 = model.b;
							if (!_v23.$) {
								var cf = _v23.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											b: $elm$core$Maybe$Just(
												_Utils_update(
													cf,
													{
														a: _List_fromArray(
															[
																_Utils_Tuple2('form', message)
															]),
														f: false
													}))
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						}
					}
				case 22:
					var contact = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								w: $elm$core$Maybe$Just(contact)
							}),
						$elm$core$Platform$Cmd$none);
				case 23:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{w: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 24:
					var _v24 = _Utils_Tuple2(model.w, model.d);
					if ((!_v24.a.$) && (!_v24.b.$)) {
						var contact = _v24.a.a;
						var token = _v24.b.a;
						return _Utils_Tuple2(
							model,
							A3($author$project$Api$deleteContact, token, contact.av, $author$project$Types$GotDeletedContact));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 25:
					var result = msg.a;
					if (!result.$) {
						var name = function () {
							var _v27 = model.w;
							if (!_v27.$) {
								var c = _v27.a;
								return c.aI;
							} else {
								return 'contact';
							}
						}();
						var backToContacts = function () {
							var _v26 = model.q;
							if (_v26.$ === 2) {
								return true;
							} else {
								return false;
							}
						}();
						var freshModel = _Utils_update(
							model,
							{
								w: $elm$core$Maybe$Nothing,
								q: backToContacts ? $author$project$Types$Contacts : model.q,
								c: $elm$core$Maybe$Just('Deleted ' + name),
								G: backToContacts ? $elm$core$Maybe$Nothing : model.G
							});
						return _Utils_Tuple2(
							freshModel,
							$author$project$Main$loadContacts(freshModel).b);
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									w: $elm$core$Maybe$Nothing,
									c: $elm$core$Maybe$Just('Delete failed: ' + message)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 64:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{c: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 26:
					var result = msg.a;
					if (!result.$) {
						var items = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									A: $author$project$Types$Success(
										{
											a0: items,
											ad: function () {
												var _v29 = model.A;
												if (_v29.$ === 2) {
													var d = _v29.a;
													return d.ad;
												} else {
													return '';
												}
											}()
										})
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									A: $author$project$Types$Failure(message)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 37:
					var q = msg.a;
					var _v30 = model.A;
					if (_v30.$ === 2) {
						var data = _v30.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									A: $author$project$Types$Success(
										_Utils_update(
											data,
											{ad: q}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 27:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								e: $elm$core$Maybe$Just($author$project$Types$emptyDealForm),
								D: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 28:
					var stage = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								e: $elm$core$Maybe$Just(
									_Utils_update(
										$author$project$Types$emptyDealForm,
										{af: stage})),
								D: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 29:
					var deal = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								e: $elm$core$Maybe$Just(
									$author$project$Types$dealToForm(deal)),
								D: $elm$core$Maybe$Just(deal.av),
								c: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 30:
					var deal = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								q: $author$project$Types$DealDetail(deal.av),
								c: $elm$core$Maybe$Nothing,
								M: $elm$core$Maybe$Just(deal)
							}),
						$elm$core$Platform$Cmd$none);
				case 31:
					var _v31 = _Utils_Tuple2(model.e, model.x);
					if (!_v31.b.$) {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{x: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					} else {
						if (!_v31.a.$) {
							var df = _v31.a.a;
							return (df._ && (!df.f)) ? _Utils_Tuple2(
								_Utils_update(
									model,
									{
										e: $elm$core$Maybe$Just(
											_Utils_update(
												df,
												{at: true}))
									}),
								$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
								_Utils_update(
									model,
									{e: $elm$core$Maybe$Nothing, D: $elm$core$Maybe$Nothing}),
								$elm$core$Platform$Cmd$none);
						} else {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					}
				case 32:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{e: $elm$core$Maybe$Nothing, D: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 33:
					var _v32 = model.e;
					if (!_v32.$) {
						var df = _v32.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									e: $elm$core$Maybe$Just(
										_Utils_update(
											df,
											{at: false}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 34:
					var field = msg.a;
					var value = msg.b;
					var _v33 = model.e;
					if (!_v33.$) {
						var df = _v33.a;
						var updated = function () {
							switch (field) {
								case 'title':
									return _Utils_update(
										df,
										{Y: value});
								case 'contactId':
									return _Utils_update(
										df,
										{aC: value});
								case 'value':
									return _Utils_update(
										df,
										{aR: value});
								case 'stage':
									return _Utils_update(
										df,
										{af: value});
								case 'closeDate':
									return _Utils_update(
										df,
										{aA: value});
								case 'owner':
									return _Utils_update(
										df,
										{ao: value});
								case 'notes':
									return _Utils_update(
										df,
										{ac: value});
								default:
									return df;
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									e: $elm$core$Maybe$Just(
										_Utils_update(
											updated,
											{
												_: true,
												a: A2(
													$elm$core$List$filter,
													function (_v34) {
														var f = _v34.a;
														return !_Utils_eq(f, field);
													},
													updated.a)
											}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 35:
					var _v36 = _Utils_Tuple2(model.e, model.d);
					if ((!_v36.a.$) && (!_v36.b.$)) {
						var df = _v36.a.a;
						var token = _v36.b.a;
						var _v37 = $author$project$Main$validateDealForm(df);
						var validated = _v37.a;
						var ok = _v37.b;
						if (!ok) {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										e: $elm$core$Maybe$Just(validated)
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							var cmd = function () {
								var _v38 = model.D;
								if (!_v38.$) {
									var id = _v38.a;
									return A4($author$project$Api$updateDeal, token, id, validated, $author$project$Types$GotSavedDeal);
								} else {
									return A3($author$project$Api$createDeal, token, validated, $author$project$Types$GotSavedDeal);
								}
							}();
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										e: $elm$core$Maybe$Just(
											_Utils_update(
												validated,
												{f: true}))
									}),
								cmd);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 36:
					var result = msg.a;
					var wasEdit = !_Utils_eq(model.D, $elm$core$Maybe$Nothing);
					var verb = wasEdit ? 'Updated ' : 'Added ';
					if (!result.$) {
						var deal = result.a;
						var freshModel = _Utils_update(
							model,
							{
								e: $elm$core$Maybe$Nothing,
								D: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Just(
									_Utils_ap(verb, deal.Y)),
								M: function () {
									var _v40 = model.q;
									if (_v40.$ === 4) {
										return $elm$core$Maybe$Just(deal);
									} else {
										return model.M;
									}
								}()
							});
						return _Utils_Tuple2(
							freshModel,
							$author$project$Main$loadDeals(freshModel).b);
					} else {
						if (!result.a.$) {
							var fields = result.a.a;
							var _v41 = model.e;
							if (!_v41.$) {
								var df = _v41.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											e: $elm$core$Maybe$Just(
												_Utils_update(
													df,
													{a: fields, f: false}))
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						} else {
							var message = result.a.a;
							var _v42 = model.e;
							if (!_v42.$) {
								var df = _v42.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											e: $elm$core$Maybe$Just(
												_Utils_update(
													df,
													{
														a: _List_fromArray(
															[
																_Utils_Tuple2('form', message)
															]),
														f: false
													}))
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						}
					}
				case 38:
					var deal = msg.a;
					var newStage = msg.b;
					var _v43 = model.d;
					if (!_v43.$) {
						var token = _v43.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									an: $elm$core$Maybe$Just(deal.av)
								}),
							A4($author$project$Api$updateDealStage, token, deal.av, newStage, $author$project$Types$GotMovedDeal));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 39:
					var result = msg.a;
					if (!result.$) {
						var deal = result.a;
						var freshModel = _Utils_update(
							model,
							{
								an: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Just(deal.Y + (' moved to ' + deal.af)),
								M: function () {
									var _v45 = model.q;
									if (_v45.$ === 4) {
										return $elm$core$Maybe$Just(deal);
									} else {
										return model.M;
									}
								}()
							});
						return _Utils_Tuple2(
							freshModel,
							$author$project$Main$loadDeals(freshModel).b);
					} else {
						var err = result.a;
						var message = function () {
							if (!err.$) {
								return 'Could not move deal.';
							} else {
								var m = err.a;
								return m;
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									an: $elm$core$Maybe$Nothing,
									c: $elm$core$Maybe$Just(message)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 40:
					var deal = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								x: $elm$core$Maybe$Just(deal)
							}),
						$elm$core$Platform$Cmd$none);
				case 41:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{x: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 42:
					var _v47 = _Utils_Tuple2(model.x, model.d);
					if ((!_v47.a.$) && (!_v47.b.$)) {
						var deal = _v47.a.a;
						var token = _v47.b.a;
						return _Utils_Tuple2(
							model,
							A3($author$project$Api$deleteDeal, token, deal.av, $author$project$Types$GotDeletedDeal));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 43:
					var result = msg.a;
					if (!result.$) {
						var name = function () {
							var _v50 = model.x;
							if (!_v50.$) {
								var d = _v50.a;
								return d.Y;
							} else {
								return 'deal';
							}
						}();
						var backToDeals = function () {
							var _v49 = model.q;
							if (_v49.$ === 4) {
								return true;
							} else {
								return false;
							}
						}();
						var freshModel = _Utils_update(
							model,
							{
								e: $elm$core$Maybe$Nothing,
								x: $elm$core$Maybe$Nothing,
								D: $elm$core$Maybe$Nothing,
								q: backToDeals ? $author$project$Types$Deals : model.q,
								c: $elm$core$Maybe$Just('Deleted ' + name),
								M: backToDeals ? $elm$core$Maybe$Nothing : model.M
							});
						return _Utils_Tuple2(
							freshModel,
							$author$project$Main$loadDeals(freshModel).b);
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									x: $elm$core$Maybe$Nothing,
									c: $elm$core$Maybe$Just('Delete failed: ' + message)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 44:
					var result = msg.a;
					if (!result.$) {
						var items = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									P: $author$project$Types$Success(items)
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									P: $author$project$Types$Failure(message)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 45:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								m: $elm$core$Maybe$Just($author$project$Types$emptyActivityForm),
								c: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 46:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{m: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 47:
					var field = msg.a;
					var value = msg.b;
					var _v52 = model.m;
					if (!_v52.$) {
						var af = _v52.a;
						var updated = function () {
							switch (field) {
								case 'kind':
									return _Utils_update(
										af,
										{bA: value});
								case 'title':
									return _Utils_update(
										af,
										{Y: value});
								case 'body':
									return _Utils_update(
										af,
										{g: value});
								case 'occurredAt':
									return _Utils_update(
										af,
										{bB: value});
								default:
									return af;
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									m: $elm$core$Maybe$Just(
										_Utils_update(
											updated,
											{
												a: A2(
													$elm$core$List$filter,
													function (_v53) {
														var f = _v53.a;
														return !_Utils_eq(f, field);
													},
													updated.a)
											}))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 48:
					var _v55 = _Utils_Tuple3(model.m, model.d, model.G);
					if (((!_v55.a.$) && (!_v55.b.$)) && (!_v55.c.$)) {
						var af = _v55.a.a;
						var token = _v55.b.a;
						var contact = _v55.c.a;
						var _v56 = $author$project$Main$validateActivityForm(af);
						var validated = _v56.a;
						var ok = _v56.b;
						return (!ok) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									m: $elm$core$Maybe$Just(validated)
								}),
							$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
							_Utils_update(
								model,
								{
									m: $elm$core$Maybe$Just(
										_Utils_update(
											validated,
											{f: true}))
								}),
							A4($author$project$Api$createActivity, token, contact.av, validated, $author$project$Types$GotSavedActivity));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 49:
					var result = msg.a;
					if (!result.$) {
						var activity = result.a;
						var freshModel = _Utils_update(
							model,
							{
								m: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Just('Logged ' + activity.Y)
							});
						var contactId = function () {
							var _v58 = model.G;
							if (!_v58.$) {
								var c = _v58.a;
								return c.av;
							} else {
								return '';
							}
						}();
						return $elm$core$String$isEmpty(contactId) ? _Utils_Tuple2(freshModel, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
							freshModel,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										A2($author$project$Main$loadActivities, freshModel, contactId).b,
										$author$project$Main$loadContacts(freshModel).b
									])));
					} else {
						if (!result.a.$) {
							var fields = result.a.a;
							var _v59 = model.m;
							if (!_v59.$) {
								var af = _v59.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											m: $elm$core$Maybe$Just(
												_Utils_update(
													af,
													{a: fields, f: false}))
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						} else {
							var message = result.a.a;
							var _v60 = model.m;
							if (!_v60.$) {
								var af = _v60.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											m: $elm$core$Maybe$Just(
												_Utils_update(
													af,
													{
														a: _List_fromArray(
															[
																_Utils_Tuple2('form', message)
															]),
														f: false
													}))
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						}
					}
				case 50:
					var activity = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								H: $elm$core$Maybe$Just(activity)
							}),
						$elm$core$Platform$Cmd$none);
				case 51:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{H: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 52:
					var _v61 = _Utils_Tuple2(model.H, model.d);
					if ((!_v61.a.$) && (!_v61.b.$)) {
						var activity = _v61.a.a;
						var token = _v61.b.a;
						return _Utils_Tuple2(
							model,
							A3($author$project$Api$deleteActivity, token, activity.av, $author$project$Types$GotDeletedActivity));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 53:
					var result = msg.a;
					if (!result.$) {
						var freshModel = _Utils_update(
							model,
							{
								H: $elm$core$Maybe$Nothing,
								c: $elm$core$Maybe$Just('Activity deleted')
							});
						var contactId = function () {
							var _v63 = model.G;
							if (!_v63.$) {
								var c = _v63.a;
								return c.av;
							} else {
								return '';
							}
						}();
						return $elm$core$String$isEmpty(contactId) ? _Utils_Tuple2(freshModel, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
							freshModel,
							A2($author$project$Main$loadActivities, freshModel, contactId).b);
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									H: $elm$core$Maybe$Nothing,
									c: $elm$core$Maybe$Just('Delete failed: ' + message)
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 54:
					var field = msg.a;
					var value = msg.b;
					var pf = model.z;
					var updated = function () {
						switch (field) {
							case 'name':
								return _Utils_update(
									pf,
									{aI: value});
							case 'email':
								return _Utils_update(
									pf,
									{aE: value});
							default:
								return pf;
						}
					}();
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								z: _Utils_update(
									updated,
									{
										a: A2(
											$elm$core$List$filter,
											function (_v64) {
												var f = _v64.a;
												return !_Utils_eq(f, field);
											},
											updated.a),
										ag: $elm$core$Maybe$Nothing
									})
							}),
						$elm$core$Platform$Cmd$none);
				case 55:
					var _v66 = model.d;
					if (!_v66.$) {
						var token = _v66.a;
						var pf = model.z;
						var errs = A2(
							$elm$core$List$filterMap,
							$elm$core$Basics$identity,
							_List_fromArray(
								[
									$elm$core$String$isEmpty(
									$elm$core$String$trim(pf.aI)) ? $elm$core$Maybe$Just(
									_Utils_Tuple2('name', 'Name is required.')) : $elm$core$Maybe$Nothing,
									(!(A2($elm$core$String$contains, '@', pf.aE) && A2($elm$core$String$contains, '.', pf.aE))) ? $elm$core$Maybe$Just(
									_Utils_Tuple2('email', 'Please enter a valid email.')) : $elm$core$Maybe$Nothing
								]));
						return (!$elm$core$List$isEmpty(errs)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									z: _Utils_update(
										pf,
										{a: errs})
								}),
							$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
							_Utils_update(
								model,
								{
									z: _Utils_update(
										pf,
										{a: _List_Nil, f: true, ag: $elm$core$Maybe$Nothing})
								}),
							A4($author$project$Api$updateMe, token, pf.aI, pf.aE, $author$project$Types$GotUpdatedProfile));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 56:
					var result = msg.a;
					var pf = model.z;
					if (!result.$) {
						var res = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									z: _Utils_update(
										pf,
										{
											f: false,
											ag: $elm$core$Maybe$Just('Profile updated.')
										}),
									d: $elm$core$Maybe$Just(res.d),
									L: $elm$core$Maybe$Just(res.L)
								}),
							$author$project$Main$storeToken(
								$elm$core$Maybe$Just(res.d)));
					} else {
						if (!result.a.$) {
							var fields = result.a.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										z: _Utils_update(
											pf,
											{a: fields, f: false})
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							var message = result.a.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										z: _Utils_update(
											pf,
											{
												a: _List_fromArray(
													[
														_Utils_Tuple2('form', message)
													]),
												f: false
											})
									}),
								$elm$core$Platform$Cmd$none);
						}
					}
				case 57:
					var field = msg.a;
					var value = msg.b;
					var pf = model.F;
					var updated = function () {
						switch (field) {
							case 'current':
								return _Utils_update(
									pf,
									{aD: value});
							case 'next':
								return _Utils_update(
									pf,
									{aw: value});
							case 'confirm':
								return _Utils_update(
									pf,
									{aU: value});
							default:
								return pf;
						}
					}();
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								F: _Utils_update(
									updated,
									{
										a: A2(
											$elm$core$List$filter,
											function (_v68) {
												var f = _v68.a;
												return !_Utils_eq(f, field);
											},
											updated.a),
										ag: $elm$core$Maybe$Nothing
									})
							}),
						$elm$core$Platform$Cmd$none);
				case 58:
					var _v70 = model.d;
					if (!_v70.$) {
						var token = _v70.a;
						var pf = model.F;
						var errs = A2(
							$elm$core$List$filterMap,
							$elm$core$Basics$identity,
							_List_fromArray(
								[
									$elm$core$String$isEmpty(pf.aD) ? $elm$core$Maybe$Just(
									_Utils_Tuple2('current', 'Enter your current password.')) : $elm$core$Maybe$Nothing,
									($elm$core$String$length(pf.aw) < 8) ? $elm$core$Maybe$Just(
									_Utils_Tuple2('next', 'New password must be at least 8 characters.')) : $elm$core$Maybe$Nothing,
									(!_Utils_eq(pf.aU, pf.aw)) ? $elm$core$Maybe$Just(
									_Utils_Tuple2('confirm', 'Passwords don\'t match.')) : $elm$core$Maybe$Nothing
								]));
						return (!$elm$core$List$isEmpty(errs)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									F: _Utils_update(
										pf,
										{a: errs})
								}),
							$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
							_Utils_update(
								model,
								{
									F: _Utils_update(
										pf,
										{a: _List_Nil, f: true, ag: $elm$core$Maybe$Nothing})
								}),
							A4($author$project$Api$changePassword, token, pf.aD, pf.aw, $author$project$Types$GotChangedPassword));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 59:
					var result = msg.a;
					var pf = model.F;
					if (!result.$) {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									F: _Utils_update(
										$author$project$Types$emptyPasswordForm,
										{
											ag: $elm$core$Maybe$Just('Password changed.')
										}),
									c: $elm$core$Maybe$Just('Password updated')
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									F: _Utils_update(
										pf,
										{
											a: _List_fromArray(
												[
													_Utils_Tuple2('form', message)
												]),
											f: false
										})
								}),
							$elm$core$Platform$Cmd$none);
					}
				case 60:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{I: true}),
						$elm$core$Platform$Cmd$none);
				case 61:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{I: false}),
						$elm$core$Platform$Cmd$none);
				case 62:
					var _v72 = model.d;
					if (!_v72.$) {
						var token = _v72.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{I: false}),
							A2($author$project$Api$logoutAll, token, $author$project$Types$GotLogoutAll));
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{I: false}),
							$elm$core$Platform$Cmd$none);
					}
				default:
					var result = msg.a;
					if (!result.$) {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									P: $author$project$Types$NotAsked,
									U: $elm$core$Maybe$Just(
										{bA: 1, aG: 'Signed out of all devices.'}),
									v: $author$project$Types$NotAsked,
									A: $author$project$Types$NotAsked,
									ab: 0,
									q: $author$project$Types$Home,
									c: $elm$core$Maybe$Nothing,
									d: $elm$core$Maybe$Nothing,
									L: $elm$core$Maybe$Nothing
								}),
							$author$project$Main$storeToken($elm$core$Maybe$Nothing));
					} else {
						var message = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									c: $elm$core$Maybe$Just('Sign-out failed: ' + message)
								}),
							$elm$core$Platform$Cmd$none);
					}
			}
		}
	});
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $elm$html$Html$main_ = _VirtualDom_node('main');
var $author$project$Types$SubmittedActivityForm = {$: 48};
var $author$project$Types$UpdatedActivityFormField = F2(
	function (a, b) {
		return {$: 47, a: a, b: b};
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Views$activityFormFieldError = F2(
	function (field, af) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$second,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var f = _v0.a;
						return _Utils_eq(f, field);
					},
					af.a)));
	});
var $author$project$Views$activityKindLabel = function (kind) {
	switch (kind) {
		case 'email':
			return 'Email';
		case 'call':
			return 'Call';
		case 'meeting':
			return 'Meeting';
		case 'note':
			return 'Note';
		case 'task':
			return 'Task';
		default:
			return 'Activity';
	}
};
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$p = _VirtualDom_node('p');
var $elm$html$Html$span = _VirtualDom_node('span');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $author$project$Views$activityKindPills = function (af) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ecc-field')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field__label')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Kind')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('stage-pills')
					]),
				A2(
					$elm$core$List$map,
					function (k) {
						var cls = _Utils_eq(af.bA, k) ? 'stage-pill stage-pill--active' : 'stage-pill';
						return A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class(cls),
									$elm$html$Html$Events$onClick(
									A2($author$project$Types$UpdatedActivityFormField, 'kind', k)),
									$elm$html$Html$Attributes$disabled(af.f)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$author$project$Views$activityKindLabel(k))
								]));
					},
					$author$project$Types$activityKinds)),
				function () {
				var _v0 = A2($author$project$Views$activityFormFieldError, 'kind', af);
				if (!_v0.$) {
					var msg = _v0.a;
					return A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('ecc-field__message')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(msg)
							]));
				} else {
					return $elm$html$Html$text('');
				}
			}()
			]));
};
var $elm$html$Html$Attributes$autofocus = $elm$html$Html$Attributes$boolProperty('autofocus');
var $elm$html$Html$Attributes$for = $elm$html$Html$Attributes$stringProperty('htmlFor');
var $elm$html$Html$form = _VirtualDom_node('form');
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm$html$Html$Attributes$novalidate = $elm$html$Html$Attributes$boolProperty('noValidate');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Events$alwaysPreventDefault = function (msg) {
	return _Utils_Tuple2(msg, true);
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $elm$html$Html$Events$onSubmit = function (msg) {
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'submit',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysPreventDefault,
			$elm$json$Json$Decode$succeed(msg)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$Attributes$rows = function (n) {
	return A2(
		_VirtualDom_attribute,
		'rows',
		$elm$core$String$fromInt(n));
};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Views$activityFormView = function (af) {
	var titleError = A2($author$project$Views$activityFormFieldError, 'title', af);
	var titleCls = function () {
		if (!titleError.$) {
			return 'ecc-field ecc-field--error';
		} else {
			return 'ecc-field';
		}
	}();
	var submitLabel = af.f ? 'Saving…' : 'Log activity';
	var formError = A2($author$project$Views$activityFormFieldError, 'form', af);
	return A2(
		$elm$html$Html$form,
		_List_fromArray(
			[
				$elm$html$Html$Events$onSubmit($author$project$Types$SubmittedActivityForm),
				$elm$html$Html$Attributes$novalidate(true)
			]),
		_List_fromArray(
			[
				function () {
				if (!formError.$) {
					var msg = formError.a;
					return A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('ecc-alert ecc-alert--error')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(msg)
							]));
				} else {
					return $elm$html$Html$text('');
				}
			}(),
				$author$project$Views$activityKindPills(af),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(titleCls)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('af-title'),
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$placeholder(' '),
								$elm$html$Html$Attributes$value(af.Y),
								$elm$html$Html$Events$onInput(
								$author$project$Types$UpdatedActivityFormField('title')),
								$elm$html$Html$Attributes$disabled(af.f),
								$elm$html$Html$Attributes$autofocus(true)
							]),
						_List_Nil),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('af-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Title')
							])),
						function () {
						if (!titleError.$) {
							var msg = titleError.a;
							return A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-field__message')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(msg)
									]));
						} else {
							return $elm$html$Html$text('');
						}
					}()
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('af-occurredAt'),
								$elm$html$Html$Attributes$type_('date'),
								$elm$html$Html$Attributes$placeholder(' '),
								$elm$html$Html$Attributes$value(af.bB),
								$elm$html$Html$Events$onInput(
								$author$project$Types$UpdatedActivityFormField('occurredAt')),
								$elm$html$Html$Attributes$disabled(af.f)
							]),
						_List_Nil),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('af-occurredAt')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Date')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field ecc-field--notes')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('ecc-field__label')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Details')
							])),
						A2(
						$elm$html$Html$textarea,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('af-body'),
								$elm$html$Html$Attributes$placeholder('What happened?'),
								$elm$html$Html$Attributes$value(af.g),
								$elm$html$Html$Events$onInput(
								$author$project$Types$UpdatedActivityFormField('body')),
								$elm$html$Html$Attributes$disabled(af.f),
								$elm$html$Html$Attributes$rows(4)
							]),
						_List_Nil)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal__actions')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
								$elm$html$Html$Events$onClick($author$project$Types$ClosedActivityForm),
								$elm$html$Html$Attributes$disabled(af.f)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Cancel')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('submit'),
								$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
								$elm$html$Html$Attributes$disabled(af.f)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(submitLabel)
							]))
					]))
			]));
};
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $elm$html$Html$header = _VirtualDom_node('header');
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$node = $elm$virtual_dom$VirtualDom$node;
var $author$project$Views$svgIcon = $elm$html$Html$node('svg');
var $author$project$Views$svgPath = function (d) {
	return A3(
		$elm$html$Html$node,
		'path',
		_List_fromArray(
			[
				A2($elm$html$Html$Attributes$attribute, 'd', d)
			]),
		_List_Nil);
};
var $author$project$Views$activityFormModal = function (af) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('modal-backdrop'),
				$elm$html$Html$Events$onClick($author$project$Types$ClosedActivityForm)
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal modal--wide'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'dialog'),
						A2($elm$html$Html$Attributes$attribute, 'aria-modal', 'true'),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Log activity'),
						A2(
						$elm$html$Html$Events$stopPropagationOn,
						'click',
						$elm$json$Json$Decode$succeed(
							_Utils_Tuple2($author$project$Types$DismissedToast, true)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Log activity')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__close'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$Types$ClosedActivityForm),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '18'),
												A2($elm$html$Html$Attributes$attribute, 'height', '18'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												$author$project$Views$svgPath('M18 6 6 18'),
												$author$project$Views$svgPath('M6 6l12 12')
											]))
									]))
							])),
						$author$project$Views$activityFormView(af)
					]))
			]));
};
var $author$project$Types$NavigatedTo = function (a) {
	return {$: 8, a: a};
};
var $author$project$Types$OpenedActivityForm = {$: 45};
var $author$project$Types$OpenedEditContact = function (a) {
	return {$: 13, a: a};
};
var $author$project$Types$RequestedDeleteContact = function (a) {
	return {$: 22, a: a};
};
var $elm$html$Html$a = _VirtualDom_node('a');
var $author$project$Types$RequestedDeleteActivity = function (a) {
	return {$: 50, a: a};
};
var $elm$html$Html$h4 = _VirtualDom_node('h4');
var $author$project$Views$iconTrash = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '15'),
			A2($elm$html$Html$Attributes$attribute, 'height', '15'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M3 6h18'),
			$author$project$Views$svgPath('M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'),
			$author$project$Views$svgPath('M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')
		]));
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $author$project$Views$activityItemView = function (a) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('activity-item')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('activity-item__marker'),
						$elm$html$Html$Attributes$class('activity-item__marker--' + a.bA)
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('activity-item__body')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('activity-item__meta')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('activity-item__kind')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$author$project$Views$activityKindLabel(a.bA))
									])),
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('activity-item__time')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(a.bB)
									])),
								$elm$core$String$isEmpty(a.bs) ? $elm$html$Html$text('') : A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('activity-item__by')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('· ' + a.bs)
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('activity-item__title-row')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h4,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('activity-item__title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(a.Y)
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('row-action row-action--danger row-action--tiny'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$title('Delete activity'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete ' + a.Y),
										$elm$html$Html$Events$onClick(
										$author$project$Types$RequestedDeleteActivity(a))
									]),
								_List_fromArray(
									[$author$project$Views$iconTrash]))
							])),
						$elm$core$String$isEmpty(a.g) ? $elm$html$Html$text('') : A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('activity-item__text')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(a.g)
							]))
					]))
			]));
};
var $author$project$Views$detailEmpty = F3(
	function (icon, titleText, desc) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('detail-empty')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-empty__icon')
						]),
					_List_fromArray(
						[icon])),
					A2(
					$elm$html$Html$h4,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-empty__title')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(titleText)
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-empty__desc')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(desc)
						]))
				]));
	});
var $author$project$Views$iconTasks = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '18'),
			A2($elm$html$Html$Attributes$attribute, 'height', '18'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M9 11l3 3L22 4'),
			$author$project$Views$svgPath('M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11')
		]));
var $author$project$Views$activityFeed = function (model) {
	var _v0 = model.P;
	switch (_v0.$) {
		case 0:
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('activity-loading')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Loading activity…')
					]));
		case 1:
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('activity-loading')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Loading activity…')
					]));
		case 3:
			var msg = _v0.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('activity-loading')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Could not load activity: ' + msg)
					]));
		default:
			if (!_v0.a.b) {
				return A3($author$project$Views$detailEmpty, $author$project$Views$iconTasks, 'No activity yet', 'Log your first call, email, or meeting to keep the timeline up to date.');
			} else {
				var items = _v0.a;
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('activity-list')
						]),
					A2($elm$core$List$map, $author$project$Views$activityItemView, items));
			}
	}
};
var $elm$html$Html$aside = _VirtualDom_node('aside');
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $elm$html$Html$section = _VirtualDom_node('section');
var $author$project$Views$detailCard = F3(
	function (titleText, action, body) {
		return A2(
			$elm$html$Html$section,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('detail-card')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$header,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-card__header')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h3,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail-card__title')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(titleText)
								])),
							function () {
							if (!action.$) {
								var a = action.a;
								return a;
							} else {
								return $elm$html$Html$text('');
							}
						}()
						])),
					body
				]));
	});
var $author$project$Views$detailStat = F3(
	function (label, valueText, hint) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('detail-stat')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-stat__label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(label)
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-stat__value')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(valueText)
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-stat__hint')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(hint)
						]))
				]));
	});
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $author$project$Views$iconBack = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '16'),
			A2($elm$html$Html$Attributes$attribute, 'height', '16'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M19 12H5'),
			$author$project$Views$svgPath('M12 19l-7-7 7-7')
		]));
var $author$project$Views$iconCalendar = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '14'),
			A2($elm$html$Html$Attributes$attribute, 'height', '14'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			A3(
			$elm$html$Html$node,
			'rect',
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$attribute, 'x', '3'),
					A2($elm$html$Html$Attributes$attribute, 'y', '4'),
					A2($elm$html$Html$Attributes$attribute, 'width', '18'),
					A2($elm$html$Html$Attributes$attribute, 'height', '18'),
					A2($elm$html$Html$Attributes$attribute, 'rx', '2')
				]),
			_List_Nil),
			$author$project$Views$svgPath('M16 2v4M8 2v4M3 10h18')
		]));
var $author$project$Views$iconContacts = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '18'),
			A2($elm$html$Html$Attributes$attribute, 'height', '18'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'),
			A3(
			$elm$html$Html$node,
			'circle',
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$attribute, 'cx', '9'),
					A2($elm$html$Html$Attributes$attribute, 'cy', '7'),
					A2($elm$html$Html$Attributes$attribute, 'r', '4')
				]),
			_List_Nil),
			$author$project$Views$svgPath('M23 21v-2a4 4 0 0 0-3-3.87'),
			$author$project$Views$svgPath('M16 3.13a4 4 0 0 1 0 7.75')
		]));
var $author$project$Views$iconDeals = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '18'),
			A2($elm$html$Html$Attributes$attribute, 'height', '18'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6')
		]));
var $author$project$Views$iconEdit = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '15'),
			A2($elm$html$Html$Attributes$attribute, 'height', '15'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'),
			$author$project$Views$svgPath('M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z')
		]));
var $author$project$Views$iconMail = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '14'),
			A2($elm$html$Html$Attributes$attribute, 'height', '14'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'),
			$author$project$Views$svgPath('M22 6l-10 7L2 6')
		]));
var $author$project$Views$iconPhone = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '14'),
			A2($elm$html$Html$Attributes$attribute, 'height', '14'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z')
		]));
var $author$project$Views$iconPin = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '14'),
			A2($elm$html$Html$Attributes$attribute, 'height', '14'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'),
			A3(
			$elm$html$Html$node,
			'circle',
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$attribute, 'cx', '12'),
					A2($elm$html$Html$Attributes$attribute, 'cy', '10'),
					A2($elm$html$Html$Attributes$attribute, 'r', '3')
				]),
			_List_Nil)
		]));
var $author$project$Views$infoRow = F3(
	function (icon, label, valueText) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('info-row')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('info-row__icon')
						]),
					_List_fromArray(
						[icon])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('info-row__body')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('info-row__label')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(label)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('info-row__value')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(valueText)
								]))
						]))
				]));
	});
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $elm$core$String$toUpper = _String_toUpper;
var $elm$core$String$words = _String_words;
var $author$project$Views$initials = function (name) {
	return $elm$core$String$toUpper(
		$elm$core$String$concat(
			A2(
				$elm$core$List$take,
				2,
				A2(
					$elm$core$List$map,
					$elm$core$String$left(1),
					$elm$core$String$words(name)))));
};
var $elm$core$String$toLower = _String_toLower;
var $author$project$Views$stageBadge = function (stage) {
	var cls = function () {
		var _v0 = $elm$core$String$toLower(stage);
		switch (_v0) {
			case 'customer':
				return 'badge badge--customer';
			case 'qualified':
				return 'badge badge--qualified';
			case 'proposal':
				return 'badge badge--proposal';
			case 'lead':
				return 'badge badge--lead';
			case 'negotiation':
				return 'badge badge--negotiation';
			case 'won':
				return 'badge badge--won';
			case 'lost':
				return 'badge badge--lost';
			default:
				return 'badge';
		}
	}();
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(cls)
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(stage)
			]));
};
var $author$project$Views$contactDetailView = F2(
	function (model, c) {
		var displayTitle = $elm$core$String$isEmpty(c.Y) ? '' : c.Y;
		var displayPhone = $elm$core$String$isEmpty(c.aK) ? '—' : c.aK;
		var displayOwner = $elm$core$String$isEmpty(c.ao) ? 'Unassigned' : c.ao;
		var displayLocation = $elm$core$String$isEmpty(c.aF) ? '—' : c.aF;
		var displayCreated = $elm$core$String$isEmpty(c.au) ? '—' : c.au;
		var displayCompany = $elm$core$String$isEmpty(c.aB) ? '—' : c.aB;
		var roleLine = $elm$core$String$isEmpty(displayTitle) ? displayCompany : (displayTitle + (' · ' + displayCompany));
		var activityCount = function () {
			var _v0 = model.P;
			if (_v0.$ === 2) {
				var items = _v0.a;
				return $elm$core$List$length(items);
			} else {
				return 0;
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('detail')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail__back'),
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$NavigatedTo($author$project$Types$Contacts))
						]),
					_List_fromArray(
						[
							$author$project$Views$iconBack,
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Back to contacts')
								]))
						])),
					A2(
					$elm$html$Html$header,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-hero')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail-hero__avatar')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$author$project$Views$initials(c.aI))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail-hero__body')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('detail-hero__title-row')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$h1,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-hero__name')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(c.aI)
												])),
											$author$project$Views$stageBadge(c.af)
										])),
									A2(
									$elm$html$Html$p,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('detail-hero__role')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(roleLine)
										])),
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('detail-hero__contact')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$a,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-hero__chip'),
													$elm$html$Html$Attributes$href('mailto:' + c.aE)
												]),
											_List_fromArray(
												[
													$author$project$Views$iconMail,
													A2(
													$elm$html$Html$span,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text(c.aE)
														]))
												])),
											$elm$core$String$isEmpty(c.aK) ? $elm$html$Html$text('') : A2(
											$elm$html$Html$a,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-hero__chip'),
													$elm$html$Html$Attributes$href('tel:' + c.aK)
												]),
											_List_fromArray(
												[
													$author$project$Views$iconPhone,
													A2(
													$elm$html$Html$span,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text(c.aK)
														]))
												])),
											$elm$core$String$isEmpty(c.aF) ? $elm$html$Html$text('') : A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-hero__chip')
												]),
											_List_fromArray(
												[
													$author$project$Views$iconPin,
													A2(
													$elm$html$Html$span,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text(c.aF)
														]))
												]))
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail-hero__actions')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick(
											$author$project$Types$OpenedEditContact(c))
										]),
									_List_fromArray(
										[
											$author$project$Views$iconEdit,
											A2(
											$elm$html$Html$span,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text('Edit')
												]))
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick(
											$author$project$Types$RequestedDeleteContact(c))
										]),
									_List_fromArray(
										[
											$author$project$Views$iconTrash,
											A2(
											$elm$html$Html$span,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text('Delete')
												]))
										]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-stats')
						]),
					_List_fromArray(
						[
							A3($author$project$Views$detailStat, 'Open deals', '0', 'No deals yet'),
							A3(
							$author$project$Views$detailStat,
							'Activities',
							$elm$core$String$fromInt(activityCount),
							'Logged'),
							A3($author$project$Views$detailStat, 'Tasks due', '0', 'All clear'),
							A3($author$project$Views$detailStat, 'Last contact', c.a2, 'Last touch')
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail__grid')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$aside,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail__sidebar')
								]),
							_List_fromArray(
								[
									A3(
									$author$project$Views$detailCard,
									'About',
									$elm$core$Maybe$Nothing,
									A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('info-list')
											]),
										_List_fromArray(
											[
												A3($author$project$Views$infoRow, $author$project$Views$iconMail, 'Email', c.aE),
												A3($author$project$Views$infoRow, $author$project$Views$iconPhone, 'Phone', displayPhone),
												A3($author$project$Views$infoRow, $author$project$Views$iconPin, 'Location', displayLocation),
												A3($author$project$Views$infoRow, $author$project$Views$iconCalendar, 'Created', displayCreated),
												A3($author$project$Views$infoRow, $author$project$Views$iconContacts, 'Owner', displayOwner)
											]))),
									A3(
									$author$project$Views$detailCard,
									'Tags',
									$elm$core$Maybe$Nothing,
									$elm$core$List$isEmpty(c.aQ) ? A2(
										$elm$html$Html$p,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('detail-muted')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('No tags yet.')
											])) : A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tag-list')
											]),
										A2(
											$elm$core$List$map,
											function (t) {
												return A2(
													$elm$html$Html$span,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('tag')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text(t)
														]));
											},
											c.aQ))),
									A3(
									$author$project$Views$detailCard,
									'Notes',
									$elm$core$Maybe$Nothing,
									$elm$core$String$isEmpty(c.ac) ? A2(
										$elm$html$Html$p,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('detail-muted')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('No notes yet. Record what matters about this relationship.')
											])) : A2(
										$elm$html$Html$p,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('detail-notes')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c.ac)
											])))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail__main')
								]),
							_List_fromArray(
								[
									A3(
									$author$project$Views$detailCard,
									'Activity',
									$elm$core$Maybe$Just(
										A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-card__action'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Events$onClick($author$project$Types$OpenedActivityForm)
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Log activity')
												]))),
									$author$project$Views$activityFeed(model)),
									A3(
									$author$project$Views$detailCard,
									'Open deals',
									$elm$core$Maybe$Just(
										A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-card__action'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Attributes$disabled(true),
													$elm$html$Html$Attributes$title('Coming soon')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('New deal')
												]))),
									A3($author$project$Views$detailEmpty, $author$project$Views$iconDeals, 'No deals yet', 'Link this contact to a deal to see pipeline value and stage.')),
									A3(
									$author$project$Views$detailCard,
									'Tasks',
									$elm$core$Maybe$Just(
										A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-card__action'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Attributes$disabled(true),
													$elm$html$Html$Attributes$title('Coming soon')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('New task')
												]))),
									A3($author$project$Views$detailEmpty, $author$project$Views$iconTasks, 'No tasks yet', 'Add a follow-up to make sure nothing slips through the cracks.'))
								]))
						]))
				]));
	});
var $author$project$Types$SubmittedContactForm = {$: 20};
var $author$project$Views$contactFormFieldError = F2(
	function (field, cf) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$second,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var f = _v0.a;
						return _Utils_eq(f, field);
					},
					cf.a)));
	});
var $author$project$Types$UpdatedContactFormField = F2(
	function (a, b) {
		return {$: 17, a: a, b: b};
	});
var $author$project$Views$notesField = function (cf) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ecc-field ecc-field--notes')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field__label')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Notes')
					])),
				A2(
				$elm$html$Html$textarea,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('cf-notes'),
						$elm$html$Html$Attributes$placeholder('Record what matters about this relationship…'),
						$elm$html$Html$Attributes$value(cf.ac),
						$elm$html$Html$Events$onInput(
						$author$project$Types$UpdatedContactFormField('notes')),
						$elm$html$Html$Attributes$disabled(cf.f),
						$elm$html$Html$Attributes$rows(4)
					]),
				_List_Nil)
			]));
};
var $author$project$Views$richField = F5(
	function (cf, fieldId, labelText, inputType, shouldFocus) {
		var err = A2($author$project$Views$contactFormFieldError, fieldId, cf);
		var currentValue = function () {
			switch (fieldId) {
				case 'name':
					return cf.aI;
				case 'email':
					return cf.aE;
				case 'company':
					return cf.aB;
				case 'title':
					return cf.Y;
				case 'phone':
					return cf.aK;
				case 'location':
					return cf.aF;
				default:
					return '';
			}
		}();
		var cls = function () {
			if (!err.$) {
				return 'ecc-field ecc-field--error';
			} else {
				return 'ecc-field';
			}
		}();
		var baseAttrs = _List_fromArray(
			[
				$elm$html$Html$Attributes$id('cf-' + fieldId),
				$elm$html$Html$Attributes$type_(inputType),
				$elm$html$Html$Attributes$placeholder(' '),
				$elm$html$Html$Attributes$value(currentValue),
				$elm$html$Html$Events$onInput(
				$author$project$Types$UpdatedContactFormField(fieldId)),
				$elm$html$Html$Attributes$disabled(cf.f)
			]);
		var finalAttrs = shouldFocus ? _Utils_ap(
			baseAttrs,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$autofocus(true)
				])) : baseAttrs;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(cls)
				]),
			_Utils_ap(
				_List_fromArray(
					[
						A2($elm$html$Html$input, finalAttrs, _List_Nil),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('cf-' + fieldId)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(labelText)
							]))
					]),
				function () {
					if (!err.$) {
						var msg = err.a;
						return _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-field__message')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(msg)
									]))
							]);
					} else {
						return _List_Nil;
					}
				}()));
	});
var $author$project$Views$stageOptions = _List_fromArray(
	['Lead', 'Qualified', 'Proposal', 'Customer']);
var $author$project$Views$stagePills = function (cf) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ecc-field')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field__label')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Stage')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('stage-pills')
					]),
				A2(
					$elm$core$List$map,
					function (s) {
						var cls = _Utils_eq(cf.af, s) ? 'stage-pill stage-pill--active' : 'stage-pill';
						return A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class(cls),
									$elm$html$Html$Events$onClick(
									A2($author$project$Types$UpdatedContactFormField, 'stage', s)),
									$elm$html$Html$Attributes$disabled(cf.f)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(s)
								]));
					},
					$author$project$Views$stageOptions))
			]));
};
var $author$project$Types$AddedContactTag = {$: 18};
var $author$project$Types$RemovedContactTag = function (a) {
	return {$: 19, a: a};
};
var $author$project$Views$onEnter = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'keydown',
		A2(
			$elm$json$Json$Decode$andThen,
			function (key) {
				return (key === 'Enter') ? $elm$json$Json$Decode$succeed(msg) : $elm$json$Json$Decode$fail('not enter');
			},
			A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string)));
};
var $author$project$Views$tagsField = function (cf) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ecc-field ecc-field--tags')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field__label')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Tags')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tag-input-row')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$id('cf-tagInput'),
								$elm$html$Html$Attributes$placeholder('Add a tag…'),
								$elm$html$Html$Attributes$value(cf.az),
								$elm$html$Html$Events$onInput(
								$author$project$Types$UpdatedContactFormField('tagInput')),
								$author$project$Views$onEnter($author$project$Types$AddedContactTag),
								$elm$html$Html$Attributes$disabled(cf.f)
							]),
						_List_Nil),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Attributes$class('tag-add-btn'),
								$elm$html$Html$Events$onClick($author$project$Types$AddedContactTag),
								$elm$html$Html$Attributes$disabled(cf.f)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Add')
							]))
					])),
				$elm$core$List$isEmpty(cf.aQ) ? $elm$html$Html$text('') : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tag-chip-list')
					]),
				A2(
					$elm$core$List$map,
					function (t) {
						return A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tag-chip')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(t),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Attributes$class('tag-chip__remove'),
											$elm$html$Html$Events$onClick(
											$author$project$Types$RemovedContactTag(t)),
											$elm$html$Html$Attributes$disabled(cf.f),
											A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Remove tag ' + t)
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('×')
										]))
								]));
					},
					cf.aQ))
			]));
};
var $author$project$Views$contactFormView = F2(
	function (cf, isEdit) {
		var submitLabel = cf.f ? 'Saving…' : (isEdit ? 'Save changes' : 'Save contact');
		var formError = A2($author$project$Views$contactFormFieldError, 'form', cf);
		return A2(
			$elm$html$Html$form,
			_List_fromArray(
				[
					$elm$html$Html$Events$onSubmit($author$project$Types$SubmittedContactForm),
					$elm$html$Html$Attributes$novalidate(true)
				]),
			_List_fromArray(
				[
					function () {
					if (!formError.$) {
						var msg = formError.a;
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('ecc-alert ecc-alert--error')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(msg)
								]));
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('form-grid')
						]),
					_List_fromArray(
						[
							A5($author$project$Views$richField, cf, 'name', 'Full name', 'text', true),
							A5($author$project$Views$richField, cf, 'email', 'Email address', 'email', false),
							A5($author$project$Views$richField, cf, 'company', 'Company', 'text', false),
							A5($author$project$Views$richField, cf, 'title', 'Job title', 'text', false),
							A5($author$project$Views$richField, cf, 'phone', 'Phone', 'tel', false),
							A5($author$project$Views$richField, cf, 'location', 'Location', 'text', false)
						])),
					$author$project$Views$stagePills(cf),
					$author$project$Views$tagsField(cf),
					$author$project$Views$notesField(cf),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal__actions')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
									$elm$html$Html$Events$onClick($author$project$Types$RequestedCloseContactForm),
									$elm$html$Html$Attributes$disabled(cf.f)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Cancel')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('submit'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
									$elm$html$Html$Attributes$disabled(cf.f || (!cf._))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(submitLabel)
								]))
						]))
				]));
	});
var $author$project$Types$CancelledCloseContactForm = {$: 16};
var $author$project$Types$ConfirmedCloseContactForm = {$: 15};
var $author$project$Views$discardConfirmView = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('modal__confirm')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('modal__confirm-text')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Discard your changes? They won\'t be saved.')
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('modal__actions')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
							$elm$html$Html$Events$onClick($author$project$Types$CancelledCloseContactForm)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Keep editing')
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
							$elm$html$Html$Events$onClick($author$project$Types$ConfirmedCloseContactForm)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Discard')
						]))
				]))
		]));
var $author$project$Views$contactFormModal = F2(
	function (model, cf) {
		var isEdit = !_Utils_eq(model.N, $elm$core$Maybe$Nothing);
		var titleText = isEdit ? 'Edit contact' : 'Add contact';
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('modal-backdrop'),
					$elm$html$Html$Events$onClick($author$project$Types$RequestedCloseContactForm)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal modal--wide'),
							A2($elm$html$Html$Attributes$attribute, 'role', 'dialog'),
							A2($elm$html$Html$Attributes$attribute, 'aria-modal', 'true'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', titleText),
							A2(
							$elm$html$Html$Events$stopPropagationOn,
							'click',
							$elm$json$Json$Decode$succeed(
								_Utils_Tuple2($author$project$Types$DismissedToast, true)))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$header,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('modal__header')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$h2,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal__title')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(titleText)
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal__close'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick($author$project$Types$RequestedCloseContactForm),
											A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close')
										]),
									_List_fromArray(
										[
											A2(
											$author$project$Views$svgIcon,
											_List_fromArray(
												[
													A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
													A2($elm$html$Html$Attributes$attribute, 'width', '18'),
													A2($elm$html$Html$Attributes$attribute, 'height', '18'),
													A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
													A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
													A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
													A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
													A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
												]),
											_List_fromArray(
												[
													$author$project$Views$svgPath('M18 6 6 18'),
													$author$project$Views$svgPath('M6 6l12 12')
												]))
										]))
								])),
							cf.at ? $author$project$Views$discardConfirmView : A2($author$project$Views$contactFormView, cf, isEdit)
						]))
				]));
	});
var $author$project$Types$OpenedAddContact = {$: 12};
var $author$project$Types$UpdatedContactsQuery = function (a) {
	return {$: 10, a: a};
};
var $author$project$Types$OpenedContactDetail = function (a) {
	return {$: 11, a: a};
};
var $elm$html$Html$td = _VirtualDom_node('td');
var $elm$html$Html$tr = _VirtualDom_node('tr');
var $author$project$Views$contactRow = function (c) {
	return A2(
		$elm$html$Html$tr,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('contact-row'),
				$elm$html$Html$Events$onClick(
				$author$project$Types$OpenedContactDetail(c))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('contact-name-cell')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('contact-avatar')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$author$project$Views$initials(c.aI))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('contact-name-info')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('contact-name')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c.aI)
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('contact-email')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c.aE)
											]))
									]))
							]))
					])),
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(c.aB)
					])),
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[
						$author$project$Views$stageBadge(c.af)
					])),
				A2(
				$elm$html$Html$td,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('contact-date')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(c.a2)
					])),
				A2(
				$elm$html$Html$td,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('contact-actions-cell')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('row-action'),
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Attributes$title('Edit'),
								A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Edit ' + c.aI),
								A2(
								$elm$html$Html$Events$stopPropagationOn,
								'click',
								$elm$json$Json$Decode$succeed(
									_Utils_Tuple2(
										$author$project$Types$OpenedEditContact(c),
										true)))
							]),
						_List_fromArray(
							[$author$project$Views$iconEdit])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('row-action row-action--danger'),
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Attributes$title('Delete'),
								A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete ' + c.aI),
								A2(
								$elm$html$Html$Events$stopPropagationOn,
								'click',
								$elm$json$Json$Decode$succeed(
									_Utils_Tuple2(
										$author$project$Types$RequestedDeleteContact(c),
										true)))
							]),
						_List_fromArray(
							[$author$project$Views$iconTrash]))
					]))
			]));
};
var $author$project$Views$matchesQuery = F2(
	function (q, c) {
		var needle = $elm$core$String$trim(
			$elm$core$String$toLower(q));
		return $elm$core$String$isEmpty(needle) || (A2(
			$elm$core$String$contains,
			needle,
			$elm$core$String$toLower(c.aI)) || (A2(
			$elm$core$String$contains,
			needle,
			$elm$core$String$toLower(c.aE)) || A2(
			$elm$core$String$contains,
			needle,
			$elm$core$String$toLower(c.aB))));
	});
var $elm$html$Html$table = _VirtualDom_node('table');
var $elm$html$Html$tbody = _VirtualDom_node('tbody');
var $elm$html$Html$th = _VirtualDom_node('th');
var $elm$html$Html$thead = _VirtualDom_node('thead');
var $author$project$Views$contactsView = function (model) {
	var _v0 = model.v;
	switch (_v0.$) {
		case 0:
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('content__empty-block')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Loading contacts…')
					]));
		case 1:
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('content__empty-block')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Loading contacts…')
					]));
		case 3:
			var msg = _v0.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('content__empty-block')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Could not load contacts: ' + msg)
					]));
		default:
			var data = _v0.a;
			var isQueryEmpty = $elm$core$String$isEmpty(
				$elm$core$String$trim(data.ad));
			var filtered = A2(
				$elm$core$List$filter,
				$author$project$Views$matchesQuery(data.ad),
				data.a0);
			var count = $elm$core$List$length(filtered);
			return A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('page-toolbar')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('page-toolbar__search')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '16'),
												A2($elm$html$Html$Attributes$attribute, 'height', '16'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												A3(
												$elm$html$Html$node,
												'circle',
												_List_fromArray(
													[
														A2($elm$html$Html$Attributes$attribute, 'cx', '11'),
														A2($elm$html$Html$Attributes$attribute, 'cy', '11'),
														A2($elm$html$Html$Attributes$attribute, 'r', '8')
													]),
												_List_Nil),
												$author$project$Views$svgPath('M21 21l-4.35-4.35')
											])),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$type_('text'),
												$elm$html$Html$Attributes$placeholder('Search contacts…'),
												$elm$html$Html$Attributes$value(data.ad),
												$elm$html$Html$Events$onInput($author$project$Types$UpdatedContactsQuery)
											]),
										_List_Nil)
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$Types$OpenedAddContact)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Add contact')
									]))
							])),
						$elm$core$List$isEmpty(filtered) ? A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('empty-state')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty-state__icon')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '22'),
												A2($elm$html$Html$Attributes$attribute, 'height', '22'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												$author$project$Views$svgPath('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'),
												A3(
												$elm$html$Html$node,
												'circle',
												_List_fromArray(
													[
														A2($elm$html$Html$Attributes$attribute, 'cx', '9'),
														A2($elm$html$Html$Attributes$attribute, 'cy', '7'),
														A2($elm$html$Html$Attributes$attribute, 'r', '4')
													]),
												_List_Nil),
												$author$project$Views$svgPath('M23 21v-2a4 4 0 0 0-3-3.87'),
												$author$project$Views$svgPath('M16 3.13a4 4 0 0 1 0 7.75')
											]))
									])),
								A2(
								$elm$html$Html$h3,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty-state__title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										isQueryEmpty ? 'No contacts yet' : 'No matches found')
									])),
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty-state__desc')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										isQueryEmpty ? 'Add your first contact to start building your CRM.' : 'Try a different search term or clear the filter.')
									])),
								isQueryEmpty ? A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty-state__action')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
												$elm$html$Html$Attributes$type_('button'),
												$elm$html$Html$Events$onClick($author$project$Types$OpenedAddContact)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Add your first contact')
											]))
									])) : $elm$html$Html$text('')
							])) : A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('table-wrap')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$table,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('data-table')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$thead,
										_List_Nil,
										_List_fromArray(
											[
												A2(
												$elm$html$Html$tr,
												_List_Nil,
												_List_fromArray(
													[
														A2(
														$elm$html$Html$th,
														_List_Nil,
														_List_fromArray(
															[
																$elm$html$Html$text('Name')
															])),
														A2(
														$elm$html$Html$th,
														_List_Nil,
														_List_fromArray(
															[
																$elm$html$Html$text('Company')
															])),
														A2(
														$elm$html$Html$th,
														_List_Nil,
														_List_fromArray(
															[
																$elm$html$Html$text('Stage')
															])),
														A2(
														$elm$html$Html$th,
														_List_Nil,
														_List_fromArray(
															[
																$elm$html$Html$text('Last contact')
															])),
														A2(
														$elm$html$Html$th,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('th-actions')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('')
															]))
													]))
											])),
										A2(
										$elm$html$Html$tbody,
										_List_Nil,
										A2($elm$core$List$map, $author$project$Views$contactRow, filtered))
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('table-footnote')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$elm$core$String$fromInt(count) + (' contact' + ((count === 1) ? '' : 's')))
							]))
					]));
	}
};
var $author$project$Types$OpenedEditDeal = function (a) {
	return {$: 29, a: a};
};
var $author$project$Types$RequestedDeleteDeal = function (a) {
	return {$: 40, a: a};
};
var $author$project$Views$contactById = F2(
	function (contacts, id) {
		return $elm$core$String$isEmpty(id) ? $elm$core$Maybe$Nothing : $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (c) {
					return _Utils_eq(c.av, id);
				},
				contacts));
	});
var $author$project$Views$contactList = function (model) {
	var _v0 = model.v;
	if (_v0.$ === 2) {
		var data = _v0.a;
		return data.a0;
	} else {
		return _List_Nil;
	}
};
var $author$project$Types$MovedDeal = F2(
	function (a, b) {
		return {$: 38, a: a, b: b};
	});
var $author$project$Views$dealStageOptions = _List_fromArray(
	['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']);
var $author$project$Views$dealStagePillsDetail = F2(
	function (isMoving, d) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('stage-pills stage-pills--detail')
				]),
			A2(
				$elm$core$List$map,
				function (s) {
					var cls = _Utils_eq(d.af, s) ? 'stage-pill stage-pill--active' : 'stage-pill';
					return A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Attributes$class(cls),
								$elm$html$Html$Events$onClick(
								A2($author$project$Types$MovedDeal, d, s)),
								$elm$html$Html$Attributes$disabled(isMoving)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(s)
							]));
				},
				$author$project$Views$dealStageOptions));
	});
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$String$fromList = _String_fromList;
var $elm$core$Basics$modBy = _Basics_modBy;
var $elm$core$String$reverse = _String_reverse;
var $elm$core$Basics$round = _Basics_round;
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $author$project$Views$formatCurrency = function (v) {
	var rounded = $elm$core$Basics$round(v);
	var sign = (rounded < 0) ? '-' : '';
	var grouped = $elm$core$String$fromList(
		$elm$core$List$reverse(
			$elm$core$List$concat(
				A2(
					$elm$core$List$indexedMap,
					F2(
						function (i, c) {
							return ((!(!i)) && (!A2($elm$core$Basics$modBy, 3, i))) ? _List_fromArray(
								[',', c]) : _List_fromArray(
								[c]);
						}),
					$elm$core$String$toList(
						$elm$core$String$reverse(
							$elm$core$String$fromInt(
								$elm$core$Basics$abs(rounded))))))));
	return sign + ('$' + grouped);
};
var $author$project$Views$iconUserTiny = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '11'),
			A2($elm$html$Html$Attributes$attribute, 'height', '11'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'),
			A3(
			$elm$html$Html$node,
			'circle',
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$attribute, 'cx', '12'),
					A2($elm$html$Html$Attributes$attribute, 'cy', '7'),
					A2($elm$html$Html$Attributes$attribute, 'r', '4')
				]),
			_List_Nil)
		]));
var $author$project$Views$dealDetailView = F2(
	function (model, d) {
		var ownerDisplay = $elm$core$String$isEmpty(d.ao) ? 'Unassigned' : d.ao;
		var isMoving = _Utils_eq(
			model.an,
			$elm$core$Maybe$Just(d.av));
		var createdDisplay = $elm$core$String$isEmpty(d.au) ? '—' : d.au;
		var contacts = $author$project$Views$contactList(model);
		var linkedContact = A2($author$project$Views$contactById, contacts, d.aC);
		var closeDateDisplay = $elm$core$String$isEmpty(d.aA) ? '—' : d.aA;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('detail')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail__back'),
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Events$onClick(
							$author$project$Types$NavigatedTo($author$project$Types$Deals))
						]),
					_List_fromArray(
						[
							$author$project$Views$iconBack,
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Back to deals')
								]))
						])),
					A2(
					$elm$html$Html$header,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-hero')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail-hero__avatar detail-hero__avatar--deal')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$author$project$Views$formatCurrency(d.aR))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail-hero__body')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('detail-hero__title-row')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$h1,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-hero__name')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(d.Y)
												])),
											$author$project$Views$stageBadge(d.af)
										])),
									A2(
									$elm$html$Html$p,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('detail-hero__role')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$elm$core$String$isEmpty(d.aV) ? 'No contact linked' : ('Linked to ' + d.aV))
										])),
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('detail-hero__contact')
										]),
									_List_fromArray(
										[
											$elm$core$String$isEmpty(d.aA) ? $elm$html$Html$text('') : A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-hero__chip')
												]),
											_List_fromArray(
												[
													$author$project$Views$iconCalendar,
													A2(
													$elm$html$Html$span,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text('Closes ' + d.aA)
														]))
												])),
											$elm$core$String$isEmpty(d.ao) ? $elm$html$Html$text('') : A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-hero__chip')
												]),
											_List_fromArray(
												[
													$author$project$Views$iconUserTiny,
													A2(
													$elm$html$Html$span,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text(d.ao)
														]))
												]))
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail-hero__actions')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick(
											$author$project$Types$OpenedEditDeal(d))
										]),
									_List_fromArray(
										[
											$author$project$Views$iconEdit,
											A2(
											$elm$html$Html$span,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text('Edit')
												]))
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick(
											$author$project$Types$RequestedDeleteDeal(d))
										]),
									_List_fromArray(
										[
											$author$project$Views$iconTrash,
											A2(
											$elm$html$Html$span,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text('Delete')
												]))
										]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail-stats')
						]),
					_List_fromArray(
						[
							A3(
							$author$project$Views$detailStat,
							'Value',
							$author$project$Views$formatCurrency(d.aR),
							'Deal value'),
							A3($author$project$Views$detailStat, 'Stage', d.af, 'Current stage'),
							A3($author$project$Views$detailStat, 'Close date', closeDateDisplay, 'Expected'),
							A3($author$project$Views$detailStat, 'Owner', ownerDisplay, 'Assigned to')
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('detail__grid')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$aside,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail__sidebar')
								]),
							_List_fromArray(
								[
									A3(
									$author$project$Views$detailCard,
									'Contact',
									$elm$core$Maybe$Nothing,
									function () {
										if (!linkedContact.$) {
											var c = linkedContact.a;
											return A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('deal-contact-card'),
														A2($elm$html$Html$Attributes$attribute, 'role', 'button'),
														A2($elm$html$Html$Attributes$attribute, 'tabindex', '0'),
														$elm$html$Html$Attributes$title('Open ' + c.aI),
														$elm$html$Html$Events$onClick(
														$author$project$Types$OpenedContactDetail(c))
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('deal-contact-card__avatar')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text(
																$author$project$Views$initials(c.aI))
															])),
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('deal-contact-card__body')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$span,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('deal-contact-card__name')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text(c.aI)
																	])),
																A2(
																$elm$html$Html$span,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('deal-contact-card__email')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text(c.aE)
																	]))
															])),
														A2(
														$elm$html$Html$span,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('deal-contact-card__chevron')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('→')
															]))
													]));
										} else {
											return $elm$core$String$isEmpty(d.aV) ? A2(
												$elm$html$Html$p,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('detail-muted')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('No contact linked to this deal.')
													])) : A2(
												$elm$html$Html$p,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('detail-muted')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(d.aV)
													]));
										}
									}()),
									A3(
									$author$project$Views$detailCard,
									'Stage',
									$elm$core$Maybe$Nothing,
									A2($author$project$Views$dealStagePillsDetail, isMoving, d)),
									A3(
									$author$project$Views$detailCard,
									'Deal info',
									$elm$core$Maybe$Nothing,
									A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('info-list')
											]),
										_List_fromArray(
											[
												A3($author$project$Views$infoRow, $author$project$Views$iconCalendar, 'Close date', closeDateDisplay),
												A3($author$project$Views$infoRow, $author$project$Views$iconUserTiny, 'Owner', ownerDisplay),
												A3($author$project$Views$infoRow, $author$project$Views$iconCalendar, 'Created', createdDisplay)
											]))),
									A3(
									$author$project$Views$detailCard,
									'Notes',
									$elm$core$Maybe$Nothing,
									$elm$core$String$isEmpty(d.ac) ? A2(
										$elm$html$Html$p,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('detail-muted')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('No notes yet. Record what matters about this deal.')
											])) : A2(
										$elm$html$Html$p,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('detail-notes')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(d.ac)
											])))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('detail__main')
								]),
							_List_fromArray(
								[
									A3(
									$author$project$Views$detailCard,
									'Recent activity',
									$elm$core$Maybe$Just(
										A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('detail-card__action'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Attributes$disabled(true),
													$elm$html$Html$Attributes$title('Coming soon')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Log activity')
												]))),
									A3($author$project$Views$detailEmpty, $author$project$Views$iconTasks, 'No activity yet', 'Activity on this deal will appear here once it\'s linked to a contact.'))
								]))
						]))
				]));
	});
var $author$project$Types$SubmittedDealForm = {$: 35};
var $author$project$Types$UpdatedDealFormField = F2(
	function (a, b) {
		return {$: 34, a: a, b: b};
	});
var $elm$core$List$sortBy = _List_sortBy;
var $author$project$Views$contactOptions = function (model) {
	var _v0 = model.v;
	if (_v0.$ === 2) {
		var data = _v0.a;
		return A2(
			$elm$core$List$sortBy,
			function ($) {
				return $.aI;
			},
			data.a0);
	} else {
		return _List_Nil;
	}
};
var $author$project$Views$dealFormFieldError = F2(
	function (field, df) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$second,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var f = _v0.a;
						return _Utils_eq(f, field);
					},
					df.a)));
	});
var $elm$html$Html$option = _VirtualDom_node('option');
var $elm$html$Html$select = _VirtualDom_node('select');
var $elm$html$Html$Attributes$selected = $elm$html$Html$Attributes$boolProperty('selected');
var $author$project$Views$dealContactSelect = F2(
	function (model, df) {
		var options = $author$project$Views$contactOptions(model);
		var err = A2($author$project$Views$dealFormFieldError, 'contactId', df);
		var cls = function () {
			if (!err.$) {
				return 'ecc-field ecc-field--error';
			} else {
				return 'ecc-field';
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(cls)
				]),
			_Utils_ap(
				_List_fromArray(
					[
						A2(
						$elm$html$Html$select,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('df-contactId'),
								$elm$html$Html$Events$onInput(
								$author$project$Types$UpdatedDealFormField('contactId')),
								$elm$html$Html$Attributes$disabled(df.f)
							]),
						A2(
							$elm$core$List$cons,
							A2(
								$elm$html$Html$option,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$value(''),
										$elm$html$Html$Attributes$selected(df.aC === '')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('No contact linked')
									])),
							A2(
								$elm$core$List$map,
								function (c) {
									return A2(
										$elm$html$Html$option,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$value(c.av),
												$elm$html$Html$Attributes$selected(
												_Utils_eq(df.aC, c.av))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c.aI)
											]));
								},
								options))),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('df-contactId')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Contact')
							]))
					]),
				function () {
					if (!err.$) {
						var msg = err.a;
						return _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-field__message')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(msg)
									]))
							]);
					} else {
						return _List_Nil;
					}
				}()));
	});
var $author$project$Views$dealNotesField = function (df) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ecc-field ecc-field--notes')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field__label')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Notes')
					])),
				A2(
				$elm$html$Html$textarea,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('df-notes'),
						$elm$html$Html$Attributes$placeholder('Add context about this deal…'),
						$elm$html$Html$Attributes$value(df.ac),
						$elm$html$Html$Events$onInput(
						$author$project$Types$UpdatedDealFormField('notes')),
						$elm$html$Html$Attributes$disabled(df.f),
						$elm$html$Html$Attributes$rows(4)
					]),
				_List_Nil)
			]));
};
var $author$project$Views$dealRichField = F5(
	function (df, fieldId, labelText, inputType, shouldFocus) {
		var err = A2($author$project$Views$dealFormFieldError, fieldId, df);
		var currentValue = function () {
			switch (fieldId) {
				case 'title':
					return df.Y;
				case 'value':
					return df.aR;
				case 'closeDate':
					return df.aA;
				case 'owner':
					return df.ao;
				default:
					return '';
			}
		}();
		var cls = function () {
			if (!err.$) {
				return 'ecc-field ecc-field--error';
			} else {
				return 'ecc-field';
			}
		}();
		var baseAttrs = _List_fromArray(
			[
				$elm$html$Html$Attributes$id('df-' + fieldId),
				$elm$html$Html$Attributes$type_(inputType),
				$elm$html$Html$Attributes$placeholder(' '),
				$elm$html$Html$Attributes$value(currentValue),
				$elm$html$Html$Events$onInput(
				$author$project$Types$UpdatedDealFormField(fieldId)),
				$elm$html$Html$Attributes$disabled(df.f)
			]);
		var finalAttrs = shouldFocus ? _Utils_ap(
			baseAttrs,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$autofocus(true)
				])) : baseAttrs;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(cls)
				]),
			_Utils_ap(
				_List_fromArray(
					[
						A2($elm$html$Html$input, finalAttrs, _List_Nil),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('df-' + fieldId)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(labelText)
							]))
					]),
				function () {
					if (!err.$) {
						var msg = err.a;
						return _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-field__message')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(msg)
									]))
							]);
					} else {
						return _List_Nil;
					}
				}()));
	});
var $author$project$Views$dealStagePills = function (df) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ecc-field')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ecc-field__label')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Stage')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('stage-pills')
					]),
				A2(
					$elm$core$List$map,
					function (s) {
						var cls = _Utils_eq(df.af, s) ? 'stage-pill stage-pill--active' : 'stage-pill';
						return A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class(cls),
									$elm$html$Html$Events$onClick(
									A2($author$project$Types$UpdatedDealFormField, 'stage', s)),
									$elm$html$Html$Attributes$disabled(df.f)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(s)
								]));
					},
					$author$project$Views$dealStageOptions))
			]));
};
var $author$project$Views$dealFormView = F3(
	function (model, df, isEdit) {
		var submitLabel = df.f ? 'Saving…' : (isEdit ? 'Save changes' : 'Save deal');
		var formError = A2($author$project$Views$dealFormFieldError, 'form', df);
		return A2(
			$elm$html$Html$form,
			_List_fromArray(
				[
					$elm$html$Html$Events$onSubmit($author$project$Types$SubmittedDealForm),
					$elm$html$Html$Attributes$novalidate(true)
				]),
			_List_fromArray(
				[
					function () {
					if (!formError.$) {
						var msg = formError.a;
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('ecc-alert ecc-alert--error')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(msg)
								]));
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('form-grid')
						]),
					_List_fromArray(
						[
							A5($author$project$Views$dealRichField, df, 'title', 'Deal title', 'text', true),
							A2($author$project$Views$dealContactSelect, model, df),
							A5($author$project$Views$dealRichField, df, 'value', 'Value (USD)', 'number', false),
							A5($author$project$Views$dealRichField, df, 'closeDate', 'Expected close', 'date', false),
							A5($author$project$Views$dealRichField, df, 'owner', 'Owner', 'text', false)
						])),
					$author$project$Views$dealStagePills(df),
					$author$project$Views$dealNotesField(df),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal__actions')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
									$elm$html$Html$Events$onClick($author$project$Types$RequestedCloseDealForm),
									$elm$html$Html$Attributes$disabled(df.f)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Cancel')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('submit'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
									$elm$html$Html$Attributes$disabled(df.f || (!df._))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(submitLabel)
								]))
						]))
				]));
	});
var $author$project$Types$CancelledCloseDealForm = {$: 33};
var $author$project$Types$ConfirmedCloseDealForm = {$: 32};
var $author$project$Views$discardDealConfirmView = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('modal__confirm')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('modal__confirm-text')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Discard your changes? They won\'t be saved.')
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('modal__actions')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
							$elm$html$Html$Events$onClick($author$project$Types$CancelledCloseDealForm)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Keep editing')
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
							$elm$html$Html$Events$onClick($author$project$Types$ConfirmedCloseDealForm)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Discard')
						]))
				]))
		]));
var $author$project$Views$dealFormModal = F2(
	function (model, df) {
		var isEdit = !_Utils_eq(model.D, $elm$core$Maybe$Nothing);
		var titleText = isEdit ? 'Edit deal' : 'Add deal';
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('modal-backdrop'),
					$elm$html$Html$Events$onClick($author$project$Types$RequestedCloseDealForm)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal modal--wide'),
							A2($elm$html$Html$Attributes$attribute, 'role', 'dialog'),
							A2($elm$html$Html$Attributes$attribute, 'aria-modal', 'true'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', titleText),
							A2(
							$elm$html$Html$Events$stopPropagationOn,
							'click',
							$elm$json$Json$Decode$succeed(
								_Utils_Tuple2($author$project$Types$DismissedToast, true)))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$header,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('modal__header')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$h2,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal__title')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(titleText)
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal__close'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick($author$project$Types$RequestedCloseDealForm),
											A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close')
										]),
									_List_fromArray(
										[
											A2(
											$author$project$Views$svgIcon,
											_List_fromArray(
												[
													A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
													A2($elm$html$Html$Attributes$attribute, 'width', '18'),
													A2($elm$html$Html$Attributes$attribute, 'height', '18'),
													A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
													A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
													A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
													A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
													A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
												]),
											_List_fromArray(
												[
													$author$project$Views$svgPath('M18 6 6 18'),
													$author$project$Views$svgPath('M6 6l12 12')
												]))
										]))
								])),
							df.at ? $author$project$Views$discardDealConfirmView : A3($author$project$Views$dealFormView, model, df, isEdit)
						]))
				]));
	});
var $author$project$Types$OpenedAddDeal = {$: 27};
var $author$project$Types$UpdatedDealsQuery = function (a) {
	return {$: 37, a: a};
};
var $author$project$Views$matchesDealQuery = F2(
	function (q, d) {
		var needle = $elm$core$String$trim(
			$elm$core$String$toLower(q));
		return $elm$core$String$isEmpty(needle) || (A2(
			$elm$core$String$contains,
			needle,
			$elm$core$String$toLower(d.Y)) || (A2(
			$elm$core$String$contains,
			needle,
			$elm$core$String$toLower(d.aV)) || A2(
			$elm$core$String$contains,
			needle,
			$elm$core$String$toLower(d.ao))));
	});
var $author$project$Types$OpenedAddDealWithStage = function (a) {
	return {$: 28, a: a};
};
var $author$project$Types$OpenedDealDetail = function (a) {
	return {$: 30, a: a};
};
var $elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						$elm$core$List$cons,
						sep,
						A2($elm$core$List$cons, x, rest));
				});
			var spersed = A3($elm$core$List$foldr, step, _List_Nil, tl);
			return A2($elm$core$List$cons, hd, spersed);
		}
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Views$stageNeighbors = function (stage) {
	var idx = A2(
		$elm$core$Maybe$withDefault,
		0,
		A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var s = _v0.b;
						return _Utils_eq(s, stage);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, $author$project$Views$dealStageOptions)))));
	return _Utils_Tuple2(
		$elm$core$List$head(
			A2($elm$core$List$drop, idx - 1, $author$project$Views$dealStageOptions)),
		$elm$core$List$head(
			A2($elm$core$List$drop, idx + 1, $author$project$Views$dealStageOptions)));
};
var $author$project$Views$dealCard = F3(
	function (contacts, movingId, d) {
		var valueClass = (!d.aR) ? 'deal-card__value deal-card__value--zero' : 'deal-card__value';
		var metaItems = A2(
			$elm$core$List$intersperse,
			A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('deal-card__meta-sep')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('·')
					])),
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						$elm$core$String$isEmpty(d.aA) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
						A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('deal-card__meta-item')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('deal-card__meta-icon')
										]),
									_List_fromArray(
										[$author$project$Views$iconCalendar])),
									$elm$html$Html$text(d.aA)
								]))),
						$elm$core$String$isEmpty(d.ao) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
						A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('deal-card__meta-item')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('deal-card__meta-icon')
										]),
									_List_fromArray(
										[$author$project$Views$iconUserTiny])),
									$elm$html$Html$text(d.ao)
								])))
					])));
		var linkedContact = A2($author$project$Views$contactById, contacts, d.aC);
		var isMoving = _Utils_eq(
			movingId,
			$elm$core$Maybe$Just(d.av));
		var cardClass = isMoving ? 'deal-card deal-card--moving' : 'deal-card';
		var _v0 = $author$project$Views$stageNeighbors(d.af);
		var prevStage = _v0.a;
		var nextStage = _v0.b;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(cardClass)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('deal-card__header')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('deal-card__title deal-card__title--link'),
									A2($elm$html$Html$Attributes$attribute, 'role', 'button'),
									A2($elm$html$Html$Attributes$attribute, 'tabindex', '0'),
									$elm$html$Html$Attributes$title('Open ' + d.Y),
									$elm$html$Html$Events$onClick(
									$author$project$Types$OpenedDealDetail(d))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(d.Y)
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('deal-card__menu')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('row-action'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Attributes$title('Edit'),
											A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Edit ' + d.Y),
											$elm$html$Html$Events$onClick(
											$author$project$Types$OpenedEditDeal(d))
										]),
									_List_fromArray(
										[$author$project$Views$iconEdit])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('row-action row-action--danger'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Attributes$title('Delete'),
											A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete ' + d.Y),
											$elm$html$Html$Events$onClick(
											$author$project$Types$RequestedDeleteDeal(d))
										]),
									_List_fromArray(
										[$author$project$Views$iconTrash]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(valueClass)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							(!d.aR) ? '—' : $author$project$Views$formatCurrency(d.aR))
						])),
					function () {
					if ($elm$core$String$isEmpty(d.aV)) {
						return $elm$html$Html$text('');
					} else {
						if (!linkedContact.$) {
							var c = linkedContact.a;
							return A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deal-card__contact deal-card__contact--link'),
										A2($elm$html$Html$Attributes$attribute, 'role', 'button'),
										A2($elm$html$Html$Attributes$attribute, 'tabindex', '0'),
										$elm$html$Html$Attributes$title('Open ' + c.aI),
										A2(
										$elm$html$Html$Events$stopPropagationOn,
										'click',
										$elm$json$Json$Decode$succeed(
											_Utils_Tuple2(
												$author$project$Types$OpenedContactDetail(c),
												true)))
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deal-card__contact-avatar')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$author$project$Views$initials(c.aI))
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deal-card__contact-name')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c.aI)
											]))
									]));
						} else {
							return A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deal-card__contact')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deal-card__contact-avatar')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$author$project$Views$initials(d.aV))
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deal-card__contact-name')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(d.aV)
											]))
									]));
						}
					}
				}(),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('deal-card__footer')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('deal-card__meta')
								]),
							metaItems),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('deal-card__move')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('deal-move-btn'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Attributes$title('Move back a stage'),
											A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Move ' + (d.Y + ' back')),
											$elm$html$Html$Events$onClick(
											function () {
												if (!prevStage.$) {
													var s = prevStage.a;
													return A2($author$project$Types$MovedDeal, d, s);
												} else {
													return $author$project$Types$DismissedToast;
												}
											}()),
											$elm$html$Html$Attributes$disabled(
											isMoving || _Utils_eq(prevStage, $elm$core$Maybe$Nothing))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('←')
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('deal-move-btn'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Attributes$title('Move forward a stage'),
											A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Move ' + (d.Y + ' forward')),
											$elm$html$Html$Events$onClick(
											function () {
												if (!nextStage.$) {
													var s = nextStage.a;
													return A2($author$project$Types$MovedDeal, d, s);
												} else {
													return $author$project$Types$DismissedToast;
												}
											}()),
											$elm$html$Html$Attributes$disabled(
											isMoving || _Utils_eq(nextStage, $elm$core$Maybe$Nothing))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('→')
										]))
								]))
						]))
				]));
	});
var $author$project$Views$dealStageClass = function (stage) {
	var _v0 = $elm$core$String$toLower(stage);
	switch (_v0) {
		case 'lead':
			return 'pipeline-col--lead';
		case 'qualified':
			return 'pipeline-col--qualified';
		case 'proposal':
			return 'pipeline-col--proposal';
		case 'negotiation':
			return 'pipeline-col--negotiation';
		case 'won':
			return 'pipeline-col--won';
		case 'lost':
			return 'pipeline-col--lost';
		default:
			return 'pipeline-col--lead';
	}
};
var $elm$core$List$sum = function (numbers) {
	return A3($elm$core$List$foldl, $elm$core$Basics$add, 0, numbers);
};
var $author$project$Views$dealColumn = F4(
	function (contacts, movingId, stageName, deals) {
		var total = $elm$core$List$sum(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.aR;
				},
				deals));
		var isEmpty = $elm$core$List$isEmpty(deals);
		var totalClass = isEmpty ? 'pipeline-col__total pipeline-col__total--muted' : 'pipeline-col__total';
		var colClass = 'pipeline-col ' + $author$project$Views$dealStageClass(stageName);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(colClass)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('pipeline-col__header')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('pipeline-col__title-wrap')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('pipeline-col__dot')
										]),
									_List_Nil),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('pipeline-col__title')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(stageName)
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('pipeline-col__count')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$elm$core$String$fromInt(
												$elm$core$List$length(deals)))
										]))
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('pipeline-col__add'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$title('Add deal to ' + stageName),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Add deal to ' + stageName),
									$elm$html$Html$Events$onClick(
									$author$project$Types$OpenedAddDealWithStage(stageName))
								]),
							_List_fromArray(
								[
									A2(
									$author$project$Views$svgIcon,
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
											A2($elm$html$Html$Attributes$attribute, 'width', '14'),
											A2($elm$html$Html$Attributes$attribute, 'height', '14'),
											A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
											A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2.2'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
										]),
									_List_fromArray(
										[
											$author$project$Views$svgPath('M12 5v14'),
											$author$project$Views$svgPath('M5 12h14')
										]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(totalClass)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							isEmpty ? 'No value' : $author$project$Views$formatCurrency(total))
						])),
					isEmpty ? A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('pipeline-col__empty')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('pipeline-col__empty-icon')
								]),
							_List_fromArray(
								[
									A2(
									$author$project$Views$svgIcon,
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
											A2($elm$html$Html$Attributes$attribute, 'width', '14'),
											A2($elm$html$Html$Attributes$attribute, 'height', '14'),
											A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
											A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
										]),
									_List_fromArray(
										[
											$author$project$Views$svgPath('M12 5v14'),
											$author$project$Views$svgPath('M5 12h14')
										]))
								])),
							$elm$html$Html$text('No deals yet')
						])) : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('pipeline-col__cards')
						]),
					A2(
						$elm$core$List$map,
						A2($author$project$Views$dealCard, contacts, movingId),
						deals))
				]));
	});
var $author$project$Views$pipelineBoard = F3(
	function (contacts, movingId, deals) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('pipeline-board')
				]),
			A2(
				$elm$core$List$map,
				function (stageName) {
					return A4(
						$author$project$Views$dealColumn,
						contacts,
						movingId,
						stageName,
						A2(
							$elm$core$List$filter,
							function (d) {
								return _Utils_eq(d.af, stageName);
							},
							deals));
				},
				$author$project$Views$dealStageOptions));
	});
var $author$project$Views$dealsView = function (model) {
	var _v0 = model.A;
	switch (_v0.$) {
		case 0:
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('content__empty-block')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Loading deals…')
					]));
		case 1:
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('content__empty-block')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Loading deals…')
					]));
		case 3:
			var msg = _v0.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('content__empty-block')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Could not load deals: ' + msg)
					]));
		default:
			var data = _v0.a;
			var isQueryEmpty = $elm$core$String$isEmpty(
				$elm$core$String$trim(data.ad));
			var filtered = A2(
				$elm$core$List$filter,
				$author$project$Views$matchesDealQuery(data.ad),
				data.a0);
			var total = $elm$core$List$sum(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.aR;
					},
					filtered));
			var count = $elm$core$List$length(filtered);
			var avgValue = (!count) ? 0 : (total / count);
			return A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('page-toolbar')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('page-toolbar__search')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '16'),
												A2($elm$html$Html$Attributes$attribute, 'height', '16'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												A3(
												$elm$html$Html$node,
												'circle',
												_List_fromArray(
													[
														A2($elm$html$Html$Attributes$attribute, 'cx', '11'),
														A2($elm$html$Html$Attributes$attribute, 'cy', '11'),
														A2($elm$html$Html$Attributes$attribute, 'r', '8')
													]),
												_List_Nil),
												$author$project$Views$svgPath('M21 21l-4.35-4.35')
											])),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$type_('text'),
												$elm$html$Html$Attributes$placeholder('Search deals…'),
												$elm$html$Html$Attributes$value(data.ad),
												$elm$html$Html$Events$onInput($author$project$Types$UpdatedDealsQuery)
											]),
										_List_Nil)
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$Types$OpenedAddDeal)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Add deal')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('deals-summary')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deals-summary__item')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deals-summary__label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Deals')
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deals-summary__value')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$elm$core$String$fromInt(count))
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deals-summary__divider')
									]),
								_List_Nil),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deals-summary__item')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deals-summary__label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('In view')
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deals-summary__value')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$author$project$Views$formatCurrency(total))
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deals-summary__divider')
									]),
								_List_Nil),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deals-summary__item')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deals-summary__label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Avg deal')
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('deals-summary__value')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												(!count) ? '—' : $author$project$Views$formatCurrency(avgValue))
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('deals-summary__spacer')
									]),
								_List_Nil)
							])),
						$elm$core$List$isEmpty(filtered) ? A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('empty-state')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h3,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty-state__title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										isQueryEmpty ? 'No deals yet' : 'No deals match your search')
									])),
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty-state__desc')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										isQueryEmpty ? 'Add your first deal to start tracking your pipeline.' : 'Try a different search term.')
									])),
								isQueryEmpty ? A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty-state__action')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
												$elm$html$Html$Attributes$type_('button'),
												$elm$html$Html$Events$onClick($author$project$Types$OpenedAddDeal)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Add your first deal')
											]))
									])) : $elm$html$Html$text('')
							])) : A3(
						$author$project$Views$pipelineBoard,
						$author$project$Views$contactList(model),
						model.an,
						filtered)
					]));
	}
};
var $author$project$Types$CancelledDeleteActivity = {$: 51};
var $author$project$Types$ConfirmedDeleteActivity = {$: 52};
var $elm$html$Html$strong = _VirtualDom_node('strong');
var $author$project$Views$deleteActivityConfirmModal = function (a) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('modal-backdrop'),
				$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteActivity)
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal modal--narrow'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'alertdialog'),
						A2($elm$html$Html$Attributes$attribute, 'aria-modal', 'true'),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete activity'),
						A2(
						$elm$html$Html$Events$stopPropagationOn,
						'click',
						$elm$json$Json$Decode$succeed(
							_Utils_Tuple2($author$project$Types$DismissedToast, true)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Delete activity')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__close'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteActivity),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '18'),
												A2($elm$html$Html$Attributes$attribute, 'height', '18'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												$author$project$Views$svgPath('M18 6 6 18'),
												$author$project$Views$svgPath('M6 6l12 12')
											]))
									]))
							])),
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__confirm-text')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Delete '),
								A2(
								$elm$html$Html$strong,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(a.Y)
									])),
								$elm$html$Html$text('? This cannot be undone.')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__actions')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
										$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteActivity)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Cancel')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
										$elm$html$Html$Events$onClick($author$project$Types$ConfirmedDeleteActivity)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Delete')
									]))
							]))
					]))
			]));
};
var $author$project$Types$CancelledDeleteContact = {$: 23};
var $author$project$Types$ConfirmedDeleteContact = {$: 24};
var $author$project$Views$deleteConfirmModal = function (contact) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('modal-backdrop'),
				$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteContact)
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal modal--narrow'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'alertdialog'),
						A2($elm$html$Html$Attributes$attribute, 'aria-modal', 'true'),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete contact'),
						A2(
						$elm$html$Html$Events$stopPropagationOn,
						'click',
						$elm$json$Json$Decode$succeed(
							_Utils_Tuple2($author$project$Types$DismissedToast, true)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Delete contact')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__close'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteContact),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '18'),
												A2($elm$html$Html$Attributes$attribute, 'height', '18'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												$author$project$Views$svgPath('M18 6 6 18'),
												$author$project$Views$svgPath('M6 6l12 12')
											]))
									]))
							])),
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__confirm-text')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Delete '),
								A2(
								$elm$html$Html$strong,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(contact.aI)
									])),
								$elm$html$Html$text('? This cannot be undone.')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__actions')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
										$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteContact)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Cancel')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
										$elm$html$Html$Events$onClick($author$project$Types$ConfirmedDeleteContact)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Delete')
									]))
							]))
					]))
			]));
};
var $author$project$Types$CancelledDeleteDeal = {$: 41};
var $author$project$Types$ConfirmedDeleteDeal = {$: 42};
var $author$project$Views$deleteDealConfirmModal = function (deal) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('modal-backdrop'),
				$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteDeal)
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal modal--narrow'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'alertdialog'),
						A2($elm$html$Html$Attributes$attribute, 'aria-modal', 'true'),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete deal'),
						A2(
						$elm$html$Html$Events$stopPropagationOn,
						'click',
						$elm$json$Json$Decode$succeed(
							_Utils_Tuple2($author$project$Types$DismissedToast, true)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Delete deal')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal__close'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteDeal),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '18'),
												A2($elm$html$Html$Attributes$attribute, 'height', '18'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												$author$project$Views$svgPath('M18 6 6 18'),
												$author$project$Views$svgPath('M6 6l12 12')
											]))
									]))
							])),
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__confirm-text')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Delete '),
								A2(
								$elm$html$Html$strong,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(deal.Y)
									])),
								$elm$html$Html$text('? This cannot be undone.')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal__actions')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
										$elm$html$Html$Events$onClick($author$project$Types$CancelledDeleteDeal)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Cancel')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
										$elm$html$Html$Events$onClick($author$project$Types$ConfirmedDeleteDeal)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Delete')
									]))
							]))
					]))
			]));
};
var $author$project$Views$statCard = F3(
	function (label, valueText, hint) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('stat-card')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('stat-card__label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(label)
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('stat-card__value')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(valueText)
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('stat-card__hint')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(hint)
						]))
				]));
	});
var $author$project$Views$homeView = F2(
	function (model, user) {
		var dealsLoaded = function () {
			var _v3 = model.A;
			if (_v3.$ === 2) {
				return true;
			} else {
				return false;
			}
		}();
		var dealItems = function () {
			var _v2 = model.A;
			if (_v2.$ === 2) {
				var data = _v2.a;
				return data.a0;
			} else {
				return _List_Nil;
			}
		}();
		var openDeals = A2(
			$elm$core$List$filter,
			function (d) {
				return (d.af !== 'Won') && (d.af !== 'Lost');
			},
			dealItems);
		var openValue = $elm$core$List$sum(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.aR;
				},
				openDeals));
		var wonDeals = A2(
			$elm$core$List$filter,
			function (d) {
				return d.af === 'Won';
			},
			dealItems);
		var wonValue = $elm$core$List$sum(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.aR;
				},
				wonDeals));
		var contactsLoaded = function () {
			var _v1 = model.v;
			if (_v1.$ === 2) {
				return true;
			} else {
				return false;
			}
		}();
		var contactsCount = function () {
			var _v0 = model.v;
			if (_v0.$ === 2) {
				var data = _v0.a;
				return $elm$core$List$length(data.a0);
			} else {
				return 0;
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h1,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('content__heading')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Welcome back, ' + user.aI)
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('content__lede')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Here\'s what\'s happening across your workspace today.')
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('stat-grid')
						]),
					_List_fromArray(
						[
							A3(
							$author$project$Views$statCard,
							'Open deals',
							dealsLoaded ? $elm$core$String$fromInt(
								$elm$core$List$length(openDeals)) : '—',
							dealsLoaded ? ($author$project$Views$formatCurrency(openValue) + ' in pipeline') : 'Loading…'),
							A3(
							$author$project$Views$statCard,
							'Contacts',
							contactsLoaded ? $elm$core$String$fromInt(contactsCount) : '—',
							'Across all stages'),
							A3($author$project$Views$statCard, 'Tasks due', '7', '2 overdue'),
							A3(
							$author$project$Views$statCard,
							'Won revenue',
							dealsLoaded ? $author$project$Views$formatCurrency(wonValue) : '—',
							dealsLoaded ? ($elm$core$String$fromInt(
								$elm$core$List$length(wonDeals)) + ' deals closed') : 'Loading…')
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('content__section')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h2,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('content__section-title')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Recent activity')
								])),
							A2(
							$elm$html$Html$p,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('content__empty')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('No activity yet. Once you add contacts and deals, updates will appear here.')
								]))
						]))
				]));
	});
var $author$project$Types$CancelledLogoutAll = {$: 61};
var $author$project$Types$ConfirmedLogoutAll = {$: 62};
var $author$project$Views$logoutAllConfirmModal = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('modal-backdrop'),
			$elm$html$Html$Events$onClick($author$project$Types$CancelledLogoutAll)
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('modal modal--narrow'),
					A2($elm$html$Html$Attributes$attribute, 'role', 'alertdialog'),
					A2($elm$html$Html$Attributes$attribute, 'aria-modal', 'true'),
					A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Sign out all devices'),
					A2(
					$elm$html$Html$Events$stopPropagationOn,
					'click',
					$elm$json$Json$Decode$succeed(
						_Utils_Tuple2($author$project$Types$DismissedToast, true)))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$header,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal__header')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h2,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('modal__title')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Sign out all devices')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('modal__close'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick($author$project$Types$CancelledLogoutAll),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close')
								]),
							_List_fromArray(
								[
									A2(
									$author$project$Views$svgIcon,
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
											A2($elm$html$Html$Attributes$attribute, 'width', '18'),
											A2($elm$html$Html$Attributes$attribute, 'height', '18'),
											A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
											A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
										]),
									_List_fromArray(
										[
											$author$project$Views$svgPath('M18 6 6 18'),
											$author$project$Views$svgPath('M6 6l12 12')
										]))
								]))
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal__confirm-text')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Every active session will be signed out, including this one. Continue?')
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal__actions')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--ghost ecc-btn--inline'),
									$elm$html$Html$Events$onClick($author$project$Types$CancelledLogoutAll)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Cancel')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
									$elm$html$Html$Events$onClick($author$project$Types$ConfirmedLogoutAll)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Sign out everywhere')
								]))
						]))
				]))
		]));
var $author$project$Views$placeholderView = F2(
	function (heading, message) {
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h1,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('content__heading')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(heading)
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('content__lede')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(message)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('content__empty-block')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Coming soon.')
						]))
				]));
	});
var $author$project$Types$SubmittedPassword = {$: 58};
var $author$project$Types$UpdatedPasswordField = F2(
	function (a, b) {
		return {$: 57, a: a, b: b};
	});
var $author$project$Views$settingsFieldError = F2(
	function (field, errors) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$second,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var f = _v0.a;
						return _Utils_eq(f, field);
					},
					errors)));
	});
var $author$project$Views$settingsStatus = F2(
	function (success, errors) {
		var _v0 = _Utils_Tuple2(
			success,
			A2($author$project$Views$settingsFieldError, 'form', errors));
		if (!_v0.a.$) {
			var msg = _v0.a.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('settings-status settings-status--ok')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(msg)
					]));
		} else {
			if (!_v0.b.$) {
				var msg = _v0.b.a;
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('settings-status settings-status--error')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(msg)
						]));
			} else {
				return $elm$html$Html$text('');
			}
		}
	});
var $author$project$Views$settingsTextField = F7(
	function (fieldId, labelText, inputType, currentValue, isDisabled, toMsg, err) {
		var cls = function () {
			if (!err.$) {
				return 'ecc-field ecc-field--error';
			} else {
				return 'ecc-field';
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(cls)
				]),
			_Utils_ap(
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id(fieldId),
								$elm$html$Html$Attributes$type_(inputType),
								$elm$html$Html$Attributes$placeholder(' '),
								$elm$html$Html$Attributes$value(currentValue),
								$elm$html$Html$Events$onInput(toMsg),
								$elm$html$Html$Attributes$disabled(isDisabled)
							]),
						_List_Nil),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for(fieldId)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(labelText)
							]))
					]),
				function () {
					if (!err.$) {
						var msg = err.a;
						return _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-field__message')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(msg)
									]))
							]);
					} else {
						return _List_Nil;
					}
				}()));
	});
var $author$project$Views$settingsPasswordCard = function (model) {
	var pf = model.F;
	var submitLabel = pf.f ? 'Updating…' : 'Change password';
	return A3(
		$author$project$Views$detailCard,
		'Password',
		$elm$core$Maybe$Nothing,
		A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('settings-form')
				]),
			_List_fromArray(
				[
					A7(
					$author$project$Views$settingsTextField,
					'pw-current',
					'Current password',
					'password',
					pf.aD,
					pf.f,
					$author$project$Types$UpdatedPasswordField('current'),
					A2($author$project$Views$settingsFieldError, 'current', pf.a)),
					A7(
					$author$project$Views$settingsTextField,
					'pw-next',
					'New password',
					'password',
					pf.aw,
					pf.f,
					$author$project$Types$UpdatedPasswordField('next'),
					A2($author$project$Views$settingsFieldError, 'next', pf.a)),
					A7(
					$author$project$Views$settingsTextField,
					'pw-confirm',
					'Confirm new password',
					'password',
					pf.aU,
					pf.f,
					$author$project$Types$UpdatedPasswordField('confirm'),
					A2($author$project$Views$settingsFieldError, 'confirm', pf.a)),
					A2($author$project$Views$settingsStatus, pf.ag, pf.a),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('settings-actions')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
									$elm$html$Html$Events$onClick($author$project$Types$SubmittedPassword),
									$elm$html$Html$Attributes$disabled(pf.f)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(submitLabel)
								]))
						]))
				])));
};
var $author$project$Types$SubmittedProfile = {$: 55};
var $author$project$Types$UpdatedProfileField = F2(
	function (a, b) {
		return {$: 54, a: a, b: b};
	});
var $author$project$Views$settingsProfileCard = function (model) {
	var pf = model.z;
	var submitLabel = pf.f ? 'Saving…' : 'Save changes';
	var nameErr = A2($author$project$Views$settingsFieldError, 'name', pf.a);
	var emailErr = A2($author$project$Views$settingsFieldError, 'email', pf.a);
	var canSubmit = (!pf.f) && function () {
		var _v0 = model.L;
		if (!_v0.$) {
			var u = _v0.a;
			return (!_Utils_eq(
				$elm$core$String$trim(pf.aI),
				u.aI)) || (!_Utils_eq(
				$elm$core$String$trim(pf.aE),
				u.aE));
		} else {
			return false;
		}
	}();
	return A3(
		$author$project$Views$detailCard,
		'Profile',
		$elm$core$Maybe$Nothing,
		A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('settings-form')
				]),
			_List_fromArray(
				[
					A7(
					$author$project$Views$settingsTextField,
					'pf-name',
					'Full name',
					'text',
					pf.aI,
					pf.f,
					$author$project$Types$UpdatedProfileField('name'),
					nameErr),
					A7(
					$author$project$Views$settingsTextField,
					'pf-email',
					'Email address',
					'email',
					pf.aE,
					pf.f,
					$author$project$Types$UpdatedProfileField('email'),
					emailErr),
					A2($author$project$Views$settingsStatus, pf.ag, pf.a),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('settings-actions')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class('ecc-btn ecc-btn--inline'),
									$elm$html$Html$Events$onClick($author$project$Types$SubmittedProfile),
									$elm$html$Html$Attributes$disabled(!canSubmit)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(submitLabel)
								]))
						]))
				])));
};
var $author$project$Types$RequestedLogoutAll = {$: 60};
var $author$project$Views$settingsSessionsCard = function (_v0) {
	return A3(
		$author$project$Views$detailCard,
		'Sessions',
		$elm$core$Maybe$Nothing,
		A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('settings-session')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('settings-session__copy')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h4,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('settings-session__title')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Sign out of all devices')
								])),
							A2(
							$elm$html$Html$p,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('settings-session__desc')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Every token issued for this account will be revoked. You\'ll need to sign in again everywhere, including here.')
								]))
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$class('ecc-btn ecc-btn--danger ecc-btn--inline'),
							$elm$html$Html$Events$onClick($author$project$Types$RequestedLogoutAll)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Sign out all devices')
						]))
				])));
};
var $author$project$Views$settingsView = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('settings')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$header,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('settings__header')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h1,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('content__heading')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Settings')
							])),
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('content__lede')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Manage your account and security preferences.')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('settings__grid')
					]),
				_List_fromArray(
					[
						$author$project$Views$settingsProfileCard(model),
						$author$project$Views$settingsPasswordCard(model),
						$author$project$Views$settingsSessionsCard(model)
					]))
			]));
};
var $author$project$Views$toastView = function (message) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('toast'),
				A2($elm$html$Html$Attributes$attribute, 'role', 'status')
			]),
		_List_fromArray(
			[
				A2(
				$author$project$Views$svgIcon,
				_List_fromArray(
					[
						A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
						A2($elm$html$Html$Attributes$attribute, 'width', '16'),
						A2($elm$html$Html$Attributes$attribute, 'height', '16'),
						A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
						A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
						A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2.5'),
						A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
						A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
					]),
				_List_fromArray(
					[
						$author$project$Views$svgPath('M20 6 9 17l-5-5')
					])),
				A2(
				$elm$html$Html$span,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(message)
					]))
			]));
};
var $author$project$Views$pageContent = F2(
	function (model, user) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('content__body')
				]),
			_List_fromArray(
				[
					function () {
					var _v0 = model.q;
					switch (_v0.$) {
						case 0:
							return A2($author$project$Views$homeView, model, user);
						case 1:
							return $author$project$Views$contactsView(model);
						case 2:
							var _v1 = model.G;
							if (!_v1.$) {
								var c = _v1.a;
								return A2($author$project$Views$contactDetailView, model, c);
							} else {
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('content__empty-block')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Contact not found.')
										]));
							}
						case 3:
							return $author$project$Views$dealsView(model);
						case 4:
							var _v2 = model.M;
							if (!_v2.$) {
								var d = _v2.a;
								return A2($author$project$Views$dealDetailView, model, d);
							} else {
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('content__empty-block')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Deal not found.')
										]));
							}
						case 5:
							return A2($author$project$Views$placeholderView, 'Tasks', 'Your task list will appear here.');
						case 6:
							return A2($author$project$Views$placeholderView, 'Reports', 'Analytics and reports will appear here.');
						default:
							return $author$project$Views$settingsView(model);
					}
				}(),
					function () {
					var _v3 = model.b;
					if (!_v3.$) {
						var cf = _v3.a;
						return A2($author$project$Views$contactFormModal, model, cf);
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					function () {
					var _v4 = model.w;
					if (!_v4.$) {
						var contact = _v4.a;
						return $author$project$Views$deleteConfirmModal(contact);
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					function () {
					var _v5 = model.e;
					if (!_v5.$) {
						var df = _v5.a;
						return A2($author$project$Views$dealFormModal, model, df);
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					function () {
					var _v6 = model.x;
					if (!_v6.$) {
						var deal = _v6.a;
						return $author$project$Views$deleteDealConfirmModal(deal);
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					function () {
					var _v7 = model.m;
					if (!_v7.$) {
						var af = _v7.a;
						return $author$project$Views$activityFormModal(af);
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					function () {
					var _v8 = model.H;
					if (!_v8.$) {
						var a = _v8.a;
						return $author$project$Views$deleteActivityConfirmModal(a);
					} else {
						return $elm$html$Html$text('');
					}
				}(),
					model.I ? $author$project$Views$logoutAllConfirmModal : $elm$html$Html$text(''),
					function () {
					var _v9 = model.c;
					if (!_v9.$) {
						var msg = _v9.a;
						return $author$project$Views$toastView(msg);
					} else {
						return $elm$html$Html$text('');
					}
				}()
				]));
	});
var $author$project$Views$pageTitle = function (model) {
	var _v0 = model.q;
	switch (_v0.$) {
		case 0:
			return 'Home';
		case 1:
			return 'Contacts';
		case 2:
			return 'Contact';
		case 3:
			return 'Deals';
		case 4:
			return 'Deal';
		case 5:
			return 'Tasks';
		case 6:
			return 'Reports';
		default:
			return 'Settings';
	}
};
var $author$project$Types$LoggedOut = {$: 7};
var $author$project$Types$Reports = {$: 6};
var $author$project$Types$Tasks = {$: 5};
var $author$project$Views$eccMark = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('ecc-mark')
		]),
	_List_fromArray(
		[
			A2(
			$author$project$Views$svgIcon,
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 40 40'),
					A2($elm$html$Html$Attributes$attribute, 'width', '40'),
					A2($elm$html$Html$Attributes$attribute, 'height', '40'),
					A2($elm$html$Html$Attributes$attribute, 'fill', 'none')
				]),
			_List_fromArray(
				[
					A3(
					$elm$html$Html$node,
					'rect',
					_List_fromArray(
						[
							A2($elm$html$Html$Attributes$attribute, 'x', '0'),
							A2($elm$html$Html$Attributes$attribute, 'y', '0'),
							A2($elm$html$Html$Attributes$attribute, 'width', '40'),
							A2($elm$html$Html$Attributes$attribute, 'height', '40'),
							A2($elm$html$Html$Attributes$attribute, 'rx', '12'),
							A2($elm$html$Html$Attributes$attribute, 'fill', 'url(#eccGrad)')
						]),
					_List_Nil),
					A3(
					$elm$html$Html$node,
					'text',
					_List_fromArray(
						[
							A2($elm$html$Html$Attributes$attribute, 'x', '20'),
							A2($elm$html$Html$Attributes$attribute, 'y', '26'),
							A2($elm$html$Html$Attributes$attribute, 'text-anchor', 'middle'),
							A2($elm$html$Html$Attributes$attribute, 'font-family', 'Inter, sans-serif'),
							A2($elm$html$Html$Attributes$attribute, 'font-size', '16'),
							A2($elm$html$Html$Attributes$attribute, 'font-weight', '700'),
							A2($elm$html$Html$Attributes$attribute, 'fill', 'white'),
							A2($elm$html$Html$Attributes$attribute, 'letter-spacing', '0.5')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('ECC')
						])),
					A3(
					$elm$html$Html$node,
					'defs',
					_List_Nil,
					_List_fromArray(
						[
							A3(
							$elm$html$Html$node,
							'linearGradient',
							_List_fromArray(
								[
									A2($elm$html$Html$Attributes$attribute, 'id', 'eccGrad'),
									A2($elm$html$Html$Attributes$attribute, 'x1', '0'),
									A2($elm$html$Html$Attributes$attribute, 'y1', '0'),
									A2($elm$html$Html$Attributes$attribute, 'x2', '40'),
									A2($elm$html$Html$Attributes$attribute, 'y2', '40'),
									A2($elm$html$Html$Attributes$attribute, 'gradientUnits', 'userSpaceOnUse')
								]),
							_List_fromArray(
								[
									A3(
									$elm$html$Html$node,
									'stop',
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'offset', '0'),
											A2($elm$html$Html$Attributes$attribute, 'stop-color', '#6366F1')
										]),
									_List_Nil),
									A3(
									$elm$html$Html$node,
									'stop',
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'offset', '1'),
											A2($elm$html$Html$Attributes$attribute, 'stop-color', '#06B6D4')
										]),
									_List_Nil)
								]))
						]))
				]))
		]));
var $author$project$Views$iconHome = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '18'),
			A2($elm$html$Html$Attributes$attribute, 'height', '18'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'),
			$author$project$Views$svgPath('M9 22V12h6v10')
		]));
var $author$project$Views$iconReports = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '18'),
			A2($elm$html$Html$Attributes$attribute, 'height', '18'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M18 20V10M12 20V4M6 20v-6')
		]));
var $author$project$Views$iconSettings = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '18'),
			A2($elm$html$Html$Attributes$attribute, 'height', '18'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			A3(
			$elm$html$Html$node,
			'circle',
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$attribute, 'cx', '12'),
					A2($elm$html$Html$Attributes$attribute, 'cy', '12'),
					A2($elm$html$Html$Attributes$attribute, 'r', '3')
				]),
			_List_Nil),
			$author$project$Views$svgPath('M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z')
		]));
var $author$project$Views$iconSignOut = A2(
	$author$project$Views$svgIcon,
	_List_fromArray(
		[
			A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
			A2($elm$html$Html$Attributes$attribute, 'width', '16'),
			A2($elm$html$Html$Attributes$attribute, 'height', '16'),
			A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
			A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
			A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
		]),
	_List_fromArray(
		[
			$author$project$Views$svgPath('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'),
			$author$project$Views$svgPath('M16 17l5-5-5-5'),
			$author$project$Views$svgPath('M21 12H9')
		]));
var $elm$html$Html$nav = _VirtualDom_node('nav');
var $author$project$Views$navItem = F4(
	function (current, target, label, icon) {
		var cls = _Utils_eq(current, target) ? 'nav-item nav-item--active' : 'nav-item';
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(cls),
					$elm$html$Html$Attributes$type_('button'),
					$elm$html$Html$Events$onClick(
					$author$project$Types$NavigatedTo(target))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('nav-item__icon')
						]),
					_List_fromArray(
						[icon])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('nav-item__label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(label)
						]))
				]));
	});
var $author$project$Views$sidebar = F2(
	function (model, user) {
		var effectiveRoute = function () {
			var _v0 = model.q;
			switch (_v0.$) {
				case 2:
					return $author$project$Types$Contacts;
				case 4:
					return $author$project$Types$Deals;
				default:
					var other = _v0;
					return other;
			}
		}();
		return A2(
			$elm$html$Html$aside,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('sidebar')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('sidebar__brand')
						]),
					_List_fromArray(
						[
							$author$project$Views$eccMark,
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('sidebar__wordmark')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('sidebar__name')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('ECC')
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('sidebar__product')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('CRM')
										]))
								]))
						])),
					A2(
					$elm$html$Html$nav,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('sidebar__nav')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('sidebar__section-label')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Workspace')
								])),
							A4($author$project$Views$navItem, effectiveRoute, $author$project$Types$Home, 'Home', $author$project$Views$iconHome),
							A4($author$project$Views$navItem, effectiveRoute, $author$project$Types$Contacts, 'Contacts', $author$project$Views$iconContacts),
							A4($author$project$Views$navItem, effectiveRoute, $author$project$Types$Deals, 'Deals', $author$project$Views$iconDeals),
							A4($author$project$Views$navItem, effectiveRoute, $author$project$Types$Tasks, 'Tasks', $author$project$Views$iconTasks),
							A4($author$project$Views$navItem, effectiveRoute, $author$project$Types$Reports, 'Reports', $author$project$Views$iconReports)
						])),
					A2(
					$elm$html$Html$nav,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('sidebar__nav sidebar__nav--bottom')
						]),
					_List_fromArray(
						[
							A4($author$project$Views$navItem, effectiveRoute, $author$project$Types$Settings, 'Settings', $author$project$Views$iconSettings)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('sidebar__user')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('sidebar__avatar')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									A2($elm$core$String$left, 1, user.aI))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('sidebar__user-info')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('sidebar__user-name')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(user.aI)
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('sidebar__user-email')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(user.aE)
										]))
								]))
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('sidebar__signout-btn'),
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Events$onClick($author$project$Types$LoggedOut)
						]),
					_List_fromArray(
						[
							$author$project$Views$iconSignOut,
							A2(
							$elm$html$Html$span,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Sign out')
								]))
						]))
				]));
	});
var $author$project$Views$topbar = F2(
	function (_v0, user) {
		return A2(
			$elm$html$Html$header,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('topbar')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('topbar__search')
						]),
					_List_fromArray(
						[
							A2(
							$author$project$Views$svgIcon,
							_List_fromArray(
								[
									A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
									A2($elm$html$Html$Attributes$attribute, 'width', '16'),
									A2($elm$html$Html$Attributes$attribute, 'height', '16'),
									A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
									A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
									A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
									A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
									A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
								]),
							_List_fromArray(
								[
									A3(
									$elm$html$Html$node,
									'circle',
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'cx', '11'),
											A2($elm$html$Html$Attributes$attribute, 'cy', '11'),
											A2($elm$html$Html$Attributes$attribute, 'r', '8')
										]),
									_List_Nil),
									$author$project$Views$svgPath('M21 21l-4.35-4.35')
								])),
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$placeholder('Search contacts, deals, tasks…'),
									$elm$html$Html$Attributes$class('topbar__search-input')
								]),
							_List_Nil),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('topbar__search-kbd')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('⌘K')
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('topbar__right')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('topbar__icon-btn topbar__icon-btn--notify'),
									$elm$html$Html$Attributes$type_('button'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Notifications')
								]),
							_List_fromArray(
								[
									A2(
									$author$project$Views$svgIcon,
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
											A2($elm$html$Html$Attributes$attribute, 'width', '18'),
											A2($elm$html$Html$Attributes$attribute, 'height', '18'),
											A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
											A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
										]),
									_List_fromArray(
										[
											$author$project$Views$svgPath('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'),
											$author$project$Views$svgPath('M13.73 21a2 2 0 0 1-3.46 0')
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('topbar__avatar')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									A2($elm$core$String$left, 1, user.aI))
								]))
						]))
				]));
	});
var $author$project$Views$appShell = F2(
	function (model, user) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('app-shell')
				]),
			_List_fromArray(
				[
					A2($author$project$Views$sidebar, model, user),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('app-main')
						]),
					_List_fromArray(
						[
							A2($author$project$Views$topbar, model, user),
							A2(
							$elm$html$Html$main_,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('content')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('content__header')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$h1,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('content__title')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													$author$project$Views$pageTitle(model))
												]))
										])),
									A2($author$project$Views$pageContent, model, user)
								]))
						]))
				]));
	});
var $elm$html$Html$footer = _VirtualDom_node('footer');
var $elm$html$Html$li = _VirtualDom_node('li');
var $author$project$Views$trustItem = function (label) {
	return A2(
		$elm$html$Html$li,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('trust-item')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('trust-check')
					]),
				_List_fromArray(
					[
						A2(
						$author$project$Views$svgIcon,
						_List_fromArray(
							[
								A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
								A2($elm$html$Html$Attributes$attribute, 'width', '14'),
								A2($elm$html$Html$Attributes$attribute, 'height', '14'),
								A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
								A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
								A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2.5'),
								A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
								A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
							]),
						_List_fromArray(
							[
								$author$project$Views$svgPath('M20 6 9 17l-5-5')
							]))
					])),
				$elm$html$Html$text(label)
			]));
};
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Views$brandPanel = A2(
	$elm$html$Html$aside,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('brand-panel')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('brand-panel__glow brand-panel__glow--1')
				]),
			_List_Nil),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('brand-panel__glow brand-panel__glow--2')
				]),
			_List_Nil),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('brand-panel__inner')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$header,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('brand-panel__header')
						]),
					_List_fromArray(
						[
							$author$project$Views$eccMark,
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('brand-panel__wordmark')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('brand-panel__name')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('ECC')
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('brand-panel__product')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('CRM')
										]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('brand-panel__hero')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h2,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('brand-panel__headline')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Customer relationships, '),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('brand-panel__headline-accent')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('secured.')
										]))
								])),
							A2(
							$elm$html$Html$p,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('brand-panel__lede')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('The unified workspace for your team to manage accounts, deals, and conversations — with enterprise-grade protection built in.')
								]))
						])),
					A2(
					$elm$html$Html$ul,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('trust-list')
						]),
					_List_fromArray(
						[
							$author$project$Views$trustItem('SOC 2 Type II certified'),
							$author$project$Views$trustItem('256-bit AES encryption at rest'),
							$author$project$Views$trustItem('GDPR & CCPA compliant')
						])),
					A2(
					$elm$html$Html$footer,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('brand-panel__footer')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('© 2026 ECC. All rights reserved.')
						]))
				]))
		]));
var $author$project$Views$loadingView = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('ecc-dashboard')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('ecc-loading')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('ecc-loading__spinner')
						]),
					_List_Nil),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('ecc-loading__text')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Restoring your session…')
						]))
				]))
		]));
var $author$project$Types$Submitted = {$: 3};
var $author$project$Types$SwitchedMode = function (a) {
	return {$: 4, a: a};
};
var $author$project$Types$ToggledRemember = function (a) {
	return {$: 1, a: a};
};
var $author$project$Views$alertView = function (maybeAlert) {
	if (maybeAlert.$ === 1) {
		return $elm$html$Html$text('');
	} else {
		var alert = maybeAlert.a;
		var cls = function () {
			var _v1 = alert.bA;
			if (!_v1) {
				return 'ecc-alert ecc-alert--error';
			} else {
				return 'ecc-alert ecc-alert--success';
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(cls),
					A2($elm$html$Html$Attributes$attribute, 'role', 'alert')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(alert.aG)
				]));
	}
};
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $author$project$Types$ToggledShowPassword = {$: 2};
var $author$project$Types$UpdatedField = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$Views$fieldError = F2(
	function (field, model) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$second,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var f = _v0.a;
						return _Utils_eq(f, field);
					},
					model.a)));
	});
var $elm$html$Html$Attributes$name = $elm$html$Html$Attributes$stringProperty('name');
var $author$project$Views$formField = F2(
	function (model, cfg) {
		var val = function () {
			var _v2 = cfg.R;
			switch (_v2) {
				case 0:
					return model.u.aI;
				case 1:
					return model.u.aE;
				default:
					return model.u.ax;
			}
		}();
		var isPassword = cfg.R === 2;
		var inputType = (isPassword && model.aN) ? 'text' : cfg.ak;
		var err = A2($author$project$Views$fieldError, cfg.R, model);
		var containerClass = function () {
			if (!err.$) {
				return 'ecc-field ecc-field--error';
			} else {
				return 'ecc-field';
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(containerClass)
				]),
			_Utils_ap(
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id(cfg.av),
								$elm$html$Html$Attributes$name(cfg.av),
								$elm$html$Html$Attributes$type_(inputType),
								$elm$html$Html$Attributes$placeholder(' '),
								A2($elm$html$Html$Attributes$attribute, 'autocomplete', cfg.aj),
								$elm$html$Html$Attributes$value(val),
								$elm$html$Html$Events$onInput(
								$author$project$Types$UpdatedField(cfg.R))
							]),
						_List_Nil),
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for(cfg.av)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(cfg.al)
							]))
					]),
				_Utils_ap(
					isPassword ? _List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$class('ecc-field__toggle'),
									A2(
									$elm$html$Html$Attributes$attribute,
									'aria-label',
									model.aN ? 'Hide password' : 'Show password'),
									$elm$html$Html$Events$onClick($author$project$Types$ToggledShowPassword)
								]),
							_List_fromArray(
								[
									model.aN ? A2(
									$author$project$Views$svgIcon,
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
											A2($elm$html$Html$Attributes$attribute, 'width', '18'),
											A2($elm$html$Html$Attributes$attribute, 'height', '18'),
											A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
											A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
										]),
									_List_fromArray(
										[
											$author$project$Views$svgPath('M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'),
											$author$project$Views$svgPath('M1 1l22 22')
										])) : A2(
									$author$project$Views$svgIcon,
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
											A2($elm$html$Html$Attributes$attribute, 'width', '18'),
											A2($elm$html$Html$Attributes$attribute, 'height', '18'),
											A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
											A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-width', '1.8'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
											A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
										]),
									_List_fromArray(
										[
											$author$project$Views$svgPath('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z'),
											A3(
											$elm$html$Html$node,
											'circle',
											_List_fromArray(
												[
													A2($elm$html$Html$Attributes$attribute, 'cx', '12'),
													A2($elm$html$Html$Attributes$attribute, 'cy', '12'),
													A2($elm$html$Html$Attributes$attribute, 'r', '3')
												]),
											_List_Nil)
										]))
								]))
						]) : _List_Nil,
					function () {
						if (!err.$) {
							var msg = err.a;
							return _List_fromArray(
								[
									A2(
									$elm$html$Html$p,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ecc-field__message')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(msg)
										]))
								]);
						} else {
							return _List_Nil;
						}
					}())));
	});
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $author$project$Views$onCheck = function (toMsg) {
	return A2(
		$elm$html$Html$Events$on,
		'change',
		A2(
			$elm$json$Json$Decode$map,
			toMsg,
			A2(
				$elm$json$Json$Decode$at,
				_List_fromArray(
					['target', 'checked']),
				$elm$json$Json$Decode$bool)));
};
var $author$project$Views$loginCard = function (model) {
	var titleText = (!model.ab) ? 'Sign in to ECC-CRM' : 'Create your ECC account';
	var switchLabel = (!model.ab) ? 'Request access' : 'Sign in instead';
	var subtitleText = (!model.ab) ? 'Enter your credentials to access your workspace.' : 'Set up your account in under a minute.';
	var submitLabel = model.f ? 'Signing in…' : ((!model.ab) ? 'Sign in' : 'Create account');
	var nextMode = (!model.ab) ? 1 : 0;
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('auth-panel')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('auth-panel__inner')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('auth-header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h1,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('auth-title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(titleText)
									])),
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('auth-subtitle')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(subtitleText)
									]))
							])),
						$author$project$Views$alertView(model.U),
						A2(
						$elm$html$Html$form,
						_List_fromArray(
							[
								$elm$html$Html$Events$onSubmit($author$project$Types$Submitted),
								$elm$html$Html$Attributes$novalidate(true)
							]),
						_Utils_ap(
							(model.ab === 1) ? _List_fromArray(
								[
									A2(
									$author$project$Views$formField,
									model,
									{aj: 'name', R: 0, ak: 'text', av: 'name', al: 'Full name'})
								]) : _List_Nil,
							_List_fromArray(
								[
									A2(
									$author$project$Views$formField,
									model,
									{aj: 'email', R: 1, ak: 'email', av: 'email', al: 'Work email'}),
									A2(
									$author$project$Views$formField,
									model,
									{
										aj: (!model.ab) ? 'current-password' : 'new-password',
										R: 2,
										ak: 'password',
										av: 'password',
										al: 'Password'
									}),
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ecc-row')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$label,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('ecc-checkbox')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$input,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$type_('checkbox'),
															$elm$html$Html$Attributes$checked(model.u.bb),
															$author$project$Views$onCheck($author$project$Types$ToggledRemember)
														]),
													_List_Nil),
													A2(
													$elm$html$Html$span,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text('Keep me signed in')
														]))
												])),
											A2(
											$elm$html$Html$a,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('ecc-link'),
													$elm$html$Html$Attributes$href('#')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Forgot password?')
												]))
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ecc-btn'),
											$elm$html$Html$Attributes$type_('submit'),
											$elm$html$Html$Attributes$disabled(model.f)
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('ecc-btn__label')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(submitLabel)
												])),
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class(
													'ecc-spinner' + (model.f ? ' ecc-spinner--on' : '')),
													A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
												]),
											_List_Nil)
										]))
								]))),
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('auth-switch')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								(!model.ab) ? 'Need an account? ' : 'Already have one? '),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('ecc-link ecc-link--strong'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick(
										$author$project$Types$SwitchedMode(nextMode))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(switchLabel)
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('auth-footer')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('auth-footer__lock')
									]),
								_List_fromArray(
									[
										A2(
										$author$project$Views$svgIcon,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'viewBox', '0 0 24 24'),
												A2($elm$html$Html$Attributes$attribute, 'width', '12'),
												A2($elm$html$Html$Attributes$attribute, 'height', '12'),
												A2($elm$html$Html$Attributes$attribute, 'fill', 'none'),
												A2($elm$html$Html$Attributes$attribute, 'stroke', 'currentColor'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-width', '2'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linecap', 'round'),
												A2($elm$html$Html$Attributes$attribute, 'stroke-linejoin', 'round')
											]),
										_List_fromArray(
											[
												A3(
												$elm$html$Html$node,
												'rect',
												_List_fromArray(
													[
														A2($elm$html$Html$Attributes$attribute, 'x', '3'),
														A2($elm$html$Html$Attributes$attribute, 'y', '11'),
														A2($elm$html$Html$Attributes$attribute, 'width', '18'),
														A2($elm$html$Html$Attributes$attribute, 'height', '11'),
														A2($elm$html$Html$Attributes$attribute, 'rx', '2')
													]),
												_List_Nil),
												$author$project$Views$svgPath('M7 11V7a5 5 0 0 1 10 0v4')
											]))
									])),
								$elm$html$Html$text('Protected by 256-bit encryption')
							]))
					]))
			]));
};
var $author$project$Views$view = function (model) {
	return A2(
		$elm$html$Html$main_,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ecc-shell')
			]),
		_List_fromArray(
			[
				function () {
				if (model.as) {
					return $author$project$Views$loadingView;
				} else {
					var _v0 = model.L;
					if (!_v0.$) {
						var user = _v0.a;
						return A2($author$project$Views$appShell, model, user);
					} else {
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('ecc-split')
								]),
							_List_fromArray(
								[
									$author$project$Views$brandPanel,
									$author$project$Views$loginCard(model)
								]));
					}
				}
			}()
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{bz: $author$project$Main$init, bJ: $author$project$Main$subscriptions, bK: $author$project$Main$update, bL: $author$project$Views$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	A2(
		$elm$json$Json$Decode$andThen,
		function (token) {
			return $elm$json$Json$Decode$succeed(
				{d: token});
		},
		A2(
			$elm$json$Json$Decode$field,
			'token',
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
						A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, $elm$json$Json$Decode$string)
					])))))(0)}});}(this));