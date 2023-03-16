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
import * as _ from 'lodash';
parasails.registerPage('upload-products', {
    data: {
        syncing: false,
        cloudError: '',
        formErrors: {},
        vendorId: -1,
        supplierName: '',
        uploadName: '',
        upload: null,
        formRules: {
            vendorId: {
                required: true,
                min: 1,
            },
            supplierName: {
                required: true,
                maxLength: 150,
            },
        },
    },
    beforeMount: function () { },
    mounted: function () {
        return __awaiter(this, void 0, void 0, function* () {
            _.extend(this, SAILS_LOCALS);
        });
    },
    filters: {
        capitalise: function (value) {
            if (!value) {
                return '';
            }
            value = value.toString();
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
    },
    methods: {
        changeFileInput: function (files) {
            try {
                this.syncing = true;
                if (files.length !== 1 && !this.upload) {
                    const errStr = 'Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.';
                    this.formErrors.upload = errStr;
                    throw new Error(errStr);
                }
                var selectedFile = files[0];
                if (!selectedFile && this.upload) {
                    return;
                }
                this.uploadName = selectedFile.name;
                this.upload = selectedFile;
                this.formErrors.upload = '';
                this.syncing = false;
            }
            catch (error) {
                this.syncing = false;
                const errStr = `changeFileInput function errored: ${error}`;
                this.formErrors.upload = errStr;
                throw new Error(errStr);
            }
        },
        csvUploadSubmitted: function (success) {
            if (success) {
                this.showToast(`Products uploaded`, () => {
                    window.history.pushState({}, '', '/admin/vendors/' + this.vendorId);
                });
            }
        },
        prepareFormForUpload: function () {
            return {
                vendorId: this.vendorId,
                supplierName: this.supplierName,
                upload: this.upload,
            };
        },
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
    },
});
//# sourceMappingURL=upload-products.page.js.map