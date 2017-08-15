
QUnit.test( "hello test", function( assert ) {
  assert.ok( 1 == "1", "Passed!" );
});

QUnit.test("History test1", function(assert) {
    var history = new History();
    assert.ok(history.searchByEarliest != null);
});