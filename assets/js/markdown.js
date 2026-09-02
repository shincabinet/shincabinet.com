(() => {
  "use strict";

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function safeHref(value) {
    const href = String(value || "").trim();
    if (!href) return "";
    if (href.startsWith("/") && !href.startsWith("//")) return href;
    if (/^(https?:|mailto:)/i.test(href)) return href;
    return "";
  }

  function inlineMarkdown(value = "") {
    const tokens = [];
    let text = String(value).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const safe = safeHref(href);
      const token = `@@SHINLINK${tokens.length}@@`;
      tokens.push(safe
        ? `<a href="${escapeHtml(safe)}"${/^https?:/i.test(safe) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(label)}</a>`
        : escapeHtml(label));
      return token;
    });
    text = escapeHtml(text);
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    text = text.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
    tokens.forEach((html, index) => {
      text = text.replace(`@@SHINLINK${index}@@`, html);
    });
    return text;
  }

  function render(markdown = "") {
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const output = [];
    let paragraph = [];
    let list = null;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      output.push(`<p>${inlineMarkdown(paragraph.join(" ").trim())}</p>`);
      paragraph = [];
    };
    const flushList = () => {
      if (!list) return;
      output.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
      list = null;
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }
      if (/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        flushParagraph(); flushList(); output.push("<hr>"); return;
      }
      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushParagraph(); flushList();
        const level = heading[1].length;
        output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
        return;
      }
      const quote = trimmed.match(/^>\s?(.*)$/);
      if (quote) {
        flushParagraph(); flushList();
        output.push(`<blockquote><p>${inlineMarkdown(quote[1])}</p></blockquote>`);
        return;
      }
      const unordered = trimmed.match(/^[-+*]\s+(.+)$/);
      const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph();
        const type = ordered ? "ol" : "ul";
        if (list && list.type !== type) flushList();
        if (!list) list = { type, items: [] };
        list.items.push((ordered || unordered)[1]);
        return;
      }
      flushList();
      paragraph.push(trimmed);
    });

    flushParagraph();
    flushList();
    return output.join("\n");
  }

  window.SHIN_MARKDOWN = Object.freeze({ render });
})();
