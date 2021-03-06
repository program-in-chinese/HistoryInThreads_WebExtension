$(function () {
  $("#选择时间范围 option[value='今天']").text(browser.i18n.getMessage("时间范围_今天"));
  $("#选择时间范围 option[value='昨天']").text(browser.i18n.getMessage("时间范围_昨天"));
  $("#选择时间范围 option[value='过去7天']").text(browser.i18n.getMessage("时间范围_过去7天"));
  $("#选择时间范围 option[value='本月']").text(browser.i18n.getMessage("时间范围_本月"));
  $("#选择时间范围 option[value='今年']").text(browser.i18n.getMessage("时间范围_今年"));
  $("#选择时间范围 option[value='所有']").text(browser.i18n.getMessage("时间范围_所有"));

  $("#keywords").attr("placeholder", browser.i18n.getMessage("搜索栏占位"));

  $("#submitKeywords").on('click', function(){
    var 关键词 = $("#keywords").val();
    //console.log(keywords);
    clearView();
    var 历史时间范围 = $("#选择时间范围").val();
    history.按关键词搜索(关键词, 历史时间范围);
  });
  $("#选择时间范围").on('change', function(){
    // TODO: 与上重复
    var 关键词 = $("#keywords").val();
    clearView();
    var 历史时间范围 = $("#选择时间范围").val();
    history.按关键词搜索(关键词, 历史时间范围);
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

        var html = "<a class='dynatree-title' href='" + node.data.href +
                   "' title='" + node.data.lastVisitTime.toLocaleString() + "'>";
        html += "<span class='td'>" + 转换转义符(!node.data.title ? node.data.href : node.data.title ) + "</span>";
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
  var history = new 浏览历史();
  history.置视图(树);
  clearView();
  history.按关键词搜索("", "今天");
  
});