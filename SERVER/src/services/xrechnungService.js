"use strict";
/* -------------------------------------------------------
    XRechnung Service - EN 16931 / XRechnung 3.0 Konform
    Cross-Industry Invoice (CII) XML Format
------------------------------------------------------- */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * XRechnung XML Generator
 * EN 16931:2017 / XRechnung 3.0 Compliant
 */
class XRechnungService {
    
    // XRechnung Namespaces
    static NAMESPACES = {
        rsm: 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
        ram: 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
        udt: 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100',
        qdt: 'urn:un:unece:uncefact:data:standard:QualifiedDataType:100'
    };
    
    // Guideline Specification Document Context Parameter
    static SPECIFICATION_ID = 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';
    
    /**
     * Generate XRechnung XML for invoice
     * @param {Object} rechnung - Rechnung document
     * @returns {Promise<string>} XML content
     */
    static async generateXML(rechnung) {
        const xml = [];
        
        // XML Declaration
        xml.push('<?xml version="1.0" encoding="UTF-8"?>');
        
        // Root Element with Namespaces
        xml.push(`<rsm:CrossIndustryInvoice`);
        xml.push(`  xmlns:rsm="${this.NAMESPACES.rsm}"`);
        xml.push(`  xmlns:ram="${this.NAMESPACES.ram}"`);
        xml.push(`  xmlns:udt="${this.NAMESPACES.udt}"`);
        xml.push(`  xmlns:qdt="${this.NAMESPACES.qdt}">`);
        
        // 1. ExchangedDocumentContext (BG-2)
        xml.push(this.generateDocumentContext(rechnung));
        
        // 2. ExchangedDocument (BT-1, BT-2, BT-3)
        xml.push(this.generateExchangedDocument(rechnung));
        
        // 3. SupplyChainTradeTransaction
        xml.push(this.generateSupplyChainTradeTransaction(rechnung));
        
        // Close Root Element
        xml.push('</rsm:CrossIndustryInvoice>');
        
        return xml.join('\n');
    }
    
    /**
     * Generate Document Context (BG-2)
     */
    static generateDocumentContext(rechnung) {
        const profileId = rechnung.xrechnung?.profilId || this.SPECIFICATION_ID;
        
        return `
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>${this.escapeXml(profileId)}</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>`;
    }
    
    /**
     * Generate Exchanged Document (BT-1 to BT-25)
     */
    static generateExchangedDocument(rechnung) {
        const typeCode = rechnung.xrechnung?.rechnungsTypCode || '380'; // 380 = Commercial Invoice
        
        let doc = `
  <rsm:ExchangedDocument>
    <ram:ID>${this.escapeXml(rechnung.rechnungsnummer)}</ram:ID>
    <ram:TypeCode>${typeCode}</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${this.formatDate102(rechnung.rechnungsdatum)}</udt:DateTimeString>
    </ram:IssueDateTime>`;
        
        // Include Note if present
        if (rechnung.notizen) {
            doc += `
    <ram:IncludedNote>
      <ram:Content>${this.escapeXml(rechnung.notizen)}</ram:Content>
    </ram:IncludedNote>`;
        }
        
        // Kleinunternehmer Hinweis (§19 UStG)
        if (rechnung.kleinunternehmer?.istKleinunternehmer) {
            doc += `
    <ram:IncludedNote>
      <ram:Content>${this.escapeXml(rechnung.kleinunternehmer.hinweisText || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.')}</ram:Content>
      <ram:SubjectCode>REG</ram:SubjectCode>
    </ram:IncludedNote>`;
        }
        
        doc += `
  </rsm:ExchangedDocument>`;
        
        return doc;
    }
    
    /**
     * Generate Supply Chain Trade Transaction
     * Contains all trade-related information
     */
    static generateSupplyChainTradeTransaction(rechnung) {
        let transaction = `
  <rsm:SupplyChainTradeTransaction>`;
        
        // Line Items (BG-25)
        transaction += this.generateLineItems(rechnung);
        
        // Trade Agreement (BG-4)
        transaction += this.generateTradeAgreement(rechnung);
        
        // Trade Delivery (BG-13)
        transaction += this.generateTradeDelivery(rechnung);
        
        // Trade Settlement (BG-16)
        transaction += this.generateTradeSettlement(rechnung);
        
        transaction += `
  </rsm:SupplyChainTradeTransaction>`;
        
        return transaction;
    }
    
