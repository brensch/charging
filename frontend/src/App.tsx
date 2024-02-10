import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material"
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom"
import ProtectedRoute from "./ProtectedRoute"
import { AuthProvider } from "./contexts/AuthContext"
import { CustomerProvider } from "./contexts/CustomerContext"
import TopAppBar from "./objects/TopAppBar"
import ConfirmLoginInPage from "./pages/ConfirmLoginPage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import LoginPendingPage from "./pages/LoginPendingPage"
import PlugPage from "./pages/PlugPage"
import UserPage from "./pages/UserPage"
import TopUpPage from "./pages/TopUpPage"
import BottomNav from "./objects/BottomNav"
import MoneyPage from "./pages/MoneyPage"
import SessionsPage from "./pages/SessionsPage"
import { useState } from "react"
import UnprotectedRoute from "./UnprotectedRoute"

const theme = createTheme({
  palette: {
    background: {
      default: "#fff", // Sets default background color to white
    },
    primary: {
      main: "#000", // Sets the primary color to black
    },
    text: {
      primary: "#000", // Sets the primary text color to black
    },
  },
  typography: {
    fontFamily: [
      "Mabry Pro",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    // Define font weights for consistency
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0, // Removes dropshadow
      },
      styleOverrides: {
        root: {
          backgroundColor: "#fff", // Sets AppBar background color to white
          border: "none",
          borderBottom: "2px solid #000000", // Adds a thin line at the bottom
          color: "#000", // Set default color here for all child elements
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none", // Removes the drop shadow
          border: "2px solid black", // Adds a 2px solid black border
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          borderRadius: "20px", // Adjust the border-radius for rounded corners
          // padding: "6px 16px", // Adjust padding, if necessary
          borderWidth: "2px",

          textTransform: "none", // Buttons have uppercase text by default, set this to 'none' to use normal casing
          boxShadow: "none", // remove shadow from all buttons
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
      variants: [
        {
          props: { variant: "contained" },
          style: {
            backgroundColor: "#000", // Change this to the color code you want
            color: "#fff", // Text color for contained button
            "&:hover": {
              // Styles for when the button is hovered
              backgroundColor: "rgba(0, 0, 0, 0.8)", // Darken button color slightly on hover
              boxShadow: "none", // remove shadow on hover
            },
          },
        },
        {
          props: { variant: "outlined" },
          style: {
            borderColor: "#000", // Border color for outlined button
            color: "#000", // Text color for outlined button
            "&:hover": {
              // Styles for when the button is hovered
              color: "#fff",
              backgroundColor: "#000",
              // borderColor: "rgba(0, 0, 0, 0.5)", // Darken border color slightly on hover
              boxShadow: "none", // remove shadow on hover
            },
          },
        },
      ],
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: "none", // Remove the drop shadow
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            // Target the Outlined Input inside the TextField
            "& fieldset": {
              // Target the fieldset element which is the actual border
              borderColor: "#000", // Set the border color
              borderWidth: "2px", // Set the border width
            },
            "&:hover fieldset": {
              borderColor: "#000", // Set the border color on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#000", // Set the border color when the TextField is focused
            },
          },
        },
      },
    },
  },
})

function App() {
  const [appBarHeight, setAppBarHeight] = useState(64)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CustomerProvider>
          <Router>
            <TopAppBar setAppBarHeight={setAppBarHeight} />
            <Container
              maxWidth="sm"
              sx={{
                marginTop: `${appBarHeight}px`,
                p: 1,
                maxWidth: "100%",
                overflowX: "hidden",
                boxSizing: "border-box",
              }}
            >
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route
                  path="/user"
                  element={
                    <ProtectedRoute>
                      <UserPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plug"
                  element={
                    <ProtectedRoute>
                      <PlugPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/money"
                  element={
                    <ProtectedRoute>
                      <MoneyPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <SessionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <UnprotectedRoute>
                      <LoginPage />
                    </UnprotectedRoute>
                  }
                />
                <Route
                  path="/loginpending"
                  element={
                    <UnprotectedRoute>
                      <LoginPendingPage />
                    </UnprotectedRoute>
                  }
                />
                <Route
                  path="/confirm-login"
                  element={
                    <UnprotectedRoute>
                      <ConfirmLoginInPage />
                    </UnprotectedRoute>
                  }
                />
                <Route
                  path="/autotopup"
                  element={
                    <ProtectedRoute>
                      <TopUpPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/home" />} />
                {/* Redirect to /home as a default route */}
                {/* <Route path="*" element={<Navigate replace to="/home" />} /> */}
              </Routes>
            </Container>
          </Router>
        </CustomerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
