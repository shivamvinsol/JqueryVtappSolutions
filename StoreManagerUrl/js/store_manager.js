// store manager
function StoreManager(options) {
  this.url = options.url;
  this.$container = options.$storeContainer;
  this.paginationOptions = options.paginationOptions;
  this.sortingOptions = options.sortingOptions;
  this.filterSelector = options.filterSelector;
  this.pageSelector = options.pageSelector;
}

StoreManager.prototype.selectedFiltersRegex = /^\?brands=((0|1)+)&colors=((0|1)+)&availability=(0|1)&productsPerPage=(\d+)&sortingCriteria=(\w+)&page=(\d+)$/;

StoreManager.prototype.initialize = function() {
  var _this = this;
  this.$products = [];
  this.$filteredProducts = [];
  this.$currentlyViewableProducts = [];

  this.getProductData().done(function() {
    _this.createFilters();
    _this.createContentDisplayArea();
    _this.createProducts();
    _this.displayProducts();
    _this.bindEvents();
    _this.checkCurrentSelectionURL(); // check if any filters present in URL
  });
};

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

// -------------------------------------------------------------------------------

// updates URL for every selection
StoreManager.prototype.createCurrentSelectionURL = function() {
  this.selectedOptions = {
    brands: this.getCode(this.$brandFilter),
    colors: this.getCode(this.$colorFilter),
    availability: this.$availability.val(),
    productsPerPage: this.$productsPerPage.val(),
    sortingCriteria: this.$sortBy.val()
  };

  // changes URL without loading the page
  history.pushState(this.selectedOptions, "SHOP", '?' + jQuery.param(this.selectedOptions) + '&page=' + this.selectedPage);
};

// binary code to represent selected filters
StoreManager.prototype.getCode = function(filter) {
  var code = '';
  $.each(filter.find('input'), function() {
    if (this.checked) {
      code += '1';
    } else {
      code += '0';
    }
  });
  return code;
};

StoreManager.prototype.checkCurrentSelectionURL = function() {
  if(location.search) {
    var selectedFilters = '';

    if(this.selectedFiltersRegex.test(location.search)) {
      // returns values of filters selected
      selectedFilters = $.map(location.search.slice(1).split('&'), function(filter) {
        return filter.split('=')[1];
      });

      this.checkSelectedFilters(this.$brandFilter, selectedFilters[0]);
      this.checkSelectedFilters(this.$colorFilter, selectedFilters[1]);
      this.checkSelectedAvailability(selectedFilters[2]);
      this.checkSelectedPagination(selectedFilters[3]);
      this.checkSelectedSortOption(selectedFilters[4]);
      this.displayProducts(); // applies all filters
      this.checkSelectedPage(selectedFilters[5]); //should be done at last, to get latest page
    } else {
      location.replace(location.origin + location.pathname); // incorrect format, redirect to home page
    }
  } else {
    console.log("no filters present");
  }
};

StoreManager.prototype.checkSelectedFilters = function(filterContainer, filter){
  var index = 0,
      isChecked = 0;
  if(filter.length !== filterContainer.find('input').length) {
    location.replace(location.origin + location.pathname); // incorrect format, redirect to home page
  } else {
    $.each(filterContainer.find('input'), function() {
      isChecked = parseInt(filter[index]);
      this.checked = isChecked;
      index++;
    });
  }
};

StoreManager.prototype.checkSelectedAvailability = function(availability) {
  if(availability === '0') {
    this.$availabilityFilter.find('input[data-id="available"]')[0].checked = true;
  } else {
    this.$availabilityFilter.find('input[data-id="all"]')[0].checked = true;
  }
};

StoreManager.prototype.checkSelectedPagination = function(productsPerPage) {
  var selectedPaginationOption = this.$paginationFilter.find('option[value=' + productsPerPage + ']');
  if (selectedPaginationOption.length) {
    selectedPaginationOption[0].selected = true;
  } else {
    location.replace(location.origin + location.pathname); // redirect to home page
  }
};

StoreManager.prototype.checkSelectedSortOption = function(sortByOption) {
  var selectedSortOption = this.$sortingFilter.find('option[value=' + sortByOption + ']');
  if (selectedSortOption.length) {
    selectedSortOption[0].selected = true;
  } else {
    location.replace(location.origin + location.pathname); // redirect to home page
  }
};

StoreManager.prototype.checkSelectedPage = function(pageNumber) {
  var totalPages = this.$paginationBar.find('div').length;
  if(pageNumber > totalPages) {
    location.replace(location.origin + location.pathname); // redirect to home page
  } else {
    this.$paginationBar.find('div[data-page=' + pageNumber + ']').trigger('click');
  }
}
// ------------------------------

