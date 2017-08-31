# shopifyEntrenue
a shopify app that connects to the Entrenue dropshipper

## Needs:

**Homebrew**: So you can install other stuff

Paste the following into your terminal =>

  `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
  
Maybe you need to prefix the whole thing with "sudo"

**NPM and Node**: So you can run the stuff

Maybe you already have them. Type `npm -v` and `node -v' on your terminal. If you have 'em, then just type `brew upgrade node`

If you don't have them, then type `brew install node` in the terminal

## How to use

**Get and Set up project**

Type in terminal `git clone https://github.com/dbratz1177/shopifyEntrenue.git` to get it

Add a constants.js file with proper credentials

**Install packages**

Go to root folder (e.g. after running `git clone` command, type `cd shopifyEntrenue`)

Type in terminal `npm install`

**Running Stuff** - do it in the root folder

You can do three things with this:
- get a list of entrenue products
  - run `node index.js getproducts count=xxx page=yyy`
  - *count* is how many products you want to see
  - *page* is what page of products with the given *count* you input
    - Useful if you ran `node index.js getproducts count=10 page=1` and then wanted the second page: `node index.js getproducts count=10 page=2`
  - Don't need to include *count* or *page* => they have default values (100 and 1, respectively)
  - `node index.js` is effectively the same as `node index.js getproducts count=100 page=1`
- add products to Shopify
  - run `node index.js addproducts`
  - first, add Entrenue product model #'s to productsToAdd.js
- delete products from Shopify
  - run `node index.js deleteproducts`
  - first, add Shopify product id's to productsToDelete.js
