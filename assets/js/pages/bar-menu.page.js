var destinationWallet = '0x47b2706a3af571142966d4eb73e1006ef84b4b74';

var fullPrices = {
    loveLaneLager: 5.00,
    pomegranateGinFizz: 7.50,
    ginAndTonic: 5.00,
    darkAndStormzy: 4.50,
    oolongTea: 3.00,
    elderflowerCollins: 7.50,
    mineralWater: 2.00,
    properScouseTapWater: 0.00
};

var reducedPrices = {
    loveLaneLager: 4.60,
    pomegranateGinFizz: 6.80,
    ginAndTonic: 4.50,
    darkAndStormzy: 4.10,
    oolongTea: 2.70,
    elderflowerCollins: 6.80,
    mineralWater: 1.80,
    properScouseTapWater: 0.00
};

var quantities = {
    loveLaneLager: 0,
    pomegranateGinFizz: 0,
    ginAndTonic: 0,
    darkAndStormzy: 0,
    oolongTea: 0,
    elderflowerCollins: 0,
    mineralWater: 0,
    properScouseTapWater: 0
};

// Is customer good or bad (i.e. did they travel by car)
var isGood = false;

var total = 0;

function setPrices (isGood) {
    total = 0;
    if (isGood) {
        $('.price').each(function (index, element) {
            $(this).text(reducedPrices[$(this).prop('id')].toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }));
        });
        for (var item in quantities) {
            total += quantities[item] * reducedPrices[item];
        }
    } else {
        $('.price').each(function (index, element) {
            $(this).text(fullPrices[$(this).prop('id')].toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }));
        });
        for (var item in quantities) {
            total += quantities[item] * fullPrices[item];
        }
    }
    $('#total').text(total.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }));
}

setPrices(false);

jQuery(function ($) {
    $('#travelMethod').change(function(e){
        if(this.value == 'good') {
            setPrices(true);
        } else {
            setPrices(false);
        }
    })

    $('.quantity').change(function(e){
        quantities[$(this).data('item')] = parseInt(this.value);

        total = 0;
        for(var item in quantities) {
            if(isGood) {
                total += quantities[item] * reducedPrices[item];
            } else {
                total += quantities[item] * fullPrices[item];
            }
        }

        $('#total').text(total.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }));
    })
    

});

var form = document.querySelector('#payment-form');

window.addEventListener("flutterInAppWebViewPlatformReady", function (event) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var paymentDetails = {
            action: 'pay',
            amount: total,
            currency: 'GBPx',
            destination: destinationWallet,
        };
        window.flutter_inappwebview.callHandler('pay', paymentDetails).then(function (result) {
            // get result from Flutter side. It will be the number 64.
            console.log(result);
        });
    });
});