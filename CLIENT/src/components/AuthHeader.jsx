import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const AuthHeader = () => {
  return (
    <Grid size={{ xs: 12 }} mb={3}>
      <Typography variant="h3" color="secondary" align="center">
        WCFinder
      </Typography>
    </Grid>
  );
};

export default AuthHeader;
