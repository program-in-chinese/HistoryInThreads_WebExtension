
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

  var 生成树 = function(无关键词访问记录, 带关键词访问记录) {
    var 源访问记录 = [];
    var 子记录 = {}; // visitId -> 子访问记录[]
    for(var i = 0; i<无关键词访问记录.length; i++) {
      var 访问记录 = 无关键词访问记录[i];
      var 父访问记录ID = 访问记录.referringVisitId;
      if (父访问记录ID != null && 父访问记录ID != -1) {
        if (子记录[父访问记录ID] == null) {
          子记录[父访问记录ID] = [];
        }
        子记录[父访问记录ID].push(访问记录);
      } else {
        源访问记录.push(访问记录);
      }
    }

    var 根节点 = 创建树(源访问记录, 子记录);

    if(当前关键词 != '') {
      var 带关键词访问记录ID = 取ID集(带关键词访问记录);
      根节点 = 过滤(根节点, 带关键词访问记录ID);
      // TODO: 如果任何带关键词的访问记录没有被包括在根节点的树中, 
    }
    修饰节点列表(根节点);
    所有主题.addChild(根节点.length == 0 ? [建空节点("No matching results")] : 根节点);
  };

  var 创建节点 = function(访问记录) {
    var 访问ID = 访问记录.visitId;
    var 节点={
      visitId: 访问ID,
      title: 访问细节表[访问ID].title,
      lastVisitTime: new Date(访问记录.visitTime),
      href: 访问细节表[访问ID].url
    };
    return 节点;
  };

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

  var 一天内毫秒数 = 1000 * 60 * 60 * 24;

  // 如果回溯时间范围为空, 默认为当天
  var 取历史回溯时间 = function(历史时间选择) {
    var 时间范围 = {开始: 取今日开始时间点()};
    if(历史时间选择 == null || 历史时间选择 == '今天'){
      // 无需修改
    } else if(历史时间选择 == '昨天'){
      时间范围.结束 = 时间范围.开始;
      时间范围.开始 = 时间范围.结束 - 一天内毫秒数;
    } else if(历史时间选择 == '过去7天'){
      时间范围.开始 = 时间范围.开始 - 一天内毫秒数 * 7;
    } else if(历史时间选择 == '本月'){
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth();
      时间范围.开始 = new Date(year,month,1);
    } else if(历史时间选择 == '今年'){
      var year = new Date().getFullYear();
      时间范围.开始 = new Date(year, 0, 1);
    } else if(历史时间选择 == '所有'){
      时间范围.开始 = 0;
    }
    return 时间范围;
  };

  var 在时间范围内 = function(时间点, 时间范围) {
    return (!时间范围.开始 || 时间点 > 时间范围.开始)
    && (!时间范围.结束 || 时间点 < 时间范围.结束)
  };
