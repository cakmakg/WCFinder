// pages/OwnerProfilePage.jsx
// Owner profil formu — kişisel bilgiler (RO) + işletme bilgileri (düzenlenebilir)

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  PersonOutlined as PersonIcon,
  StoreOutlined as StoreIcon,
  SaveOutlined as SaveIcon,
  ArrowBackOutlined as BackIcon,
} from "@mui/icons-material";
import businessService from "../services/businessService";

const BUSINESS_TYPES = ["Cafe", "Restaurant", "Hotel", "Shop", "Gas Station", "Other"];

const SectionHeader = ({ icon: Icon, title }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        backgroundColor: "rgba(8,145,178,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ color: "#0891b2", fontSize: 20 }} />
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
      {title}
    </Typography>
  </Box>
);

const ReadField = ({ label, value }) => (
  <TextField
    label={label}
    value={value || "—"}
    fullWidth
    size="small"
    InputProps={{ readOnly: true }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        backgroundColor: "#f8fafc",
        "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
      },
    }}
  />
);

export default function OwnerProfilePage() {
  const { currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Germany",
    openingHours: "",
    phone: "",
    ustIdNr: "",
  });

  useEffect(() => {
    if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
      navigate("/home");
      return;
    }
    loadBusiness();
  }, [currentUser, navigate]);

  const loadBusiness = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessService.getMyBusiness();
      const b = res?.result || res;
      if (b) {
        setForm({
          businessName: b.businessName || "",
          businessType: b.businessType || "",
          street: b.address?.street || "",
          city: b.address?.city || "",
          postalCode: b.address?.postalCode || "",
          country: b.address?.country || "Germany",
          openingHours: b.openingHours || "",
          phone: b.phone || "",
          ustIdNr: b.ustIdNr || "",
        });
      }
    } catch {
      setError("Geschäftsdaten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await businessService.updateMyBusiness({
        businessName: form.businessName,
        businessType: form.businessType,
        address: {
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        openingHours: form.openingHours,
        phone: form.phone,
        ustIdNr: form.ustIdNr,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Änderungen konnten nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "&:hover fieldset": { borderColor: "#0891b2" },
      "&.Mui-focused fieldset": { borderColor: "#0891b2" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  };

  if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 4 }}>
      <Box sx={{ maxWidth: 760, mx: "auto", px: { xs: 2, md: 3 } }}>

        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
            borderRadius: "16px",
            p: 3,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(8,145,178,0.25)",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 0.3 }}>
              Mein Profil
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Persönliche und Geschäftsinformationen
            </Typography>
          </Box>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.4)",
              border: "1px solid",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Zurück
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#0891b2" }} />
          </Box>
        ) : (
          <>
            {/* Kişisel Bilgiler (Readonly) */}
            <Paper
              elevation={0}
              sx={{ borderRadius: "14px", p: 3, mb: 2.5, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <SectionHeader icon={PersonIcon} title="Persönliche Informationen" />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ReadField label="Benutzername" value={currentUser.username} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadField label="E-Mail" value={currentUser.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadField label="Vorname" value={currentUser.firstName} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadField label="Nachname" value={currentUser.lastName} />
                </Grid>
              </Grid>
              <Typography
                variant="caption"
                sx={{ color: "#94a3b8", mt: 1.5, display: "block" }}
              >
                Persönliche Daten können im Einstellungsbereich geändert werden.
              </Typography>
            </Paper>

            {/* Geschäftsdaten (Editable) */}
            <Paper
              elevation={0}
              sx={{ borderRadius: "14px", p: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <SectionHeader icon={StoreIcon} title="Geschäftsinformationen" />

              <Grid container spacing={2}>
                {/* Name + Type */}
                <Grid item xs={12} sm={7}>
                  <TextField
                    label="Unternehmensname"
                    value={form.businessName}
                    onChange={handleChange("businessName")}
                    fullWidth
                    size="small"
                    required
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    select
                    label="Unternehmenstyp"
                    value={form.businessType}
                    onChange={handleChange("businessType")}
                    fullWidth
                    size="small"
                    required
                    sx={fieldSx}
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Address */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                      ADRESSE
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Straße & Hausnummer"
                    value={form.street}
                    onChange={handleChange("street")}
                    fullWidth
                    size="small"
                    required
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="PLZ"
                    value={form.postalCode}
                    onChange={handleChange("postalCode")}
                    fullWidth
                    size="small"
                    required
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Stadt"
                    value={form.city}
                    onChange={handleChange("city")}
                    fullWidth
                    size="small"
                    required
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Land"
                    value={form.country}
                    onChange={handleChange("country")}
                    fullWidth
                    size="small"
                    required
                    sx={fieldSx}
                  />
                </Grid>

                {/* Weitere Infos */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                      WEITERE ANGABEN
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Telefon"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    fullWidth
                    size="small"
                    placeholder="+49 123 456789"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="USt-IdNr."
                    value={form.ustIdNr}
                    onChange={handleChange("ustIdNr")}
                    fullWidth
                    size="small"
                    placeholder="DE123456789"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Öffnungszeiten"
                    value={form.openingHours}
                    onChange={handleChange("openingHours")}
                    fullWidth
                    size="small"
                    placeholder="Mo–Fr 08:00–20:00; Sa 09:00–18:00"
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>

              {/* Save */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    boxShadow: "0 2px 10px rgba(8,145,178,0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
                    },
                  }}
                >
                  {saving ? "Wird gespeichert..." : "Änderungen speichern"}
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess(false)}
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          Änderungen erfolgreich gespeichert.
        </Alert>
      </Snackbar>
    </Box>
  );
}
