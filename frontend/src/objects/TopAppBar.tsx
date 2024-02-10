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

interface MenuItem {
  label: string
  icon: JSX.Element
  path: string
}

interface TopAppBarProps {
  setAppBarHeight: React.Dispatch<React.SetStateAction<number>>
}

const TopAppBar: React.FC<TopAppBarProps> = ({ setAppBarHeight }) => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const appBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set the AppBar height after the component mounts
    if (appBarRef.current) {
      setAppBarHeight(appBarRef.current.clientHeight)
    }
  }, [setAppBarHeight])

  const toggleMenu = () => {
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
        sx={{
          width: "100vw",
          position: "fixed",
          top: "64px", // AppBar height
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
      </Box>
    </Slide>
  )

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: appBarZIndex }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Magic Charge
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleMenu}
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
