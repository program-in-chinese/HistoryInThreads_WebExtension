
  function hasKeywords(node, hasVisit){
    
    if(hasVisit[node.visitId])
      return true;
    else if(node.children){
      for(var i in node.children){
        if(hasKeywords(node.children[i], hasVisit))
          return true;
        /*else
          console.log(node.children[i].visitId+" no keyword");*/
      }
    }
    //console.log(node.visitId+" no keyword");
    return false;
  }

  function createNoneNode(title){
    return {title:title};
  }
  
  function notEmptyArray(array){
    if (array && array.length > 0)
      return true;
    return false;
  }
