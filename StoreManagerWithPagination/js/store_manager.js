// store manager
function StoreManager(options) {
  this.url = options.url;
  this.$container = options.$storeContainer;
  this.$products = [];
  this.$filteredProducts = [];
  this.$currentlyViewableProducts = [];
  this.paginationOptions = [3, 6, 9];
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
  this.createPaginationFilter();
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
      $allOption = $('<input>', {type: 'radio', name:'availability',id: 'all', 'data-name': 'filter', value: '1', checked: 'checked'}),
      $availableLabel = $('<label>', { for: 'available'}).addClass('label').html('AVAILABLE'),
      $availableOption = $('<input>', {type: 'radio', name:'availability', id: 'available', 'data-name': 'filter', value: '0'});
  // load-----------
  this.$availabilityFilter.append($allOption, $allLabel, $availableOption, $availableLabel);
};

StoreManager.prototype.createPaginationFilter = function() {
  this.$paginationFilter = this.createFilterLayout('PAGINATION');
  this.$productsPerPage = $('<select>', {id: 'productsPerPage', 'data-name': 'filter'}).addClass('pagination');
  this.$paginationBar = $('<div>', {id: 'pagination-bar'}).addClass('pagination-bar');
  // data----------
  var $fragment = document.createDocumentFragment(),
      $pageOption = '';

  $.each(this.paginationOptions, function() {
    $pageOption = $('<option>', {value: this}).html(this);
    $fragment.append($pageOption[0]);
  });

  this.$productsPerPage.append($fragment);

  // load-----------
  this.$paginationFilter.append(this.$productsPerPage);
};

StoreManager.prototype.createFilterLayout = function(filterName) {
  var $heading = $('<h4>').addClass('heading').html(filterName),
      $container = $('<div>', {id: filterName.toLowerCase() + '-filter'}).append($heading);
  this.$filterContainer.append($container);
  return $container;
};

StoreManager.prototype.loadFilterData = function($filterContainer, filterData) {
  var $filterOptions = [],
      $filterOption = '',
      $OptionName = '';
  filterData.sort();
  $.each(filterData, function() {
    $filterOption = $('<input/>',{type: 'checkbox', value: this, id: this, 'data-name': 'filter'}),
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
  var _this = this,
       product = '';
  $.each(this.productData, function() {
    product = new Product(this);
    _this.$products.push(product);
  });
};

StoreManager.prototype.displayProducts = function() {
  this.applyFilters();

  this.createPaginationBar();
  this.$paginationBar.find('div:first-child').addClass('highlight');
  this.selectedPage = 1;

  this.applyPagination();
  this.displayCurrentlyViewableProducts();
};

StoreManager.prototype.displayCurrentlyViewableProducts = function() {
  var documentFragment = document.createDocumentFragment();

  $.each(this.$currentlyViewableProducts, function() {
    documentFragment.append(this.$productDOM[0]);
  });

  this.$contentContainer.empty();
  this.$contentContainer.append(documentFragment, this.$paginationBar);

};

StoreManager.prototype.createPaginationBar = function() {
  this.$paginationBar.empty();
  var totalProducts = this.$filteredProducts.length,
      productsPerPage = this.$productsPerPage.val(),
      noOfPages = Math.floor((totalProducts - 1)/ productsPerPage) + 1,
      $documentFragment = document.createDocumentFragment(),
      $page = '',
      index = 0;

  for(index = 1; index <= noOfPages; index += 1) {
    $page = $('<div>', {id: 'page' + index, 'data-page' : index}).addClass('page').html(index);
    $documentFragment.append($page[0]);
  }

  this.$paginationBar.append($documentFragment);
  this.$contentContainer.append(this.$paginationBar);

};

// ------------------------------------------

StoreManager.prototype.applyFilters = function() {
  this.$contentContainer.empty();  // clear container
  this.$filteredProducts = []; // empty previous filtered products

  var filtersSelected = 'input:checked',
      _this = this;

  this.$brandsSelected = this.$brandFilter.find(filtersSelected);
  this.$colorsSelected = this.$colorFilter.find(filtersSelected);
  this.$availability = this.$availabilityFilter.find(filtersSelected);

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


StoreManager.prototype.applyPagination = function() {
  var productsPerPage = parseInt(this.$productsPerPage.val()),
      totalProducts = this.$filteredProducts.length,
      firstProductIndex = (this.selectedPage - 1) * productsPerPage,
      lastProductIndex = firstProductIndex + productsPerPage - 1;

  if (lastProductIndex > totalProducts - 1) {
    lastProductIndex = totalProducts - 1;
  }

  this.$currentlyViewableProducts = this.$filteredProducts.slice(firstProductIndex, lastProductIndex + 1);
};

// ---------------------------------------------------------

StoreManager.prototype.bindEvents = function() {
  this.bindChangeEvent();
  this.bindPageClickEvent();
};

StoreManager.prototype.bindChangeEvent = function() {
  var _this = this;
  $('[data-name="filter"]').on('change', function() { _this.displayProducts(); });
};

StoreManager.prototype.bindPageClickEvent = function() {
  var _this = this,
      $this = '';
  this.$contentContainer.on('click', '[data-page]', function() {
    $this = $(this);
    $this.addClass('highlight').siblings().removeClass('highlight');
    _this.selectedPage = $this.data('page');
    _this.applyPagination();
    _this.displayCurrentlyViewableProducts(); // filters remains same
  });
};
