// store manager
function StoreManager(options) {
  this.url = options.url;
  this.$container = options.$storeContainer;
  this.$products = [];
  this.$filteredProducts = [];
}

// Product
function Product(product) {
  this.name = parseInt(product.name);
  this.color = product.color;
  this.brand = product.brand;
  this.isSoldOut = product.sold_out;
  this.imageUrl = product.url;
  this.$productDOM = $('<img>', {src: 'images/' + this.imageUrl}).addClass('product-image'); // contains product image (DOM)
}

StoreManager.prototype.initialize = function() {
  var _this = this;
  this.getProductData().done(function() {
    _this.createFilters();
    _this.createContentDisplayArea();
    _this.createProducts();
    _this.displayProducts();
    _this.bindEvents();
  });
};

// -----------------------------------------------------

// GET PRODUCTS DATA FROM JSON FILE
StoreManager.prototype.getProductData = function() {
  var _this = this;
  return $.ajax({
    url: _this.url,
    dataType: 'JSON',
    type: 'GET',

    success: function(response) {
      _this.productData = response; // save data
    },

    error: function(xhr, status) {
      console.log("error");
    }
  });
};

// ------------------------------

// FILTERS START
StoreManager.prototype.createFilters = function() {
  this.$filterContainer = $('<div>').addClass('filter-container');
  this.createBrandFilter();
  this.createColorFilter();
  this.createAvailabilityFilter();
  this.$container.append(this.$filterContainer);
};

StoreManager.prototype.createBrandFilter = function() {
  this.$brandFilter = this.createFilterLayout('BRAND');
  this.uniqueBrands = this.getUniqueData('brand');
  this.loadFilterData(this.$brandFilter, this.uniqueBrands);
};

StoreManager.prototype.createColorFilter = function() {
  this.$colorFilter = this.createFilterLayout('COLOR');
  this.uniqueColors = this.getUniqueData('color');
  this.loadFilterData(this.$colorFilter, this.uniqueColors);
};

StoreManager.prototype.createAvailabilityFilter = function() {
  this.$availabilityFilter = this.createFilterLayout('AVAILABILITY');
  // data----------
  var $allLabel = $('<label>', { for: 'all'}).addClass('label').html('ALL'),
      $allOption = $('<input>', {type: 'radio', name:'availability',id: 'all', 'data-id': 'all', value: '1', checked: 'checked'}),
      $availableLabel = $('<label>', { for: 'available'}).addClass('label').html('AVAILABLE'),
      $availableOption = $('<input>', {type: 'radio', name:'availability', id: 'available', 'data-id': 'available', value: '0'});
  // load-----------
  this.$availabilityFilter.append($allOption, $allLabel, $availableOption, $availableLabel);
};

StoreManager.prototype.createFilterLayout = function(filterName) {
  $heading = $('<h4>').addClass('heading').html(filterName);
  $container = $('<div>', {id: filterName.toLowerCase() + '-filter'}).append($heading);
  this.$filterContainer.append($container);
  return $container;
};

StoreManager.prototype.loadFilterData = function($filterContainer, filterData) {
  var $filterOptions = [];
  filterData.sort();
  $.each(filterData, function() {
    var $filterOption = $('<input/>',{type: 'checkbox', value: this, id: this}),
      $OptionName = $('<label>', { for: this }).html(this).addClass('label');
    $filterOptions.push($filterOption, $OptionName);
  });

  $filterContainer.append($filterOptions);
};

StoreManager.prototype.getUniqueData = function(filterOption) {
  var filter = new Set();

  $.each(this.productData, function() {
    filter.add(this[filterOption]);
  });

  return Array.from(filter);
};

// -------------------------------------------------------------------

StoreManager.prototype.createContentDisplayArea = function() {
  this.$contentContainer = $('<div>').addClass('content-container');
  this.$container.append(this.$contentContainer);
};

StoreManager.prototype.createProducts = function() {
  var _this = this, product = '';
  $.each(this.productData, function() {
    product = new Product(this);
    _this.$products.push(product);
  });
  this.$filteredProducts = this.$products; // initially
};

StoreManager.prototype.displayProducts = function() {
  console.log(this.$filteredProducts);
  var documentFragment = document.createDocumentFragment();

  $.each(this.$filteredProducts, function() {
    documentFragment.append(this.$productDOM[0]);
  });

  this.$contentContainer.empty();
  this.$contentContainer.append(documentFragment);
};


// ------------------------------------------

StoreManager.prototype.applyFilters = function() {
  this.$contentContainer.empty();  // clear container
  this.$filteredProducts = []; // clean filters

  var filtersSelected = 'input:checked';

  this.$brandsSelected = this.$brandFilter.find(filtersSelected);
  this.$colorsSelected = this.$colorFilter.find(filtersSelected);
  this.$availability = this.$availabilityFilter.find(filtersSelected);
  _this = this;

  $.each(this.$products, function() {
    // brand filter
    if (!(_this.checkFilter(_this.$brandsSelected, this, 'brand'))) {
      return; // does not match criteria
    }

    // color filter
    if (!(_this.checkFilter(_this.$colorsSelected, this, 'color'))) {
      return; // does not match criteria
    }

    // availability filter
    if (_this.$availability.val() == 0 && this.isSoldOut == 1) {
      return; // remove sold out items, when available selected
    }

    _this.$filteredProducts.push(this);
  });
};

StoreManager.prototype.checkFilter = function($filtersSelected, product, filterProperty) {

  if($filtersSelected.length !== 0) {
    var matchesFilter = false;
    $.each($filtersSelected, function() {
      if (this.value == product[filterProperty]) {
        matchesFilter = true;
        return false; // to break out of loop
      }
    });

    if(matchesFilter) {
      return true;
    }
  } else {
    return true; // no filter applied
  }
};

// ---------------------------------------------------------

StoreManager.prototype.bindEvents = function() {
  this.bindChangeEvent(this.$brandFilter);
  this.bindChangeEvent(this.$colorFilter);
  this.bindChangeEvent(this.$availabilityFilter);
};

StoreManager.prototype.bindChangeEvent = function(filter) {
  var _this = this;
  filter.on('change', function() {
    _this.applyFilters();
    _this.displayProducts();
  })
};

// starts  ------------------
$(function() {
  var options = {
    url: 'product.json',
    $storeContainer: $('div[data-container="product-store"]'),
  },
      store = new StoreManager(options);
  store.initialize();
});