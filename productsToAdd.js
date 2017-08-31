'use strict'

/**
 * Example: 
 * 
 * module.exports = [
 *  SOME_ENTRENUE_PRODUCT_MODEL_NUMBER,
 *  ANOTHER_ENTRENUE_PRODUCT_MODEL_NUMBER
 * ]
 * 
 * Usage: Clear the array after script runs successfully
 * so that the array is empty
 * 
 * Note: In terms of manually choosing products to add, using model numbers - 
 *  or some other uniquely identifying aspect like a name - is probably the simplest way
 *  for you to do so.
 *  However, it's pretty inefficient - Entrenue's API offers no way to get product information
 *  on a specified array of model #'s, and so there'll be a call per #.
 *  Shouldn't really be a big deal given that this functionality isn't going to be used too
 *  frequently, isn't a super time sensitive operation, and with a ceiling of number of model
 *  #'s that really isn't that high.
 *  If this becomes an issue, then we should talk about more efficient ways of going about
 *  this
 */

module.exports = [

];