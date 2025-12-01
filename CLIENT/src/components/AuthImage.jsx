import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

const AuthImage = ({ image, alt = "WCFinder authentication illustration" }) => {
  return (
    <Grid size={{ xs: 10, sm: 7, md: 6 }}>
      <Container>
        <img src={image} alt={alt} style={{ width: "20%" }} />
      </Container>
    </Grid>
  );
};

export default AuthImage;