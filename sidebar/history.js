var History = function(){

  // TODO: 当本次回溯时间比上次近, 而且关键词相同时, 不用再次搜索浏览历史. 只需在缓冲表中重新搜索创建树即可.

  var numRequestsOutstanding = 0;
  var 缓冲表;  
  var 最早回溯时间点 = new Date();
  var earliest = new Date();
  var 访问Ids = new Set();

  var 一天内毫秒数 = 1000 * 60 * 60 * 24;
  var 默认回溯时间点 = 取今日开始时间点();

  // 第一次打开时,默认只显示一天内历史
  // TODO: 添加界面, 允许选择回溯时间点
  var 回溯时间点 = 默认回溯时间点;

  var 取最早访问 = function(that, url, visitItems){
    for(var v in visitItems){
        var visitId = visitItems[v].visitId;
        
        if(visitItems[v].visitTime<earliest){
          earliest=visitItems[v].visitTime;
        }
        访问Ids.add(visitId);
    }
    if (!--numRequestsOutstanding) {
      searchByEarliest(earliest, 访问Ids, that);
    }
  };
  
  var 初始化缓冲表 = function(){
    缓冲表 = new 访问缓冲表();
  };
  
  var searchByEarliest = function(earliest, visitIds, that){
    var currentStartTime = earliest - 一天内毫秒数;
    //if earliest history retrieving time is earlier than this earliest, no need to retrieve history again
    if(最早回溯时间点 < currentStartTime){
      that.需重建树=false;
      that.onAllVisitsProcessed(visitIds);
      return;
    }
    that.需重建树=true;
    最早回溯时间点 = currentStartTime;
    初始化缓冲表();
    var searchOptions = {
      'text': '',              // 返回所有历史! TODO: 默认改为当天, 防止耗时太久
      'startTime': currentStartTime,
      'maxResults':100
    };
    
    // 必须是that.  TODO: 改掉它
    that.历史搜索(that, searchOptions, visitIds);
  };
  
  this.历史搜索 = function(that, searchOptions, visitIds) {
    chrome.history.search(searchOptions,
      function(historyItems) {
        // For each history item, get details on all visits.
        //console.log("history number:"+historyItems.length);
        for (var i = 0; i < historyItems.length; ++i) {
          var url = historyItems[i].url;
          var title = historyItems[i].title;
          var historyId = historyItems[i].id;
          
          var processVisitsWithUrl = function(url, title, historyId) {
            // We need the url of the visited item to process the visit.
            // Use a closure to bind the  url into the callback's args.
            return function(visitItems) {
              processVisits(that, url, title, historyId, visitItems, visitIds);
            };
          };
          chrome.history.getVisits({url: url}, processVisitsWithUrl(url, title, historyId));
          numRequestsOutstanding++;
        }
        if (!numRequestsOutstanding) {
          that.onAllVisitsProcessed(visitIds);
        }
      }
    );
  }

  /* exceptions: ignore these visitItems */
  /* need to take all visit items into account, as they all can be root (title empty, typed, etc) */
  var processVisits = function(that, url, title, historyId, visitItems, visitIds) {
    //filter self by url
    for(var v in visitItems){
      var 访问时间 = visitItems[v].visitTime;
      if (回溯时间点 > 访问时间) {
        continue;
      }

      var visitId = visitItems[v].visitId;
        
      缓冲表.置网页抬头(visitId, title);
      缓冲表.置URL(visitId, url);
      缓冲表.置来源ID(visitId, visitItems[v].referringVisitId);
      缓冲表.置访问时间(visitId, 访问时间);
      缓冲表.置历史(visitId, historyId);
    }
    if (!--numRequestsOutstanding) {
      that.onAllVisitsProcessed(visitIds);
    }
    
  };
  
  
  // This function is called when we have the final list of URls to display.
  this.onAllVisitsProcessed = function(visitIds) {
      var walked = new Set();
      var LIMIT=100;//too deep to be real, can be loop
      //rebuild roots
      if(this.需重建树){
        this.roots=[];
        this.links={};
        for(var visitId in 缓冲表.访问ID到URL){
          //loop to get top root
          var i = 0;
          var currentVisitId=visitId;
          var referr = 缓冲表.取来源ID(currentVisitId);
          while(referr!=null&&referr!=0&&i<LIMIT){
            
            i++;
            // if current id has been visited, no need to trace back, as it has been done already
            if(currentVisitId in walked){
              break;
            }
            
            // 如果referr不在缓冲表内, it's invalid, and be discarded for now
            if(!(referr in 缓冲表.访问ID到URL))
              break;
            
            if(this.links[referr]==null)
              this.links[referr]=[];
            this.links[referr].push(currentVisitId);
            walked.add(currentVisitId);
            currentVisitId=referr;
            
          }
          
          if(!(currentVisitId in walked) && (currentVisitId in 缓冲表.访问ID到URL)){
            var historyId = 缓冲表.取历史(currentVisitId);
            
            walked.add(currentVisitId);
            this.roots.push(currentVisitId);
            
          }
        }
    }
    
    var children = [];
    //in reverse order, to make latest on top
    for(var r=this.roots.length-1;r>=0;r--){
      children.push(generateTree(this.roots[r], this.links, visitIds));
    }
    if(visitIds != null){
      var filtered = children.filter(function(element){
        return hasKeywords(element, visitIds);
      });
      children = filtered.length==0 ? [建空节点("No matching results")] : filtered;
    }
    
    this.树.addChild(children);
    return children;
  }
  
  function generateTree(visitId, links, visitIds){
    var node={
      visitId: visitId,
      title: 缓冲表.取网页抬头(visitId),
      lastVisitTime: new Date(缓冲表.取访问时间(visitId)),
      href: 缓冲表.取URL(visitId)
    };
    if(visitIds && (visitId in visitIds))
      node.addClass='withkeywords';
    /*console.log(visitId+" -> "+links[visitId]);*/
    if(notEmptyArray(links[visitId])){
      node.isFolder=true;
      node.children=[];
      for(var c in links[visitId])
        node.children.push(generateTree(links[visitId][c], links, visitIds));
    }
    return node;
  }
  
  /* search by keywords, only show the referrers; when keywords is empty, show a week's history */
  this.按关键词搜索历史 = function(keywords, that){
    numRequestsOutstanding = 0;
    
    //console.log("in 按关键词搜索历史: "+numRequestsOutstanding);
    var searchOptions = {
      'text': keywords,              // Return every history item....
      'startTime': 0,
      'maxResults':100
    };
    if(keywords==''){
      //init the maps only when there's no keywords
      初始化缓冲表();
      
      searchOptions.startTime = 默认回溯时间点;
      最早回溯时间点 = 默认回溯时间点;
      
      this.历史搜索(that, searchOptions);
    }
    //search for the time of the earliest historyItems matching the keywords
    //then use the time to get all visitItems then structure threads
    else{
      //init the retrieve date when there's keywords
      earliest = new Date();
      访问Ids = new Set();
      
      chrome.history.search(searchOptions,
      function(historyItems) {
        for (var i = 0; i < historyItems.length; ++i) {
          var url = historyItems[i].url;
          var processVisitsWithUrl = function(url) {
            return function(visitItems) {
              取最早访问(that, url, visitItems);
            };
          };
          chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
          numRequestsOutstanding++;
        }
        /* this only happens when there's no matching history items */
        if (!numRequestsOutstanding) {
          that.onAllVisitsProcessed(访问Ids);
        }
      });
    }
  }
};

