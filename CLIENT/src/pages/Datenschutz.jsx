import LegalPageLayout from '../components/legal/LegalPageLayout';

// ⚠️ RECHTLICHER HINWEIS / TODO VOR LAUNCH:
// Diese Datenschutzerklärung ist eine VORLAGE. Alle [ECKIGEN KLAMMERN] müssen mit den
// echten Angaben (Verantwortlicher, Hosting-Anbieter, Auftragsverarbeiter) ergänzt und
// vor dem Live-Gang juristisch geprüft werden (DSGVO / BDSG). Die genannten Dienste
// (Stripe, PayPal, MongoDB Atlas) müssen mit den tatsächlich eingesetzten übereinstimmen.
const Datenschutz = () => (
  <LegalPageLayout title="Datenschutzerklärung" lastUpdated="[DATUM]">
    <h2>1. Datenschutz auf einen Blick</h2>
    <p>
      Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
      personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind
      alle Daten, mit denen Sie persönlich identifiziert werden können.
    </p>

    <h2>2. Verantwortliche Stelle</h2>
    <p>
      Verantwortlich für die Datenverarbeitung auf dieser Website ist:
      <br />
      [FIRMENNAME]
      <br />
      [STRASSE UND HAUSNUMMER]
      <br />
      [PLZ] [ORT]
      <br />
      E-Mail: [E-MAIL-ADRESSE]
    </p>

    <h2>3. Ihre Rechte</h2>
    <p>Sie haben jederzeit das Recht:</p>
    <ul>
      <li>Auskunft über Ihre gespeicherten Daten zu erhalten (Art. 15 DSGVO),</li>
      <li>die Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO),</li>
      <li>die Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO),</li>
      <li>die Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO),</li>
      <li>der Verarbeitung zu widersprechen (Art. 21 DSGVO),</li>
      <li>Ihre Daten in einem übertragbaren Format zu erhalten (Art. 20 DSGVO).</li>
    </ul>
    <p>
      Zur Ausübung dieser Rechte genügt eine E-Mail an [E-MAIL-ADRESSE]. Zudem steht Ihnen ein
      Beschwerderecht bei der zuständigen Datenschutz-Aufsichtsbehörde zu.
    </p>

    <h2>4. Hosting</h2>
    <p>
      Diese Website wird bei einem externen Dienstleister gehostet ([HOSTING-ANBIETER, z. B. Render /
      Vercel]). Die Datenbank wird bei [MongoDB Atlas / DB-ANBIETER] betrieben. Die dabei erhobenen
      Daten werden auf den Servern des Anbieters gespeichert. Mit dem Anbieter wurde ein Vertrag über
      Auftragsverarbeitung (AVV) geschlossen.
    </p>

    <h2>5. Erfassung von Daten auf dieser Website</h2>
    <h3>Server-Log-Dateien</h3>
    <p>
      Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten
      Server-Log-Dateien (Browsertyp, Betriebssystem, Referrer-URL, Hostname, Uhrzeit, IP-Adresse).
      Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zum Zweck des sicheren und
      stabilen Betriebs.
    </p>
    <h3>Cookies</h3>
    <p>
      Diese Website verwendet technisch notwendige Cookies sowie – nach Ihrer Einwilligung – ggf.
      weitere Cookies. Die Einwilligung erfolgt über den Cookie-Banner (Art. 6 Abs. 1 lit. a DSGVO)
      und kann jederzeit widerrufen werden. Technisch notwendige Cookies beruhen auf Art. 6 Abs. 1
      lit. f DSGVO.
    </p>

    <h2>6. Registrierung und Nutzerkonto</h2>
    <p>
      Bei der Registrierung verarbeiten wir die von Ihnen angegebenen Daten (z. B. Name,
      E-Mail-Adresse) zur Bereitstellung des Nutzerkontos und zur Abwicklung der Buchungen. Die
      Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
    </p>

    <h2>7. Zahlungsdienstleister</h2>
    <p>
      Für die Zahlungsabwicklung nutzen wir externe Zahlungsdienstleister. Ihre Zahlungsdaten werden
      direkt an den jeweiligen Dienstleister übermittelt; Kartendaten werden nicht auf unseren
      Servern gespeichert.
    </p>
    <ul>
      <li>
        <strong>Stripe:</strong> Stripe Payments Europe, Ltd. Weitere Informationen:{' '}
        <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer">
          stripe.com/de/privacy
        </a>
      </li>
      <li>
        <strong>PayPal:</strong> PayPal (Europe) S.à r.l. et Cie, S.C.A. Weitere Informationen:{' '}
        <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer">
          paypal.com/de/…/privacy-full
        </a>
      </li>
    </ul>
    <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>

    <h2>8. SSL-/TLS-Verschlüsselung</h2>
    <p>
      Diese Seite nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte
      Verbindung erkennen Sie an „https://“ in der Adresszeile Ihres Browsers.
    </p>

    <h2>9. Speicherdauer</h2>
    <p>
      Soweit keine speziellen gesetzlichen Aufbewahrungsfristen bestehen, werden personenbezogene
      Daten gelöscht, sobald der Zweck der Verarbeitung entfällt. Rechnungsdaten werden aufgrund
      handels- und steuerrechtlicher Vorgaben (u. a. GoBD) bis zu 10 Jahre aufbewahrt.
    </p>
  </LegalPageLayout>
);

export default Datenschutz;
