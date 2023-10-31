import { useEffect, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import { firestore } from "../firebase"
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { Plug, PlugState } from "../contracts/objects"
import PlugStateCard from "./PlugStateCard"
import { Container } from "@chakra-ui/react"

function Page() {
  const { id } = useParams<{ id: string }>()
  const [plugData, setPlugData] = useState<Plug | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    // First, find the site that contains this plug id
    const sitesCollectionRef = collection(firestore, "sites")
    const q = query(sitesCollectionRef, where("plug_ids", "array-contains", id))

    // Execute the query
    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach((siteDoc) => {
        // Now subscribe to real-time updates for the found site
        const unsubscribe = onSnapshot(siteDoc.ref, (siteSnapshot) => {
          if (siteSnapshot.exists()) {
            const siteData = siteSnapshot.data()
            // Extract the plug data from the site's data using the plug id
            const plug = siteData.plugs.find(
              (plug: Plug) => plug.plug_id === id,
            )
            if (plug) {
              setPlugData(Plug.fromJSON(plug))
            }
          }
        })

        // Clean up the listener on component unmount
        return () => unsubscribe()
      })
    })
  }, [id])

  if (!plugData) {
    return (
      <Container maxW="4xl" p={4}>
        Loading...
      </Container>
    )
  }
  return (
    <Container maxW="4xl" p={4}>
      <PlugStateCard plugData={plugData} />
      <Outlet />
    </Container>
  )
}

export default Page
