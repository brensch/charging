import { Button, Typography, Box } from "@mui/material"
import { useNavigate } from "react-router-dom"

const HomePage = () => {
  const navigate = useNavigate()
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        The cheapest way to charge your EV.
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mb: 4 }}>
        Plug your car in to a normal outlet when you get home. Leave the rest to
        us.
      </Typography>
      <Button variant="outlined" onClick={() => navigate("/plug")}>
        Get started here.
      </Button>
    </Box>
  )
}

export default HomePage
