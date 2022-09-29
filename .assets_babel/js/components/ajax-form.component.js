"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * <ajax-form>
 * -----------------------------------------------------------------------------
 * A form that talks to the backend using AJAX.
 * > For example usage, take a look at one of the forms generated in a new
 * > Sails app when using the "Web app" template.
 *
 * @type {Component}
 *
 * @slot default                     [form contents]
 *
 * @event update:cloudError          [:cloud-error.sync="…"]
 * @event update:syncing             [:syncing.sync="…"]
 * @event update:formErrors          [:form-errors.sync="…"]
 * @event submitted                  [emitted after the server responds with a 2xx status code]
 * @event rejected                   [emitted after the server responds with a non-2xx status code]
 * -----------------------------------------------------------------------------
 */
parasails.registerComponent('ajaxForm', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Note:
  // Some of these props rely on the `.sync` modifier re-introduced in Vue 2.3.x.
  // For more info, see: https://vuejs.org/v2/guide/components.html#sync-Modifier
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  props: ['syncing', // « 2-way bound (:syncing.sync="…")
  'cloudError', // « 2-way bound (:cloud-error.sync="…")
  'action', 'formErrors', // « 2-way bound (:form-errors.sync="…")
  'formData', 'formRules', 'protocol', 'handleSubmitting', // « alternative for `action`
  'handleParsing' // « alternative for `formRules`+`formData`+`formErrors`
  ],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function data() {
    return {//…
    };
  },
  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: "\n  <form class=\"ajax-form\" @submit.prevent=\"submit()\" @keydown.meta.enter=\"keydownMetaEnter()\">\n    <slot name=\"default\"></slot>\n  </form>\n  ",
  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {//…
  },
  mounted: function () {
    var _mounted = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var SUPPORTED_RULES, fieldName, ruleName, kebabRules, lowerCaseRules, ruleIdx;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(this.action === undefined && this.handleSubmitting === undefined)) {
                _context.next = 4;
                break;
              }

              throw new Error('Neither `:action` nor `:handle-submitting` was passed in to <ajax-form>, but one or the other must be provided.');

            case 4:
              if (!(this.action !== undefined && this.handleSubmitting !== undefined)) {
                _context.next = 8;
                break;
              }

              throw new Error('Both `:action` AND `:handle-submitting` were passed in to <ajax-form>, but only one or the other should be provided.');

            case 8:
              if (!(this.action !== undefined && (!_.isString(this.action) || !_.isFunction(Cloud[_.camelCase(this.action)])))) {
                _context.next = 12;
                break;
              }

              throw new Error('Invalid `action` in <ajax-form>.  `action` should be the name of a method on the `Cloud` global.  For example: `action="login"` would make this form communicate using `Cloud.login()`, which corresponds to the "login" action on the server.');

            case 12:
              if (!(this.action !== undefined && !_.isFunction(Cloud[this.action]))) {
                _context.next = 16;
                break;
              }

              throw new Error('Unrecognized `action` in <ajax-form>.  Did you mean to type `action="' + _.camelCase(this.action) + '"`?  (<ajax-form> expects `action` to be provided in camelCase format.  In other words, to reference the action at "api/controllers/foo/bar/do-something", use `action="doSomething"`.)');

            case 16:
              if (!(this.handleSubmitting !== undefined && !_.isFunction(this.handleSubmitting))) {
                _context.next = 18;
                break;
              }

              throw new Error('Invalid `:handle-submitting` function passed to <ajax-form>.  (Any chance you forgot the ":" in front of the prop name?)  For example: `:handle-submitting="handleSubmittingSomeForm"`.  This function should be an `async function`, and it should either throw a special exit signal or return response data from the server.  (If this custom `handleSubmitting` will be doing something more complex than a single request to a server, feel free to return whatever amalgamation of data you wish.)');

            case 18:
              if (!(this.handleParsing === undefined && this.formData === undefined)) {
                _context.next = 22;
                break;
              }

              throw new Error('Neither `:form-data` nor `:handle-parsing` was passed in to <ajax-form>, but one or the other must be provided.');

            case 22:
              if (!(this.handleParsing !== undefined && this.formData !== undefined)) {
                _context.next = 26;
                break;
              }

              throw new Error('Both `:form-data` AND `:handle-parsing` were passed in to <ajax-form>, but only one or the other should be provided.');

            case 26:
              if (!(this.handleParsing !== undefined && !_.isFunction(this.handleParsing))) {
                _context.next = 30;
                break;
              }

              throw new Error('Invalid `:handle-parsing` function passed to <ajax-form>.  (Any chance you forgot the ":" in front of the prop name?)  For example: `:handle-parsing="handleParsingSomeForm"`.  This function should return a dictionary (plain JavaScript object like `{}`) of parsed form data, ready to be sent in a request to the server.');

            case 30:
              if (!(this.formData !== undefined && (!_.isObject(this.formData) || _.isFunction(this.formData) || _.isArray(this.formData)))) {
                _context.next = 32;
                break;
              }

              throw new Error('Invalid `:form-data` passed to <ajax-form>.  (Any chance you forgot the ":" in front of the prop name?)  For example: `:form-data="someFormData"`.  This should reference a dictionary (plain JavaScript object like `{}`).  Specifically, `:form-data` should only be used in the case where the raw data from the form in the user interface happens to correspond **EXACTLY** with the names and format of the argins that should be sent in a request to the server.  (For more nuanced behavior, use `handle-parsing` instead!)');

            case 32:
              if (!(!this.formData && (this.formRules || this.formErrors))) {
                _context.next = 36;
                break;
              }

              throw new Error('If `:form-rules` or `:form-errors.sync` are in use, then `:form-data` must also be passed in.  (If the AJAX request doesn\'t need form data, then use an empty dictionary, i.e. `:form-data="{}"`.)');

            case 36:
              if (!(this.formRules && !this.formErrors)) {
                _context.next = 38;
                break;
              }

              throw new Error('If `:form-rules` are provided, then `:form-errors.sync` must also be passed in.');

            case 38:
              if (!this.formRules) {
                _context.next = 61;
                break;
              }

              SUPPORTED_RULES = ['required', 'isEmail', 'isIn', 'is', 'minLength', 'maxLength', 'sameAs', 'isHalfwayDecentPassword', 'custom', 'regex'];
              _context.t0 = _regeneratorRuntime().keys(this.formRules);

            case 41:
              if ((_context.t1 = _context.t0()).done) {
                _context.next = 61;
                break;
              }

              fieldName = _context.t1.value;
              _context.t2 = _regeneratorRuntime().keys(this.formRules[fieldName]);

            case 44:
              if ((_context.t3 = _context.t2()).done) {
                _context.next = 59;
                break;
              }

              ruleName = _context.t3.value;

              if (!_.contains(SUPPORTED_RULES, ruleName)) {
                _context.next = 49;
                break;
              }

              _context.next = 57;
              break;

            case 49:
              kebabRules = _.map(_.clone(SUPPORTED_RULES), function (ruleName) {
                return _.kebabCase(ruleName);
              });
              lowerCaseRules = _.map(_.clone(SUPPORTED_RULES), function (ruleName) {
                return ruleName.toLowerCase();
              });
              ruleIdx = _.indexOf(kebabRules, ruleName) === -1 ? _.indexOf(lowerCaseRules, ruleName.toLowerCase()) === -1 ? -1 : _.indexOf(lowerCaseRules, ruleName.toLowerCase()) : _.indexOf(kebabRules, ruleName);

              if (!(ruleIdx !== -1)) {
                _context.next = 56;
                break;
              }

              throw new Error('Did you mean `' + SUPPORTED_RULES[ruleIdx] + '`?  (note the capitalization)\nYou are seeing this error because <ajax-form> encountered an unsupported (but vaguely familiar-looking) client-side validation rule: `' + ruleName + '`.');

            case 56:
              throw new Error('<ajax-form> does not support that client-side validation rule (`' + ruleName + '`).\n [?] If you\'re unsure, visit https://sailsjs.com/support');

            case 57:
              _context.next = 44;
              break;

            case 59:
              _context.next = 41;
              break;

            case 61:
              // Focus our "focus-first" field, if relevant.
              // (but not on mobile, because it can get weird)
              if (typeof bowser !== 'undefined' && !bowser.mobile && this.$find('[focus-first]').length > 0) {
                this.$focus('[focus-first]');
              } // console.log("ajax-form mounted with " + (this.action ? 'action' : (this.handleSubmitting ? 'handleSubmitting' : 'no')) + ' handler');


            case 62:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function mounted() {
      return _mounted.apply(this, arguments);
    }

    return mounted;
  }(),
  beforeDestroy: function beforeDestroy() {//…
  },
  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    keydownMetaEnter: function () {
      var _keydownMetaEnter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._submit();

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function keydownMetaEnter() {
        return _keydownMetaEnter.apply(this, arguments);
      }

      return keydownMetaEnter;
    }(),
    submit: function () {
      var _submit = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this._submit();

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function submit() {
        return _submit.apply(this, arguments);
      }

      return submit;
    }(),
    //  ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
    //  ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
    //  ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
    _submit: function () {
      var _submit2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var argins, formData, formErrors, fieldName, fieldValue, ruleName, ruleRhs, violation, isFieldValuePresent, otherFieldName, otherFieldValue, failedWithCloudExit, rawErrorFromCloudSDK, result, protocol;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this.syncing) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                //•
                // Clear the userland "cloudError" prop.
                this.$emit('update:cloudError', ''); // Determine the argins that will be sent to the server in our request.

                debugger;

                if (!this.handleParsing) {
                  _context4.next = 14;
                  break;
                }

                // Run the provided "handle-parsing" logic.
                // > This should clear out any pre-existing error messages, perform any additional
                // > client-side form validation checks, and do any necessary data transformations
                // > to munge the form data into the format expected by the server.
                argins = this.handleParsing();

                if (!(argins === undefined)) {
                  _context4.next = 10;
                  break;
                }

                return _context4.abrupt("return");

              case 10:
                if (!(!_.isObject(argins) || _.isArray(argins) || _.isFunction(argins))) {
                  _context4.next = 12;
                  break;
                }

                throw new Error('Invalid data returned from custom form parsing logic.  (Should return a dictionary of argins, like `{}`.)');

              case 12:
                _context4.next = 85;
                break;

              case 14:
                if (!this.formData) {
                  _context4.next = 85;
                  break;
                }

                // Or use the simpler, built-in absorbtion strategy.
                // > This uses the provided form data as our argins, verbatim.  Then it runs
                // > built-in client-side validation, if configured to do so.
                argins = this.formData;
                formData = this.formData;
                formErrors = {};
                _context4.t0 = _regeneratorRuntime().keys(this.formRules);

              case 19:
                if ((_context4.t1 = _context4.t0()).done) {
                  _context4.next = 81;
                  break;
                }

                fieldName = _context4.t1.value;
                fieldValue = formData[fieldName];
                _context4.t2 = _regeneratorRuntime().keys(this.formRules[fieldName]);

              case 23:
                if ((_context4.t3 = _context4.t2()).done) {
                  _context4.next = 79;
                  break;
                }

                ruleName = _context4.t3.value;
                ruleRhs = this.formRules[fieldName][ruleName];
                violation = void 0;
                isFieldValuePresent = fieldValue !== undefined && fieldValue !== '' && !_.isNull(fieldValue);

                if (!(ruleName === 'required' && (ruleRhs === true || ruleRhs === false))) {
                  _context4.next = 32;
                  break;
                }

                // ® Must be defined, non-null, and not the empty string
                if (ruleRhs === false) {
                  violation = false;
                } else {
                  violation = !isFieldValuePresent;
                }

                _context4.next = 74;
                break;

              case 32:
                if (isFieldValuePresent) {
                  _context4.next = 35;
                  break;
                }

                _context4.next = 74;
                break;

              case 35:
                if (!(ruleName === 'isEmail' && (ruleRhs === true || ruleRhs === false))) {
                  _context4.next = 39;
                  break;
                }

                // ® Must be an email address (unless falsy)
                if (ruleRhs === false) {
                  violation = false;
                } else {
                  violation = !parasails.util.isValidEmailAddress(fieldValue);
                }

                _context4.next = 74;
                break;

              case 39:
                if (!(ruleName === 'isIn' && _.isArray(ruleRhs))) {
                  _context4.next = 43;
                  break;
                }

                // ® Must be one of these things
                violation = !_.contains(ruleRhs, fieldValue);
                _context4.next = 74;
                break;

              case 43:
                if (!(ruleName === 'is')) {
                  _context4.next = 47;
                  break;
                }

                // ® Must be exactly this thing (useful for required checkboxes)
                violation = ruleRhs !== fieldValue;
                _context4.next = 74;
                break;

              case 47:
                if (!(ruleName === 'minLength' && _.isNumber(ruleRhs))) {
                  _context4.next = 51;
                  break;
                }

                // ® Must consist of at least this many characters
                violation = !_.isString(fieldValue) || fieldValue.length < ruleRhs;
                _context4.next = 74;
                break;

              case 51:
                if (!(ruleName === 'maxLength' && _.isNumber(ruleRhs))) {
                  _context4.next = 55;
                  break;
                }

                // ® Must consist of no more than this many characters
                violation = !_.isString(fieldValue) || fieldValue.length > ruleRhs;
                _context4.next = 74;
                break;

              case 55:
                if (!(ruleName === 'sameAs' && ruleRhs !== '' && _.isString(ruleRhs))) {
                  _context4.next = 61;
                  break;
                }

                // ® Must match the value in another field
                otherFieldName = ruleRhs;
                otherFieldValue = formData[otherFieldName];
                violation = otherFieldValue !== fieldValue;
                _context4.next = 74;
                break;

              case 61:
                if (!(ruleName === 'isHalfwayDecentPassword' && (ruleRhs === true || ruleRhs === false))) {
                  _context4.next = 65;
                  break;
                }

                // ® Must be a halfway-decent password
                // > This is an arbitrary distinction, so change it if you want.
                // > Just... please use common sense.  And try to avoid engaging
                // > in security theater.
                if (ruleRhs === false) {
                  violation = false;
                } else {
                  violation = !_.isString(fieldValue) && !_.isNumber(fieldValue) || fieldValue.length < 6;
                }

                _context4.next = 74;
                break;

              case 65:
                if (!(ruleName === 'regex')) {
                  _context4.next = 69;
                  break;
                }

                // ® Must match the regex specified
                violation = !ruleRhs.test(fieldValue);
                _context4.next = 74;
                break;

              case 69:
                if (!(ruleName === 'custom' && _.isFunction(ruleRhs))) {
                  _context4.next = 73;
                  break;
                }

                // ® Provided function must return truthy when invoked with the value.
                try {
                  violation = !ruleRhs(fieldValue);
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.warn(err);
                  violation = true;
                }

                _context4.next = 74;
                break;

              case 73:
                throw new Error('Cannot interpret client-side validation rule (`' + ruleName + '`) because the configuration provided for it is not recognized by <ajax-form>.\n [?] If you\'re unsure, visit https://sailsjs.com/support');

              case 74:
                if (!violation) {
                  _context4.next = 77;
                  break;
                }

                formErrors[fieldName] = ruleName;
                return _context4.abrupt("break", 79);

              case 77:
                _context4.next = 23;
                break;

              case 79:
                _context4.next = 19;
                break;

              case 81:
                //∞
                // Whether there are any errors or not, update userland "formErrors" prop
                // so that the markup reflects the new reality (i.e. inline validation errors
                // either get rendered or go away.)
                this.$emit('update:formErrors', formErrors); // If there were any form errors, avast.  (Submission will not be attempted.)

                if (!(Object.keys(formErrors).length > 0)) {
                  _context4.next = 85;
                  break;
                }

                // In development mode, also log a warning
                // (so that it's clear what's going on just in case validation
                // states/messages are not hooked up in the HTML template)
                if (this._environment !== 'production') {
                  // eslint-disable-next-line no-console
                  console.warn("<ajax-form> encountered ".concat(Object.keys(formErrors).length, " form error").concat(Object.keys(formErrors).length !== 1 ? 's' : '', " when performing client-side validation of \"form-data\" versus \"form-rules\".  (Note: This warning is only here to assist with debugging-- it will not be displayed in production.  If you're unsure, check out https://sailsjs.com/support for more resources.)"), _.cloneDeep(formErrors));
                } //ﬁ


                return _context4.abrupt("return");

              case 85:
                //ﬁ  (determining argins)
                debugger; // Set syncing state to `true` on userland "syncing" prop.

                this.$emit('update:syncing', true); // Submit the form

                if (!this.handleSubmitting) {
                  _context4.next = 113;
                  break;
                }

                _context4.prev = 88;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // FUTURE: Consider cloning the argins ahead of time to prevent accidental mutation of form data.
                // (but remember argins could contain File instances that might not be clone-able)
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // eslint-disable-next-line no-console
                console.log('handleSubmitting handle called on form');
                _context4.next = 92;
                return this.handleSubmitting(argins);

              case 92:
                result = _context4.sent;
                _context4.next = 111;
                break;

              case 95:
                _context4.prev = 95;
                _context4.t4 = _context4["catch"](88);
                rawErrorFromCloudSDK = _context4.t4;

                if (!(_.isString(_context4.t4) && _context4.t4 !== '')) {
                  _context4.next = 102;
                  break;
                }

                failedWithCloudExit = _context4.t4;
                _context4.next = 111;
                break;

              case 102:
                if (!(_.isError(_context4.t4) && _context4.t4.exit)) {
                  _context4.next = 106;
                  break;
                }

                failedWithCloudExit = _context4.t4.exit;
                _context4.next = 111;
                break;

              case 106:
                if (!(_.isObject(_context4.t4) && !_.isError(_context4.t4) && !_.isArray(_context4.t4) && !_.isFunction(_context4.t4) && Object.keys(_context4.t4)[0] && _.isString(Object.keys(_context4.t4)[0]))) {
                  _context4.next = 110;
                  break;
                }

                failedWithCloudExit = Object.keys(_context4.t4)[0];
                _context4.next = 111;
                break;

              case 110:
                throw _context4.t4;

              case 111:
                _context4.next = 117;
                break;

              case 113:
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // FUTURE: Potentially filter unused data in argins here before proceeding
                // (assuming cloudsdk has that information available)
                // Or better yet, just have `Cloud.*.with()` take care of that automatically.
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                protocol = this.protocol || 'jQuery';
                _context4.next = 116;
                return Cloud[this.action]["with"](argins).protocol(protocol).tolerate(function (err) {
                  rawErrorFromCloudSDK = err;
                  failedWithCloudExit = err.exit || 'error';
                });

              case 116:
                result = _context4.sent;

              case 117:
                // When a cloud error occurs, tolerate it, but set the userland "cloudError"
                // prop accordingly.
                if (failedWithCloudExit) {
                  this.$emit('update:cloudError', failedWithCloudExit);
                } // Set syncing state to `false` on userland "syncing" prop.


                this.$emit('update:syncing', false); // If the server says we were successful, then emit the "submitted" event.

                if (!failedWithCloudExit) {
                  this.$emit('submitted', result);
                } else {
                  this.$emit('rejected', rawErrorFromCloudSDK);
                }

              case 120:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[88, 95]]);
      }));

      function _submit() {
        return _submit2.apply(this, arguments);
      }

      return _submit;
    }()
  }
});
