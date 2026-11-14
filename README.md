# f8idea

Source for the blog at <https://f8fvwgzc.github.io/>. GitHub Pages rebuilds the site about a minute after every push to `main`.

## Write a post

Add a Markdown file to `_posts/`, named `YYYY-MM-DD-title.md`:

```markdown
---
title: My new post
description: One line shown under the title and in the post list.
---

The post starts here.
```

Then commit and push. The post appears at `/posts/title/` and at the top of the home page.

## Math and diagrams

- **Math (KaTeX):** write LaTeX between double dollar signs: `$$e^{i\pi} + 1 = 0$$` inside a sentence, or on lines of their own for a centered formula.
- **Diagrams (Mermaid):** use a code block whose language is `mermaid`.

Both are loaded only on pages that use them. The "Hello, world" post shows each one with its source. If a formula contains `{{` or `{%`, wrap it in `{% raw %}` and `{% endraw %}` so Jekyll leaves it alone.

## Change the look

| To change | Edit |
| --- | --- |
| Blog name, home page headline, top-right links | `_config.yml` |
| Colors, fonts, text sizes, column width | the `:root` block at the top of `assets/css/style.css` |
| Size of everything at once | the "Overall scale" rule (`font-size: 75%`) in `assets/css/style.css` |
| Page structure (header, footer) | `_layouts/default.html` |
| Home page | `_layouts/home.html` |
| Post page | `_layouts/post.html` |
| About page | `about.md` |

## Preview on your own machine (optional)

Needs Ruby 3. Run `bundle install` once, then `bundle exec jekyll serve` and open <http://localhost:4000>.
