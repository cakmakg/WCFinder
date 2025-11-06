import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LockIcon from "@mui/icons-material/Lock";
import image from "../assets/registerPp.png";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import AuthHeader from "../components/AuthHeader";
import AuthImage from "../components/AuthImage";
import { Formik} from "formik";
import RegisterForm from "../components/RegisterForm";
import useAuthCall from "../hook/useAuthCall";
import * as Yup from "yup";

const Register = () => {
  const {register} = useAuthCall()

  //! Yup ile istediğimiz alanlara istediğimiz validasyon koşullarını
  //  oluşturuyoruz. Sonra oluşturduğumuz bu şemayı formike tanımlayarak
  //  kullanıyoruz. Böylelikle formik hem formumuzu yönetiyor hem de verdiğimiz
  //  validationSchema yı uyguluyor. Dikkat edilmesi gereken husus; formikte
  //  tanımladığımız initialValues daki keylerle, Yupta tanımladığımız keylerin
  //  aynı olması. Eğer bir harf bile farklı olsa o alanla ilgili yazdığınız
  //  validation çalışmaz.
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

          <Formik
            initialValues={{
              username: "",
              firstName: "",
              lastName: "",
              email: "",
              password: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={(values, actions) => {
              register(values);
              actions.resetForm();// formu temizleme yapar.
              actions.setSubmitting(false);// isSubmitting değerini tekrar false a çeker
            }}
            component={(props) => <RegisterForm {...props} />} //* formikin bize verdiğim metotlar,değişkenler props içersinde geliyor biz de onları RegisterForm componentine göndermiş olduk.
          />
          <Box sx={{ textAlign: "center", mt: 2, color: "secondary.main" }}>
            <Link to="/">Already have an account? Sign in</Link>
          </Box>
        </Grid>

        
      </Grid>
    </Container>
  );
};

export default Register;
