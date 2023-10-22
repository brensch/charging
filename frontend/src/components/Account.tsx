// Account.tsx

import React from "react"
import { Outlet } from "react-router-dom"

function Page() {
  console.log("account page")
  return (
    <div>
      Account actual Page
      <Outlet />
    </div>
  )
}

export default Page
