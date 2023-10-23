import React from "react"
import { Outlet, useParams } from "react-router-dom"

function Page() {
  let { id } = useParams()
  return (
    <div>
      Plug Metadata for {id}
      <Outlet />
    </div>
  )
}

export default Page
