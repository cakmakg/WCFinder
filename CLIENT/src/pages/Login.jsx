import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/Lock";
import image from "../assets/loginPp.png";
import { Link } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import AuthImage from "../components/AuthImage";
import { Formik } from "formik";

import LoginForm, { loginScheme } from "../components/LoginForm";
import useAuthCall from "../hook/useAuthCall";

const Login = () => {
  const { login } = useAuthCall();

  // Manuel login testi
  const handleManualLogin = async () => {
    try {
      setTestResult('Testing login...');
      
      // Doğrudan axios ile test
      const response = await axiosPublic.post('/auth/login', credentials);
      
      console.log('🔍 Raw login response:', response.data);
      setTestResult(`✅ Raw Response: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (error) {
      console.error('❌ Login test error:', error);
      setTestResult(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Hook ile login testi
  const handleHookLogin = async () => {
    try {
      setTestResult('Testing with hook...');
      await login(credentials);
      setTestResult('✅ Hook login successful');
    } catch (error) {
      console.error('❌ Hook login error:', error);
      setTestResult(`❌ Hook Error: ${error.message}`);
    }
  };
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

        <Grid item xs={12} sm={10} md={6}>
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
          <Typography variant="h4" align="center" mb={4} color="secondary.main">
            SIGN IN
          </Typography>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginScheme}
            onSubmit={(values, actions) => {
              login(values);
              actions.resetForm();
              actions.setSubmitting(false);
            }}
            component={(props) => <LoginForm {...props} />}>
              
            </Formik>
          <Box sx={{ textAlign: "center", mt: 2, color: "secondary.main" }}>
            <Link to="/register">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Grid>

        
      </Grid>
    </Container>
  );
};

export default Login;
