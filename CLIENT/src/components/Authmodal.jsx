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
  redirectAfterLogin = '/home',  // Login sonrası nereye gidileceği
  businessName = null  // İşletme adı (opsiyonel bilgilendirme için)
}) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuthCall();
  const { loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Validation schemas
  const loginSchema = Yup.object({
    email: Yup.string()
      .email(t('auth.validation.emailInvalid'))
      .required(t('auth.validation.emailRequired')),
    password: Yup.string().required(t('auth.validation.passwordRequired')),
  });

  const registerSchema = Yup.object({
    username: Yup.string()
      .required(t('auth.validation.usernameRequired'))
      .min(3, t('auth.validation.usernameMin')),
    firstName: Yup.string()
      .min(2, t('auth.validation.firstNameMin'))
      .max(50, t('auth.validation.firstNameMax'))
      .required(t('auth.validation.firstNameRequired')),
    lastName: Yup.string()
      .min(2, t('auth.validation.lastNameMin'))
      .max(50, t('auth.validation.lastNameMax'))
      .required(t('auth.validation.lastNameRequired')),
    email: Yup.string()
      .email(t('auth.validation.emailInvalid'))
      .required(t('auth.validation.emailRequired')),
    password: Yup.string()
      .required(t('auth.validation.passwordRequired'))
      .min(8, t('auth.validation.passwordMin'))
      .matches(/\d+/, t('auth.validation.passwordNumber'))
      .matches(/[a-z]/, t('auth.validation.passwordLowercase'))
      .matches(/[A-Z]/, t('auth.validation.passwordUppercase'))
      .matches(/[@$?!%&*]+/, t('auth.validation.passwordSpecial')),
  });

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
          {isLogin ? t('auth.login') : t('auth.register')}
        </Typography>

        {/* İşletme bilgilendirme mesajı */}
        {businessName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {isLogin 
              ? t('auth.loginToBook', { businessName })
              : t('auth.registerToBook', { businessName })
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
            {t('auth.socialLogin.facebook')}
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
            {t('auth.socialLogin.google')}
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
            {t('auth.socialLogin.apple')}
          </Button>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('common.or')}
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
                    label={t('auth.email')}
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    placeholder={t('auth.emailPlaceholder')}
                  />

                  <TextField
                    fullWidth
                    label={t('auth.password')}
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    placeholder={t('auth.passwordPlaceholder')}
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
                    {t('auth.forgotPassword')}
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
                    {loading ? <CircularProgress size={24} /> : t('auth.loginButton')}
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
                    label={t('auth.username')}
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
                      label={t('auth.firstName')}
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />

                    <TextField
                      fullWidth
                      label={t('auth.lastName')}
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
                    label={t('auth.email')}
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
                    label={t('auth.password')}
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
                    {loading ? <CircularProgress size={24} /> : t('auth.registerButton')}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        )}

        {/* Toggle Between Login/Register */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
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
            {isLogin ? t('auth.createAccount') : t('auth.loginHere')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;