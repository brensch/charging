import { Button, Typography, Box } from "@mui/material"
import { useNavigate } from "react-router-dom"

const HomePage = () => {
  const navigate = useNavigate()
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        The cheapest way to charge your EV.
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body1">
          Scan the QR code above a plug, or{" "}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/plug")}>
          get started here.
        </Button>
      </Box>
    </Box>
  )
}

export default HomePage
