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
    formData: {
      emailAddress: '',
      phoneNumber: '',
      password: '',
      rememberMe: false
    },
    formErrors: {},
    formRules: {
      phoneNumber: {
        required: true,
        regex: /^\+?\d{0,13}$/
      },
      status: {}
    },
    userPhoneNumber: ''
  },
  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: function () {
    var _mounted = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var config, auth;
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
              (0, _app.initializeApp)(config);
              auth = (0, _auth.getAuth)(); // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
              //   'size': 'invisible', //TODO Set up fictional phone Numbers for testing
              //   'callback': (response) => {
              //     window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString());
              //     //unhide phone number form
              //     document.getElementById('numberForm').removeAttribute('hidden');
              //   },
              //   'expired-callback': () => {
              //     window.alert('repatcha expired callback called');
              //   }
              // }, auth);

              window.recaptchaVerifier = new _auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'normal',
                'callback': function callback(response) {
                  window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString()); //unhide phone number form

                  document.getElementById('numberForm').removeAttribute('hidden');
                },
                'expired-callback': function expiredCallback() {
                  window.alert('repatcha expired callback called');
                }
              }, auth); // this.$focus('[autofocus]');

            case 4:
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
  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    testButton: function testButton() {
      window.alert('testing!');
    },
    changeUserPhoneNumber: function changeUserPhoneNumber(phoneNumber) {
      this.userPhoneNumber = phoneNumber;
    },
    initFirebase: function initFirebase() {},
    loadFirstCaptchaUser: function loadFirstCaptchaUser() {
      window.recaptchaVerifier.render().then(function (widgetId) {});
    },
    clickVerifyPhoneNumber: function clickVerifyPhoneNumber() {
      var phoneNumber = document.getElementById('phoneNumber').value;
      var appVerifier = window.recaptchaVerifier;

      var isValidPhoneNumber = function isValidPhoneNumber(phoneNumber) {
        return !!phoneNumber;
      };

      if (isValidPhoneNumber(phoneNumber)) {
        var auth = (0, _auth.getAuth)();
        (0, _auth.signInWithPhoneNumber)(auth, phoneNumber, appVerifier).then(function (confirmationResult) {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          window.confirmationResult = confirmationResult;
          window.alert('Input verification code');
          document.getElementById('numberForm').setAttribute('hidden', true);
          document.getElementById('verificationForm').removeAttribute('hidden'); // ...
        })["catch"](function (error) {
          // Error; SMS not sent
          // ...
          window.alert('verify phone number failed' + error);
          window.recaptchaVerifier.render().then(function (widgetId) {
            debugger;
            window.recaptchaVerifier.reset(widgetId);
          });
        });
      }
    },
    // onSignInSubmit: function () {
    //   signInWithPhoneNumber(document.getElementById("phoneNumber"), window.recaptchaVerifier)
    //       .then((confirmationResult) => {
    //         window.confirmationResult = confirmationResult;
    //         window.alert(confirmationResult);
    //         document.getElementById("numberForm").setAttribute("hidden", true);
    //         document.getElementById("verificationForm").removeAttribute("hidden");
    //       })
    //       .catch((err) => {
    //         window.alert(err);
    //       });
    // },
    verifyCodeSubmit: function verifyCodeSubmit() {
      var code = document.getElementById('verificationcode').value;

      if (code) {
        window.confirmationResult.confirm(code).then(function (result) {
          // window.alert(result);
          // User signed in successfully.
          var user = result.user;
          window.alert(user.phoneNumber); //TODO: send user cerdentials using Cloud.* to backend.
        })["catch"](function (error) {
          // User couldn't sign in (bad verification code?)
          window.alert(error);
        }); // Alternatively, can sign in by getting the credential
        // var credential = PhoneAuthProvider.credential(confirmationResult.verificationId, code);
        // signInWithCredential(credential);
      } else {
        window.alert('Verification code was empty! Please add SMS Code!');
      }
    },
    // clickInitFirebaseButton: async function () {
    //   // https://firebaseopensource.com/projects/firebase/firebaseui-web/#using_firebaseui%20for%20authentication
    //   // https://firebase.google.com/docs/auth/web/phone-auth
    //   const auth = getAuth();
    //   // // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
    //   // window.recaptchaVerifier = new RecaptchaVerifier('firebase-sign-in-button', {
    //   //   'size': 'invisible',
    //   //   'callback': (response) => {
    //   //     // reCAPTCHA solved, allow signInWithPhoneNumber.
    //   //     console.debug(response);
    //   //     debugger;
    //   //   }
    //   // }, auth);
    //   // FirebaseUI config.
    //   // var uiConfig = {
    //   //   signInSuccessUrl: '/admin',
    //   //   signInOptions: [
    //   //     // Leave the lines as is for the providers you want to offer your users.
    //   //     // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //   //     // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //   //     // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    //   //     // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    //   //     // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //   //     // eslint-disable-next-line no-undef
    //   //     firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    //   //     // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    //   //   ],
    //   //   // tosUrl and privacyPolicyUrl accept either url string or a callback
    //   //   // function.
    //   //   // Terms of service url/callback.
    //   //   tosUrl: 'https://vegiapp.co.uk/privacy',
    //   //   // Privacy policy url/callback.
    //   //   privacyPolicyUrl: function () {
    //   //     window.location.assign('https://vegiapp.co.uk/privacy');
    //   //   }
    //   // };
    //   // // Initialize the FirebaseUI Widget using Firebase.
    //   // // eslint-disable-next-line no-undef
    //   // var ui = new firebaseui.auth.AuthUI(firebase.auth());
    //   // // The start method will wait until the DOM is loaded.
    //   // ui.start('#firebaseui-auth-container', uiConfig);
    // },
    // fetch6DCode: async function () {
    //   //TODO: show the iframe and wait for user to input the code.
    // },
    // handleSignInFirebase: async function () {
    //   // const appVerifier = window.recaptchaVerifier;
    //   // //TODO: Add RemememberMe like in login-with-firebase.ts api endpoint setPersistence f-wrap.
    //   // const auth = getAuth();
    //   // const rememberMe = this.formData.rememberMe;
    //   // signInWithPhoneNumber(auth, this.formData.phoneNumber, appVerifier)
    //   //     .then( async (confirmationResult) => {
    //   //       // SMS sent. Prompt user to type the code from the message, then sign the
    //   //       // user in with confirmationResult.confirm(code).
    //   //       window.confirmationResult = confirmationResult;
    //   //       const verify6DCode = await fetch6DCode(); //TODO: Workout how to implement this using the docs.
    //   //       const userCredential = await confirmationResult.confirm(verify6DCode);
    //   //       const firebaseSessionToken = await userCredential.user.getIdToken();
    //   //       //TODO: Call the login-with-firebase api method with the token from this confirmationResult.
    //   //       Cloud.loginWithFirebase(firebaseSessionToken, rememberMe)
    //   //         .then(() => {
    //   //           window.location = '/admin';
    //   //         });
    //   //       // ...
    //   //     }).catch((error) => {
    //   //       // Error; SMS not sent
    //   //       // ...
    //   //     });
    // },
    // handleParsingForm: function () {
    //   // Clear out any pre-existing error messages.
    //   this.formErrors = {};
    //   var argins = this.formData;
    //   // Validate email:
    //   if (!argins.emailAddress) {
    //     this.formErrors.emailAddress = true;
    //   }
    //   // Validate password:
    //   if (!argins.password) {
    //     this.formErrors.password = true;
    //   }
    //   // If there were any issues, they've already now been communicated to the user,
    //   // so simply return undefined.  (This signifies that the submission should be
    //   // cancelled.)
    //   if (Object.keys(this.formErrors).length > 0) {
    //     return;
    //   }
    //   return argins;
    // },
    // submittedForm: function () {
    //   this.syncing = true;
    //   location.replace('./admin');
    // },
    // handleParsingFormFirebase: function () {
    //   // Clear out any pre-existing error messages.
    //   this.formErrors = {};
    //   var argins = this.formData;
    //   // Validate email:
    //   if (!argins.phoneNumber) {
    //     this.formErrors.phoneNumber = true;
    //   }
    //   // If there were any issues, they've already now been communicated to the user,
    //   // so simply return undefined.  (This signifies that the submission should be
    //   // cancelled.)
    //   if (Object.keys(this.formErrors).length > 0) {
    //     return;
    //   }
    //   return argins;
    // },
    submittedFormFirebase: function submittedFormFirebase() {
      this.syncing = true;
      location.replace('./admin');
    }
  }
});
