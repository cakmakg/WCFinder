// components/AuthModal.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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

const AuthModal = ({ 
  open, 
  onClose, 
  redirectAfterLogin = '/home',
  businessName = null
}) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuthCall();
  const { loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Validation schemas
  const loginSchema = Yup.object({
    email: Yup.string()
      .email(t('auth.validation.emailInvalid') || "Bitte geben Sie eine gültige E-Mail ein")
      .required(t('auth.validation.emailRequired') || "E-Mail ist erforderlich"),
    password: Yup.string().required(t('auth.validation.passwordRequired') || "Passwort ist erforderlich"),
  });

  const registerSchema = Yup.object({
    username: Yup.string()
      .required(t('auth.validation.usernameRequired') || "Benutzername ist erforderlich")
      .min(3, t('auth.validation.usernameMin') || "Benutzername muss mindestens 3 Zeichen lang sein"),
    firstName: Yup.string()
      .min(2, t('auth.validation.firstNameMin') || "Zu kurz")
      .max(50, t('auth.validation.firstNameMax') || "Zu lang")
      .required(t('auth.validation.firstNameRequired') || "Vorname ist erforderlich"),
    lastName: Yup.string()
      .min(2, t('auth.validation.lastNameMin') || "Zu kurz")
      .max(50, t('auth.validation.lastNameMax') || "Zu lang")
      .required(t('auth.validation.lastNameRequired') || "Nachname ist erforderlich"),
    email: Yup.string()
      .email(t('auth.validation.emailInvalid') || "Ungültige E-Mail")
      .required(t('auth.validation.emailRequired') || "E-Mail ist erforderlich"),
    password: Yup.string()
      .required(t('auth.validation.passwordRequired') || "Passwort ist erforderlich")
      .min(8, t('auth.validation.passwordMin') || "Mindestens 8 Zeichen")
      .matches(/\d+/, t('auth.validation.passwordNumber') || "Muss eine Zahl enthalten")
      .matches(/[a-z]/, t('auth.validation.passwordLowercase') || "Muss einen Kleinbuchstaben enthalten")
      .matches(/[A-Z]/, t('auth.validation.passwordUppercase') || "Muss einen Großbuchstaben enthalten")
      .matches(/[@$?!%&*]+/, t('auth.validation.passwordSpecial') || "Muss ein Sonderzeichen enthalten"),
  });

  const handleSocialLogin = (provider) => {
    alert(`${provider} Login wird implementiert...`);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = () => {
    onClose();
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

        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, fontWeight: 600, color: "#333" }}
        >
          {isLogin ? (t('auth.login') || 'Anmelden') : (t('auth.register') || 'Registrieren')}
        </Typography>

        {businessName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {isLogin 
              ? (t('auth.loginToBook', { businessName }) || `Bitte melden Sie sich an, um ${businessName} zu buchen`)
              : (t('auth.registerToBook', { businessName }) || `Registrieren Sie sich, um ${businessName} zu buchen`)
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
            {t('auth.socialLogin.facebook') || 'Mit Facebook anmelden'}
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
            {t('auth.socialLogin.google') || 'Mit Google anmelden'}
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
            {t('auth.socialLogin.apple') || 'Mit Apple anmelden'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('common.or') || 'ODER'}
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
              handleLoginSuccess();
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth
                    label={t('auth.email') || 'E-Mail'}
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    placeholder={t('auth.emailPlaceholder') || 'ihre@email.de'}
                  />

                  <TextField
                    fullWidth
                    label={t('auth.password') || 'Passwort'}
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    placeholder={t('auth.passwordPlaceholder') || '••••••••'}
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
                    {t('auth.forgotPassword') || 'Passwort vergessen'}
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
                    {loading ? <CircularProgress size={24} /> : (t('auth.loginButton') || 'EINLOGGEN')}
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
              handleLoginSuccess();
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth
                    label={t('auth.username') || 'Benutzername'}
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
                      label={t('auth.firstName') || 'Vorname'}
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />

                    <TextField
                      fullWidth
                      label={t('auth.lastName') || 'Nachname'}
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
                    label={t('auth.email') || 'E-Mail'}
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
                    label={t('auth.password') || 'Passwort'}
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
                    {loading ? <CircularProgress size={24} /> : (t('auth.registerButton') || 'REGISTRIEREN')}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        )}

        {/* Toggle Between Login/Register */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? (t('auth.noAccount') || 'Noch kein Konto?') : (t('auth.hasAccount') || 'Bereits ein Konto?')}
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
            {isLogin ? (t('auth.createAccount') || 'Jetzt registrieren') : (t('auth.loginHere') || 'Hier anmelden')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
