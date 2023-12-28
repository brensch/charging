import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { firestore } from "../firebase"
import { collection, doc, onSnapshot, query, where } from "firebase/firestore"
import {
  // Plug,
  // Site,
  SiteSettings,
  // siteStateFromJSON,
} from "../contracts/objects"
import PlugStateCard from "./PlugStateCard"
import { Container, Grid, Heading } from "@chakra-ui/react"

const PlugsList: React.FC = () => {
  // const [site, setSite] = useState<Site | undefined>(undefined)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | undefined>(
    undefined,
  )
  const { id } = useParams() // Get the site_id from the route params
  const navigate = useNavigate()

  // useEffect(() => {
  //   if (!id) {
  //     return // Return early if id is not available
  //   }

  //   // Directly reference the site document with the given id
  //   const siteDocRef = doc(firestore, "sites", id)

  //   // Listen for real-time updates on the site document
  //   const unsubscribe = onSnapshot(siteDocRef, (docSnapshot) => {
  //     if (docSnapshot.exists()) {
  //       const siteData = Site.fromJSON(docSnapshot.data())
  //       setSite(siteData)
  //     }
  //   })

  //   // Clean up the listener on component unmount
  //   return () => unsubscribe()
  // }, [id])

  useEffect(() => {
    if (!id) {
      return // Return early if id is not available
    }

    // Directly reference the site document with the given id
    const siteDocRef = doc(firestore, "site_settings", id)

    // Listen for real-time updates on the site document
    const unsubscribe = onSnapshot(siteDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const siteData = SiteSettings.fromJSON(docSnapshot.data())
        setSiteSettings(siteData)
      }
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [id])

  return (
    <Container maxW="4xl" p={4}>
      <Heading>Site {siteSettings?.name}</Heading>
      <Grid templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]} gap={4}>
        {/* {site?.plugs.map((plug) => (
          <PlugStateCard key={plug.plug_id} plugData={plug} />
        ))} */}
      </Grid>
    </Container>
  )
}

export default PlugsList