var 浏览历史 = function(){
  var 带关键词访问记录 = [];
  var 无关键词访问记录 = [];
  var 当前关键词 = '';

  this.按关键词搜索历史 = function(关键词, 回溯时间) {
    当前关键词 = 关键词;

    // TODO: 如果先按关键词搜索, 如果没有匹配, 可以省去搜索所有历史
    // 首先搜索所有浏览历史
    var 无关键词搜索选项 = 生成搜索选项('', 回溯时间);

    var 无关键词搜索 = chrome.history.search(无关键词搜索选项);
    无关键词搜索.then(遍历无关键词历史记录);
  };

  var 遍历无关键词历史记录 = function(历史记录) {
    var 所有url = 取历史记录url(历史记录);

    for (var i = 0; i < 所有url.length; i++ ) {
      var 无关键词访问搜索 = chrome.history.getVisits({url: 所有url[i]});
      无关键词访问搜索.then(处理无关键词访问);
    }
  }

  var 处理无关键词访问 = function(访问记录) {
    // 保存所有访问记录
    Array.prototype.push.apply(无关键词访问记录, 访问记录);

    if (i == 所有url.length - 1) {
      if (当前关键词 == '') {
        生成树();
      } else {
        var 带关键词搜索选项 = 生成搜索选项(关键词, 回溯时间);
        var 带关键词搜索 = chrome.history.search(带关键词搜索选项);
        带关键词搜索.then(遍历带关键词历史记录);
      }
    }
  };

  var 遍历带关键词历史记录 = function(历史记录) {
    var 匹配url = 取历史记录url(历史记录);

    for (var i = 0; i < 匹配url.length; i++ ) {
      var 带关键词访问搜索 = chrome.history.getVisits({url: 匹配url[i]})
      带关键词访问搜索.then(处理带关键词访问);
    }
  };

  var 处理带关键词访问 = function(访问记录) {
    // 保存所有带关键词访问记录
    Array.prototype.push.apply(带关键词访问记录, 访问记录);

    if (i == 匹配url.length - 1) {
      生成树();
    }
  };

  var 生成树 = function() {
    console.log();
  };

  var 取历史记录url = function(历史记录) {
    var 所有url = [];
    for (var i = 0; i < 历史记录.length; i++) {
      所有url.push(历史记录[i].url);
    }
  }

  // 如果回溯时间为空, 默认为当天
  var 生成搜索选项 = function(关键词, 回溯时间) {
    var 历史回溯时间 = 回溯时间 == null ? 取今日开始时间点() : 回溯时间;
    return {
      'text': 关键词,
      'startTime': 历史回溯时间,
      'maxResults': 100
    };
  }
};

浏览历史.prototype = {
	constructor: 浏览历史,
  //save the roots if history isn't retrieved
  roots:[],
  links:{},
  树:null,
  需重建树:true,//flag: when the earliest date of the matched visitItems are later than 最早回溯时间点, set this to false, meaning no need to rebuild roots
  
  置视图: function(树){
    this.树 = 树;
  },
	按关键词搜索: function(关键词){
    this.按关键词搜索历史(关键词);
	},
  
}

