import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LockIcon from "@mui/icons-material/Lock";
import image from "../assets/loginPp.png";
import { useLocation, useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import AuthImage from "../components/AuthImage";
import { Formik } from "formik";
import * as Yup from "yup";
import useAuthCall from "../hook/useAuthCall";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Login = () => {
  const { login } = useAuthCall();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);
  const [pendingApproval, setPendingApproval] = useState(false);

  const from = location.state?.from || '/';
  const businessName = location.state?.businessName;

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, from, navigate]);

  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Bitte geben Sie eine gültige E-Mail ein")
      .required("E-Mail ist erforderlich"),
    password: Yup.string().required("Passwort ist erforderlich"),
  });

  return (
    <Container maxWidth="lg">
      <Grid
        container
        justifyContent="center"
        direction="row-reverse"
        sx={{
          height: "100vh",
          p: 2,
        }}
      >
        <AuthImage image={image} />
        <AuthHeader />

        <Grid size={{ xs: 12, sm: 10, md: 6 }}>
          <Avatar
            sx={{
              backgroundColor: "secondary.main",
              m: "auto",
              width: 40,
              height: 40,
            }}
          >
            <LockIcon size="30" />
          </Avatar>
          <Typography variant="h4" align="center" mb={2} color="secondary.main">
            ANMELDEN
          </Typography>

          {/* Info message when redirected from a business page */}
          {businessName && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Bitte melden Sie sich an, um <strong>{businessName}</strong> zu buchen
            </Alert>
          )}

          {pendingApproval && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Ihr Konto wartet noch auf die Genehmigung durch den Administrator. Sie erhalten eine E-Mail, sobald Ihr Konto aktiviert wurde.
            </Alert>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values, actions) => {
              setPendingApproval(false);
              try {
                await login(values);
                actions.resetForm();
              } catch (error) {
                if (error?.response?.status === 403 && error?.response?.data?.code === "ACCOUNT_PENDING_APPROVAL") {
                  setPendingApproval(true);
                }
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, handleSubmit }) => (
              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Box component="label" htmlFor="login-email" sx={{ display: 'block', mb: 0.5, fontSize: 14, color: 'text.secondary' }}>
                      E-Mail-Adresse
                    </Box>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      aria-label="E-Mail-Adresse"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8 }}
                      placeholder="ihre@email.de"
                    />
                    {touched.email && errors.email && (
                      <Typography variant="caption" color="error">{errors.email}</Typography>
                    )}
                  </Box>

                  <Box>
                    <Box component="label" htmlFor="login-password" sx={{ display: 'block', mb: 0.5, fontSize: 14, color: 'text.secondary' }}>
                      Kennwort
                    </Box>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      aria-label="Kennwort"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8 }}
                      placeholder="••••••••"
                    />
                    {touched.password && errors.password && (
                      <Typography variant="caption" color="error">{errors.password}</Typography>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {isSubmitting ? 'EINLOGGEN...' : 'EINLOGGEN'}
                  </Button>
                </Box>
              </Box>
            )}
          </Formik>

          {/* Forgot password link — outside form to avoid submit issues */}
          <Box sx={{ textAlign: "center", marginTop: "1rem" }}>
            <Typography
              component="span"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  // Production-safe navigation
                  if (typeof navigate === 'function') {
                    navigate('/forgot-password');
                  } else {
                    window.location.href = '/forgot-password';
                  }
                }
              }}
              onClick={(e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                // Production-safe navigation
                // useNavigate hook'u her zaman function olmalı, ama production'da bazen undefined olabilir
                const navFunction = navigate;
                if (navFunction && typeof navFunction === 'function') {
                  try {
                    navFunction('/forgot-password');
                  } catch {
                    // Fallback: direct navigation
                    if (typeof window !== 'undefined') {
                      window.location.href = '/forgot-password';
                    }
                  }
                } else {
                  // Fallback: direct navigation
                  if (typeof window !== 'undefined') {
                    window.location.href = '/forgot-password';
                  }
                }
              }}
              sx={{
                color: "#0891b2",
                fontSize: "0.875rem",
                cursor: "pointer",
                userSelect: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
                "&:focus": {
                  outline: "2px solid #0891b2",
                  outlineOffset: "2px",
                },
              }}
            >
              Passwort vergessen
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", mt: 2, color: "secondary.main" }}>
            <Typography
              component="span"
              onClick={() => navigate('/register', { state: { from, businessName } })}
              sx={{
                color: "secondary.main",
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Noch kein Konto? Jetzt registrieren
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;