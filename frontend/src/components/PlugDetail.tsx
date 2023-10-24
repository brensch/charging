import { useEffect, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import { firestore } from "../firebase"
import { doc, onSnapshot, getDoc } from "firebase/firestore"
import { Plug, PlugState } from "../contracts/objects"
import PlugStateCard from "./PlugStateCard"

function Page() {
  let { id } = useParams<{ id: string }>() // specify the type for useParams
  const [plugData, setPlugData] = useState<Plug | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }
    const plugRef = doc(firestore, "plugs", id) // Reference to the plug with the specified id

    // Listen for real-time updates
    const unsubscribe = onSnapshot(plugRef, (documentSnapshot) => {
      if (documentSnapshot.exists()) {
        setPlugData(Plug.fromJSON(documentSnapshot.data()))
        console.log(documentSnapshot.data())
      } else {
        console.log("No such plug!")
        setPlugData(null)
      }
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [id]) // Include id in the dependency array to refetch if id changes

  if (!plugData) {
    return <div>Loading...</div>
  }
  return (
    <div>
      Plug Metadata for {id}: <PlugStateCard plugData={plugData} />
      <Outlet />
    </div>
  )
}

export default Page
