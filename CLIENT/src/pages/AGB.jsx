import LegalPageLayout from '../components/legal/LegalPageLayout';

// ⚠️ RECHTLICHER HINWEIS / TODO VOR LAUNCH:
// Diese AGB sind eine VORLAGE und müssen an das tatsächliche Geschäftsmodell angepasst
// und juristisch geprüft werden. Insbesondere Widerrufsrecht, Gebühren/Provisionen und
// Haftung sind rechtlich sensibel. Alle [ECKIGEN KLAMMERN] ausfüllen.
const AGB = () => (
  <LegalPageLayout title="Allgemeine Geschäftsbedingungen (AGB)" lastUpdated="[DATUM]">
    <h2>§ 1 Geltungsbereich</h2>
    <p>
      Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform WCFinder
      (nachfolgend „Plattform“), betrieben von [FIRMENNAME] (nachfolgend „Betreiber“). Sie regeln das
      Verhältnis zwischen dem Betreiber und den Nutzern der Plattform.
    </p>

    <h2>§ 2 Vertragsgegenstand und Leistungen</h2>
    <p>
      WCFinder ist eine Online-Plattform, über die Nutzer öffentlich zugängliche Toiletten finden und
      kostenpflichtig buchen können. Der Betreiber stellt hierfür die technische Plattform bereit und
      vermittelt zwischen Nutzern und den anbietenden Partnern (Betreiber der Sanitäranlagen).
    </p>

    <h2>§ 3 Registrierung und Nutzerkonto</h2>
    <p>
      Für bestimmte Funktionen ist eine Registrierung erforderlich. Der Nutzer ist verpflichtet, bei
      der Registrierung wahrheitsgemäße Angaben zu machen und seine Zugangsdaten geheim zu halten.
      Eine Weitergabe an Dritte ist nicht gestattet.
    </p>

    <h2>§ 4 Buchung und Vertragsschluss</h2>
    <p>
      Mit dem Absenden einer Buchung gibt der Nutzer ein verbindliches Angebot ab. Der Vertrag kommt
      mit der Bestätigung der Buchung durch die Plattform zustande. Der Nutzer erhält eine Bestätigung
      per E-Mail bzw. in der Anwendung.
    </p>

    <h2>§ 5 Preise und Zahlung</h2>
    <p>
      Es gelten die zum Zeitpunkt der Buchung angegebenen Preise inklusive der gesetzlichen
      Umsatzsteuer. Die Zahlung erfolgt über die auf der Plattform angebotenen Zahlungsdienstleister
      (z. B. Stripe, PayPal). Der Betreiber kann eine Service-/Vermittlungsgebühr erheben, die vor
      Abschluss der Buchung ausgewiesen wird.
    </p>

    <h2>§ 6 Widerrufsrecht</h2>
    <p>
      Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu. Bei Dienstleistungen kann
      das Widerrufsrecht vorzeitig erlöschen, wenn die Leistung mit ausdrücklicher Zustimmung des
      Nutzers vor Ablauf der Widerrufsfrist vollständig erbracht wurde. [WIDERRUFSBELEHRUNG /
      AUSNAHMEN HIER RECHTSSICHER EINFÜGEN.]
    </p>

    <h2>§ 7 Pflichten des Nutzers</h2>
    <p>
      Der Nutzer verpflichtet sich, die Plattform nicht missbräuchlich zu nutzen, keine
      rechtswidrigen Inhalte einzustellen und die Rechte Dritter zu wahren.
    </p>

    <h2>§ 8 Haftung</h2>
    <p>
      Der Betreiber haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von
      Leben, Körper und Gesundheit. Im Übrigen ist die Haftung auf den vertragstypischen,
      vorhersehbaren Schaden begrenzt. Für die tatsächliche Verfügbarkeit oder Beschaffenheit der
      vermittelten Sanitäranlagen übernimmt der Betreiber keine Gewähr.
    </p>

    <h2>§ 9 Vertragslaufzeit und Kündigung</h2>
    <p>
      Das Nutzerkonto kann jederzeit ohne Einhaltung einer Frist gekündigt bzw. gelöscht werden.
      Bereits abgeschlossene Buchungen bleiben hiervon unberührt.
    </p>

    <h2>§ 10 Schlussbestimmungen</h2>
    <p>
      Es gilt das Recht der Bundesrepublik Deutschland. Sollte eine Bestimmung dieser AGB unwirksam
      sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
    </p>
  </LegalPageLayout>
);

export default AGB;
