import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import ReceiptIcon from "@mui/icons-material/Receipt"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [value, setValue] = useState<string>("")

  const handleChange = (_: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue)
    navigate(newValue)
  }

  useEffect(() => {
    setValue(location.pathname)
  }, [location])

  return (
    <BottomNavigation value={value} onChange={handleChange} showLabels>
      <BottomNavigationAction
        label="Plug"
        value="/plug"
        icon={<ElectricalServicesIcon />}
      />
      <BottomNavigationAction
        label="User"
        value="/user"
        icon={<AccountCircleIcon />}
      />
      <BottomNavigationAction
        label="Sessions"
        value="/sessions"
        icon={<ReceiptIcon />}
      />
      <BottomNavigationAction
        label="Money"
        value="/money"
        icon={<AttachMoneyIcon />}
      />
    </BottomNavigation>
  )
}

export default BottomNav
