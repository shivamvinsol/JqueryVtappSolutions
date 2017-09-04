var options = {
  brands : $("div[data-behaviour='brands']"),
  colors : $("div[data-behaviour='colors']"),
  sold_out : $("div[data-behaviour='sold_out']"),
  products : $("div[data-behaviour = 'products']")
};

var Store = function(options){
  this.brands = options.brands;
  this.colors = options.colors;
  this.sold_out = options.sold_out;
  this.products = options.products;
  this.attributes = { 'brand' : [], 'color' : [], 'sold_out' : [] };
  this.imageDiv = $("<div/>");
};

Store.prototype.readData = function() {
  var _this = this;
  $.ajax({
    url: 'jsonData.json',
    dataType: 'json'
  }).done(function(data){
    $.each(data, function(index, object){
      var img = _this.loadImage("images/" + object["url"]);
      _this.addDataAttr(img, object);
    });
  });
  this.products.append(this.imageDiv);
  this.filterSelection({selection : this.brands, property : 'brand'});
  this.filterSelection({selection : this.colors, property : 'color'});
  this.filterSelection({selection : this.sold_out, property : 'sold_out'});
};

Store.prototype.loadImage = function(path) {
  var _this = this;
  var img = $("<img/>").attr('src', path)
      .on('load', function() {
        _this.imageDiv.append(img);
      });
  return img;
};

Store.prototype.addDataAttr = function(image, object) {
  $.each(object, function(attribute, value){
    image.data(attribute, value);
  });
};

Store.prototype.filterSelection = function(options) {
  var selection = options.selection,
      property = options.property,
      _this = this;
  selection.find("input[type='checkbox']").on("click", function(){
    var value = $(this).data('behaviour');
    if($(this).prop('checked')){
      _this.attributes[property].push(value);
    }
    else{
      _this.attributes[property].splice( $.inArray(value, _this.attributes[property]), 1 );
    }
    _this.showProducts();
  });
};

Store.prototype.showProducts = function() {
  var _this = this,
      filteredImages = this.products.find("img");
  
  filteredImages.hide();
  for(var filterType in this.attributes) {
    if(this.attributes[filterType].length > 0) {
      filteredImages = filteredImages.filter(function() {
        if($.inArray($(this).data(filterType), _this.attributes[filterType]) >= 0) {
          return true;
        }
      });
    }
  }
  filteredImages.fadeIn();
};

$(document).ready(function(){
  var products = new Store(options);
  products.readData();
});
