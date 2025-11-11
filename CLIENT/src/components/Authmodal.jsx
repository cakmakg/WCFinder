// components/AuthModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useAuthCall from "../hook/useAuthCall";

// Validation schemas
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Bitte geben Sie eine gültige E-Mail ein")
    .required("E-Mail ist erforderlich"),
  password: Yup.string().required("Passwort ist erforderlich"),
});

const registerSchema = Yup.object({
  username: Yup.string()
    .required("Benutzername ist erforderlich")
    .min(3, "Benutzername muss mindestens 3 Zeichen lang sein"),
  firstName: Yup.string()
    .min(2, "Vorname muss mindestens 2 Zeichen lang sein")
    .max(50, "Vorname darf maximal 50 Zeichen lang sein")
    .required("Vorname ist erforderlich"),
  lastName: Yup.string()
    .min(2, "Nachname muss mindestens 2 Zeichen lang sein")
    .max(50, "Nachname darf maximal 50 Zeichen lang sein")
    .required("Nachname ist erforderlich"),
  email: Yup.string()
    .email("Bitte geben Sie eine gültige E-Mail ein")
    .required("E-Mail ist erforderlich"),
  password: Yup.string()
    .required("Passwort ist erforderlich")
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
    .matches(/\d+/, "Passwort muss mindestens eine Zahl enthalten")
    .matches(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
    .matches(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
    .matches(
      /[@$?!%&*]+/,
      "Passwort muss mindestens ein Sonderzeichen enthalten (@$?!%&*)"
    ),
});

const AuthModal = ({ 
  open, 
  onClose, 
  redirectAfterLogin = '/home',  // Login sonrası nereye gidileceği
  businessName = null  // İşletme adı (opsiyonel bilgilendirme için)
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuthCall();
  const { loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSocialLogin = (provider) => {
    alert(`${provider} Login wird implementiert...`);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = () => {
    // Modal'ı kapat
    onClose();
    
    // Belirtilen sayfaya yönlendir
    setTimeout(() => {
      navigate(redirectAfterLogin);
    }, 100);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxWidth: 500,
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <DialogContent sx={{ p: 4, position: "relative" }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "#0891b2",
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, fontWeight: 600, color: "#333" }}
        >
          {isLogin ? "Anmelden" : "Registrieren"}
        </Typography>

        {/* İşletme bilgilendirme mesajı */}
        {businessName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {isLogin 
              ? `Bitte melden Sie sich an, um ${businessName} zu buchen`
              : `Registrieren Sie sich, um ${businessName} zu buchen`
            }
          </Alert>
        )}

        {/* Social Login Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={() => handleSocialLogin("Facebook")}
            sx={{
              borderColor: "#e5e7eb",
              color: "#333",
              textTransform: "none",
              py: 1.2,
              fontSize: "0.95rem",
              "&:hover": {
                borderColor: "#0891b2",
                backgroundColor: "rgba(8,145,178,0.05)",
              },
            }}
          >
            Mit Facebook anmelden
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialLogin("Google")}
            sx={{
              borderColor: "#e5e7eb",
              color: "#333",
              textTransform: "none",
              py: 1.2,
              fontSize: "0.95rem",
              "&:hover": {
                borderColor: "#0891b2",
                backgroundColor: "rgba(8,145,178,0.05)",
              },
            }}
          >
            Mit Google anmelden
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<AppleIcon />}
            onClick={() => handleSocialLogin("Apple")}
            sx={{
              borderColor: "#e5e7eb",
              color: "#333",
              textTransform: "none",
              py: 1.2,
              fontSize: "0.95rem",
              "&:hover": {
                borderColor: "#0891b2",
                backgroundColor: "rgba(8,145,178,0.05)",
              },
            }}
          >
            Mit Apple anmelden
          </Button>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            oder
          </Typography>
        </Divider>

        {/* Login Form */}
        {isLogin ? (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values, actions) => {
              await login(values);
              actions.setSubmitting(false);
              // Login başarılı olursa yönlendir
              handleLoginSuccess();
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="E-Mail-Adresse"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    placeholder="ihre@email.de"
                  />

                  <TextField
                    fullWidth
                    label="Kennwort"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    placeholder="••••••••"
                  />

                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      color: "#0891b2",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Passwort vergessen
                  </Typography>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading || isSubmitting}
                    sx={{
                      background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : "EINLOGGEN"}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        ) : (
          // Register Form
          <Formik
            initialValues={{
              username: "",
              firstName: "",
              lastName: "",
              email: "",
              password: "",
            }}
            validationSchema={registerSchema}
            onSubmit={async (values, actions) => {
              await register(values);
              actions.setSubmitting(false);
              // Register başarılı olursa yönlendir
              handleLoginSuccess();
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Benutzername"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Vorname"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />

                    <TextField
                      fullWidth
                      label="Nachname"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="E-Mail-Adresse"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />

                  <TextField
                    fullWidth
                    label="Kennwort"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading || isSubmitting}
                    sx={{
                      background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : "REGISTRIEREN"}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        )}

        {/* Toggle Between Login/Register */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? "Du hast noch kein Konto?" : "Bereits ein Konto?"}
          </Typography>
          <Typography
            variant="body2"
            onClick={toggleMode}
            sx={{
              color: "#0891b2",
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {isLogin ? "Konto erstellen" : "Anmelden"}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;