'use strict';
const demoTabs = [...document.querySelectorAll('[data-tab]')];
function selectTab(tab, focus = false) {
  for (const item of demoTabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  }
  if (focus) tab.focus();
}
for (const tab of demoTabs) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const index = demoTabs.indexOf(tab);
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % demoTabs.length;
    if (event.key === 'ArrowLeft') next = (index + demoTabs.length - 1) % demoTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = demoTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(demoTabs[next], true); }
  });
}
const releaseRoot = 'https://github.com/FishXIN/easysend-website/releases/download/';
for (const select of document.querySelectorAll('select[data-platform]')) {
  select.addEventListener('change', () => {
    const platform = select.dataset.platform;
    const version = ['macos', 'android'].includes(platform) ? '1.18.5' : '1.18.4';
    const option = select.value;
    let file, label;
    if (platform === 'macos') { file = `macos-${option}.dmg`; label = 'DMG'; }
    if (platform === 'android') { file = `android-${option}.apk`; label = 'APK'; }
    if (platform === 'windows') { file = option === 'zip' ? 'windows-x64.zip' : 'windows-x64-setup.exe'; label = option === 'zip' ? 'ZIP' : 'EXE'; }
    if (platform === 'linux') { file = `linux-x64.${option}`; label = option === 'deb' ? 'DEB' : 'tar.gz'; }
    const link = document.getElementById(`download-${platform}`);
    link.href = `${releaseRoot}v${version}-preview.1/EasySend-${version}-${file}`;
    link.firstChild.textContent = `下载 ${label} `;
  });
}

// Keep the native selects as a no-script fallback; enhance the visible controls
// so the expanded menu uses the same design on Windows, macOS and phones.
const packagePickers = [];
for (const select of document.querySelectorAll('select[data-platform]')) {
  const wrapper = select.parentElement;
  wrapper.classList.add('package-picker');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'package-trigger';
  trigger.id = `${select.id}-picker`;
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', select.getAttribute('aria-label'));
  trigger.innerHTML = '<span class="package-value"></span><svg class="icon" aria-hidden="true"><use href="#i-chevron"/></svg>';
  const menu = document.createElement('div');
  menu.className = 'package-menu';
  menu.id = `${select.id}-options`;
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', select.getAttribute('aria-label'));
  menu.hidden = true;
  trigger.setAttribute('aria-controls', menu.id);
  let active = select.selectedIndex;
  const options = [...select.options].map((option, index) => {
    const item = document.createElement('div');
    item.id = `${select.id}-option-${index}`;
    item.className = 'package-option';
    item.setAttribute('role', 'option');
    item.textContent = option.textContent;
    // Keep focus on the combobox until the click is committed.
    item.addEventListener('pointerdown', event => event.preventDefault());
    item.addEventListener('pointermove', () => setActive(index));
    item.addEventListener('click', () => choose(index));
    menu.append(item);
    return item;
  });
  function sync() {
    trigger.querySelector('.package-value').textContent = select.selectedOptions[0].textContent;
    options.forEach((item, index) => item.setAttribute('aria-selected', String(index === select.selectedIndex)));
  }
  function setActive(index) {
    active = index;
    options.forEach((item, i) => item.classList.toggle('is-active', i === active));
    if (!menu.hidden) trigger.setAttribute('aria-activedescendant', options[active].id);
  }
  function close() {
    menu.hidden = true;
    wrapper.removeAttribute('data-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
  }
  function open() {
    packagePickers.forEach(picker => picker.close());
    menu.hidden = false;
    wrapper.setAttribute('data-open', '');
    trigger.setAttribute('aria-expanded', 'true');
    setActive(select.selectedIndex);
  }
  function choose(index) {
    select.selectedIndex = index;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close();
    trigger.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', () => menu.hidden ? open() : close());
  trigger.addEventListener('keydown', event => {
    const wasOpen = !menu.hidden;
    if (event.key === 'Escape') { close(); event.preventDefault(); return; }
    if (event.key === 'Tab') { close(); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!wasOpen) open();
      if (event.key === 'Home') setActive(0);
      else if (event.key === 'End') setActive(options.length - 1);
      else if (wasOpen) setActive((active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      wasOpen ? choose(active) : open();
    }
  });
  wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget)) close(); });
  select.addEventListener('change', sync);
  select.hidden = true;
  const previousChevron = wrapper.querySelector('.select-chevron');
  if (previousChevron) previousChevron.hidden = true;
  wrapper.append(trigger, menu);
  const label = document.querySelector(`label[for="${select.id}"]`);
  if (label) label.htmlFor = trigger.id;
  packagePickers.push({ wrapper, close });
  sync();
}
document.addEventListener('pointerdown', event => {
  packagePickers.forEach(picker => { if (!picker.wrapper.contains(event.target)) picker.close(); });
});
