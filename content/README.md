# Writing pages and guides

Everything in this folder becomes a page on the site when you run `npm run build`.
Write in Markdown: it's plain text with a few symbols, like a WhatsApp message.

| You type | You get |
|---|---|
| `## A heading` | a section heading |
| `**bold**`, `*italic*` | **bold**, *italic* |
| `- item` (one per line) | a bullet list |
| `1. step` | a numbered list |
| `[link text](/haldi-invitation-video)` | a link |
| `![what the picture shows](/guides/photo.jpg)` | a picture (put the file in `public/guides/`) |
| `> a quote` | a quote |
| `<!-- a note to yourself -->` | nothing: notes never appear on the page |

## The header at the top of each file

```
---
title: When to send wedding invitations in India
description: One or two sentences that appear under the title on Google (under 155 characters).
status: draft          # change to: published   when it's ready to go live
date: 2026-11-15       # the day you first publish it
updated: 2026-11-15    # change this only when you make a real improvement
image: /guides/photo.jpg   # optional: the picture shown when the link is shared
---
```

- `status: draft` builds the page (so you can look at it at `/guides/<file-name>`) but hides it from
  Google, the sitemap, the menus and the RSS feed.
- `status: published` puts it live everywhere.
- The file name becomes the address: `content/guides/when-to-send-wedding-invitations.md` →
  `/guides/when-to-send-wedding-invitations`. Use lowercase words and dashes, and never rename a
  published file (the old address would break).

## Folders

- `content/guides/`: articles. Each draft has a writing brief in its comments: the search it's for,
  what to cover, and what only you can add.
- `content/pages/`: about, privacy, terms.

## Rules that keep Google happy (from the playbook)

1. One page per search. Don't write two guides that answer the same question.
2. Put something only you have in every guide: a photo, a real price you were quoted, what your
   family actually did, a mistake you made.
3. Link to two or three related pages inside your sentences (not just at the end), using the words
   people search for: "make a [Haldi invitation video](/haldi-invitation-video)".
4. Publish at most one or two new guides a week. Don't touch a published guide for about 90 days
   unless something is wrong. Google needs time to judge it.
5. AI can help you draft, but read every line, fix anything you wouldn't say, and add your own part.
