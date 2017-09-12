// Product
function Product(product) {
  this.name = parseInt(product.name);
  this.color = product.color;
  this.brand = product.brand;
  this.isSoldOut = product.sold_out;
  this.imageUrl = product.url;
  this.$productDOM = $('<img>', {src: 'images/' + this.imageUrl}).addClass('product-image'); // contains product image (DOM)
}
