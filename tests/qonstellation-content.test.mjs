import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = process.env.QONSTELLATION_APP_ROOT || path.resolve(root, '../qonstellation');
const read = name => readFileSync(path.join(root, name), 'utf8');
const product = read('qonstellation.html');
const terms = read('qonstellation-terms.html');
const privacy = read('qonstellation-privacy.html');
const deletion = read('qonstellation-delete-account.html');
const pages = ['qonstellation.html', 'qonstellation-terms.html',
  'qonstellation-privacy.html', 'qonstellation-delete-account.html'];

test('plan cards match the current app and backend allowances', {
  skip: !existsSync(path.join(app, 'functions/storage_quota_policy.js')),
}, () => {
  const require = createRequire(import.meta.url);
  const {storageLimitBytesForTier} = require(path.join(app, 'functions/storage_quota_policy.js'));
  const source = readFileSync(path.join(app, 'lib/features/books/data/book_repository.dart'), 'utf8');
  for (const [name, tier, branch, bytes] of [
    ['free', 'free', 'default:', 250_000_000],
    ['plus', 'plus', 'case SubscriptionEntitlements.plus:', 3_000_000_000],
    ['premium', 'crown', 'case SubscriptionEntitlements.crown:', 20_000_000_000],
  ]) {
    const card = product.match(new RegExp(`<article[^>]*data-plan="${name}"[\\s\\S]*?</article>`))?.[0];
    assert.ok(card, `Missing ${name} card`);
    assert.equal(storageLimitBytesForTier(tier), bytes);
    const storage = card.match(/class="qon-storage">(\d+) <span>(MB|GB)/);
    assert.equal(Number(storage[1]) * (storage[2] === 'GB' ? 1e9 : 1e6), bytes);
    const limits = source.slice(source.indexOf(branch)).match(/activeBooks:\s*(null|\d+),\s*pagesPerBook:\s*(\d+),\s*imagesPerBook:\s*(\d+)/);
    assert.ok(limits, `Missing ${name} app limits`);
    const expected = [limits[1] === 'null' ? 'No fixed cap*' : limits[1],
      Number(limits[2]).toLocaleString('en-US'), limits[3]];
    assert.deepEqual([...card.matchAll(/<dd>(.*?)<\/dd>/g)].map(match => match[1]), expected);
  }
});

test('storage explanations do not imply monthly refills or unlimited Premium storage', () => {
  assert.match(product, /Storage does not reset each month/);
  assert.match(product, /Premium is not unlimited storage/);
  assert.match(product, /Images in Recently Deleted still use storage/);
  assert.match(product, /new image uploads pause/);
  assert.match(terms, /250 MB.*3 GB.*20 GB/);
  assert.match(terms, /does not reset each month/);
});

test('billing wording preserves same-account and original-store boundaries', () => {
  assert.match(product, /same Qonstellation account/);
  assert.match(product, /Different app accounts are not automatically combined/);
  assert.match(product, /do not automatically cancel existing charges/);
  assert.match(deletion, /does not automatically cancel/);
});

test('safety retention reflects resolution-based cleanup rather than a creation deadline', () => {
  assert.match(privacy, /not automatically removed 30 days after creation/);
  assert.match(privacy, /30 days after dismissal or resolution/);
  assert.match(privacy, /periodic cleanup/);
  assert.match(privacy, /active legal or safety hold/);
});

test('company navigation describes creation rather than publishing', () => {
  assert.doesNotMatch(read('home.js'), /Creative writing and publishing studio/);
  assert.doesNotMatch(read('index.html'), /Creative publishing/);
  assert.match(product, /not a publisher, public book marketplace, or printing service/);
  assert.match(terms, /not a publisher, public book distributor/);
});

test('Qonstellation local links, fragments, images, and styles resolve', () => {
  for (const file of pages) {
    const html = read(file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate IDs in ${file}`);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|mailto:|data:)/.test(value)) continue;
      const [target, fragment] = value.split('#');
      const filename = target.split('?')[0] || file;
      assert.ok(existsSync(path.join(root, filename)), `${file}: missing ${value}`);
      if (fragment) assert.ok(read(filename).includes(`id="${fragment}"`), `${file}: missing #${fragment}`);
    }
  }
});

test('all FAQs are keyboard-native controls and plan headings are labelled', () => {
  assert.equal((product.match(/<details>/g) || []).length, 5);
  assert.equal((product.match(/<summary>/g) || []).length, 5);
  assert.equal((product.match(/data-plan=/g) || []).length, 3);
  assert.match(read('qonstellation-page.css'), /focus-visible/);
  assert.match(read('qonstellation-page.css'), /prefers-reduced-motion/);
});
