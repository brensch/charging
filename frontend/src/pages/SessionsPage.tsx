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
  const { transactions, sessions } = useContext(CustomerContext)

  return (
    <Container>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" mb={2}>
          Charging Sessions
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="transactions table">
            <TableHead>
              <TableRow>
                <TableCell>Start</TableCell>
                <TableCell>Finish</TableCell>
                <TableCell>Energy Used</TableCell>
                <TableCell>Cost (AUD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.session_id}>
                  <TableCell>
                    {new Date(session.start_ms).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(session.finish_ms).toLocaleString()}
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
        <Typography variant="h6" mb={2} mt={2}>
          Topups
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="transactions table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount (AUD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.payment_id}>
                  <TableCell>
                    {new Date(transaction.completed_ms).toLocaleString()}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    ${transaction.cents_aud / 100}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  )
}

export default SessionsPage
