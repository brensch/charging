import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"
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
import PlugPage from "./pages/PlugPage"
import UserPage from "./pages/UserPage"
import TopUpPage from "./pages/TopUpPage"
import BottomNav from "./objects/BottomNav"
import MoneyPage from "./pages/MoneyPage"
import SessionsPage from "./pages/SessionsPage"

// Create a Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: "#ff1744",
    },
    background: {
      default: "#fff",
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CustomerProvider>
          <CssBaseline />

          <Router>
            <TopAppBar />
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/confirm-login" element={<ConfirmLoginInPage />} />
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
          </Router>
        </CustomerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
