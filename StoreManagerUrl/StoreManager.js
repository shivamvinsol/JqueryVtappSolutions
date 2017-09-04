// store manager
function StoreManager(options) {
  this.url = options.url;
  this.$container = options.$storeContainer;
  this.$products = [];
  this.$filteredProducts = [];
  this.$currentlyViewableProducts = [];
  this.paginationOptions = [3, 6, 9];
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
    _this.checkCurrentSelectionURL(); // check if any filters present in URL
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
    var selectedFiltersRegex = /^\?brands=((0|1)+)&colors=((0|1)+)&availability=(0|1)&productsPerPage=(\d+)&sortingCriteria=(\w+)&page=(\d+)$/,
        selectedfilters = '';

    if(selectedFiltersRegex.test(location.search)) {

      // returns values of filters selected
      selectedfilters = $.map(location.search.slice(1).split('&'), function(filter) {
        return filter.split('=')[1];
      });

      this.checkSelectedFilters(this.$brandFilter, selectedfilters[0]);
      this.checkSelectedFilters(this.$colorFilter, selectedfilters[1]);
      this.checkSelectedAvailability(selectedfilters[2]);
      this.checkSelectedPagination(selectedfilters[3]);
      this.checkSelectedSortOption(selectedfilters[4]);
      this.displayProducts(); // applies all filters
      this.checkSelectedPage(selectedfilters[5]); // if I do this before displaying products, I get old values of filters
    } else {
        location.replace(location.origin + location.pathname); // incorrect format, redirect to home page
    }
  } else {
      console.log("no filters present");
  }
};

StoreManager.prototype.checkSelectedFilters = function(filterContainer, filter){
  var i = 0, isChecked = 0;
  if(filter.length !== filterContainer.find('input').length) {
    location.replace(location.origin + location.pathname); // incorrect format, redirect to home page
  } else {
    $.each(filterContainer.find('input'), function() {
      isChecked = parseInt(filter[i]);
      this.checked = isChecked;
      i++;
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
  this.$availabilityFilter = this.createFilterLayout('AVAILABILITY');
  // data----------
  var $allLabel = $('<label>', { for: 'all'}).addClass('label').html('ALL'),
      $allOption = $('<input>', {type: 'radio', name:'availability',id: 'all', 'data-id': 'all', value: '1', checked: 'checked'}),
      $availableLabel = $('<label>', { for: 'available'}).addClass('label').html('AVAILABLE'),
      $availableOption = $('<input>', {type: 'radio', name:'availability', id: 'available', 'data-id': 'available', value: '0'});
  // load-----------
  this.$availabilityFilter.append($allOption, $allLabel, $availableOption, $availableLabel);
};

StoreManager.prototype.createPaginationFilter = function() {
  this.$paginationFilter = this.createFilterLayout('PAGINATION');
  this.$productsPerPage = $('<select>', {id: 'productsPerPage'}).addClass('pagination');
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

StoreManager.prototype.createSortingFilter = function() {
  this.$sortingFilter = this.createFilterLayout('SORTING');
  this.$sortBy = $('<select>', {id: 'sortBy'}).addClass('sort');

  // data----------
  var $sortByName = $('<option>', {value: 'name', selected: 'selected'}).html('Name'),
      $sortByColor = $('<option>', {value: 'color'}).html('Color'),
      $sortByBrand = $('<option>', {value: 'brand'}).html('Brand'),
      $sortByAvailability = $('<option>', {value: 'isSoldOut'}).html('Availability');

  this.$sortBy.append($sortByName, $sortByBrand, $sortByColor, $sortByAvailability);

  // load-----------
  this.$sortingFilter.append(this.$sortBy);
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
  this.$paginationBar.empty();
  var totalProducts = this.$filteredProducts.length,
      productsPerPage = this.$productsPerPage.val(),
      noOfPages = Math.floor((totalProducts - 1)/ productsPerPage) + 1,
      $documentFragment = document.createDocumentFragment(),
      $page = '',
      i = 0;

  for(i = 1; i <= noOfPages; i += 1) {
    $page = $('<div>', {id: 'page' + i, 'data-page' : i}).addClass('page').html(i);
    $documentFragment.append($page[0]);
  }

  this.$paginationBar.append($documentFragment);
  this.$contentContainer.append(this.$paginationBar);

};

// ------------------------------------------

StoreManager.prototype.applyFilters = function() {
  this.$contentContainer.empty();  // clear container
  this.$filteredProducts = []; // empty previous filtered products

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


StoreManager.prototype.applySorting = function() {
  var sortCriteria = this.$sortBy.val()
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
  this.bindChangeEvent(this.$brandFilter);
  this.bindChangeEvent(this.$colorFilter);
  this.bindChangeEvent(this.$availabilityFilter);
  this.bindChangeEvent(this.$paginationFilter);
  this.bindChangeEvent(this.$sortingFilter);
  this.bindPageClickEvent();
};

StoreManager.prototype.bindChangeEvent = function(filter) {
  var _this = this;
  filter.on('change', function() {
    _this.displayProducts();
    _this.createCurrentSelectionURL();
  })
};

StoreManager.prototype.bindPageClickEvent = function() {
  var _this = this;
  this.$contentContainer.on('click', '#pagination-bar div', function() {
    var $this = $(this);
     $this.addClass('highlight').siblings().removeClass('highlight');
     _this.selectedPage = $this.html();
     _this.applyPagination();
    _this.displayCurrentlyViewableProducts(); // filters remains same
    _this.createCurrentSelectionURL();
  });
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
