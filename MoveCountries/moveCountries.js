function CountriesMover(options) {
  this.$fromCountryList = options.$fromCountryList;
  this.$toCountryList = options.$toCountryList;
}

CountriesMover.prototype.initialize = function() {
  this.bindEvents();
};

CountriesMover.prototype.bindEvents = function() {
  var _this = this;
  // delegate click event to all options in select
  this.$fromCountryList.on('click', 'option', function() { _this.moveCountry(this); });
  this.$toCountryList.on('click', 'option', function() { _this.moveCountry(this); });
};

CountriesMover.prototype.moveCountry = function(countrySelected) {
  var $countrySelected = $(countrySelected);

  // moves the option, depending upon its parent list
  if ($countrySelected.closest('select').is(this.$fromCountryList)) {
    this.$toCountryList.append($countrySelected);
  } else {
    this.$fromCountryList.append($countrySelected);
  }
};


// starts ---------------------------
$(function() {
  var options = {
    $fromCountryList: $('select[data-name="fromCountryList"]'),
    $toCountryList: $('select[data-name="toCountryList"]')
  },
      countryMover = new CountriesMover(options);
  countryMover.initialize();
});
