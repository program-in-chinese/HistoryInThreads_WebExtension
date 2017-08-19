var 访问缓冲表 = function() {
  this.访问ID到网页抬头 = {}; //visitId->title
}
访问缓冲表.prototype.置网页抬头 = function(访问ID, 网页抬头) {
  this.访问ID到网页抬头[访问ID] = 网页抬头;
}
访问缓冲表.prototype.取网页抬头 = function(访问ID) {
  return this.访问ID到网页抬头[访问ID];
}