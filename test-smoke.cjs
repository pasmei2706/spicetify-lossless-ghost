const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('lossless-ghost.js', 'utf8');

function element(text, children = [], parent = null, attrs = {}) {
  return {
    textContent: text,
    children,
    parentElement: parent,
    dataset: {},
    attrs,
    style: { value: null, setProperty(name, value, priority) { this.value = [name, value, priority]; } },
    getAttribute(name) { return this.attrs[name] ?? null; },
    closest(selector) {
      let current = this;
      while (current) {
        if ((selector.includes('button') && current.tagName === 'BUTTON') ||
            (selector.includes('[role=') && current.role === 'button')) return current;
        current = current.parentElement;
      }
      return null;
    },
    querySelectorAll() { return descendants(this); },
  };
}
function descendants(node) {
  return node.children.flatMap(child => [child, ...descendants(child)]);
}
function runScenario(widget, expectedHidden) {
  let intervalCallback;
  const context = {
    window: { Spicetify: {} },
    document: { body: {}, querySelector(selector) { return selector.includes('now-playing-widget') ? widget : null; } },
    MutationObserver: class { constructor(callback) { this.callback = callback; } observe() {} disconnect() {} },
    requestAnimationFrame(callback) { callback(); },
    setInterval(callback) { intervalCallback = callback; return 1; },
    clearInterval() {},
    console: { log() {}, warn() {}, error() {} },
  };
  vm.runInNewContext(source, context);
  intervalCallback();
  const targets = descendants(widget);
  assert.strictEqual(targets.filter(node => node.dataset.losslessGhostHidden === '1').length, expectedHidden);
  return targets;
}

const button = element('Lossless'); button.tagName = 'BUTTON';
const label = element(' Lossless '); label.parentElement = button; button.children = [label];
runScenario(element('', [button]), 1);
assert.deepStrictEqual(button.style.value, ['display', 'none', 'important']);

const plainLabel = element('Lossless');
runScenario(element('', [plainLabel]), 1);
assert.strictEqual(plainLabel.style.value[1], 'none');

const accessibleBadge = element('', [], null, { 'aria-label': 'Lossless' });
runScenario(element('', [accessibleBadge]), 1);
assert.strictEqual(accessibleBadge.style.value[1], 'none');

const trackButton = element('Song TitleLossless'); trackButton.tagName = 'BUTTON';
const title = element('Song Title', [], trackButton);
const badge = element('Lossless', [], trackButton);
trackButton.children = [title, badge];
runScenario(element('', [trackButton]), 1);
assert.strictEqual(trackButton.style.value, null);
assert.strictEqual(badge.style.value[1], 'none');
console.log('DOM behavior: button, plain-text, accessible-label, and metadata-safe cases pass');