// FILTERS START
StoreManager.prototype.createFilters = function() {
  this.$filterContainer = $('<div>').addClass('filter-container');
  this.createBrandFilter();
  this.createColorFilter();
  this.createAvailabilityFilter();
  this.createPaginationFilter();
  this.createSortingFilter();
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

  // data----------
  var $allLabel = $('<label>', { for: 'all'}).addClass('label').html('ALL'),
      $allOption = $('<input>', {type: 'radio', name:'availability',id: 'all', 'data-id': 'all', 'data-name': 'filter', value: '1', checked: 'checked'}),
      $availableLabel = $('<label>', { for: 'available'}).addClass('label').html('AVAILABLE'),
      $availableOption = $('<input>', {type: 'radio', name:'availability', id: 'available', 'data-id': 'available', 'data-name': 'filter', value: '0'});

  this.$availabilityFilter = this.createFilterLayout('AVAILABILITY');

  // load-----------
  this.$availabilityFilter.append($allOption, $allLabel, $availableOption, $availableLabel);
};

StoreManager.prototype.createPaginationFilter = function() {
  var $fragment = document.createDocumentFragment(),
      $pageOption = '';

  this.$paginationFilter = this.createFilterLayout('PAGINATION');
  this.$productsPerPage = $('<select>', {id: 'productsPerPage', 'data-name': 'filter'}).addClass('pagination');
  this.$paginationBar = $('<div>', {id: 'pagination-bar'}).addClass('pagination-bar');
  // data----------

  $.each(this.paginationOptions, function() {
    $pageOption = $('<option>', {value: this}).html(this);
    $fragment.append($pageOption[0]);
  });

  this.$productsPerPage.append($fragment);

  // load-----------
  this.$paginationFilter.append(this.$productsPerPage);
};

StoreManager.prototype.createSortingFilter = function() {
  var $fragment = document.createDocumentFragment(),
      $filterOption = '';

  this.$sortingFilter = this.createFilterLayout('SORTING');
  this.$sortBy = $('<select>', {id: 'sortBy', 'data-name': 'filter'}).addClass('sort');

  // data----------
  $.each(this.sortingOptions, function() {
    $filterOption = $('<option>', {value: this[0]}).html(this[1]);
    $fragment.append($filterOption[0]);
  });

  this.$sortBy.append($fragment);

  // load-----------
  this.$sortingFilter.append(this.$sortBy);
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
      $optionName = '';

  filterData.sort();

  $.each(filterData, function() {
    $filterOption = $('<input/>',{type: 'checkbox', value: this, id: this, 'data-name': 'filter'}),
    $optionName = $('<label>', { for: this }).html(this).addClass('label');
    $filterOptions.push($filterOption, $optionName);
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
};

StoreManager.prototype.displayProducts = function() {
  this.applyFilters();
  this.applySorting();

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
  var totalProducts = this.$filteredProducts.length,
      productsPerPage = this.$productsPerPage.val(),
      noOfPages = Math.floor((totalProducts - 1)/ productsPerPage) + 1,
      $documentFragment = document.createDocumentFragment(),
      $page = '',
      index = 0;

  this.$paginationBar.empty();

  for(index = 1; index <= noOfPages; index += 1) {
    $page = $('<div>', {id: 'page' + index, 'data-page' : index}).addClass('page').html(index);
    $documentFragment.append($page[0]);
  }

  this.$paginationBar.append($documentFragment);
  this.$contentContainer.append(this.$paginationBar);
};

// ------------------------------------------

StoreManager.prototype.applyFilters = function() {
  var filtersSelected = 'input:checked',
  _this = this;

  this.$contentContainer.empty();  // clear container
  this.$filteredProducts = []; // empty previous filtered products

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
  var matchesFilter = false;

  if($filtersSelected.length !== 0) {
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


StoreManager.prototype.applySorting = function() {
  var sortCriteria = this.$sortBy.val();
  this.$filteredProducts.sort(function(product1, product2) {
    if (product1[sortCriteria] > product2[sortCriteria]) {
      return 1;
    } else {
      return -1;
    }
  });

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
  // change in any filter
  this.$filterContainer.on('change', this.filterSelector,  this.handleChangeEvent() );

  // click on pagination bar to change page
  this.$contentContainer.on('click', this.pageSelector, this.handlePageClickEvent() );
};

StoreManager.prototype.handleChangeEvent = function() {
  var _this = this;
  return function() {
    _this.displayProducts();
    _this.createCurrentSelectionURL();
  };
};

StoreManager.prototype.handlePageClickEvent = function() {
  var _this = this,
      $this = '';
  return function() {
    $this = $(this);
    $this.addClass('highlight').siblings().removeClass('highlight');
    _this.selectedPage = $this.data('page');
    _this.applyPagination();
    _this.displayCurrentlyViewableProducts(); // filters remains same
    _this.createCurrentSelectionURL();
  };
};
