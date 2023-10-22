import React from "react"
import { Outlet } from "react-router-dom"

function Page() {
  return (
    <div>
      Plug Detail Page
      <Outlet />
    </div>
  )
}

export default Page
