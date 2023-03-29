var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
parasails.registerPage('waiting-list', {
    data: {
        accounts: [],
    },
    beforeMount: function () {
    },
    mounted: function () {
        return __awaiter(this, void 0, void 0, function* () {
        });
    },
    methods: {
        showToast: function (message, cb) {
            Toastify({
                text: message,
                duration: 1000,
                destination: './',
                newWindow: true,
                close: false,
                gravity: 'top',
                position: 'right',
                stopOnFocus: true,
                style: {
                    background: 'linear-gradient(to right, #00b09b, #96c93d)',
                },
                onClick: function () { },
                callback: cb,
            }).showToast();
        },
        toggleOnboardUserEmail: function (email) {
            return function (event) {
                var that = this;
                const onboarded = event.target.value;
                Cloud.onboardUserEmailFromWaitingList(email, onboarded).then(() => {
                    if (onboarded) {
                        this.showToast(`Email added to waitinglist`);
                    }
                    else {
                        that.showToast(`Email removed from waitinglist`);
                    }
                });
            };
        },
    },
});
//# sourceMappingURL=waiting-list.page.js.map