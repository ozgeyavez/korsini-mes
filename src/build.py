"""Kaynakları tek dosyalık HTML'e derler.
Kullanım: python3 src/build.py docs/index.html          (GitHub Pages, tam HTML)
          python3 src/build.py out.html --artifact      (claude.ai sayfası, iskeletsiz)"""
import os, sys
S = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(S, '..', 'docs', 'index.html')
ART = '--artifact' in sys.argv
rd = lambda n: open(os.path.join(S, n), encoding='utf8').read()
safe = lambda s: s.replace('</script', '<\\/script')
XLSX = '<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>'
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">')
body = f'''<template id="logo-tpl">{rd('logo.svg').strip()}</template>
<div id="app"></div>
<div id="toast" class="toast" role="status" aria-live="polite"></div>
{XLSX}
<script>{safe(rd('app.js'))}</script>'''
if ART:
    html = f'''<title>MCC Korsini MES</title>
<meta name="claude:viewport-fit-sides" content="cover">
{FONTS}
<style>{rd('app.css')}</style>
{body}
'''
else:
    html = f'''<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>MCC Korsini MES</title>
{FONTS}
<style>{rd('app.css')}</style></head>
<body>
{body}
</body></html>'''
open(OUT, 'w', encoding='utf8').write(html)
print(OUT, len(html) // 1024, 'KB')
