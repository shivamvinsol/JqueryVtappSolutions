$(document).ready(function(){
  list = $("select");
  options = $("select option");

  options.draggable({
    cancel : "input, textarea, button",
    revert: true
  });

  list.droppable({
    cancel : "input, textarea, button",
    drop: function( event, ui ) {
      $(this).append(ui.helper);
    }
  });
});
