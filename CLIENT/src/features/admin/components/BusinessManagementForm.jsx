// features/admin/components/BusinessManagementForm.jsx
// Admin panel form for creating Owner, Business, and Toilet together

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Wc as WcIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import apiClient from "../../../shared/utils/apiClient";
import { searchLocation } from "../../../services/geocoding";
import useCrudCall from "../../../hook/useCrudCall";

const steps = ["Inhaber", "Geschäft", "Toilette"];

const BusinessManagementForm = () => {
  const { getCrudData } = useCrudCall();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [findingCoordinates, setFindingCoordinates] = useState(false);

  // Owner form data
  const [ownerData, setOwnerData] = useState({
    username: "",
    email: "",
    password: "",
    role: "owner",
    isActive: true,
  });

  // Business form data
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "Deutschland",
    },
    location: {
      type: "Point",
      coordinates: [0, 0], // [longitude, latitude]
    },
    openingHours: "",
    approvalStatus: "approved",
  });

  // Toilet form data
  const [toiletData, setToiletData] = useState({
    name: "",
    fee: 1.00,
    features: {
      isAccessible: false,
      hasBabyChangingStation: false,
    },
    status: "available",
  });

  const handleOwnerChange = (field, value) => {
    setOwnerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessChange = (field, value) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      const newAddress = { ...businessData.address, [addressField]: value };
      setBusinessData((prev) => ({
        ...prev,
        address: newAddress,
      }));

      // Adres bilgileri tamamlandığında otomatik koordinat bul (async olarak)
      if (
        newAddress.street &&
        newAddress.city &&
        newAddress.postalCode &&
        newAddress.country
      ) {
        findCoordinatesFromAddress(newAddress).catch((err) => {
          console.error("Error finding coordinates:", err);
        });
      }
    } else {
      setBusinessData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const findCoordinatesFromAddress = async (address) => {
    try {
      setFindingCoordinates(true);
      const addressString = `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`;
      console.log("🔍 Searching coordinates for:", addressString);

      const location = await searchLocation(addressString);

      if (location) {
        setBusinessData((prev) => ({
          ...prev,
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat], // [longitude, latitude]
          },
        }));
        console.log("✅ Coordinates found:", location.lng, location.lat);
        setSuccess(`Koordinaten gefunden: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        // Success mesajını 3 saniye sonra temizle
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.warn("⚠️ Coordinates not found for address");
        setError("Koordinaten für die Adresse nicht gefunden. Bitte überprüfen Sie die Adresse.");
      }
    } catch (err) {
      console.error("❌ Error finding coordinates:", err);
      setError("Fehler beim Suchen der Koordinaten.");
    } finally {
      setFindingCoordinates(false);
    }
  };

  const handleFindCoordinates = async () => {
    const { address } = businessData;
    if (!address.street || !address.city || !address.postalCode) {
      setError("Bitte geben Sie mindestens Straße, Stadt und Postleitzahl ein.");
      return;
    }
    await findCoordinatesFromAddress(address);
  };

  const handleToiletChange = (field, value) => {
    if (field.startsWith("features.")) {
      const featureField = field.split(".")[1];
      setToiletData((prev) => ({
        ...prev,
        features: { ...prev.features, [featureField]: value },
      }));
    } else {
      setToiletData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError(null);
    setSuccess(null);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
    setSuccess(null);
  };

  const validateOwnerData = () => {
    if (!ownerData.username || !ownerData.email || !ownerData.password) {
      return "Inhaber-Informationen fehlen!";
    }
    if (ownerData.password.length < 8) {
      return "Das Passwort muss mindestens 8 Zeichen lang sein!";
    }
    return null;
  };

  const validateBusinessData = () => {
    if (
      !businessData.businessName ||
      !businessData.businessType ||
      !businessData.address.street ||
      !businessData.address.city ||
      !businessData.address.postalCode
    ) {
      return "Geschäftsinformationen fehlen!";
    }
    if (
      businessData.location.coordinates[0] === 0 &&
      businessData.location.coordinates[1] === 0
    ) {
      return "Koordinaten nicht gefunden. Bitte klicken Sie auf 'Koordinaten finden' oder überprüfen Sie die Adressinformationen.";
    }
    return null;
  };

  const validateToiletData = () => {
    if (!toiletData.name) {
      return "Toilettenname ist erforderlich!";
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate all data
      const ownerError = validateOwnerData();
      const businessError = validateBusinessData();
      const toiletError = validateToiletData();

      if (ownerError || businessError || toiletError) {
        setError(ownerError || businessError || toiletError);
        setLoading(false);
        return;
      }

      // Step 1: Create Owner
      console.log("📝 Creating owner...", ownerData);
      const ownerResponse = await apiClient.post("/users", ownerData);
      const ownerId = ownerResponse.data.result._id;
      console.log("✅ Owner created:", ownerId);

      // Step 2: Create Business with owner reference
      const businessPayload = {
        ...businessData,
        owner: ownerId,
      };
      console.log("📝 Creating business...", businessPayload);
      const businessResponse = await apiClient.post("/business", businessPayload);
      const businessId = businessResponse.data.result._id;
      console.log("✅ Business created:", businessId);

      // Step 3: Create Toilet with business reference
      const toiletPayload = {
        ...toiletData,
        business: businessId,
        fee: 1.00, // Always 1.00 EUR
      };
      console.log("📝 Creating toilet...", toiletPayload);
      const toiletResponse = await apiClient.post("/toilets", toiletPayload);
      console.log("✅ Toilet created:", toiletResponse.data.result._id);

      setSuccess(
        `Erfolgreich! Inhaber-, Geschäfts- und Toiletten-Datensätze wurden erstellt.`
      );

      // Business ve Toilet listelerini yeniden yükle
      try {
        console.log("🔄 Refreshing business and toilet lists...");
        await Promise.all([
          // Business listesini yenile (limit: 1000 - tüm business'ları getir)
          getCrudData('business', false, 1000),
          // Toilet listesini yenile (limit: 1000 - tüm toilet'leri getir)
          getCrudData('toilets', false, 1000),
        ]);
        console.log("✅ Lists refreshed successfully");
        
        // Custom event tetikle - aynı tab'da güncelleme için
        window.dispatchEvent(new CustomEvent('businessUpdated'));
        
        // Storage event tetikle - diğer tab'larda da güncellensin
        window.localStorage.setItem('business_updated', Date.now().toString());
        setTimeout(() => {
          window.localStorage.removeItem('business_updated');
        }, 100);
      } catch (refreshError) {
        console.error("⚠️ Error refreshing lists:", refreshError);
        // Hata olsa bile devam et
      }

      // Reset form
      setTimeout(() => {
        setOwnerData({
          username: "",
          email: "",
          password: "",
          role: "owner",
          isActive: true,
        });
        setBusinessData({
          businessName: "",
          businessType: "",
          address: {
            street: "",
            city: "",
            postalCode: "",
            country: "Deutschland",
          },
          location: {
            type: "Point",
            coordinates: [0, 0],
          },
          openingHours: "",
          approvalStatus: "approved",
        });
        setToiletData({
          name: "",
          fee: 1.00,
          features: {
            isAccessible: false,
            hasBabyChangingStation: false,
          },
          status: "available",
        });
        setActiveStep(0);
      }, 2000);
    } catch (err) {
      console.error("❌ Error creating records:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Fehler beim Erstellen der Datensätze!"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOwnerForm = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <PersonIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Inhaber-Informationen
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Benutzername"
            value={ownerData.username}
            onChange={(e) => handleOwnerChange("username", e.target.value)}
            required
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="E-Mail"
            type="email"
            value={ownerData.email}
            onChange={(e) => handleOwnerChange("email", e.target.value)}
            required
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Passwort"
            type="password"
            value={ownerData.password}
            onChange={(e) => handleOwnerChange("password", e.target.value)}
            required
            disabled={loading}
            helperText="Mindestens 8 Zeichen"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled>
            <InputLabel>Rolle</InputLabel>
            <Select value={ownerData.role} label="Rolle">
              <MenuItem value="owner">Inhaber</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={ownerData.isActive}
                onChange={(e) =>
                  handleOwnerChange("isActive", e.target.checked)
                }
                disabled={loading}
              />
            }
            label="Aktiv"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderBusinessForm = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BusinessIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Geschäftsinformationen
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Geschäftsname"
            value={businessData.businessName}
            onChange={(e) =>
              handleBusinessChange("businessName", e.target.value)
            }
            required
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Geschäftstyp</InputLabel>
            <Select
              value={businessData.businessType}
              label="Geschäftstyp"
              onChange={(e) =>
                handleBusinessChange("businessType", e.target.value)
              }
              disabled={loading}
            >
              <MenuItem value="Cafe">Café</MenuItem>
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Hotel">Hotel</MenuItem>
              <MenuItem value="Shop">Laden</MenuItem>
              <MenuItem value="Gas Station">Tankstelle</MenuItem>
              <MenuItem value="Other">Sonstiges</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Adressinformationen
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Straße"
            value={businessData.address.street}
            onChange={(e) =>
              handleBusinessChange("address.street", e.target.value)
            }
            required
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Stadt"
            value={businessData.address.city}
            onChange={(e) =>
              handleBusinessChange("address.city", e.target.value)
            }
            required
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Postleitzahl"
            value={businessData.address.postalCode}
            onChange={(e) =>
              handleBusinessChange("address.postalCode", e.target.value)
            }
            required
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Land"
            value={businessData.address.country}
            onChange={(e) =>
              handleBusinessChange("address.country", e.target.value)
            }
            required
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Standortinformationen
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={handleFindCoordinates}
              disabled={loading || findingCoordinates || !businessData.address.street || !businessData.address.city || !businessData.address.postalCode}
              sx={{ minWidth: 200 }}
            >
              {findingCoordinates ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Wird gesucht...
                </>
              ) : (
                "Koordinaten finden"
              )}
            </Button>
            {businessData.location.coordinates[0] !== 0 &&
              businessData.location.coordinates[1] !== 0 && (
                <Typography variant="body2" color="text.secondary">
                  Koordinaten: {businessData.location.coordinates[1].toFixed(4)}, {businessData.location.coordinates[0].toFixed(4)}
                </Typography>
              )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Nach dem Eingeben der Adressinformationen klicken Sie auf "Koordinaten finden". 
            Die Koordinaten werden automatisch gefunden.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Öffnungszeiten"
            value={businessData.openingHours}
            onChange={(e) =>
              handleBusinessChange("openingHours", e.target.value)
            }
            disabled={loading}
            placeholder="Beispiel: Mo-Fr 09:00-18:00; Sa 10:00-16:00"
            helperText="Optional"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Genehmigungsstatus</InputLabel>
            <Select
              value={businessData.approvalStatus}
              label="Genehmigungsstatus"
              onChange={(e) =>
                handleBusinessChange("approvalStatus", e.target.value)
              }
              disabled={loading}
            >
              <MenuItem value="approved">Genehmigt</MenuItem>
              <MenuItem value="pending">Ausstehend</MenuItem>
              <MenuItem value="rejected">Abgelehnt</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  const renderToiletForm = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <WcIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Toiletten-Informationen
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Toilettenname"
            value={toiletData.name}
            onChange={(e) => handleToiletChange("name", e.target.value)}
            required
            disabled={loading}
            placeholder="Beispiel: Haupttoilette, Erdgeschoss WC"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Gebühr (EUR)"
            type="number"
            value={toiletData.fee}
            disabled
            inputProps={{ step: 0.01, min: 0 }}
            helperText="Die Toilettengebühr wird immer mit 1,00 EUR gespeichert"
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Eigenschaften
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={toiletData.features.isAccessible}
                onChange={(e) =>
                  handleToiletChange("features.isAccessible", e.target.checked)
                }
                disabled={loading}
              />
            }
            label="Barrierefrei (Zugänglich)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={toiletData.features.hasBabyChangingStation}
                onChange={(e) =>
                  handleToiletChange(
                    "features.hasBabyChangingStation",
                    e.target.checked
                  )
                }
                disabled={loading}
              />
            }
            label="Wickelstation"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={toiletData.status}
              label="Status"
              onChange={(e) => handleToiletChange("status", e.target.value)}
              disabled={loading}
            >
              <MenuItem value="available">Verfügbar</MenuItem>
              <MenuItem value="in_use">In Benutzung</MenuItem>
              <MenuItem value="out_of_order">Außer Betrieb</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Paper sx={{ p: 4, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Geschäftsverwaltung
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Erstellen Sie Inhaber-, Geschäfts- und Toiletten-Datensätze zusammen. 
        Sie können die Datensatzerstellung, die Sie in MongoDB Compass durchgeführt haben, hier durchführen.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>
        {activeStep === 0 && renderOwnerForm()}
        {activeStep === 1 && renderBusinessForm()}
        {activeStep === 2 && renderToiletForm()}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          variant="outlined"
        >
          Zurück
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Weiter
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? "Wird gespeichert..." : "Speichern"}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default BusinessManagementForm;

