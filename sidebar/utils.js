
  function hasKeywords(node, hasVisit){
    if(hasVisit[node.visitId])
      return true;
    else if(node.children){
      for(var i in node.children){
        if(hasKeywords(node.children[i], hasVisit))
          return true;
      }
    }
    return false;
  }

  function 建空节点(title){
    return {title:title};
  }
  
  function notEmptyArray(array){
    return array && array.length > 0;
  }

  // 返回毫秒
  function 取今日开始时间点() {
    var now=new Date();
    var hour = now.getHours();
    var milli = now.getMilliseconds();
    var min = now.getMinutes();
    var sec = now.getSeconds();
    return now-((60*hour+min)*60+sec)*1000+milli;
  }

  var 取ID集 = function(带关键词访问记录) {
    var 记录ID = new Set();
    for (var i = 0; i< 带关键词访问记录.length; i++) {
      记录ID.add(带关键词访问记录[i].visitId);
    }
    return 记录ID;
  };

  var 过滤 = function(节点列表, ID集) {
    var 结果 = [];
    for (var i = 0; i<节点列表.length; i++) {
      if (包含关键词(节点列表[i], ID集)) {
        结果.push(节点列表[i]);
      }
    }
    return 结果;
  };

  var 包含关键词 = function(节点, ID集) {
    if(ID集[节点.visitId]) {
      节点.addClass='withkeywords';
      return true;
    }
    else if(notEmptyArray(节点.children)){
      for(var i in 节点.children){
        if(包含关键词(节点.children[i], ID集))
          return true;
      }
    }
    return false;
  };

  var 修饰节点列表 = function(节点列表) {
    for(var i in 节点列表){
      var 节点 = 节点列表[i];
      if(notEmptyArray(节点.children)) {
        节点.isFolder=true;
        修饰节点列表(节点.children);
      }
    }
  };

  var 创建树 = function(访问记录数组, 子记录) {
    var 节点数组 = [];
    if (访问记录数组 == null) {
      return 节点数组;
    }
    for (var i = 0; i< 访问记录数组.length; i++) {
      var 节点 = 创建节点(访问记录数组[i]);
      var 子记录数组 = 子记录[访问记录数组[i].visitId];
      节点.children = 创建树(子记录数组, 子记录);
      节点数组.push(节点);
    }
    return 节点数组;
  };

  var 取历史记录url = function(历史记录) {
    var 所有url = [];
    for (var i = 0; i < 历史记录.length; i++) {
      所有url.push(历史记录[i].url);
    }
    return 所有url;
  };
