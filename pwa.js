/* PWA installation and staged, verified updates. Runs independently from training state. */
(() => {
  'use strict';
  const build = document.querySelector('meta[name="app-build"]')?.content || '';
  const version = document.querySelector('meta[name="app-version"]')?.content || '';
  const CHECK_INTERVAL = 30 * 60 * 1000;
  const $ = (id) => document.getElementById(id);
  const ui = {
    version: $('pwaVersion'), status: $('pwaUpdateStatus'), check: $('pwaCheckBtn'),
    restart: $('pwaRestartBtn'), install: $('pwaInstallBtn'), hint: $('pwaInstallHelp'),
    banner: $('pwaBanner'), bannerRestart: $('pwaBannerRestart'), later: $('pwaBannerLater'),
  };
  let registration = null;
  let installEvent = null;
  let installationRequested = false;
  let justInstalled = false;
  let state = { kind: 'idle' };
  let remoteVersion = '';
  let remoteBuild = '';
  let lastCheck = 0;
  let currentCheck = null;
  let restarting = false;
  let dismissedBuild = null;
  const installed = () => window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    navigator.standalone === true;

  function installHint() {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
      return 'In Safari: Teilen → Zum Home-Bildschirm → Hinzufügen.';
    }
    if (/SamsungBrowser/.test(ua)) return 'Im Browsermenü: Zur Startseite hinzufügen bzw. App installieren.';
    if (/Firefox/.test(ua)) return 'Im Browsermenü: Installieren oder Zum Startbildschirm hinzufügen (falls unterstützt).';
    if (/Android/.test(ua)) return 'Im Browsermenü (⋮): App installieren oder Zum Startbildschirm hinzufügen.';
    return 'Im Browsermenü bzw. in der Adressleiste: App installieren (falls unterstützt).';
  }

  function draw() {
    const runningInstalled = installed() || justInstalled;
    ui.version.textContent = `Vokabeltrainer v${version || '?'} · Build ${build || 'unbekannt'}`;
    ui.install.classList.toggle('hidden', runningInstalled || installationRequested);
    if (runningInstalled) ui.hint.textContent = justInstalled && !installed() ? 'App installiert. Bitte über das App-Icon starten.' : 'Als installierte App geöffnet. Offline nutzbar.';
    else if (installationRequested) ui.hint.textContent = 'Installation angefordert. Öffne die App anschließend über das Startbildschirm-Icon.';
    else if (installEvent) ui.hint.textContent = 'App über den Button installieren und anschließend vom Startbildschirm starten.';
    else ui.hint.textContent = `Installation: ${installHint()} Der Button zeigt die Anleitung, falls der Browser keinen Installationsdialog anbietet.`;

    const { kind } = state;
    ui.check.disabled = restarting || kind === 'checking' || kind === 'downloading' || kind === 'ready' || kind === 'activating' || kind === 'unsupported';
    ui.check.textContent = kind === 'checking' ? 'Prüfe …' : kind === 'downloading' ? 'Download läuft …' : 'Auf Updates prüfen';
    const ready = kind === 'ready';
    ui.restart.classList.toggle('hidden', !ready);
    ui.restart.disabled = restarting;
    const showBanner = ready && dismissedBuild !== (state.build || 'waiting');
    ui.banner.classList.toggle('hidden', !showBanner);
    const label = state.version ? `Version ${state.version} (Build ${String(state.build || remoteBuild || '').slice(0, 8)})` : 'Eine neue Version';
    if (showBanner) ui.banner.querySelector('.pwa-banner-text').textContent = `${label} ist bereit.`;
    switch (kind) {
      case 'idle': ui.status.textContent = 'Updates werden automatisch geprüft.'; break;
      case 'checking': ui.status.textContent = 'Suche nach neuen Versionen …'; break;
      case 'current': ui.status.textContent = `Aktuell (geprüft um ${new Date(state.at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}).`; break;
      case 'downloading': ui.status.textContent = `Neue Version wird heruntergeladen und geprüft${state.total ? ` (${state.done} von ${state.total} Dateien)` : ''} …`; break;
      case 'ready': ui.status.textContent = `${label} ist vollständig geladen und geprüft. Mit „Neu starten“ wird sie aktiviert.`; break;
      case 'activating': ui.status.textContent = 'Neue Version wird aktiviert …'; break;
      case 'error': ui.status.textContent = state.message; break;
      case 'unsupported': ui.status.textContent = 'Automatische Updates benötigen HTTPS (oder localhost) und einen Browser mit Service-Worker-Unterstützung.'; break;
    }
  }
  function setState(next) {
    // Never overwrite the ready-to-restart prompt with a late check result.
    if (state.kind === 'ready' && next.kind !== 'activating' && next.kind !== 'error') return;
    state = next;
    draw();
  }
  function onWaiting() {
    if (!navigator.serviceWorker?.controller || !registration?.waiting) return;
    setState({ kind: 'ready', version: remoteVersion, build: remoteBuild || 'waiting' });
  }
  function watchInstalling(worker) {
    if (!worker) return;
    const changed = () => {
      if (worker.state === 'installed') onWaiting();
      if (worker.state === 'redundant' && state.kind === 'downloading') {
        setState({ kind: 'error', message: 'Der Download konnte nicht abgeschlossen werden. Bitte später erneut versuchen.' });
      }
    };
    worker.addEventListener('statechange', changed);
    changed();
  }
  let reloaded = false;
  function reloadOnce() {
    if (reloaded) return;
    reloaded = true;
    location.reload();
  }
  async function applyUpdate() {
    if (restarting) return;
    const waiting = registration?.waiting;
    if (!waiting) {
      setState({ kind: 'error', message: 'Die neue Version ist nicht mehr bereit. Bitte erneut auf Updates prüfen.' });
      return;
    }
    // The app keeps completed training scores in localStorage; the current round's queue is transient.
    if (!confirm('App mit der neuen Version neu starten? Eine laufende Trainingsrunde wird beendet; gespeicherter Lernfortschritt bleibt erhalten.')) return;
    restarting = true;
    state = { kind: 'activating' };
    draw();
    const active = () => waiting.state === 'activated' || navigator.serviceWorker.controller === waiting;
    const poll = setInterval(() => {
      if (!active()) return;
      clearInterval(poll);
      reloadOnce();
    }, 250);
    const timeout = setTimeout(() => {
      clearInterval(poll);
      if (active()) return reloadOnce();
      restarting = false;
      setState({ kind: 'error', message: 'Aktivierung fehlgeschlagen. Bitte erneut auf Updates prüfen.' });
    }, 20000);
    waiting.addEventListener('statechange', () => {
      if (active()) {
        clearInterval(poll);
        clearTimeout(timeout);
        reloadOnce();
      }
    });
    try { waiting.postMessage({ type: 'SKIP_WAITING' }); }
    catch (e) {
      clearInterval(poll);
      clearTimeout(timeout);
      restarting = false;
      setState({ kind: 'error', message: `Neustart fehlgeschlagen: ${e.message}` });
    }
  }

  async function checkForUpdates(manual = false) {
    if (!registration || state.kind === 'unsupported' || state.kind === 'ready' || state.kind === 'activating') return;
    if (currentCheck) return currentCheck;
    lastCheck = Date.now();
    if (manual) setState({ kind: 'checking' });
    const check = async () => {
      try {
        const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const online = await res.json();
        if (typeof online.build !== 'string' || !/^[0-9a-f]{12,64}$/.test(online.build)) throw new Error('Ungültige Versionsdatei');
        remoteBuild = online.build;
        remoteVersion = String(online.version || '');
        if (registration.waiting) return onWaiting();
        if (online.build === build) {
          if (state.kind !== 'downloading') setState({ kind: 'current', at: Date.now() });
          return;
        }
        setState({ kind: 'downloading', version: remoteVersion, done: 0, total: 0 });
        await registration.update();
        if (registration.waiting) return onWaiting();
        if (!registration.installing) setState({ kind: 'error', message: 'Die Versionsdatei ist neu, aber der Server liefert noch den alten Service Worker. Später erneut prüfen.' });
      } catch (err) {
        if (manual || state.kind === 'checking' || state.kind === 'downloading') {
          setState({ kind: 'error', message: navigator.onLine ? `Updateprüfung fehlgeschlagen: ${err.message}` : 'Offline: Updateprüfung derzeit nicht möglich.' });
        }
      }
    };
    currentCheck = check().finally(() => { currentCheck = null; });
    return currentCheck;
  }
  async function promptInstall() {
    if (installed()) return;
    if (!installEvent) {
      ui.hint.textContent = installHint();
      return;
    }
    const event = installEvent;
    installEvent = null;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      installationRequested = choice?.outcome === 'accepted';
    } catch {
      installationRequested = false;
    }
    draw();
  }

  ui.check.addEventListener('click', () => checkForUpdates(true));
  ui.restart.addEventListener('click', applyUpdate);
  ui.bannerRestart.addEventListener('click', applyUpdate);
  ui.install.addEventListener('click', promptInstall);
  ui.later.addEventListener('click', () => { dismissedBuild = state.build || 'waiting'; draw(); });
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installEvent = event;
    justInstalled = false;
    installationRequested = false;
    draw();
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    justInstalled = true;
    installationRequested = false;
    draw();
  });
  for (const mode of ['(display-mode: standalone)', '(display-mode: window-controls-overlay)']) {
    window.matchMedia?.(mode)?.addEventListener?.('change', draw);
  }
  draw();
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) ||
      (location.protocol === 'http:' && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))) {
    return setState({ kind: 'unsupported' });
  }
  navigator.serviceWorker.addEventListener('message', (event) => {
    const d = event.data || {};
    if (d.build === build) return;
    if (d.type === 'INSTALL_PROGRESS') {
      if (d.version) remoteVersion = d.version;
      if (d.build) remoteBuild = d.build;
      if (state.kind !== 'ready' && state.kind !== 'activating') {
        setState({ kind: 'downloading', version: remoteVersion, done: d.done, total: d.total });
      }
    } else if (d.type === 'INSTALL_FAILED') {
      setState({ kind: 'error', message: `Update konnte nicht geprüft werden: ${d.error}` });
    }
  });
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) reloadOnce(); // never reload the page on the first install
  });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((reg) => {
    registration = reg;
    reg.addEventListener('updatefound', () => {
      if (navigator.serviceWorker.controller) setState({ kind: 'downloading', version: remoteVersion, done: 0, total: 0 });
      watchInstalling(reg.installing);
    });
    watchInstalling(reg.installing);
    if (reg.waiting && navigator.serviceWorker.controller) onWaiting();
    setTimeout(() => checkForUpdates(), 1500);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Date.now() - lastCheck >= CHECK_INTERVAL) checkForUpdates();
    });
    window.addEventListener('online', () => checkForUpdates());
    setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastCheck >= CHECK_INTERVAL) checkForUpdates();
    }, 5 * 60 * 1000);
  }).catch((err) => setState({ kind: 'error', message: `Service Worker konnte nicht registriert werden: ${err.message}` }));
})();
