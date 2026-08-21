// DSGVO Cookie-Einwilligung: Speicherung und Auslesen der Entscheidung.
//
// Liegt bewusst außerhalb der Banner-Komponente: Dienste, die erst nach
// Einwilligung geladen werden dürfen (z. B. Analytics), fragen den Status hier
// ab, ohne die UI-Komponente zu importieren.
//
// Werte: 'all' (alle Cookies) | 'necessary' (nur notwendige) | null (noch keine
// Entscheidung getroffen).

const STORAGE_KEY = 'cookieConsent';

export const getCookieConsent = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setCookieConsent = (choice) => {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // localStorage nicht verfügbar (Private Mode, blockierte Site-Daten) –
    // die Entscheidung geht verloren, der Banner erscheint erneut.
  }
};

// Nicht-notwendige Dienste dürfen ausschließlich bei 'all' geladen werden.
export const hasFullCookieConsent = () => getCookieConsent() === 'all';
