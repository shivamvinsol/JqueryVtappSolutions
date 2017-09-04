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
};

CountriesMover.prototype.bindDragEvent = function() {
  this.$countries.draggable({
    cancel : "",
    revert: true
  });
};

CountriesMover.prototype.bindDropEvent = function() {
  this.$list.droppable({
    drop: function(event, ui) {
      $(this).append(ui.helper);
    }
  });
};

// starts ---------------------------
$(function() {
  var options = {
    $lists: $('select'),
    $countries: $('select > option')
  },
      countryMover = new CountriesMover(options);
  countryMover.initialize();
});
