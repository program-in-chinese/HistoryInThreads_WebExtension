var Set = function() {}
Set.prototype.add = function(o) {this[o] = true;}
Set.prototype.remove = function(o) {delete this[o];}