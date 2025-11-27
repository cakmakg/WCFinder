// features/admin/components/InvoiceForm.jsx
// Invoice form dialog with editable fields and PDF download

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Divider,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";

const InvoiceForm = ({ open, onClose, business, businessStats, viewMode, selectedDate }) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    businessName: "",
    businessAddress: "",
    businessTaxId: "",
    customerName: "",
    customerAddress: "",
    items: [],
    subtotal: 0,
    taxRate: 19,
    taxAmount: 0,
    total: 0,
    notes: "",
  });

  useEffect(() => {
    if (business && businessStats && selectedDate) {
      // Get business ID - could be _id or id
      const businessId = business._id?.toString() || business.id?.toString() || business._id || business.id || "";
      const businessIdStr = businessId.toString();
      
      // Find matching stats - try both id formats
      const stats = businessStats.find((b) => {
        const bId = b.id?.toString() || b.id;
        return bId === businessIdStr || bId === business._id?.toString() || bId === business.id?.toString();
      });
      
      const revenue = viewMode === "daily" ? stats?.dailyRevenue || 0 : stats?.monthlyRevenue || 0;
      const taxRate = 19; // MwSt (Mehrwertsteuer) in Deutschland
      const subtotal = revenue;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      // Get owner name
      let ownerName = "";
      if (business.owner) {
        if (typeof business.owner === "object" && business.owner !== null) {
          ownerName = business.owner.username || business.owner.name || business.owner.email || "";
        } else if (typeof business.owner === "string") {
          ownerName = business.owner;
        }
      }

      // Generate invoice number safely
      const invoiceSuffix = businessIdStr && businessIdStr.length > 0 
        ? businessIdStr.slice(-6) 
        : Date.now().toString().slice(-6);
      const timestampSuffix = Date.now().toString().slice(-4);

      setInvoiceData({
        invoiceNumber: `INV-${invoiceSuffix}-${timestampSuffix}`,
        invoiceDate: selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        dueDate: selectedDate 
          ? new Date(selectedDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        businessName: business.businessName || "",
        businessAddress: business.address || "",
        businessTaxId: business.taxId || "",
        customerName: ownerName,
        customerAddress: "",
        items: [
          {
            description: viewMode === "daily" ? "Tägliche Dienstleistungen" : "Monatliche Dienstleistungen",
            quantity: 1,
            unitPrice: subtotal,
            amount: subtotal,
          },
        ],
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: viewMode === "daily"
          ? `Rechnung für tägliche Dienstleistungen am ${selectedDate ? selectedDate.toLocaleDateString("de-DE") : new Date().toLocaleDateString("de-DE")}`
          : `Rechnung für monatliche Dienstleistungen im ${selectedDate ? selectedDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" }) : new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`,
      });
    }
  }, [business, businessStats, viewMode, selectedDate]);

  const handleFieldChange = (field, value) => {
    setInvoiceData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate totals if items change
      if (field === "items") {
        const subtotal = value.reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = (subtotal * updated.taxRate) / 100;
        updated.subtotal = subtotal;
        updated.taxAmount = taxAmount;
        updated.total = subtotal + taxAmount;
      } else if (field === "taxRate") {
        const taxAmount = (updated.subtotal * value) / 100;
        updated.taxAmount = taxAmount;
        updated.total = updated.subtotal + taxAmount;
      }
      
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate item amount
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].amount = (updatedItems[index].quantity || 0) * (updatedItems[index].unitPrice || 0);
    }
    
    handleFieldChange("items", updatedItems);
  };

  const addItem = () => {
    handleFieldChange("items", [
      ...invoiceData.items,
      { description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const removeItem = (index) => {
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    handleFieldChange("items", updatedItems);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Header with colored background
    doc.setFillColor(8, 145, 178); // #0891b2
    doc.rect(0, 0, pageWidth, 35, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RECHNUNG", pageWidth - margin, 20, { align: "right" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Rechnungsnummer: ${invoiceData.invoiceNumber}`, pageWidth - margin, 28, { align: "right" });
    doc.text(`Rechnungsdatum: ${new Date(invoiceData.invoiceDate).toLocaleDateString("de-DE")} | Fällig: ${new Date(invoiceData.dueDate).toLocaleDateString("de-DE")}`, pageWidth - margin, 32, { align: "right" });
    
    doc.setTextColor(0, 0, 0);
    yPos = 45;

    // Business & Customer Info - Side by Side (Compact)
    const colWidth = (pageWidth - 3 * margin) / 2;
    
    // Business Info (Left)
    doc.setFillColor(248, 250, 252); // #f8fafc
    doc.rect(margin, yPos, colWidth, 30, "F");
    doc.setDrawColor(226, 232, 240); // #e2e8f0
    doc.rect(margin, yPos, colWidth, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 145, 178);
    doc.text("Rechnungssteller", margin + 3, yPos + 7);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(invoiceData.businessName || "-", margin + 3, yPos + 12);
    if (invoiceData.businessAddress) {
      const addressLines = doc.splitTextToSize(invoiceData.businessAddress, colWidth - 6);
      addressLines.forEach((line, idx) => {
        doc.text(line, margin + 3, yPos + 17 + idx * 4);
      });
    }
    if (invoiceData.businessTaxId) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`USt-IdNr.: ${invoiceData.businessTaxId}`, margin + 3, yPos + 27);
    }

    // Customer Info (Right)
    doc.setFillColor(248, 250, 252);
    doc.rect(margin + colWidth + margin, yPos, colWidth, 30, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin + colWidth + margin, yPos, colWidth, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 145, 178);
    doc.text("Rechnungsempfänger", margin + colWidth + margin + 3, yPos + 7);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(invoiceData.customerName || "-", margin + colWidth + margin + 3, yPos + 12);
    if (invoiceData.customerAddress) {
      const addressLines = doc.splitTextToSize(invoiceData.customerAddress, colWidth - 6);
      addressLines.forEach((line, idx) => {
        doc.text(line, margin + colWidth + margin + 3, yPos + 17 + idx * 4);
      });
    }
    
    yPos += 35;

    // Items Table - Compact
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 145, 178);
    doc.text("Positionen", margin, yPos);
    yPos += 8;

    // Table Header
    doc.setFillColor(8, 145, 178);
    doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Beschreibung", margin + 2, yPos);
    doc.text("Menge", pageWidth - 100, yPos);
    doc.text("Einzelpreis", pageWidth - 70, yPos);
    doc.text("Gesamt", pageWidth - margin, yPos, { align: "right" });
    yPos += 8;

    // Table Rows
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    invoiceData.items.forEach((item, idx) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }
      
      // Alternating row colors
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 8, "F");
      }
      
      const descLines = doc.splitTextToSize(item.description || "-", 90);
      const rowHeight = Math.max(descLines.length * 4, 8);
      
      descLines.forEach((line, lineIdx) => {
        doc.text(line, margin + 2, yPos + lineIdx * 4);
      });
      doc.text((item.quantity || 0).toString(), pageWidth - 100, yPos);
      doc.text(`€${(item.unitPrice || 0).toFixed(2)}`, pageWidth - 70, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(`€${(item.amount || 0).toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
      doc.setFont("helvetica", "normal");
      yPos += rowHeight;
    });
    yPos += 5;

    // Totals - Compact Box
    const totalsBoxWidth = 100;
    const totalsBoxX = pageWidth - margin - totalsBoxWidth;
    doc.setFillColor(248, 250, 252);
    doc.rect(totalsBoxX, yPos - 3, totalsBoxWidth, 25, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(totalsBoxX, yPos - 3, totalsBoxWidth, 25);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Zwischensumme:", totalsBoxX + 2, yPos + 3);
    doc.text(`€${invoiceData.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos + 3, { align: "right" });
    yPos += 6;
    doc.text(`MwSt. (${invoiceData.taxRate}%):`, totalsBoxX + 2, yPos + 3);
    doc.text(`€${invoiceData.taxAmount.toFixed(2)}`, pageWidth - margin - 2, yPos + 3, { align: "right" });
    yPos += 6;
    
    // Total with colored background
    doc.setFillColor(8, 145, 178);
    doc.rect(totalsBoxX, yPos - 3, totalsBoxWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("Gesamtbetrag:", totalsBoxX + 2, yPos + 3);
    doc.text(`€${invoiceData.total.toFixed(2)}`, pageWidth - margin - 2, yPos + 3, { align: "right" });
    yPos += 12;

    // Notes (if exists)
    if (invoiceData.notes) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setFillColor(255, 250, 240);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 15, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 15);
      const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - 2 * margin - 4);
      notesLines.forEach((line, idx) => {
        doc.text(line, margin + 2, yPos + 5 + idx * 4);
      });
      yPos += 18;
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("Vielen Dank für Ihr Vertrauen!", pageWidth / 2, pageHeight - 10, { align: "center" });

    // Download PDF
    doc.save(`rechnung-${invoiceData.invoiceNumber}.pdf`);
  };

  const formatCurrency = (value) => {
    return `€${Number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!business) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "#0891b2", color: "white", pb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={700}>Rechnung erstellen</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#f8fafc", p: 2 }}>
        <Grid container spacing={2}>
          {/* Invoice Header - Compact */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rechnungsnummer"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Rechnungsdatum"
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Fälligkeitsdatum"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Business & Customer Info - Side by Side */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: "#0891b2" }}>
                Rechnungssteller
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Firmenname"
                    value={invoiceData.businessName}
                    onChange={(e) => handleFieldChange("businessName", e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="USt-IdNr."
                    value={invoiceData.businessTaxId}
                    onChange={(e) => handleFieldChange("businessTaxId", e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    multiline
                    rows={2}
                    value={invoiceData.businessAddress}
                    onChange={(e) => handleFieldChange("businessAddress", e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: "#0891b2" }}>
                Rechnungsempfänger
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={invoiceData.customerName}
                    onChange={(e) => handleFieldChange("customerName", e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    multiline
                    rows={2}
                    value={invoiceData.customerAddress}
                    onChange={(e) => handleFieldChange("customerAddress", e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Items - Compact Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0891b2" }}>
                  Positionen
                </Typography>
                <Button variant="outlined" onClick={addItem} size="small" sx={{ minWidth: "auto" }}>
                  + Hinzufügen
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {invoiceData.items.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "flex-start",
                      p: 1.5,
                      bgcolor: index % 2 === 0 ? "#f8fafc" : "white",
                      borderRadius: 1,
                    }}
                  >
                    <TextField
                      label="Beschreibung"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      size="small"
                      sx={{ flex: 1, bgcolor: "white" }}
                    />
                    <TextField
                      label="Menge"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                      size="small"
                      sx={{ width: 80, bgcolor: "white" }}
                    />
                    <TextField
                      label="Einzelpreis"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      size="small"
                      sx={{ width: 100, bgcolor: "white" }}
                    />
                    <TextField
                      label="Gesamt"
                      value={formatCurrency(item.amount)}
                      InputProps={{ readOnly: true }}
                      size="small"
                      sx={{ width: 100, bgcolor: "white" }}
                    />
                    <IconButton
                      onClick={() => removeItem(index)}
                      size="small"
                      color="error"
                      sx={{ mt: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Totals & Notes - Side by Side */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: "#0891b2" }}>
                Zusammenfassung
              </Typography>
              <TextField
                fullWidth
                label="MwSt. Satz (%)"
                type="number"
                value={invoiceData.taxRate}
                onChange={(e) => handleFieldChange("taxRate", parseFloat(e.target.value) || 0)}
                size="small"
                sx={{ mb: 2, bgcolor: "white" }}
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", pb: 1, borderBottom: "1px solid #e5e7eb" }}>
                  <Typography color="text.secondary">Zwischensumme:</Typography>
                  <Typography fontWeight={600}>{formatCurrency(invoiceData.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", pb: 1, borderBottom: "1px solid #e5e7eb" }}>
                  <Typography color="text.secondary">MwSt. ({invoiceData.taxRate}%):</Typography>
                  <Typography fontWeight={600}>{formatCurrency(invoiceData.taxAmount)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, bgcolor: "#0891b2", p: 1.5, borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ color: "white" }}>Gesamtbetrag:</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: "white" }}>
                    {formatCurrency(invoiceData.total)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: "#0891b2" }}>
                Hinweise / Notizen
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={invoiceData.notes}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                size="small"
                placeholder="Zusätzliche Informationen oder Notizen..."
                sx={{ bgcolor: "white" }}
              />
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
        <Button onClick={onClose} variant="outlined">Abbrechen</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={generatePDF}
          sx={{
            bgcolor: "#0891b2",
            "&:hover": { bgcolor: "#0e7490" },
            px: 3,
            py: 1,
          }}
        >
          PDF herunterladen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceForm;

