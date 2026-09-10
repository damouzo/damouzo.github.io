/* Blog progressive enhancement:
   - Intercepts clicks on the post list and swaps only the main panel.
   - Updates the URL with history.pushState so every post keeps a real,
     shareable URL and the back/forward buttons still work.
   - Without JS (or if a fetch fails) every link still works as a normal
     page navigation, because every post is a real, indexable page.
*/
document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('blog-main');
  const sidebar = document.querySelector('.blog-sidebar');
  if (!main || !sidebar) return;

  async function loadPost(url, pushState = true) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();

      // Parse the fetched document without executing scripts or
      // loading its assets (unlike an iframe approach).
      const template = document.createElement('template');
      template.innerHTML = html;
      const doc = template.content;

      const newMain = doc.querySelector('#blog-main');
      if (!newMain) throw new Error('no blog-main content found');
      main.innerHTML = newMain.innerHTML;
      if (window.hljs) window.hljs.highlightAll();

      const newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;

      const newDescription = doc.querySelector('meta[name="description"]');
      if (newDescription) {
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', newDescription.getAttribute('content'));
      }

      if (pushState) history.pushState({ url }, '', url);

      // Highlight the matching post in the list; on the blog landing
      // (/blog/) fall back to the first visible post.
      const items = Array.from(sidebar.querySelectorAll('.post-list-item'));
      const matched = items.find(item => item.dataset.postUrl === url);
      const fallback = items.find(item => !item.classList.contains('hidden'));
      items.forEach(item => {
        const active = (matched || fallback) === item;
        item.classList.toggle('active', active);
        item.setAttribute('aria-current', active ? 'true' : 'false');
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      // Static fallback: navigate the normal way.
      window.location.href = url;
    }
  }

  sidebar.addEventListener('click', (e) => {
    // Let modified clicks (new tab, etc.) keep the default behaviour.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('.post-list-item');
    if (!link) return;
    e.preventDefault();
    loadPost(link.getAttribute('href'));
  });

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.url) loadPost(e.state.url, false);
  });

  const tagPills = sidebar.querySelectorAll('.tag-pill');
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tag = pill.dataset.tag; // empty string = "All"
      tagPills.forEach(p => p.classList.toggle('active', p === pill));

      const items = sidebar.querySelectorAll('.post-list-item');
      let firstVisibleUrl = null;
      items.forEach(item => {
        const tags = (item.dataset.tags || '').split(',').filter(Boolean);
        const visible = !tag || tags.includes(tag);
        item.classList.toggle('hidden', !visible);
        if (visible && !firstVisibleUrl) firstVisibleUrl = item.dataset.postUrl;
      });

      if (firstVisibleUrl) loadPost(firstVisibleUrl);
    });
  });
});