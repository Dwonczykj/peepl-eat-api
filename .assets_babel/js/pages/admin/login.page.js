"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _app = require("firebase/app");

var _auth = require("firebase/auth");

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

parasails.registerPage('login', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formErrors: {},
    countryCode: '44',
    phoneNoCountry: '',
    //TODO: remove this from commit APIKEY
    preventNextIteration: false,
    verificationCode: '',
    viewVerifyCodeForm: false,
    rememberMe: false,
    _hideRecaptcha: false
  },
  computed: {
    // * Getter -> a computed getter so that computed each time we access it
    phoneNumber: function phoneNumber() {
      return "+".concat(this.countryCode, " ").concat(this.phoneNoCountry);
    },
    phoneNoCountryNoFormat: function phoneNoCountryNoFormat() {
      return this.phoneNoCountry.replace(/-/g, '').match(/(\d{1,10})/g)[0];
    },
    phoneNoCountryFormatted: function phoneNoCountryFormatted() {
      // Format display value based on calculated currencyValue
      return this.phoneNoCountryNoFormat.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
    }
  },
  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: function () {
    var _mounted = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var config;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = {
                apiKey: 'AIzaSyB9hAjm49_3linYAcDkkEYijBiCoObXYfk',
                //! apiKey is fine: See: https://firebase.google.com/docs/projects/api-keys
                authDomain: 'vegiliverpool.firebaseapp.com',
                projectId: 'vegiliverpool',
                storageBucket: 'vegiliverpool.appspot.com',
                messagingSenderId: '526129377',
                appId: '1:526129377:web:a0e4d54396cbdebe70bfa0',
                measurementId: 'G-YZCWVWRNKN'
              };
              (0, _app.initializeApp)(config); // this.createRecaptcha();
              // this.$focus('[autofocus]');

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function mounted() {
      return _mounted.apply(this, arguments);
    }

    return mounted;
  }(),
  // exits: {
  //   badPhoneNumberFormat: {
  //     description: 'Please ensure number is of format: "+ 1 234-567-8910"'
  //   },
  //   badVerificationCode: {
  //     description: 'Please ensure verification code is 6 digits: "123456"'
  //   },
  // },
  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createRecaptcha: function createRecaptcha() {
      var _this = this;

      var auth = (0, _auth.getAuth)(); //TODO: Switch to invisible?
      // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      //   'size': 'invisible',
      //   'callback': (response) => {
      //     window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString());
      //     //unhide phone number form
      //     document.getElementById('numberForm').removeAttribute('hidden');
      //     return this.clickVerifyPhoneNumber(widgetId);
      //   },
      //   'expired-callback': () => {
      //     window.alert('repatcha expired callback called');
      //   }
      // }, auth);

      window.recaptchaVerifier = new _auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': function callback(response) {
          // window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString());
          console.log('createRecaptcha callback'); //unhide phone number form

          _this.viewForm = 'numberForm';
          document.getElementById('numberForm').classList.remove('hidden');
          console.log('Invisible Recaptcha callback called');
          return _this.clickVerifyPhoneNumber();
        },
        'expired-callback': function expiredCallback() {
          window.alert('recatcha expired!');
        }
      }, auth); // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      //   'size': 'normal',
      //   'callback': (response) => {
      //     // Note: Called when the recaptcha is verified
      //     // window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString());
      //     //unhide phone number form
      //     document.getElementById('start-recaptcha').classList.remove('hidden');
      //     this.viewForm = 'numberForm';
      //     document.getElementById('numberForm').classList.remove('hidden');
      //     return this.clickVerifyPhoneNumber();
      //   },
      //   'expired-callback': () => {
      //     window.alert('recatcha expired!');
      //   }
      // }, auth);

      var elements = document.querySelectorAll('[role="alert"]');

      for (var el in elements) {
        if (el && el.classList) {
          el.classList.remove('hidden');
        }
      }
    },
    clickVerifyPhoneNumber: function () {
      var _clickVerifyPhoneNumber = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var _this2 = this;

        var phoneNumber, appVerifier, userExists, auth, _signInToFirebase, user;

        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // const phoneNumber = document.getElementById('phoneNumber').value;
                console.log('clickVerifyPhoneNumber');
                phoneNumber = this.phoneNumber;
                appVerifier = window.recaptchaVerifier;
                document.getElementById('verificationCode').focus();
                document.getElementById('recaptcha-container').classList.add('hidden'); // document.getElementById('recaptcha-container').classList.remove('hidden');

                _context2.next = 7;
                return Cloud.userExistsForPhone(this.countryCode, this.phoneNoCountryNoFormat);

              case 7:
                userExists = _context2.sent;

                if (userExists) {
                  _context2.next = 14;
                  break;
                }

                this.syncing = false;
                this.formErrors.phoneNumber = true;
                this.formErrors.countryCode = true;
                this.cloudError = 'userNotFound';
                return _context2.abrupt("return");

              case 14:
                console.log('fetching SMS Code for phoneNumber');
                auth = (0, _auth.getAuth)();

                _signInToFirebase = function _signInToFirebase() {
                  return (0, _auth.signInWithPhoneNumber)(auth, phoneNumber, appVerifier).then(function (confirmationResult) {
                    // SMS sent. Prompt user to type the code from the message, then sign the
                    // user in with confirmationResult.confirm(code).
                    window.confirmationResult = confirmationResult;
                    console.log('clickVerifyPhoneNumber.signInWithPhoneNumber callback');
                    document.getElementById('numberForm').classList.add('hidden');
                    document.getElementById('verificationForm').classList.remove('hidden');
                    _this2.syncing = false;
                    return confirmationResult; // ...
                  })["catch"](function (error) {
                    // Error; SMS not sent
                    // ...
                    window.alert('verify phone number failed' + error);
                    _this2.syncing = false;
                    window.recaptchaVerifier.render().then(function (widgetId) {
                      window.recaptchaVerifier._reset(widgetId); // document.getElementById('register').classList.add('hidden');
                      // document.getElementById('start-recaptcha').classList.add('hidden');


                      document.getElementById('login-button-container').classList.add('hidden');
                      return _this2.clickVerifyPhoneNumber(widgetId);
                    });
                  });
                };

                if (!this.rememberMe) {
                  _context2.next = 24;
                  break;
                }

                _context2.next = 20;
                return (0, _auth.setPersistence)(auth, _auth.browserSessionPersistence).then(function () {
                  // Existing and futurd(auth, email, password);
                  return _signInToFirebase();
                });

              case 20:
                user = _context2.sent;
                return _context2.abrupt("return", user);

              case 24:
                _context2.next = 26;
                return _signInToFirebase();

              case 26:
                return _context2.abrupt("return", _context2.sent);

              case 27:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function clickVerifyPhoneNumber() {
        return _clickVerifyPhoneNumber.apply(this, arguments);
      }

      return clickVerifyPhoneNumber;
    }(),
    diplayErrorFields: function diplayErrorFields(hide) {
      hide = !!hide;
      var elements = document.querySelectorAll('[role="alert"]');

      for (var el in elements) {
        if (hide && el.classList) {
          el.classList.add('hidden');
        } else {
          el.classList.remove('hidden');
        }
      }
    },
    phoneNumberFocusOut: function phoneNumberFocusOut(event) {
      if (['Arrow', 'Backspace', 'Shift'].includes(event.key)) {
        this.preventNextIteration = true;
        return;
      }

      if (this.preventNextIteration) {
        this.preventNextIteration = false;
        return;
      }

      this.phoneNoCountry = this.phoneNoCountryFormatted;
    },
    loadFirstCaptchaUser: function () {
      var _loadFirstCaptchaUser = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var _this3 = this;

        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.syncing = true;

                if (!window.recaptchaVerifier) {
                  this.createRecaptcha();
                }

                _context3.prev = 2;

                if (!(this.phoneNumber && Object.keys(this.formErrors).length < 1)) {
                  _context3.next = 6;
                  break;
                }

                document.getElementById('recaptcha-container').classList.remove('hidden');
                return _context3.abrupt("return", window.recaptchaVerifier.render().then(function (widgetId) {
                  _this3.syncing = false; // document.getElementById('register').classList.add('hidden');
                  // document.getElementById('start-recaptcha').classList.add('hidden');

                  document.getElementById('login-button-container').classList.add('hidden');

                  if (_this3._hideRecaptcha) {
                    return _this3.clickVerifyPhoneNumber();
                  } else {
                    return;
                  }
                }));

              case 6:
                _context3.next = 12;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](2);
                this.syncing = false;
                return _context3.abrupt("return", undefined);

              case 12:
                this.syncing = false;
                return _context3.abrupt("return", undefined);

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[2, 8]]);
      }));

      function loadFirstCaptchaUser() {
        return _loadFirstCaptchaUser.apply(this, arguments);
      }

      return loadFirstCaptchaUser;
    }(),
    clickCheckVerificationCode: function () {
      var _clickCheckVerificationCode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var code, token, confirmationResult, result, user;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                code = this.verificationCode.trim();

                if (!code) {
                  _context4.next = 30;
                  break;
                }

                token = '';
                _context4.prev = 3;
                _context4.next = 6;
                return window.confirmationResult.confirm(code);

              case 6:
                confirmationResult = _context4.sent;
                result = confirmationResult; //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#retrieve_id_tokens_on_clients

                _context4.next = 10;
                return result.user.getIdToken(true);

              case 10:
                token = _context4.sent;
                //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#:~:text=Retrieve%20ID%20tokens%20on%20clients%20When%20a%20user,user%20or%20device%20on%20your%20custom%20backend%20server.
                // var refreshToken = await result.user.getRefreshToken(true);
                console.log(token);
                _context4.next = 18;
                break;

              case 14:
                _context4.prev = 14;
                _context4.t0 = _context4["catch"](3);
                window.alert('Firebase unable to confirm the verificationCode and threw');
                return _context4.abrupt("return");

              case 18:
                _context4.prev = 18;
                _context4.next = 21;
                return Cloud.loginWithFirebase(this.phoneNumber, token);

              case 21:
                user = _context4.sent;
                window.location.replace('/admin');
                _context4.next = 28;
                break;

              case 25:
                _context4.prev = 25;
                _context4.t1 = _context4["catch"](18);

                // User couldn't sign in (bad verification code?)
                if (_context4.t1.status === 404) {
                  window.location.replace('/admin/signup');
                } else {
                  if (_context4.t1.name === 'FirebaseError') {
                    console.log(_context4.t1);
                  } else {
                    console.log(_context4.t1);
                  }

                  window.alert(_context4.t1);
                }

              case 28:
                _context4.next = 32;
                break;

              case 30:
                window.alert('Verification code was empty! Please add SMS Code!');
                throw new Error('badVerificationCode');

              case 32:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[3, 14], [18, 25]]);
      }));

      function clickCheckVerificationCode() {
        return _clickCheckVerificationCode.apply(this, arguments);
      }

      return clickCheckVerificationCode;
    }(),
    // * navigation functions
    toRegister: function toRegister() {
      window.location.replace('/admin/signup');
    },
    toLoginWithPassword: function toLoginWithPassword() {
      window.location.replace('/admin/login-with-password');
    },
    // * Front End Form Valiadation, parse and styling functions
    parseNumberInputsToArgIns: function parseNumberInputsToArgIns() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};
      var firebasePhoneRegex = /^\+\d{1,2} \d{3}-\d{3}-\d{4}$/;
      var inputText = this.phoneNumber.trim();
      var argins = {
        'phoneNumber': inputText
      };

      if (inputText.match(firebasePhoneRegex)) {
        this.phoneNumber = argins['phoneNumber'];
        return argins;
      } else {
        this.formErrors.phoneNumber = true; // throw new Error('badPhoneNumberFormat');

        return undefined; //Cancel Submission
      }
    },
    handleParsingFormFirebase: function handleParsingFormFirebase() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};
      var argins = this.formData; // Validate email:

      if (!argins.phoneNumber) {
        this.formErrors.phoneNumber = true;
      } // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)


      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },
    submittedVerifyCodeForm: function submittedVerifyCodeForm() {
      if (!this.cloudError) {
        this.syncing = true;
        location.replace('/admin');
      } else {
        this.cloudError = '';
      }
    },
    parseVerificationCodeToArgIns: function parseVerificationCodeToArgIns() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};
      var firebaseVerifCodeRegex = /^\d{6}$/;
      var inputText = this.verificationCode.trim();
      var argins = {
        'verificationCode': inputText
      };

      if (inputText.match(firebaseVerifCodeRegex)) {
        return argins;
      } else {
        this.formErrors.verificationCode = true; // throw new Error('badVerificationCode');
      }
    }
  }
});
