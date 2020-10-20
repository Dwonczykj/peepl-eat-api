var urlParams = new URLSearchParams(window.location.search);
var wallet = urlParams.get('wallet') || '0xd72625cca6d607b8fa5106552c2f08690b3c4356';
var walletSnippet = wallet.substring(wallet.length - 6);
var url = 'https://h43v4kftw0.execute-api.eu-west-1.amazonaws.com/test/sendsms';

jQuery(function ($) {
    $('.js-wallet-reference').each(function () {
        $(this).text(walletSnippet);
    });

    $('.js-show-sms-details').on('click', function () {
        $('.peepl-topup').addClass('peepl-topup--sms');
        setTimeout(function () {
            $('#tel').focus();
        }, 100);
    });

    $('.js-hide-sms-details').on('click', function () {
        $('.peepl-topup').removeClass('peepl-topup--sms');
    });

    $('.js-sms-details').on('submit', function (event) {
        event.preventDefault();

        var $form = $(this);
        $form.addClass('sending');
        $form.find('.js-sms-error').remove();

        var smsSuccess = function (data, textStatus, jqXHR) {
            $form.removeClass('sending').addClass('sent');
            setTimeout(function(){
                $form.removeClass('sent');
            }, 5000);
        };

        var smsError = function (jqXHR, textStatus, errorThrown) {
            var html = 'Hmmm… ';
            if ( jqXHR.responseJSON && jqXHR.responseJSON.code ) {
                html += 'Are you sure that’s a valid UK phone number? ';
                html += '<small class="d-block">(Twilio API error code ' + jqXHR.responseJSON.code + ')</small>';
            } else {
                html += 'Something went wrong. Maybe try again later?';
            }
            $form.removeClass('sending');
            showError(html);
        };

        var showError = function(html) {
            var $error = $('<div class="alert alert-danger js-sms-error">');
            $error.html(html);
            $error.appendTo('.js-sms-details');
        };

        $.ajax({
            url: url,
            data: {
                number: $('#tel').val().replace(/[^0-9+]/gi, ''),
                reference: walletSnippet
            },
            success: smsSuccess,
            error: smsError
        });
    });
});