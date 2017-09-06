
var 浏览历史 = function(){}

var 所有主题 = [];

var 开始时间 = new Date();
var 耗时 = {};

  var 计时 = function(说明) {
    耗时[说明] = new Date() - 开始时间;
    开始时间 = new Date();
  }

  // history.visitItem
  var 带关键词访问记录 = [];
  var 无关键词访问记录 = [];
  var 当前关键词 = '';
  var 历史回溯时间;
  var 当前时间范围;
  var 未处理url数 = 0;
  var 访问细节表 = {}; // visitId -> historyItem

  var 按关键词搜索历史 = function(关键词, 历史时间范围) {
    计时("调用前")
    带关键词访问记录 = [];
    未处理url数 = 0;

    if (关键词 != null) {
      当前关键词 = 关键词;
    }

    if (当前时间范围 == null || !不需重新索引(历史时间范围, 当前时间范围)) {
      无关键词访问记录 = [];
      访问细节表 = {};

      var 新回溯时间 = 取历史回溯时间(历史时间范围);
      历史回溯时间 = 新回溯时间;
      当前时间范围 = 历史时间范围;

      // TODO: 如果先按关键词搜索, 如果没有匹配, 可以省去搜索所有历史
      // 首先搜索所有浏览历史
      var 无关键词搜索选项 = 生成搜索选项('', 历史回溯时间);
    
      var 无关键词搜索 = browser.history.search(无关键词搜索选项);
      无关键词搜索.then(遍历无关键词历史记录);
    } else {
      var 带关键词搜索选项 = 生成搜索选项(当前关键词, 历史回溯时间);
      var 带关键词搜索 = browser.history.search(带关键词搜索选项);
      带关键词搜索.then(遍历带关键词历史记录);
    }

  };

  var 遍历无关键词历史记录 = function(历史记录) {
    计时("调用无关键词搜索返回历史记录之前")
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
              计时("遍历" + 历史记录.length + "个历史记录")
              生成树(无关键词访问记录, 带关键词访问记录);
              计时("生成树之前")
            } else {
              所有主题.removeChildren();
              所有主题.addChild([建空节点(browser.i18n.getMessage("搜索中"))]);

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
    未处理url数 = 历史记录.length;
    for (var i = 0; i < 历史记录.length; i++ ) {
      var 带关键词访问搜索 = browser.history.getVisits({url: 历史记录[i].url})
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

浏览历史.prototype = {
	constructor: 浏览历史,
  置视图: function(树){
    所有主题 = 树;
  },
	按关键词搜索: function(关键词, 历史范围选择){
    所有主题.addChild([建空节点(browser.i18n.getMessage("索引中"))]);
    按关键词搜索历史(关键词, 历史范围选择);
	},
  
}

