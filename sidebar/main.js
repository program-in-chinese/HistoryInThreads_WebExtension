$(function () {
  $("#submitKeywords").on('click', function(){
    var 关键词 = $("#keywords").val();
    //console.log(keywords);
    clearView();
    history.按关键词搜索(关键词);
  });
  $("#keywords").keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $('#submitKeywords').click();
            return false;
        } else {
            return true;
        }
    });
  // select the tree container using jQuery
  $("#demo1").dynatree({
    /*onClick: function(node, event) {
      //alert(node.data.title);
      if( node.data.href ){
        
        window.open(node.data.href, node.data.target);
        return false;
      }
      return true;
    },*/
    onActivate: function(node, event) {
      //alert(node.data.title);
      if( node.data.href ){
        
        window.open(node.data.href);
      }
      node.toggleExpand();
      node.deactivate();
    },
      onCustomRender: function(node) {
        // Render title as columns
        if(node.data.lastVisitTime==null){
          // Default rendering
          return false;
        }
        
        var html = "<a class='dynatree-title' href='"+node.data.href+"'>";
        //for(var i=0; i<cols.length; i++){
          html += "<span class='td'>" + node.data.title + "</span>";
          html += "<span class='td'>" + node.data.lastVisitTime.toLocaleString() + "</span>";
        //}
        return html + "</a>";
      },

      onExpand: function(flag, node){
          node.visit(function(node){
            node.expand(true);
          });
      },
      persist: true
  });
  var benchStart = 0;
  var 树 = $("#demo1").dynatree("getRoot");
  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;
  
  var clearView = function(){
    树.removeChildren();
  }
  var history = new History();
  history.置视图(树);
  clearView();
  history.按关键词搜索("");
  
});