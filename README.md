# Vokabeltrainer

GitHub-Pages-fertige PWA.

## Veröffentlicht auf GitHub Pages
[chuckmoritzgg.github.io/vokabeltrainer/](https://chuckmoritzgg.github.io/vokabeltrainer/)

## Als App installieren
Die Website ist als PWA (Progressive Web App) eingerichtet, und kann somit auf vielen Geräten wie eine normale App installiert werden. Die genaue Vorgehensweise hängt vom Gerät und Browser ab.

- Android + Chrome: Website öffnen → Menü "⋮" → „App installieren“ oder „Zum Startbildschirm hinzufügen“
- Android + andere Browser: Je nach Browser heißt die Funktion ähnlich, z. B. „Installieren“ oder „Zum Startbildschirm hinzufügen“.
- iPhone/iPad + Safari: Website öffnen → Teilen → „Zum Home-Bildschirm“ → „Hinzufügen“
- Windows + Chrome/Edge: Website öffnen → in der Adressleiste das Installieren-Symbol auswählen oder im Menü „App installieren“.
- Mac + Chrome/Edge: Website öffnen → über das Browser-Menü „App installieren“ auswählen.

Nach der Installation erscheint die Website wie eine normale App auf dem Startbildschirm, im App-Menü oder auf dem Desktop. Sie kann außerdem offline funktionieren und Inhalte zwischenspeichern.

«Hinweis: Nicht jeder Browser unterstützt PWAs vollständig. Wenn keine Installationsoption angezeigt wird, kann die Website trotzdem ganz normal im Browser verwendet werden.»

## Fortschritt
Der Fortschritt wird lokal pro **Buch → Unit → Vokabel** gespeichert. Das Schema ist bereits für weitere Bücher und Units vorbereitet. Mit **Fortschritt exportieren** entsteht eine JSON-Datei, die auf einem anderen Gerät über **Fortschritt importieren** eingelesen werden kann.

## Neue Bücher/Units
Die Vokabeldaten stehen in `index.html`. Neue Bücher können im Objekt `BOOKS` ergänzt werden. Jede Unit besitzt ein eigenes `cards`-Array und einen eigenen Fortschritts-Namespace.
