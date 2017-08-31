'use strict';

const axios = require('axios').default;
axios.defaults.baseURL = 'https://api.entrenue.com';

const unescape = require('unescape');
const errors = require('./errors');

const keys = require('./keys');

const Shopify = require('shopify-api-node');

const shopify = new Shopify({
    shopName: keys.SHOPIFY_SHOPNAME,
    apiKey: keys.SHOPIFY_API_KEY,
    password: keys.SHOPIFY_PASSWORD
})

const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_PAGE = 1;

const GET_PRODUCTS = 'getproducts';
const ADD_PRODUCTS = 'addproducts';
const DELETE_PRODUCTS = 'deleteproducts';

const PAGE_RE = /^page=/i;
const PAGE_SIZE_RE = /^count=/i;

const productsToDelete = require('./productsToDelete');
const productsToAdd = require('./productsToAdd');

console.log(process.argv);

switch(process.argv.length) {
    case 0:
    case 1:
        errors.reportError({
            error: 'Did not give enough arguments to program',
            program: 'STOPPED'
        });
        break;
    case 2:
        //default to getting products
        getEntrenueProducts(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
        break;
    default:
        let command = process.argv[2];
        if(command.toLowerCase() === GET_PRODUCTS) {
            let {pageSize, page} = parseProductArgs();
            getEntrenueProducts(page, pageSize);
        } else if(command.toLowerCase() === ADD_PRODUCTS) {
            addEntrenueProducts();
        } else if(command.toLowerCase() === DELETE_PRODUCTS) {
            deleteShopifyProducts();
        } else {
            errors.reportError({
                error: command + ' is not a recognized command',
                program: 'STOPPED'
            });
        }
}

function getEntrenueProducts(page, pageSize) {
    axios.get('/products', {
        params: {
            email: keys.ENTRENUE_API_USERNAME,
            apikey: keys.ENTRENUE_API_KEY,
            pagination: pageSize,
            page: page
        }
    })
    .then(res => {
        showEntrenueProducts(res.data.data);
    })
    .catch(err => {
        console.log("There was an error fetching the Entrenue Products");
        console.log("Below is a full error message: ");
        errors.reportError(err);
    })
}

function showEntrenueProducts(products) {
    products.forEach(product => {
        console.log('NAME: ' + unescape(product.name));
        console.log('MODEL: ' + product.model);
        console.log('DESCRIPTION: ' + unescape(product.description));
        console.log('MANUFACTURER: ' + unescape(product.manufacturer));
        console.log('PRICE: ' + product.price);
        console.log('TAGS: ' + unescape(product.tags));
        console.log('CATEGORIES: ' + unescape(product.categories));
        console.log('-------------------------------------------------------');
    });
}

function delay(t) {
    return new Promise(resolve => {
        setTimeout(resolve, t);
    });
}

function addEntrenueProducts() {
    let queries = [];
    let timeoutWait = 0;
    productsToAdd.forEach(model => {
        //entrenue call
        //then, shopify call
        let productPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                axios.get('/products', {
                    params: {
                        email: keys.ENTRENUE_API_USERNAME,
                        apikey: keys.ENTRENUE_API_KEY,
                        model: model
                    }
                })
                .then(results => {
                    console.log("fetched Entrenue product " + results.data.data[0].name);
                    let shopifyProduct = convertToShopifyProduct(results.data.data[0]);
                    return shopify.product.create(shopifyProduct);
                }, err => {
                    console.log('Call to Entrenue for model ' + model + ' errored. Ignoring.')
                    errors.reportError({
                        error: err,
                        program: 'CONTINUING'
                    });
                })
                .then(product => {
                    if(product.id) {
                        console.log("SUCCESS: Product with id " + product.id + " and title " + product.title + " was successfully created!");
                        resolve(product);
                    }
                })
                .catch(err => {
                    reject({err, model});
                });
            }, timeoutWait++);
        });
        queries.push(productPromise);
    });
    Promise.all(queries)
        .then(results => {
            console.log("Products were successfully added! There may have been errors reported above. Clear the file list accordingly.");
        })
        .catch(err => {
            console.log('Something went wrong in trying to convert the Entrenue model ' + err.model + ' into a Shopify product');
            console.log("Check the above SUCCESS messages to see which, if any, products were successfully added to Shopify");
            console.log("Below is the full error message: ");
            errors.reportError(err.err);
        });
}

function convertToShopifyProduct(entrenueProduct) {
    return {
        title: entrenueProduct.name,
        body_html: unescape(entrenueProduct.description),
        vendor: 'modernaphrodite',
        images: [{
            src: entrenueProduct.image
        }],
        product_type: entrenueProduct.manufacturer,
        variants: [{
            price: entrenueProduct.price,
            sku: entrenueProduct.model
        }]
    };
}

function deleteShopifyProducts() {
    //for each id, add delete query
    //Promise.all that ish
    let queries = [];
    let timeoutWait = 0;
    productsToDelete.forEach(id => {
        queries.push(
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    shopify.product.delete(id)
                    .then(res => {
                        console.log("SUCCESS: Product with id " + id + " was deleted");
                        resolve(res);
                    })
                    .catch(err => {
                        reject({id: id, err: err});
                    });
                }, timeoutWait++);
            })
        );
    });
    Promise.all(queries)
        .then(results => {
            console.log("All products were successfully deleted. Don't forget to clear them from the file list!");
        })
        .catch(err => {
            console.log("Product with id " + err.id + "failed to be deleted.");
            console.log("Check the above SUCCESS messages to see which, if any, products were deleted");
            console.log("Below is an error message: ");
            errors.reportError(err.err);
        });
}

function parseProductArgs() {
    let page = DEFAULT_PAGE;
    let pageSize = DEFAULT_PAGE_SIZE;
    if(process.argv.length > 3) {
        let index;
        for(let i = 3; i < process.argv.length; i++) {
            //if arg page-prefixed, assign value if number
            if(PAGE_RE.test(process.argv[i])) {
                let pageArg = parseInt(RegExp.rightContext, 10);
                if(!isNaN(pageArg)) {
                    page = pageArg;
                } else {
                    errors.reportError({
                        error: process.argv[i] + " is not a number. Page will use default value of " + DEFAULT_PAGE,
                        program: 'CONTINUING'
                    });
                }
            } else if(PAGE_SIZE_RE.test(process.argv[i])) {
                let pageSizeArg = parseInt(RegExp.rightContext, 10);
                if(!isNaN(pageSizeArg)) {
                    pageSize = pageSizeArg;
                } else {
                    errors.reportError({
                        error: process.argv[i] + " is not a number. Page Size will use default value of " + DEFAULT_PAGE_SIZE,
                        program: 'CONTINUING'
                    });
                }
            } else {
                errors.reportError({
                    error: process.argv[i] + " is not a recognized argument. Is ignored.",
                    program: 'CONTINUING'
                });
            }
        }
    }
    return {pageSize, page};
}