import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

const AuthImage = ({ image }) => {
  return (
    <Grid size={{ xs: 10, sm: 7, md: 6 }}>
      <Container>
        <img src={image} alt="img" style={{ width: "20%" }} />
      </Container>
    </Grid>
  );
};

export default AuthImage;