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
