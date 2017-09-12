function CountriesMover(options) {
  this.$list = options.$lists;
  this.$countries = options.$countries;
}

CountriesMover.prototype.initialize = function() {
  this.bindEvents();
};

CountriesMover.prototype.bindEvents = function() {
  this.bindDragEvent();
  this.bindDropEvent();
  this.bindClickEvent();
};

CountriesMover.prototype.bindDragEvent = function() {
  var _this = this;
  this.$countries.draggable({
    revert: true,
    revertDuration: 0,
    drag: function(event, ui) { _this.handleDragEvent(this);}
  });
};

CountriesMover.prototype.bindDropEvent = function() {
  var _this = this;
  this.$list.droppable({
    drop: function(event, ui) { _this.handleDropEvent(this, ui.helper);}
  });
};

CountriesMover.prototype.bindClickEvent = function() {
  var _this = this;
  this.$countries.on('click', function() { _this.handleClickEvent(this);});
};

CountriesMover.prototype.handleDragEvent = function(country) {
  var $country = $(country);
  this.$countries.removeClass('ui-state-highlight');
  $country.addClass('ui-state-highlight');
};

CountriesMover.prototype.handleDropEvent = function(list, country) {
  var $list = $(list),
      $country = $(country);

  // country is not dropped into the list which is already containing it
  if (!$.contains($list[0], $country[0])) {
    $list.append(country);
  }
  $country.removeClass('ui-state-highlight');
};

CountriesMover.prototype.handleClickEvent = function(country) {
  var $country = $(country);
  this.$countries.removeClass('ui-state-highlight');
  $country.addClass('ui-state-highlight');
};

// starts ---------------------------
$(function() {
  var options = {
    $lists: $("[data-name='list']"),
    $countries: $("[data-name='country']")
  },
      countryMover = new CountriesMover(options);
  countryMover.initialize();
});
