# Vokabeltrainer

GitHub-Pages-fertige PWA für das Lernen von Englischvokabeln.

## Veröffentlicht auf GitHub Pages

[chuckmoritzgg.github.io/vokabeltrainer/](https://chuckmoritzgg.github.io/vokabeltrainer/)

## Als App installieren

Die Website ist als PWA (Progressive Web App) eingerichtet und kann auf vielen Geräten wie eine normale App installiert werden. Die genaue Vorgehensweise hängt vom Gerät und Browser ab.

- Android + Chrome: Website öffnen → Menü „⋮“ → „App installieren“ oder „Zum Startbildschirm hinzufügen“
- Android + andere Browser: Je nach Browser heißt die Funktion ähnlich, z. B. „Installieren“ oder „Zum Startbildschirm hinzufügen“.
- iPhone/iPad + Safari: Website öffnen → Teilen → „Zum Home-Bildschirm“ → „Hinzufügen“
- Windows + Chrome/Edge: Website öffnen → in der Adressleiste das Installieren-Symbol auswählen oder im Menü „App installieren“
- Mac + Chrome/Edge: Website öffnen → über das Browser-Menü „App installieren“ auswählen

Nach der Installation erscheint die Website wie eine normale App auf dem Startbildschirm, im App-Menü oder auf dem Desktop. Sie kann außerdem offline funktionieren und Inhalte zwischenspeichern.

> Hinweis: Nicht jeder Browser unterstützt PWAs vollständig. Wenn keine Installationsoption angezeigt wird, kann die Website trotzdem ganz normal im Browser verwendet werden.

## Fortschritt und Einstellungen

Der Lernfortschritt wird lokal getrennt nach **Buch → Unit → Vokabel** gespeichert. Die zuletzt verwendeten Trainingseinstellungen – insbesondere **Buch, Unit bzw. Seitenbereich, Richtung, Auswahl und Kartenanzahl** – werden ebenfalls gespeichert und beim nächsten Start wiederhergestellt.

Die Web-App verwendet dafür den lokalen Browserspeicher; die zuletzt aktive Auswahl wird zusätzlich als Cookie gespeichert. Mit **Fortschritt exportieren** entsteht eine JSON-Datei, die auf einem anderen Gerät über **Fortschritt importieren** eingelesen werden kann.

Bei der Kartenanzahl ist **Alle** die Standardeinstellung. Bei einer begrenzten Auswahl beträgt die kleinste mögliche Einstellung **20 Karten**.

## Datenstruktur und neue Bücher/Units

Die Vokabeldaten liegen getrennt von `index.html` im Ordner `data/`.

`data/books.json` ist die Liste aller Bücher. Für jedes Buch gibt es eine eigene JSON-Datei mit Buchmetadaten, Units und Karten.

### Eintrag in `data/books.json`

Für ein neues Buch genau einen Eintrag in das Array von `data/books.json` einfügen:

```json
{
  "id": "eindeutige-buch-id",
  "title": "Buchtitel",
  "subtitle": "z. B. 6. Klasse",
  "file": "./data/eindeutige-buch-id.json"
}
```

Die `id` muss eindeutig sein und muss mit `id` in der Buchdatei übereinstimmen. `file` zeigt auf die zugehörige JSON-Datei.

### Struktur einer Buchdatei

```json
{
  "id": "eindeutige-buch-id",
  "title": "Buchtitel",
  "subtitle": "z. B. 6. Klasse",
  "pageRange": {
    "min": 100,
    "max": 160
  },
  "units": [
    {
      "id": "unit1",
      "title": "Unit 1",
      "pages": [100, 119]
    }
  ],
  "cards": [
    {
      "id": 0,
      "de": "Beispiel",
      "en": "example",
      "context": "Can you give me an example?",
      "unit": "unit1",
      "page": 100
    }
  ]
}
```

Regeln:

- `id` jeder Karte muss innerhalb des Buches eindeutig sein.
- `unit` einer Karte muss exakt einer `units[].id` entsprechen.
- `page` ist die gedruckte Seitenzahl im Buch.
- `pageRange.min` und `pageRange.max` umfassen den gesamten verfügbaren Seitenbereich des Buches.
- `units[].pages` enthält die erste und letzte Vokabelseite der Unit.
- `context` ist der zum Eintrag gehörende Beispielsatz; wenn keiner vorhanden ist, `""` verwenden.
- Optionale Bestandteile einer Vokabel dürfen in runden Klammern stehen, z. B. `kind (of)`. Die Web-App akzeptiert bei der Eingabe sowohl die vollständige Form als auch die Form ohne Klammerzusatz.

Nach dem Hinzufügen einer neuen Buchdatei muss sie auch in `sw.js` in `ASSETS` aufgenommen werden, damit sie offline verfügbar ist.

## Prompt für ein LLM: Vokabelkarten aus Scans erstellen

Diesen Prompt zusammen mit den Scans der Vokabelseiten verwenden. Die Platzhalter für Buchdaten vorher ausfüllen:

```text
Du erhältst Scans der Vocabulary-Seiten eines Englischbuchs und sollst eine JSON-Datendatei für eine bestehende Vokabeltrainer-Web-App erzeugen.

Buchdaten:
- Buch-ID: <EINDEUTIGE-ID, z. B. english-book-2-kl6>
- Titel: <BUCHTITEL>
- Untertitel: <z. B. 6. Klasse>

Extraktion:
1. Extrahiere ausschließlich die Deutsch–Englisch-Vokabeln aus dem festen Vokabelraster der Scans. Ignoriere Übungen, Aufgaben, Schaubilder, Bilder, Zusatzboxen, Lautschrift-Übungen und sonstige Inhalte außerhalb dieses Rasters.
2. Übernimm pro Vokabel die deutsche Bedeutung, die englische Vokabel, den zugehörigen Kontext-/Beispielsatz, die gedruckte Seitenzahl und die Unit.
3. Korrigiere offensichtliche OCR-Fehler anhand des Scans. Achte besonders auf Apostrophe, Bindestriche, Mehrwortausdrücke und Endungen wie -ly. Erfinde nichts und ändere keine tatsächlich gedruckte Vokabel in eine andere Wortform.
4. Wenn ein Bestandteil der Vokabel in runden Klammern steht, übernimm die Klammern exakt, z. B. "kind (of)". Diese Teile werden von der Web-App später als optional behandelt.
5. Verwende für jede Karte innerhalb des Buches eine eindeutige fortlaufende numerische id ab 0.

Die Web-App erwartet EXAKT dieses JSON-Schema:
{
  "id": "<Buch-ID>",
  "title": "<Buchtitel>",
  "subtitle": "<Untertitel>",
  "pageRange": {"min": <kleinste gedruckte Vokabelseite>, "max": <größte gedruckte Vokabelseite>},
  "units": [
    {"id": "unit1", "title": "Unit 1", "pages": [<erste Vokabelseite>, <letzte Vokabelseite>]}
  ],
  "cards": [
    {"id": 0, "de": "<Deutsch>", "en": "<Englisch>", "context": "<Kontextsatz oder leerer String>", "unit": "unit1", "page": <gedruckte Seitenzahl>}
  ]
}

Zusätzlich gib NACH der Buch-JSON einen separaten Block mit genau dem Eintrag aus, den der Nutzer in data/books.json in das bestehende Array kopieren muss:
{
  "id": "<Buch-ID>",
  "title": "<Buchtitel>",
  "subtitle": "<Untertitel>",
  "file": "./data/<Buch-ID>.json"
}

Ausgabeformat:
- Zuerst ein Codeblock mit der vollständigen Buch-JSON.
- Danach ein Codeblock mit genau einem books.json-Eintrag.
- Keine weiteren Erklärungen.
- Vor der Ausgabe intern prüfen: alle Karten haben id/de/en/context/unit/page; alle unit-Werte existieren in units; alle Seiten liegen in pageRange; Karten-IDs sind eindeutig; JSON ist syntaktisch valide.
```

## GitHub Pages

1. Alle Dateien und Ordner dieses Verzeichnisses in ein GitHub-Repository hochladen.
2. Unter **Settings → Pages** bei **Build and deployment** `Deploy from a branch` wählen.
3. Branch `main` und Ordner `/ (root)` auswählen.
4. Nach dem Deployment die GitHub-Pages-Adresse öffnen.
5. Auf unterstützten Browsern kann die Seite anschließend als App installiert werden.

Wichtig: Die Seite sollte über GitHub Pages/HTTPS geöffnet werden. Bei einem direkten lokalen Öffnen von `index.html` per `file://` können Browser das Laden der JSON-Dateien blockieren.
