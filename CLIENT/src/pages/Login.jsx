import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LockIcon from "@mui/icons-material/Lock";
import image from "../assets/loginPp.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import AuthImage from "../components/AuthImage";
import { Formik } from "formik";
import * as Yup from "yup";
import useAuthCall from "../hook/useAuthCall";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const Login = () => {
  const { login } = useAuthCall();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);
  
  // Login sayfasına gelirken gönderilen state'i al
  const from = location.state?.from || '/';
  const businessName = location.state?.businessName;

  // Kullanıcı zaten login yapmışsa redirect et
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
            SIGN IN
          </Typography>

          {/* İşletmeye gitmek için login yapması gerektiğini bildiren mesaj */}
          {businessName && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Bitte melden Sie sich an, um <strong>{businessName}</strong> zu buchen
            </Alert>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values, actions) => {
              try {
                console.log('🔐 [Login] Form submit with values:', { email: values.email, hasPassword: !!values.password });
                await login(values);
                actions.resetForm();
              } catch (error) {
                console.error('❌ [Login] Login failed:', error);
                // Error zaten useApiCall içinde toast ile gösteriliyor
              } finally {
                actions.setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, handleSubmit }) => (
              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Box component="label" sx={{ display: 'block', mb: 0.5, fontSize: 14, color: 'text.secondary' }}>
                      E-Mail-Adresse
                    </Box>
                    <input
                      name="email"
                      type="email"
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
                    <Box component="label" sx={{ display: 'block', mb: 0.5, fontSize: 14, color: 'text.secondary' }}>
                      Kennwort
                    </Box>
                    <input
                      name="password"
                      type="password"
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

                  <Typography variant="body2" align="center" sx={{ color: "#0891b2", cursor: "pointer" }}>
                    Passwort vergessen
                  </Typography>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
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

          <Box sx={{ textAlign: "center", mt: 2, color: "secondary.main" }}>
            <Link to="/register" state={{ from, businessName }}>
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;