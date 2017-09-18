$(function() {
  var options = {
    url: 'data/product.json',
    $storeContainer: $('div[data-container="product-store"]'),
    paginationOptions: [3, 6, 9],
    sortingOptions: [['name', 'Name'], ['color', 'Color'], ['brand', 'Brand'], ['isSoldOut', 'Availability']],
    filterSelector: '[data-name="filter"]',
  },
      store = new StoreManager(options);
  store.initialize();
});
