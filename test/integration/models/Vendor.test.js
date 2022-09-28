// ./test/integration/models/Vendor.test.js

const { assert } = require('chai');
var util = require('util');

describe('Vendor (model)', () => {

    describe('Can get a vendor', () => {
        it('should return 1 vendor', (done) => {
            Vendor.find({ name: 'Delifonseca' })
                .then((vendors) => {
                    if (vendors.length !== 1) {
                        return done(new Error(
                            'Should return exactly 1 vendor.  ' +
                            'But instead, got: ' + util.inspect(vendors, { depth: null }) + ''
                        ));
                    }
                    return done();

                })
                .catch(done);
        });
    });
    describe('Can get a vendor\'s associations', () => {
        it('should return 1 vendor with 1 product', (done) => {
            Vendor.findOne({ name: 'Delifonseca' }).populate('products')
                .then((vendor) => {
                    assert(vendor.products && vendor.products.length === 1, 'Vendor should only have one Product named Burns night');
                    assert(vendor.products[0].name === 'Burns Night - Dine @ Home (For 1)');
                    return done();
                })
                .catch(done);
        });
        it('should return 1 vendor with 1 product with starter, main & dessert product options', (done) => {
            Vendor.findOne({ name: 'Delifonseca' }).populate('products&products.options&options.values')
                .then((vendor) => {
                    assert(vendor.products && vendor.products.length === 1, 'Vendor should only have one Product named Burns night');
                    assert(vendor.products[0].name === 'Burns Night - Dine @ Home (For 1)');
                    return done();
                })
                .catch(done);
        });
        it('should return 1 vendor with 1 product with 3 product categories for lunch, coffee and dinner', (done) => {
            Vendor.findOne({ name: 'Delifonseca' }).populate('productCategories')
                .then((vendor) => {
                    assert(vendor.productCategories && vendor.productCategories.length === 3, 'Vendor should have 3 productCategories');
                    const sortedCatNames = vendor.productCategories.map((pc) => pc.name).sort();
                    assert(sortedCatNames[0] === 'Coffee', 'First Product Category Name is Coffee');
                    assert(sortedCatNames[1] === 'Dinner', 'Second Product Category Name is Dinner');
                    assert(sortedCatNames[2] === 'Lunch', 'Third Product Category Name is Lunch');
                    return done();
                })
                .catch(done);
        });
        it('MultiQuery should return 1 vendor with 1 product with 3 product categories for lunch, coffee and dinner', (done) => {
            Vendor.findOne({ name: 'Delifonseca' }).populate('productCategories&products.options&options.values')
                .then((vendor) => {
                    assert(vendor.productCategories && vendor.productCategories.length === 3, 'Vendor should have 3 productCategories');
                    const sortedCatNames = vendor.productCategories.map((pc) => pc.name).sort();
                    assert(sortedCatNames[0] === 'Coffee', 'First Product Category Name is Coffee');
                    assert(sortedCatNames[1] === 'Dinner', 'Second Product Category Name is Dinner');
                    assert(sortedCatNames[2] === 'Lunch', 'Third Product Category Name is Lunch');
                    return done();
                })
                .catch(done);
        });
    });

});
