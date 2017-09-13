function ItemMover(options) {
  this.$list = options.$lists;
  this.$items = options.$items;
  this.scope = options.scope;
  this.getDefaultClass(options.class);
}

ItemMover.prototype.getDefaultClass = function(className) {
  // no class given
  if (className === undefined) {
    this.defaultClass = 'ui-state-highlight';
  } else {
    this.defaultClass = className; // custom class given
  }
};

ItemMover.prototype.initialize = function() {
  this.bindEvents();
};

ItemMover.prototype.bindEvents = function() {
  this.bindDragEvent();
  this.bindDropEvent();
  this.bindClickEvent();
};

ItemMover.prototype.bindDragEvent = function() {
  var _this = this;
  this.$items.draggable({
    revert: true,
    revertDuration: 0,
    scope: _this.scope,
    drag: function(event, ui) { _this.handleDragEvent(this);}
  });
};

ItemMover.prototype.bindDropEvent = function() {
  var _this = this;
  this.$list.droppable({
    scope: _this.scope,
    drop: function(event, ui) { _this.handleDropEvent(this, ui.helper);}
  });
};

ItemMover.prototype.bindClickEvent = function() {
  var _this = this;
  this.$items.on('click', function() { _this.handleClickEvent(this);});
};

ItemMover.prototype.handleDragEvent = function(item) {
  var $item = $(item);
  this.$items.removeClass(this.defaultClass);
  $item.addClass(this.defaultClass);
};

ItemMover.prototype.handleDropEvent = function(list, item) {
  var $list = $(list),
      $item = $(item);

  // item is not dropped into the list which is already containing it
  if (!$.contains($list[0], $item[0])) {
    $list.append(item);
  }
  $item.removeClass(this.defaultClass);
};

ItemMover.prototype.handleClickEvent = function(item) {
  var $item = $(item);
  this.$items.removeClass(this.defaultClass);
  $item.addClass(this.defaultClass);
};

// starts ---------------------------
$(function() {
  // custom class
  var options = {
    $lists: $("[data-name='country-list']"),
    $items: $("[data-name='country']"),
    scope: 'country',
    class: 'highlight'
  },
  // default class
    options2 = {
      $lists: $("[data-name='state-list']"),
      $items: $("[data-name='state']"),
      scope: 'state'
    },
    countryMover = new ItemMover(options),
    stateMover = new ItemMover(options2);

  countryMover.initialize();
  stateMover.initialize();
});
