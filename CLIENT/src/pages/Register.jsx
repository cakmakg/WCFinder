import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LockIcon from "@mui/icons-material/Lock";
import image from "../assets/registerPp.png";
import Grid from "@mui/material/Grid";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import AuthHeader from "../components/AuthHeader";
import AuthImage from "../components/AuthImage";
import { Formik } from "formik";
import useAuthCall from "../hook/useAuthCall";
import * as Yup from "yup";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const Register = () => {
  const { register } = useAuthCall();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);

  // Register sayfasına gelirken gönderilen state'i al
  const from = location.state?.from || '/';
  const businessName = location.state?.businessName;

  // Kullanıcı zaten login yapmışsa redirect et
  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, from, navigate]);

  const SignupSchema = Yup.object().shape({
    username: Yup.string()
      .required("Bu alan zorunludur!")
      .min(3, "Username en az 3 karakter olmalıdır!"),
    firstName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    lastName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
      .required()
      .min(8)
      .matches(/\d+/, "Digit karakter içermelidir!")
      .matches(/[a-z]/, "Küçük harf içermelidir!")
      .matches(/[A-Z]/, "Büyük harf içermelidir!")
      .matches(/[@$?!%&*]+/, "Özel karakter içermelidir(@$?!%&*)")
  });

  return (
    <Container maxWidth="lg">
      <Grid
        container
        justifyContent="center"
        direction="row-reverse"
        rowSpacing={{ sm: 3 }}
        sx={{
          height: "100vh",
          p: 2,
        }}
      >
        <AuthImage image={image} />
        <AuthHeader />

        <Grid item xs={12} sm={10} md={6}>
          <Avatar
            sx={{
              backgroundColor: "secondary.light",
              m: "auto",
              width: 40,
              height: 40,
            }}
          >
            <LockIcon size="30" />
          </Avatar>
          <Typography
            variant="h4"
            align="center"
            mb={2}
            color="secondary.light"
          >
            Register
          </Typography>

          {/* İşletmeye gitmek için register yapması gerektiğini bildiren mesaj */}
          {businessName && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Registrieren Sie sich, um <strong>{businessName}</strong> zu buchen
            </Alert>
          )}

          <Formik
            initialValues={{
              username: "",
              firstName: "",
              lastName: "",
              email: "",
              password: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={async (values, actions) => {
              await register(values);
              actions.resetForm();
              actions.setSubmitting(false);
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
              <Box component="form" onSubmit={(e) => { e.preventDefault(); }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Box component="label" sx={{ display: 'block', mb: 0.5, fontSize: 14, color: 'text.secondary' }}>
                      Benutzername
                    </Box>
                    <input
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8 }}
                    />
                    {touched.username && errors.username && (
                      <Typography variant="caption" color="error">{errors.username}</Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box component="label" sx={{ display: 'block', mb: 0.5, fontSize: 14, color: 'text.secondary' }}>
                        Vorname
                      </Box>
                      <input
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8 }}
                      />
                      {touched.firstName && errors.firstName && (
                        <Typography variant="caption" color="error">{errors.firstName}</Typography>
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box component="label" sx={{ display: 'block', mb: 0.5, fontSize: 14, color: 'text.secondary' }}>
                        Nachname
                      </Box>
                      <input
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8 }}
                      />
                      {touched.lastName && errors.lastName && (
                        <Typography variant="caption" color="error">{errors.lastName}</Typography>
                      )}
                    </Box>
                  </Box>

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
                    onClick={() => register(values)}
                    sx={{
                      background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    REGISTRIEREN
                  </Button>
                </Box>
              </Box>
            )}
          </Formik>

          <Box sx={{ textAlign: "center", mt: 2, color: "secondary.main" }}>
            <Link to="/login" state={{ from, businessName }}>
              Already have an account? Sign in
            </Link>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register;