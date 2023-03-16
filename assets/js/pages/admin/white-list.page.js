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
parasails.registerPage('white-list', {
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
        toggleVerifyAccount: function (walletAddress) {
            return function (event) {
                var that = this;
                const verified = event.target.value;
                Cloud.verifyWalletAccount(walletAddress, verified).then(() => {
                    if (verified) {
                        this.showToast(`Account added to whitelist`);
                    }
                    else {
                        that.showToast(`Account removed from whitelist`);
                    }
                });
            };
        },
    },
});
//# sourceMappingURL=white-list.page.js.map