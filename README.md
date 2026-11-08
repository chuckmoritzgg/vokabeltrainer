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

Nach der Installation erscheint die Website wie eine normale App auf dem Startbildschirm, im App-Menü oder auf dem Desktop. Alle im Buchverzeichnis gelisteten Vokabeldateien werden für den Offlinebetrieb vorbereitet.

### Installationsbutton und automatische Updates

Unter **Training & Verwaltung → Einstellungen → App & Updates** befindet sich ein **„App installieren“**-Button, solange die Anwendung nicht im installierten Standalone-Modus ausgeführt wird. Unterstützte Browser öffnen dadurch den nativen Installationsdialog. Andere Browser (z. B. Safari auf dem iPhone) zeigen dort die Anleitung für die manuelle Installation. Die Erkennung bezieht sich auf die **aktuelle Startart**: Ob die App anderswo installiert wurde, ist für Websites nicht zuverlässig feststellbar.

Die PWA prüft Updates beim Start, wenn sie nach längerer Pause wieder in den Vordergrund kommt, bei erneuter Internetverbindung und regelmäßig während der Nutzung. Ein neues Release wird im Hintergrund **vollständig heruntergeladen und anhand seiner SHA-256-Prüfsummen überprüft**. Das bisherige Release bleibt so lange aktiv. Sobald die neue Version bereitsteht, erscheint auch bei geschlossenen Einstellungen unten ein Hinweis mit **„Neu starten“** und **„Später“**. Der Neustart wird nach Bestätigung durchgeführt; er beendet die aktuelle Runde, **löscht aber keinen gespeicherten Lernfortschritt**. Im Einstellungsbereich sind Version, Updatestatus und eine manuelle Prüfung sichtbar. Funktioniert auch außerhalb des installierten Modus, sofern Service Worker unterstützt werden.

Wichtige technische Einschränkung: Automatische Checks laufen nur, solange die App vom Browser ausgeführt wird (nicht bei vollständig geschlossener PWA). Service Worker benötigen HTTPS oder `localhost`. Ein Browser ohne Installations-Prompt kann keinen programmatischen Installationsdialog anzeigen. Bei einem fehlerhaften oder unvollständigen Update läuft die alte Version weiter.

> Hinweis: Nicht jeder Browser unterstützt PWAs vollständig. Wenn keine Installationsoption angezeigt wird, kann die Website trotzdem ganz normal im Browser verwendet werden.

## Fortschritt und Einstellungen

Der Lernfortschritt wird lokal getrennt nach **Buch → Unit → Vokabel** gespeichert. Die zuletzt verwendeten Trainingseinstellungen – insbesondere **Buch, Unit bzw. Seitenbereich, Richtung, Auswahl und Kartenanzahl** – werden ebenfalls gespeichert und beim nächsten Start wiederhergestellt.

Die Web-App verwendet dafür den lokalen Browserspeicher; die zuletzt aktive Auswahl wird zusätzlich als Cookie gespeichert. Mit **Fortschritt exportieren** entsteht eine JSON-Datei, die auf einem anderen Gerät über **Fortschritt importieren** eingelesen werden kann.

Bei der Kartenanzahl ist **Alle** die Standardeinstellung. Bei einer begrenzten Auswahl beträgt die kleinste mögliche Einstellung **20 Karten**.

### Antwortprüfung und Vibrationen

- Ein englisches **to** außerhalb von Klammern ist **Pflicht** (`to discover` verlangt `to discover`). **`(to)` bleibt optional**.
- **Satzzeichen** werden beim Vergleichen nicht verlangt. Wortabstände bleiben relevant; Bindestrich und andere Zeichen können entfallen oder durch einen Abstand ersetzt werden.
- **Eingeklammerte Textteile** sind einzeln optional, auch wenn mehrere Klammern in einer Vokabel stehen.
- In englischen Antworten sind **sth/something** und **sb/somebody/someone** austauschbar, ebenso **s.o.** und **s.b.** für Personen. Andere Wörter bleiben unverändert.
- Unter **Training & Verwaltung → Einstellungen** lassen sich **Vibrationen** dauerhaft ausschalten. Standardmäßig sind sie eingeschaltet. Bei einer falschen Antwort gibt es eine kurze Vibration, beim Trainingsende ein etwa dreisekündiges rhythmisches Muster (auch im zweisprachigen Lernmodus). Die Vibrations-API wird insbesondere von Android-Browsern unterstützt, nicht jedoch von allen Geräten oder Browsern. Eine fehlende Unterstützung verhindert das Lernen nicht.
- Der Vibrationsschalter ist Bestandteil der lokal gespeicherten Einstellungen und von Fortschritts-Exporten/Importen.


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

Nach jeder Änderung an `index.html`, `pwa.js`, den Buchdaten oder anderen ausgelieferten Dateien **vor dem Deploy** aus dem Projektverzeichnis ausführen:

```bash
node scripts/build-pwa.mjs
```

Das Skript erstellt `version.json` und `sw.js` neu, schreibt den Build-Identifier in `index.html` und nimmt **automatisch alle in `data/books.json` genannten Buchdateien** in den vollständig prüfbaren Offline-Cache auf. Zum Ändern der angezeigten semantischen Versionsnummer `app-version.json` bearbeiten. Bei inhaltlichen Änderungen ist keine manuelle Versionsnummer-Erhöhung erforderlich: Die Build-ID wird aus den Dateiinhalten abgeleitet. `sw.js` und `version.json` **zusammen mit allen App-Dateien** veröffentlichen, keines der generierten Artefakte auslassen. `sw.js` nicht manuell bearbeiten; dazu `scripts/sw.template.js` anpassen und den Build erneut ausführen. Das Build-Skript kann beliebig oft aufgerufen werden, ohne die Build-ID unnötig zu verändern.

**Für zukünftige Implementierungen / AI Agents:** Bei jeder Code- oder Vokabeldatenänderung den Build ausführen, die Tests prüfen und erst dann das Deployment-ZIP erstellen. Andernfalls kann eine PWA-Installation die Änderung nicht korrekt erkennen oder verifizieren.

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

Antwortprüfung: Ein `to` ohne Klammern muss bei Englisch-Antworten mitgeschrieben werden; `(to)` bleibt wie andere Klammerteile optional. Satzzeichen und die bestehenden englischen Abkürzungen werden weiterhin tolerant geprüft. Das Abschluss-Vibrationsmuster dauert 3 Sekunden (sofern vom Gerät unterstützt); Fehler-Vibration sowie die dauerhaft speicherbare Einstellung bleiben unverändert.

## Entwickler-Checks

Ohne zusätzliche Abhängigkeiten können die Tests der Antwortprüfung, der Vibrations-/Speicherlogik und der PWA-Installation/-Updateverwaltung mit Node.js ausgeführt werden:

```sh
node tests/answer-check.test.js
node tests/training-haptics.test.js
node tests/pwa-update.test.mjs
node tests/pwa-ui.test.mjs
```

## GitHub Pages

1. Alle Dateien und Ordner dieses Verzeichnisses in ein GitHub-Repository hochladen.
2. Unter **Settings → Pages** bei **Build and deployment** `Deploy from a branch` wählen.
3. Branch `main` und Ordner `/ (root)` auswählen.
4. Nach dem Deployment die GitHub-Pages-Adresse öffnen.
5. Auf unterstützten Browsern kann die Seite anschließend als App installiert werden.

Wichtig: Die Seite sollte über GitHub Pages/HTTPS geöffnet werden. Bei einem direkten lokalen Öffnen von `index.html` per `file://` können Browser das Laden der JSON-Dateien blockieren.