    /**
     * Generate Line Items (BG-25)
     */
    static generateLineItems(rechnung) {
        let items = '';
        
        rechnung.positionen.forEach((pos, index) => {
            const lineId = pos.positionsnummer || (index + 1);
            const unitCode = pos.einheitCode || 'C62';
            
            items += `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${lineId}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${this.escapeXml(pos.beschreibung)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${this.formatAmount(pos.einzelpreis)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="${unitCode}">${this.formatQuantity(pos.menge)}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${this.getVATCategoryCode(pos.steuersatz, rechnung)}</ram:CategoryCode>
          <ram:RateApplicablePercent>${this.formatAmount(pos.steuersatz)}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${this.formatAmount(pos.gesamtpreis)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
        });
        
        return items;
    }
    
    /**
     * Generate Trade Agreement (BG-4 Seller, BG-7 Buyer)
     */
    static generateTradeAgreement(rechnung) {
        const seller = rechnung.leistender;
        const buyer = rechnung.rechnungsempfaenger;
        
        let agreement = `
    <ram:ApplicableHeaderTradeAgreement>`;
        
        // Buyer Reference (BT-10)
        if (rechnung.xrechnung?.kaeuferReferenz || buyer.leitwegId) {
            agreement += `
      <ram:BuyerReference>${this.escapeXml(rechnung.xrechnung?.kaeuferReferenz || buyer.leitwegId)}</ram:BuyerReference>`;
        }
        
        // Seller (BG-4)
        agreement += `
      <ram:SellerTradeParty>
        <ram:Name>${this.escapeXml(seller.firmenname)}</ram:Name>`;
        
        // Seller Legal Organization
        if (seller.handelsregister) {
            agreement += `
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${this.escapeXml(seller.handelsregister)}</ram:ID>
        </ram:SpecifiedLegalOrganization>`;
        }
        
        // Seller Address
        agreement += `
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${this.escapeXml(seller.plz)}</ram:PostcodeCode>
          <ram:LineOne>${this.escapeXml(seller.strasse)}${seller.hausnummer ? ' ' + seller.hausnummer : ''}</ram:LineOne>
          <ram:CityName>${this.escapeXml(seller.ort)}</ram:CityName>
          <ram:CountryID>${seller.landCode || 'DE'}</ram:CountryID>
        </ram:PostalTradeAddress>`;
        
        // Seller Email
        if (seller.email) {
            agreement += `
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="EM">${this.escapeXml(seller.email)}</ram:URIID>
        </ram:URIUniversalCommunication>`;
        }
        
        // Seller Tax ID (BT-31, BT-32)
        if (seller.ustIdNr) {
            agreement += `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${this.escapeXml(seller.ustIdNr)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`;
        }
        if (seller.steuernummer) {
            agreement += `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="FC">${this.escapeXml(seller.steuernummer)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`;
        }
        
        agreement += `
      </ram:SellerTradeParty>`;
        
        // Buyer (BG-7)
        agreement += `
      <ram:BuyerTradeParty>
        <ram:Name>${this.escapeXml(buyer.firmenname)}</ram:Name>`;
        
        // Buyer Address
        agreement += `
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${this.escapeXml(buyer.plz)}</ram:PostcodeCode>
          <ram:LineOne>${this.escapeXml(buyer.strasse)}${buyer.hausnummer ? ' ' + buyer.hausnummer : ''}</ram:LineOne>
          <ram:CityName>${this.escapeXml(buyer.ort)}</ram:CityName>
          <ram:CountryID>${buyer.landCode || 'DE'}</ram:CountryID>
        </ram:PostalTradeAddress>`;
        
        // Buyer Email
        if (buyer.email) {
            agreement += `
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="EM">${this.escapeXml(buyer.email)}</ram:URIID>
        </ram:URIUniversalCommunication>`;
        }
        
        // Buyer Tax ID
        if (buyer.ustIdNr) {
            agreement += `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${this.escapeXml(buyer.ustIdNr)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`;
        }
        
        agreement += `
      </ram:BuyerTradeParty>`;
        
        // Contract Reference
        if (rechnung.xrechnung?.vertragsnummer) {
            agreement += `
      <ram:ContractReferencedDocument>
        <ram:IssuerAssignedID>${this.escapeXml(rechnung.xrechnung.vertragsnummer)}</ram:IssuerAssignedID>
      </ram:ContractReferencedDocument>`;
        }
        
        agreement += `
    </ram:ApplicableHeaderTradeAgreement>`;
        
        return agreement;
    }
    
    /**
     * Generate Trade Delivery (BG-13)
     */
    static generateTradeDelivery(rechnung) {
        return `
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${this.formatDate102(rechnung.leistungszeitraum.bis)}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>`;
    }
    
    /**
     * Generate Trade Settlement (BG-16, BG-20, BG-22)
     */
    static generateTradeSettlement(rechnung) {
        const bank = rechnung.zahlungsbedingungen.bankverbindung;
        const summen = rechnung.summen;
        const waehrung = rechnung.xrechnung?.waehrungscode || 'EUR';
        
        let settlement = `
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${waehrung}</ram:InvoiceCurrencyCode>`;
        
        // Payment Means (BG-16) - SEPA Credit Transfer
        if (bank?.iban) {
            settlement += `
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>58</ram:TypeCode>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${this.escapeXml(bank.iban.replace(/\s/g, ''))}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>`;
            
            if (bank.bic) {
                settlement += `
        <ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${this.escapeXml(bank.bic)}</ram:BICID>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>`;
            }
            
            settlement += `
      </ram:SpecifiedTradeSettlementPaymentMeans>`;
        }
        
        // Tax (BG-23)
        if (!rechnung.kleinunternehmer?.istKleinunternehmer) {
            // Standard VAT
            settlement += `
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${this.formatAmount(summen.mehrwertsteuer.betrag)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${this.formatAmount(summen.mehrwertsteuer.netto || summen.nettobetrag)}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>${this.formatAmount(summen.mehrwertsteuer.satz)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`;
            
            // Reduced VAT (7%) if present
            if (summen.ermaeßigteSteuer?.betrag > 0) {
                settlement += `
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${this.formatAmount(summen.ermaeßigteSteuer.betrag)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${this.formatAmount(summen.ermaeßigteSteuer.netto)}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>${this.formatAmount(summen.ermaeßigteSteuer.satz)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`;
            }
        } else {
            // Kleinunternehmer - Exempt from VAT
            settlement += `
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>0.00</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${this.formatAmount(summen.nettobetrag)}</ram:BasisAmount>
        <ram:CategoryCode>E</ram:CategoryCode>
        <ram:ExemptionReason>Gemäß § 19 UStG wird keine Umsatzsteuer berechnet</ram:ExemptionReason>
        <ram:RateApplicablePercent>0.00</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`;
        }
        
        // Billing Period (BG-14)
        settlement += `
      <ram:BillingSpecifiedPeriod>
        <ram:StartDateTime>
          <udt:DateTimeString format="102">${this.formatDate102(rechnung.leistungszeitraum.von)}</udt:DateTimeString>
        </ram:StartDateTime>
        <ram:EndDateTime>
          <udt:DateTimeString format="102">${this.formatDate102(rechnung.leistungszeitraum.bis)}</udt:DateTimeString>
        </ram:EndDateTime>
      </ram:BillingSpecifiedPeriod>`;
        
        // Payment Terms (BT-9, BT-20)
        settlement += `
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${this.formatDate102(rechnung.zahlungsbedingungen.faelligkeitsdatum)}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>`;
        
        // Monetary Summation (BG-22)
        const totalTax = (summen.mehrwertsteuer?.betrag || 0) + (summen.ermaeßigteSteuer?.betrag || 0);
        
        settlement += `
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${this.formatAmount(summen.nettobetrag)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${this.formatAmount(summen.nettobetrag)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${waehrung}">${this.formatAmount(rechnung.kleinunternehmer?.istKleinunternehmer ? 0 : totalTax)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${this.formatAmount(summen.bruttobetrag)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${this.formatAmount(summen.zahlbetrag || summen.bruttobetrag)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>`;
        
        settlement += `
    </ram:ApplicableHeaderTradeSettlement>`;
        
        return settlement;
    }
    
    // =============================================
    // HELPER METHODS
    // =============================================
    
    /**
     * Format date as YYYYMMDD (format 102)
     */
    static formatDate102(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
    
    /**
     * Format amount with 2 decimal places
     */
    static formatAmount(amount) {
        return Number(amount || 0).toFixed(2);
    }
    
    /**
     * Format quantity
     */
    static formatQuantity(qty) {
        return Number(qty || 0).toString();
    }
    
    /**
     * Escape XML special characters
     */
    static escapeXml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    /**
     * Get VAT Category Code
     * S = Standard rate
     * Z = Zero rate
     * E = Exempt
     * AE = Reverse charge
     * K = Intra-community
     */
    static getVATCategoryCode(steuersatz, rechnung) {
        if (rechnung.kleinunternehmer?.istKleinunternehmer) {
            return 'E'; // Exempt
        }
        if (steuersatz === 0) {
            return 'Z'; // Zero rate
        }
        return 'S'; // Standard rate
    }
    
    /**
     * Save XRechnung XML to file
     * @param {Object} rechnung - Rechnung document
     * @returns {Promise<string>} File path
     */
    static async saveXML(rechnung) {
        const xmlContent = await this.generateXML(rechnung);
        
        // Create directory if not exists
        const xrechnungDir = path.join(__dirname, '../../public/rechnungen/xrechnung');
        if (!fs.existsSync(xrechnungDir)) {
            fs.mkdirSync(xrechnungDir, { recursive: true });
        }
        
        const filename = `${rechnung.rechnungsnummer}_xrechnung.xml`;
        const filepath = path.join(xrechnungDir, filename);
        
        fs.writeFileSync(filepath, xmlContent, 'utf8');
        
        return `/rechnungen/xrechnung/${filename}`;
    }
    
    /**
     * Calculate SHA-256 hash for integrity (GoBD)
     */
    static calculateHash(content) {
        return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
    }
    
    /**
     * Validate XRechnung structure (basic validation)
     * Full validation should use KOSIT Validator
     */
    static validateBasic(rechnung) {
        const errors = [];
        
        // Pflichtfelder prüfen (§14 UStG)
        
        // BT-1 Invoice number
        if (!rechnung.rechnungsnummer) {
            errors.push('BT-1: Rechnungsnummer fehlt');
        }
        
        // BT-2 Invoice issue date
        if (!rechnung.rechnungsdatum) {
            errors.push('BT-2: Rechnungsdatum fehlt');
        }
        
        // BT-5 Invoice currency code
        if (!rechnung.xrechnung?.waehrungscode && rechnung.xrechnung?.waehrungscode !== 'EUR') {
            // Default ist EUR, kein Fehler
        }
        
        // BG-4 Seller
        if (!rechnung.leistender?.firmenname) {
            errors.push('BG-4: Verkäufer Name fehlt');
        }
        if (!rechnung.leistender?.strasse || !rechnung.leistender?.plz || !rechnung.leistender?.ort) {
            errors.push('BG-4: Verkäufer Adresse unvollständig');
        }
        if (!rechnung.leistender?.ustIdNr && !rechnung.leistender?.steuernummer) {
            errors.push('BT-31/BT-32: Steuernummer oder USt-IdNr fehlt');
        }
        
        // BG-7 Buyer
        if (!rechnung.rechnungsempfaenger?.firmenname) {
            errors.push('BG-7: Käufer Name fehlt');
        }
        if (!rechnung.rechnungsempfaenger?.plz || !rechnung.rechnungsempfaenger?.ort) {
            errors.push('BG-7: Käufer Adresse unvollständig');
        }
        
        // BG-25 Invoice Line
        if (!rechnung.positionen || rechnung.positionen.length === 0) {
            errors.push('BG-25: Mindestens eine Rechnungsposition erforderlich');
        }
        
        // BT-109 Invoice total amount with VAT
        if (typeof rechnung.summen?.bruttobetrag !== 'number') {
            errors.push('BT-109: Gesamtbetrag fehlt');
        }
        
        // BT-116 Invoice total amount due for payment
        if (typeof rechnung.summen?.zahlbetrag !== 'number' && typeof rechnung.summen?.bruttobetrag !== 'number') {
            errors.push('BT-116: Zahlbetrag fehlt');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = XRechnungService;

