import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import Slide from "@mui/material/Slide"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices"
import ReceiptIcon from "@mui/icons-material/Receipt"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import Box from "@mui/material/Box"
import { Button, Container, Divider } from "@mui/material"
import { useAuth } from "../contexts/AuthContext"
import { sendEmailVerification } from "firebase/auth"
import { auth } from "../firebase"

import { useCustomer } from "../contexts/CustomerContext"
import {
  StateMachineState,
  stateMachineStateToJSON,
} from "../contracts/objects"

interface MenuItem {
  label: string
  icon: JSX.Element
  path: string
}

interface TopAppBarProps {
  setAppBarHeight: React.Dispatch<React.SetStateAction<number>>
}

const formatState = (state: StateMachineState) =>
  stateMachineStateToJSON(state)
    .replace(/^StateMachineState_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())

const appBarHeight = "64px"

const TopAppBar: React.FC<TopAppBarProps> = ({ setAppBarHeight }) => {
  const authState = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const appBarRef = useRef<HTMLDivElement>(null)
  const customer = useCustomer()

  useEffect(() => {
    if (appBarRef.current) {
      setAppBarHeight(appBarRef.current.clientHeight)
    }
  }, [setAppBarHeight])

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const handleSignOut = () => {
    setIsMenuOpen(false)
    auth.signOut()
  }

  const menuItems: MenuItem[] = [
    {
      label: "Start Charging",
      icon: <ElectricalServicesIcon />,
      path: "/plug",
    },
    {
      label: `Get Credit`,
      icon: <AttachMoneyIcon />,
      path: "/money",
    },
    { label: "View Charge Sessions", icon: <ReceiptIcon />, path: "/sessions" },
  ]

  const handleListItemClick = (path: string) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  const appBarZIndex = 1200
  const menuZIndex = 1100

  const fullScreenMenu = (
    <Slide direction="down" in={isMenuOpen} mountOnEnter unmountOnExit>
      <Box
        sx={{
          width: "100vw",
          position: "fixed",
          top: appBarHeight,
          left: 0,
          zIndex: menuZIndex,
          backgroundColor: "white",
          borderBottom: "2px solid black",
        }}
      >
        <List disablePadding>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => handleListItemClick(item.path)}
              sx={{
                "&:hover": {
                  backgroundColor: "#bafca2",
                  cursor: "pointer",
                  "& .MuiListItemIcon-root": {
                    color: "black",
                  },
                  "& .MuiListItemText-primary": {
                    color: "black",
                  },
                },
              }}
            >
              <Container maxWidth="sm">
                <ListItem key={`${index}-inside`} disablePadding>
                  <ListItemIcon sx={{ color: "black" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              </Container>
            </ListItem>
          ))}
        </List>

        {customer.inUsePlugs.length > 0 && (
          <Divider sx={{ border: "1px solid black" }} />
        )}
        <List disablePadding>
          {customer.inUsePlugs.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => handleListItemClick(`/plug/${item.id}`)}
              sx={{
                "&:hover": {
                  backgroundColor: "#bafca2",
                  cursor: "pointer",
                  "& .MuiListItemIcon-root": {
                    color: "black",
                  },
                  "& .MuiListItemText-primary": {
                    color: "black",
                  },
                },
              }}
            >
              <Container maxWidth="sm">
                <ListItem key={`${index}-inside`} disablePadding>
                  <ListItemText
                    primary={`Your plug ${item.id.slice(-15)} - ${
                      item.state?.state ? formatState(item.state?.state) : ""
                    }`}
                  />
                </ListItem>
              </Container>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ border: "1px solid black" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "16px",
            gap: "16px",
            flexDirection: "row",
          }}
        >
          <Button variant="outlined" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button
            variant="outlined"
            component="a"
            href="mailto:help@niquist.com"
          >
            Contact Us
          </Button>
        </Box>
      </Box>
    </Slide>
  )

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ height: appBarHeight, zIndex: appBarZIndex }}
      >
        <Container maxWidth="sm">
          <Toolbar ref={appBarRef}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Magic Charge
            </Typography>
            {authState.currentUser &&
              typeof customer.customerBalance?.cents_aud === "number" && (
                <Typography variant="h6">
                  ${customer.customerBalance?.cents_aud / 100}
                </Typography>
              )}
            {authState.currentUser && (
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleMenu}
                id="closedhamburger"
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      {fullScreenMenu}
    </>
  )
}

export default TopAppBar
