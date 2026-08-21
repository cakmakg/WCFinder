import LegalPageLayout from '../components/legal/LegalPageLayout';

// ⚠️ RECHTLICHER HINWEIS / TODO VOR LAUNCH:
// Diese Seite ist eine VORLAGE. Alle [ECKIGEN KLAMMERN] müssen mit den echten
// Unternehmensdaten ersetzt und vor dem Live-Gang juristisch geprüft werden
// (z. B. über eRecht24 / anwaltliche Prüfung). Ein fehlerhaftes/fehlendes
// Impressum ist in Deutschland abmahnfähig (§ 5 TMG / § 5 DDG).
const Impressum = () => (
  <LegalPageLayout title="Impressum">
    <h2>Angaben gemäß § 5 DDG (ehem. § 5 TMG)</h2>
    <p>
      [FIRMENNAME / RECHTSFORM]
      <br />
      [STRASSE UND HAUSNUMMER]
      <br />
      [PLZ] [ORT]
      <br />
      [LAND]
    </p>

    <h2>Vertreten durch</h2>
    <p>[NAME DER VERTRETUNGSBERECHTIGTEN PERSON(EN) / GESCHÄFTSFÜHRUNG]</p>

    <h2>Kontakt</h2>
    <p>
      Telefon: [TELEFONNUMMER]
      <br />
      E-Mail: [E-MAIL-ADRESSE]
    </p>

    <h2>Registereintrag</h2>
    <p>
      Eintragung im Handelsregister.
      <br />
      Registergericht: [REGISTERGERICHT]
      <br />
      Registernummer: [HRB-NUMMER]
    </p>

    <h2>Umsatzsteuer-ID</h2>
    <p>
      Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
      <br />
      [USt-IdNr., z. B. DE123456789]
    </p>

    <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
    <p>
      [NAME]
      <br />
      [ANSCHRIFT, falls abweichend]
    </p>

    <h2>EU-Streitschlichtung</h2>
    <p>
      Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
      <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
        https://ec.europa.eu/consumers/odr/
      </a>
      . Unsere E-Mail-Adresse finden Sie oben im Impressum.
    </p>

    <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
    <p>
      Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
      Verbraucherschlichtungsstelle teilzunehmen.
    </p>

    <h2>Haftung für Inhalte</h2>
    <p>
      Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach
      den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter
      jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
      oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
    </p>

    <h2>Haftung für Links</h2>
    <p>
      Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
      Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für
      die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
      verantwortlich.
    </p>

    <h2>Urheberrecht</h2>
    <p>
      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
      deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
      Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
      jeweiligen Autors bzw. Erstellers.
    </p>
  </LegalPageLayout>
);

export default Impressum;
