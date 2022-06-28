
import test from 'node:test';

test('synchronous failing test', (t) => {
  // This test fails because it throws an exception.
  assert.strictEqual(1, 2);
});
