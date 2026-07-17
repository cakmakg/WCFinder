import React from "react";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import logger from "../utils/logger";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false
        };
    }

    componentDidCatch(error, info) {
        // Stack yalnızca logger'a gider (DEV), kullanıcıya asla render edilmez
        logger.error("Unhandled render error", error, { componentStack: info?.componentStack });
        this.setState({
            error: error
        });
    }

    handleRetry = () => {
        this.setState({ error: false });
    };

    render() {
        if (this.state.error) {
            return (
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#f5f5f5",
                        p: 2,
                    }}
                >
                    <Paper
                        sx={{
                            p: 4,
                            maxWidth: 480,
                            textAlign: "center",
                            borderRadius: "16px",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        }}
                    >
                        <ErrorOutlineIcon sx={{ fontSize: 48, color: "#0891b2", mb: 2 }} />
                        <Typography variant="h6" sx={{ color: "#0f172a", mb: 1 }}>
                            Etwas ist schiefgelaufen
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
                            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es
                            erneut oder kehren Sie zur Startseite zurück.
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                onClick={this.handleRetry}
                                sx={{
                                    bgcolor: "#0891b2",
                                    borderRadius: "12px",
                                    "&:hover": { bgcolor: "#0e7490" },
                                }}
                            >
                                Erneut versuchen
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => { window.location.href = "/"; }}
                                sx={{
                                    color: "#0891b2",
                                    borderColor: "#0891b2",
                                    borderRadius: "12px",
                                }}
                            >
                                Zur Startseite
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
