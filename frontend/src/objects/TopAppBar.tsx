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
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import ReceiptIcon from "@mui/icons-material/Receipt"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import Box from "@mui/material/Box"
import { Button, Divider } from "@mui/material"
import { useAuth } from "../contexts/AuthContext"
import { auth } from "../firebase"

interface MenuItem {
  label: string
  icon: JSX.Element
  path: string
}

interface TopAppBarProps {
  setAppBarHeight: React.Dispatch<React.SetStateAction<number>>
}

const appBarHeight = "64px"

const TopAppBar: React.FC<TopAppBarProps> = ({ setAppBarHeight }) => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null) // Reference to the menu
  const appBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (appBarRef.current) {
      setAppBarHeight(appBarRef.current.clientHeight)
    }
  }, [setAppBarHeight])

  useEffect(() => {
    // TODO: fix pressing the hamburger when open reopening
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the menu and not on the menu button
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    // Add event listener only when the menu is open
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen]) // Depend on isMenuOpen to add/remove the event listener

  const toggleMenu = () => {
    if (isMenuOpen) {
      return
    }
    setIsMenuOpen(!isMenuOpen)
  }

  const menuItems: MenuItem[] = [
    { label: "Plug", icon: <ElectricalServicesIcon />, path: "/plug" },
    { label: "User", icon: <AccountCircleIcon />, path: "/user" },
    { label: "Sessions", icon: <ReceiptIcon />, path: "/sessions" },
    { label: "Money", icon: <AttachMoneyIcon />, path: "/money" },
  ]

  const handleListItemClick = (path: string) => {
    navigate(path)
    setIsMenuOpen(false) // Close menu after navigation
  }

  const appBarZIndex = 1200 // Set AppBar zIndex to be higher than the menu
  const menuZIndex = 1100 // Ensure this is lower than AppBar's zIndex

  const fullScreenMenu = (
    <Slide direction="down" in={isMenuOpen} mountOnEnter unmountOnExit>
      <Box
        ref={menuRef} // Add the ref here
        sx={{
          width: "100vw",
          position: "fixed",
          top: appBarHeight, // AppBar height
          left: 0,
          zIndex: menuZIndex, // zIndex lower than AppBar
          backgroundColor: "white",
          borderBottom: "2px solid black",
        }}
      >
        <List>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => handleListItemClick(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ border: "1px solid black" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center", // This centers the buttons
            padding: "16px", // This adds padding; you can adjust as needed
            gap: "16px", // This adds space between the buttons
            flexDirection: "row", // This stacks the buttons vertically
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setIsMenuOpen(false)
              auth.signOut()
            }}
          >
            Sign Out
          </Button>
          <Button variant="outlined">Contact Us</Button>
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
        <Toolbar ref={menuRef}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Magic Charge
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleMenu}
            id="closedhamburger"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {fullScreenMenu}
    </>
  )
}

export default TopAppBar
