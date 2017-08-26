
var 浏览历史 = function(){}

var 所有主题 = [];

  // history.visitItem
  var 带关键词访问记录 = [];
  var 无关键词访问记录 = [];
  var 当前关键词 = '';
  var 历史回溯时间;
  var 未处理url数 = 0;
  var 访问细节表 = {}; // visitId -> historyItem

  var 按关键词搜索历史 = function(关键词, 历史时间范围) {
    
    带关键词访问记录 = [];
    无关键词访问记录 = [];
    if (关键词 != null) {
      当前关键词 = 关键词;
    }
    历史回溯时间 = 取历史回溯时间(历史时间范围);
    未处理url数 = 0;
    访问细节表 = {};

    // TODO: 如果先按关键词搜索, 如果没有匹配, 可以省去搜索所有历史
    // 首先搜索所有浏览历史
    var 无关键词搜索选项 = 生成搜索选项('', 历史回溯时间);

    var 无关键词搜索 = browser.history.search(无关键词搜索选项);
    无关键词搜索.then(遍历无关键词历史记录);
  };

  var 遍历无关键词历史记录 = function(历史记录) {
    未处理url数 = 历史记录.length;
    if (历史记录.length == 0) {
      生成树(无关键词访问记录, 带关键词访问记录);
      return;
    }
    for (var i = 0; i < 历史记录.length; i++) {
      var 某历史记录 = 历史记录[i];
      var 无关键词访问搜索 = browser.history.getVisits({url: 某历史记录.url});

      // 需要保存(visitId->历史记录)对应表, 以便生成树时根据visitId取title和url
      var 处理无关键词访问 = function(某历史记录) {
        return function(访问记录) {
          未处理url数 --;
          // 保存回溯时间之后所有访问记录
          for (var i = 0; i<访问记录.length; i++) {
            var 记录 = 访问记录[i];
            if (在时间范围内(记录.visitTime, 历史回溯时间)) {
              无关键词访问记录.push(记录);
              访问细节表[记录.visitId] = 某历史记录;
            }
          }
      
          if (未处理url数 == 0) {
            if (当前关键词 == '') {
              生成树(无关键词访问记录, 带关键词访问记录);
            } else {
              var 带关键词搜索选项 = 生成搜索选项(当前关键词, 历史回溯时间);
              var 带关键词搜索 = browser.history.search(带关键词搜索选项);
              带关键词搜索.then(遍历带关键词历史记录);
            }
          }
        }
      };
      无关键词访问搜索.then(处理无关键词访问(某历史记录));
    }
  }

  var 遍历带关键词历史记录 = function(历史记录) {
    var 匹配url = 取历史记录url(历史记录);

    未处理url数 = 匹配url.length;
    for (var i = 0; i < 匹配url.length; i++ ) {
      var 带关键词访问搜索 = browser.history.getVisits({url: 匹配url[i]})
      带关键词访问搜索.then(处理带关键词访问);
    }
  };

  var 处理带关键词访问 = function(访问记录) {
    未处理url数 --;
    // 保存所有带关键词访问记录
    for (var i = 0; i<访问记录.length; i++) {
      if (在时间范围内(访问记录[i].visitTime, 历史回溯时间)) {
        带关键词访问记录.push(访问记录[i]);
      }
    }

    if (未处理url数 == 0) {
      生成树(无关键词访问记录, 带关键词访问记录);
    }
  };

  var 生成搜索选项 = function(关键词, 时间范围) {
    var 搜索选项 = {
      'text': 关键词,
      'maxResults': Number.MAX_SAFE_INTEGER
    };
    if (时间范围.开始) {
      搜索选项.startTime = 时间范围.开始;
    }
    if (时间范围.结束) {
      搜索选项.endTime = 时间范围.结束;
    }
    return 搜索选项;
  };

浏览历史.prototype = {
	constructor: 浏览历史,
  //save the roots if history isn't retrieved
  roots:[],
  links:{},
  //树:null,
  需重建树:true,//flag: when the earliest date of the matched visitItems are later than 最早回溯时间点, set this to false, meaning no need to rebuild roots
  
  置视图: function(树){
    所有主题 = 树;
  },
	按关键词搜索: function(关键词, 历史范围选择){
    按关键词搜索历史(关键词, 历史范围选择);
	},
  
}

