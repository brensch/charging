import React from "react"
import { Outlet } from "react-router-dom"

function Page() {
  return (
    <div>
      Plugs Page
      <Outlet />
    </div>
  )
}

export default Page
