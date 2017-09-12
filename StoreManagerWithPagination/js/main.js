// starts  ------------------
$(function() {
  var options = {
    url: 'data/product.json',
    $storeContainer: $('div[data-container="product-store"]'),
  },
      store = new StoreManager(options);
  store.initialize();
});
