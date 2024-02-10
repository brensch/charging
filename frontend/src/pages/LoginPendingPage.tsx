import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import React from "react"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import { useNavigate } from "react-router-dom"

const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Container component="main" maxWidth="xs">
      <Typography variant="h4" component="h1" gutterBottom>
        Login email sent.
      </Typography>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="button" display="block">
            Having trouble?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemText>
                If you don't receive the email, check your spam folder.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                If the email does not contain a link, the link might have been
                removed by your spam filter.{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    navigate("/login") // Update the navigation path as needed
                  }}
                >
                  Click here
                </Link>{" "}
                and enter your email again.
              </ListItemText>
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
    </Container>
  )
}

export default LoginPage
