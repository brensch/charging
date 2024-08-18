import React, { useContext } from "react"
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material"
import { CustomerContext } from "../contexts/CustomerContext"

const SessionsPage = () => {
  const { sessions } = useContext(CustomerContext)

  const calculateDuration = (start_ms: number, finish_ms: number) => {
    const milliseconds = finish_ms - start_ms
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Helper function to format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  // Helper function to format time
  const formatTime = (timestamp: number) => {
    const time = new Date(timestamp)
    return time.toLocaleTimeString()
  }

  console.log(sessions)

  return (
    <Container>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" my={2}>
          Charging Sessions
        </Typography>
        {sessions.length > 0 ? (
          <TableContainer component={Paper}>
            <Table aria-label="charging sessions table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell> {/* Added Date column */}
                  <TableCell>Time</TableCell> {/* Added Time column */}
                  <TableCell>Duration</TableCell>
                  <TableCell>Energy</TableCell>
                  <TableCell>Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell>
                      {formatDate(session.start_ms)} {/* Display Date */}
                    </TableCell>
                    <TableCell>
                      {formatTime(session.start_ms)} {/* Display Time */}
                    </TableCell>
                    <TableCell>
                      {calculateDuration(session.start_ms, session.finish_ms)}
                    </TableCell>
                    <TableCell>{session.total_kwh.toFixed(3)}kWh</TableCell>
                    <TableCell component="th" scope="row">
                      ${session.cents / 100}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>
            No charging sessions logged yet. Plug in to get started.
          </Typography>
        )}
      </Box>
    </Container>
  )
}

export default SessionsPage
