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
  const { transactions } = useContext(CustomerContext)

  return (
    <Container>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" mb={2}>
          Times we exchanged money
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="transactions table">
            <TableHead>
              <TableRow>
                <TableCell>Amount (AUD)</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.payment_id}>
                  <TableCell component="th" scope="row">
                    ${transaction.cents_aud / 100}
                  </TableCell>
                  <TableCell align="right">
                    {new Date(transaction.completed_ms).toLocaleString()}
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
