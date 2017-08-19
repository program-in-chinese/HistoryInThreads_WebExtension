var 访问缓冲表 = function() {
  this.访问ID到网页抬头 = {}; //visitId->title
  this.访问ID到URL = {}; //visitId->url
}
访问缓冲表.prototype.置网页抬头 = function(访问ID, 网页抬头) {
  this.访问ID到网页抬头[访问ID] = 网页抬头;
}
访问缓冲表.prototype.取网页抬头 = function(访问ID) {
  return this.访问ID到网页抬头[访问ID];
}
访问缓冲表.prototype.置URL = function(访问ID, url) {
  this.访问ID到URL[访问ID] = url;
}
访问缓冲表.prototype.取URL = function(访问ID) {
  return this.访问ID到URL[访问ID];
}
访问缓冲表.prototype.访问ID到URL = function() {
  return this.访问ID到URL;
}
// 不需要?
访问缓冲表.prototype.所有ID = function() {
  return Object.keys(this.访问ID到URL);
}