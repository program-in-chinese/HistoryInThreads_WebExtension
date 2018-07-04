
QUnit.test( "Set test", function( assert ) {
  var 集合 = new Set();
  集合.add(12);
  assert.ok( 集合[12] != null );
  集合.remove(12);
  assert.ok( 集合[12] == null );
});

QUnit.test("访问缓冲表测试", function(assert) {
  var 缓冲表 = new 访问缓冲表();
  缓冲表.置网页抬头(1, "抬头1");
  assert.equal(缓冲表.取网页抬头(1), "抬头1");

  缓冲表.置URL(2, "url1");
  缓冲表.置URL(3, "url2");
  assert.deepEqual(缓冲表.所有ID(), ["2", "3"]);
});

QUnit.test("浏览历史接口测试", function(assert) {
    var 历史搜索 = new 浏览历史();
    assert.ok(历史搜索.按关键词搜索 != null);
});

QUnit.test("不需重新索引测试", function(assert) {
  assert.notOk(不需重新索引(时间选择_昨天, 时间选择_今天));
  assert.notOk(不需重新索引(时间选择_过去7天, 时间选择_今天));
  assert.notOk(不需重新索引(时间选择_本月, 时间选择_今天));
  assert.notOk(不需重新索引(时间选择_今年, 时间选择_今天));
  assert.notOk(不需重新索引(时间选择_所有, 时间选择_今天));

  assert.notOk(不需重新索引(时间选择_今天, 时间选择_昨天));
  assert.notOk(不需重新索引(时间选择_过去7天, 时间选择_昨天));
  assert.notOk(不需重新索引(时间选择_所有, 时间选择_昨天));

  assert.notOk(不需重新索引(时间选择_所有, 时间选择_过去7天));
  assert.notOk(不需重新索引(时间选择_所有, 时间选择_本月));
  assert.notOk(不需重新索引(时间选择_所有, 时间选择_今年));

  assert.ok(不需重新索引(时间选择_今天, 时间选择_过去7天));
  assert.ok(不需重新索引(时间选择_昨天, 时间选择_过去7天));

  assert.ok(不需重新索引(时间选择_今天, 时间选择_本月));

  assert.ok(不需重新索引(时间选择_今天, 时间选择_今年));

  assert.ok(不需重新索引(时间选择_今天, 时间选择_所有));
  assert.ok(不需重新索引(时间选择_昨天, 时间选择_所有));
  assert.ok(不需重新索引(时间选择_过去7天, 时间选择_所有));
  assert.ok(不需重新索引(时间选择_本月, 时间选择_所有));
  assert.ok(不需重新索引(时间选择_今年, 时间选择_所有));
});

QUnit.test("转换转义符测试", function(assert) {
    assert.equal(转换转义符("测试"), "测试");
    assert.equal(转换转义符("<测试>"), "&lt;测试&gt;");
    assert.equal(转换转义符('"测试&'), "&quot;测试&amp;");
});