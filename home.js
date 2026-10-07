const destinations = [
  ['Products', 'products.html', 'All Æffinityone products'],
  ['Taskynx', 'taskynx.html', 'Work operations, schedules, proof, and team visibility'],
  ['Qonstellation', 'qonstellation.html', 'Creative writing and publishing studio'],
  ['AEXSpace', 'aexspace.html', 'Community spaces and shared activity'],
  ['Amouraéx', 'amouraex.html', 'Intentional connection and compatibility'],
  ['Services', 'services.html', 'Product, design, and technology services'],
  ['Portfolio', 'portfolio.html', 'Selected Æffinityone work'],
  ['Legal Center', 'legal.html', 'Product policies and legal documents'],
  ['Contact', 'contact.html', 'Contact Æffinityone'],
  ['Website Privacy', 'website-privacy.html', 'Website privacy policy'],
  ['Website Terms', 'website-terms.html', 'Website terms of use'],
  ['Join Us', 'join-us.html', 'Opportunities at Æffinityone'],
  ['Donate', 'donate.html', 'Choose an amount to support independent product development'],
  ['Community Guidelines', 'community-guidelines.html', 'Standards for our communities'],
  ['Safety & Reporting', 'safety.html', 'Safety resources and reporting'],
  ['Child Safety', 'child-safety.html', 'Child safety standards'],
  ['Delete Account', 'delete-account.html', 'Account deletion information']
];

const menu = document.querySelector('.menu-panel');
const menuButton = document.querySelector('.menu-button');
const menuScrim = document.querySelector('.menu-scrim');
const closeMenuButton = document.querySelector('.close-menu');

function setMenu(open) {
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  menuScrim.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (open) closeMenuButton.focus();
}

menuButton.addEventListener('click', () => setMenu(true));
closeMenuButton.addEventListener('click', () => setMenu(false));
menuScrim.addEventListener('click', () => setMenu(false));

const dialog = document.querySelector('.search-dialog');
const searchInput = document.querySelector('#site-search');
const results = document.querySelector('.search-results');

function renderResults(query = '') {
  const normalized = query.trim().toLowerCase();
  const filtered = destinations.filter(([name,, description]) => `${name} ${description}`.toLowerCase().includes(normalized));
  const matches = normalized ? filtered : filtered.slice(0, 6);
  document.querySelector('.search-caption').textContent = normalized ? 'Search results' : 'Quick links';
  results.innerHTML = matches.length
    ? matches.map(([name, href, description]) => `<a class="search-result" href="${href}"><strong>${name}</strong><span aria-hidden="true">→</span><small>${description}</small></a>`).join('')
    : '<p>No matching pages found.</p>';
}

function openSearch() {
  renderResults();
  dialog.showModal();
  requestAnimationFrame(() => searchInput.focus());
}

document.querySelector('.search-button').addEventListener('click', openSearch);
searchInput.addEventListener('input', event => renderResults(event.target.value));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!dialog.open) openSearch();
  }
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
const stories = [...document.querySelectorAll('[role="tabpanel"]')];
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => item.setAttribute('aria-selected', String(item === tab)));
  stories.forEach(story => { story.hidden = story.id !== `story-${tab.dataset.product}`; });
  document.querySelector(`#story-${tab.dataset.product}`).scrollIntoView({behavior: 'smooth', block: 'nearest'});
}));

document.querySelector('#year').textContent = new Date().getFullYear();
