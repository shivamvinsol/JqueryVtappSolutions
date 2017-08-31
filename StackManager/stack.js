function StackCreator(options) {
  this.$stack = options.$stack;
  this.$addItem = options.$addItem;
  this.$top = ''; // initially null
}

StackCreator.prototype.initialize = function() {
  this.bindEvents();
};

StackCreator.prototype.bindEvents = function() {
  this.bindButtonClickEvent();
  this.bindStackItemClickEvent();
};

StackCreator.prototype.bindButtonClickEvent = function() {
  var _this = this,
    $stackItem = '',
    stackItemCount = 0;

  this.$addItem.on('click', function() {
    stackItemCount = _this.$stack.find('div').length;
    $stackItem = $('<div>', {'class' : 'stackItem'}).html(stackItemCount + 1);
    _this.$stack.prepend($stackItem);
    _this.$top = $stackItem; // make it top
  });
};

StackCreator.prototype.bindStackItemClickEvent = function() {
  var _this = this;

  this.$stack.on('click', 'div', function() { // delegate click event to all div inside stack
    var $this = $(this),
      isTopStackItem = _this.checkTopStackItem($this); // check if it is top element

    _this.highlightStackItem($this); // highlight selection

    if (isTopStackItem) {
      _this.deleteTopStackItem($this);  // delete top element
    }
  });
};

// delete top stack element
StackCreator.prototype.deleteTopStackItem = function($stackItem) {
  var $popTopStackItem = $stackItem;
  this.$top = $stackItem.next();
  $popTopStackItem.remove();
};

// check if selected item is top element
StackCreator.prototype.checkTopStackItem = function($stackItem) {
  if ($stackItem.is($(':first-child', this.$stack))) { // check if selected stack is first child of stack (top most)
    return true;
  }
  return false;
};


// highlight stack element
StackCreator.prototype.highlightStackItem = function($stackItem) {
  $stackItem.addClass('highlight')  // highlight the selection
    .siblings().removeClass('highlight'); // remove highlight from others
};


// starts----------
$(function() {
  var options = {
    $stack : $('div[data-container="stack"]'),
    $addItem : $('input[data-id="addItem"]')
  },
  stack = new StackCreator(options);
  stack.initialize();
});
