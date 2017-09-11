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
    revert: true,
    drag: function(event, ui) {
      ui.helper.addClass('ui-state-highlight');
    }
  });
};

CountriesMover.prototype.bindDropEvent = function() {
  var $this = '';
  this.$list.droppable({
    drop: function(event, ui) {
      $this = $(this);
      // country is not dropped into the list which is already containing it
      if (!$.contains($this[0], ui.helper[0])) {
        $this.append(ui.helper);
      }
      ui.helper.removeClass('ui-state-highlight');
    }
  });
};

// starts ---------------------------
$(function() {
  var options = {
    $lists: $("[data-name^='list']"),
    $countries: $("[data-name='country']")
  },
      countryMover = new CountriesMover(options);
  countryMover.initialize();
});
