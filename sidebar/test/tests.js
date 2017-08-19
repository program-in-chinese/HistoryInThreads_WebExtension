
QUnit.test( "Set test", function( assert ) {
  var 集合 = new Set();
  集合.add(12);
  assert.ok( 集合[12] != null );
  集合.remove(12);
  assert.ok( 集合[12] == null );
});

QUnit.test("访问缓冲表测试", function(assert) {
  var 缓冲表 = new 访问缓冲表();//访问缓冲表();CacheMap
  缓冲表.置网页抬头(1, "抬头1");
  assert.equal(缓冲表.取网页抬头(1), "抬头1");
});

QUnit.test("History test1", function(assert) {
    var history = new History();
    assert.ok(history.按关键词搜索 != null);
});