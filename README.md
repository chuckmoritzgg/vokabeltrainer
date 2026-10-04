# Vokabeltrainer – Green Line 2

GitHub-Pages-fertige PWA.

## Veröffentlichen auf GitHub Pages
1. Neues Repository anlegen.
2. `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png` und `icon-512.png` in das Repository hochladen.
3. In GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Branch `main` und Ordner `/ (root)` auswählen und speichern.
5. Die von GitHub angezeigte HTTPS-Adresse öffnen. Danach kann die Seite auf unterstützten Geräten als App installiert werden.

## Fortschritt
Der Fortschritt wird lokal pro **Buch → Unit → Vokabel** gespeichert. Das Schema ist bereits für weitere Bücher und Units vorbereitet. Mit **Fortschritt exportieren** entsteht eine JSON-Datei, die auf einem anderen Gerät über **Fortschritt importieren** eingelesen werden kann.

## Neue Bücher/Units
Die Vokabeldaten stehen in `index.html`. Neue Bücher können im Objekt `BOOKS` ergänzt werden. Jede Unit besitzt ein eigenes `cards`-Array und einen eigenen Fortschritts-Namespace.
