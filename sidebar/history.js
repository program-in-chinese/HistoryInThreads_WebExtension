var History = function(){
    

  var Set = function() {}
Set.prototype.add = function(o) {this[o] = true;}
Set.prototype.remove = function(o) {delete this[o];}

    var numRequestsOutstanding = 0;
  var titleByVisitId = {}; //visitId->title
    var urlByVisitId = {};//visitId->url
    var referrByVisitId = {};//visitId -> referrerId
    var typeByVisitId={};
    var idByVisitId={};
    var historyByVisitId={};
    var timeByVisitId={};
    
    var earliestStartTime = new Date();
    var earliest = new Date();
    var 访问Ids = new Set();
    
  var 取最早访问 = function(that, url, visitItems){
    for(var v in visitItems){
        var visitId = visitItems[v].visitId;
        
        if(visitItems[v].visitTime<earliest){
          //console.log(visitItems[v].visitTime+" earlier than: "+earliest);
          earliest=visitItems[v].visitTime;
        }
        访问Ids.add(visitId);
    }
    if (!--numRequestsOutstanding) {
      searchByEarliest(earliest, 访问Ids, that);
    }
  };
  
  var initCachedMaps = function(){
    titleByVisitId = {}; //visitId->title
    urlByVisitId = {};//visitId->url
    referrByVisitId = {};//visitId -> referrerId
    typeByVisitId={};
    idByVisitId={};
    historyByVisitId={};
    timeByVisitId={};
  };
  
  var searchByEarliest = function(earliest, visitIds, that){
    var currentStartTime = earliest-microsecondsPerDay;
    //if earliest history retrieving time is earlier than this earliest, no need to retrieve history again
    if(earliestStartTime<currentStartTime){
      //console.log("earliest: "+(new Date(earliestStartTime))+" no need to retrieve");
      that.rootsRebuild=false;
      that.onAllVisitsProcessed(visitIds);
      return;
    }
    that.rootsRebuild=true;
    earliestStartTime = currentStartTime;
    //init the maps
    initCachedMaps();
    var searchOptions = {
      'text': '',              // Return every history item....
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
        var visitId = visitItems[v].visitId;
        
        //ignore all 'reload' type
        /*if(visitItems[v].transition=="reload"){
          continue;
        }*/
        
        /*if(referrByVisitId[visitId]!=null)
          console.log(visitId+": "+referrByVisitId[visitId]);*/
        referrByVisitId[visitId]=visitItems[v].referringVisitId;
        idByVisitId[visitId]=visitItems[v].id;
        historyByVisitId[visitId]=historyId;
        urlByVisitId[visitId]=url;
        titleByVisitId[visitId]=title;
        typeByVisitId[visitId]=visitItems[v].transition;
        timeByVisitId[visitId]=visitItems[v].visitTime;
    }
    if (!--numRequestsOutstanding) {
      that.onAllVisitsProcessed(visitIds);
    }
    
  };
  
  
  // This function is called when we have the final list of URls to display.
  this.onAllVisitsProcessed = function(visitIds) {
    var vilen=0;
    for(var i in visitIds)
        vilen++;
    var walked = new Set();
    var LIMIT=100;//too deep to be real, can be loop
    //rebuild roots
    if(this.rootsRebuild){
        this.roots=[];
        this.links={};
        for(var visitId in urlByVisitId){
          //loop to get top root
          var i = 0;
          var currentVisitId=visitId;
          
          while(referrByVisitId[currentVisitId]!=null&&referrByVisitId[currentVisitId]!=0&&i<LIMIT){
            
            i++;
            // if current id has been visited, no need to trace back, as it has been done already
            if(currentVisitId in walked){
              break;
            }
            
            //visitId can be wrong: no url/title, maybe a redirect? so if it's not urlByVisitId, it's invalid, and be discarded for now
            if(!(referrByVisitId[currentVisitId] in urlByVisitId))
              break;
            
            if(this.links[referrByVisitId[currentVisitId]]==null)
              this.links[referrByVisitId[currentVisitId]]=[];
            this.links[referrByVisitId[currentVisitId]].push(currentVisitId);
            walked.add(currentVisitId);
            currentVisitId=referrByVisitId[currentVisitId];
            
          }
          
          if(!(currentVisitId in walked) && (currentVisitId in urlByVisitId)){
            var historyId = historyByVisitId[currentVisitId];
            
            walked.add(currentVisitId);
            this.roots.push(currentVisitId);
            
          }
        }
    }
    
    var children = [];
    var lastUrl = "";
    var count=1;
    /* show 'no match' */
    if(this.roots.length==0){
        return createNoneNode("No history record");
      
    }
    //console.log("root number:"+this.roots.length);
    var linkslen =0;
    for(var l in this.links){
        linkslen++;
    }
    //console.log("links length:"+linkslen);
    var lastRoot = generateTree(this.roots[0], this.links, visitIds);
    lastUrl=lastRoot.href;
    if(this.roots.length==1){
      children.push(lastRoot);
    }else{
        //in reverse order, to make latest on top
        for(var r=this.roots.length-1;r>=0;r--){
          //group those that have same url continuously, shown times in front
          var root = generateTree(this.roots[r], this.links, visitIds);
          if(lastUrl==root.href){
            count++;
            continue;
          }else if(root.href==null){
            //ignore those with null url
            continue;
          }
          else{
            if(count!=1){
              lastRoot.title="("+count+") "+lastRoot.title;
            }
            count=1;
          }
          /*if(!visitIds || hasKeywords(lastRoot, hasVisit))*/
            children.push(lastRoot);
          /*else if(visitIds)
            console.log("no keywords: "+lastRoot.visitId);*/
          lastRoot = root;
          lastUrl=root.href;
        }
        
        //console.log("after filtering roots have: "+children.length);
        if(!visitIds){
          //console.log("visitIds null");
          //return children;
        }else{
          var filtered = children.filter(function(element){
            return hasKeywords(element, visitIds);
          });
          
          //console.log("visitIds not null, length: "+filtered.length);
          if(filtered.length==0){
            children=[];
            children.push(createNoneNode("No matching results"));
          }
          else
            children= filtered;
        }
    }
    this.树.addChild(children);
    return children;
  }
  
  function generateTree(visitId, links, visitIds){
    var node={visitId: visitId, title:titleByVisitId[visitId],lastVisitTime:new Date(timeByVisitId[visitId]),href:urlByVisitId[visitId]};
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
  
  var microsecondsPerDay = 1000 * 60 * 60 * 24 * 7;
  var defaultStartTime = (new Date).getTime() - microsecondsPerDay;
  
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
      initCachedMaps();
      
      searchOptions.startTime = defaultStartTime;
      earliestStartTime = defaultStartTime;
      searchOptions.text = "";
      
      this.历史搜索(that, searchOptions);
    }
    //search for the time of the earliest historyItems matching the keywords
    //then use the time to get all visitItems then structure threads
    else{
      //init the retrieve date when there's keywords
      earliest = new Date();
      访问Ids = new Set();
      
      //console.log("go earliest");
      //console.log(searchOptions);
      chrome.history.search(searchOptions,
      function(historyItems) {
        //console.log("history items: "+historyItems.length);
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

History.prototype = {
	constructor: History,
  //save the roots if history isn't retrieved
  roots:[],
  links:{},
  树:null,
  rootsRebuild:true,//flag: when the earliest date of the matched visitItems are later than earliestStartTime, set this to false, meaning no need to rebuild roots
  
  置视图: function(树){
    this.树 = 树;
  },
	按关键词搜索: function(关键词){
    this.按关键词搜索历史(关键词, this);
	},
  
}

