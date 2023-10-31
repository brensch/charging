import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Image,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import SiteCard from "./SiteCard"
import SiteCardGrid from "./SiteCardGrid"
import { Site, SiteSetting } from "../contracts/objects"
import { collection, onSnapshot } from "firebase/firestore"
import { firestore } from "../firebase"
import car from "../assets/car-side.svg" // adjust the path to match your directory structure

function Page() {
  let navigate = useNavigate()
  const [sites, setSites] = useState<Site[]>([])

  useEffect(() => {
    const sitesCollectionRef = collection(firestore, "sites") // Reference to the sites collection

    // Listen for real-time updates
    const unsubscribe = onSnapshot(sitesCollectionRef, (querySnapshot) => {
      const sitesData: Site[] = []
      querySnapshot.forEach((doc) => {
        const site = Site.fromJSON(doc.data())
        sitesData.push(site)
      })
      setSites(sitesData)
      console.log(sitesData)
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [])

  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([])

  useEffect(() => {
    const siteSettingsCollectionRef = collection(firestore, "sitesettings") // Reference to the site settings collection

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      siteSettingsCollectionRef,
      (querySnapshot) => {
        const sitesData: SiteSetting[] = []
        querySnapshot.forEach((doc) => {
          const siteSetting = SiteSetting.fromJSON(doc.data())
          sitesData.push(siteSetting)
        })
        setSiteSettings(sitesData)
      },
    )

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [])

  // Helper function to get the SiteSetting for a given Site
  const getSiteSettingForSite = (site: Site) => {
    return siteSettings.find(
      (siteSetting) => siteSetting.site_id === site.site_id,
    )
  }

  console.log(siteSettings)

  return (
    <>
      {/* <Box bg="#69d2e7" position="relative"> */}
      {/* <Box bg="#e3a018" position="relative"> */}
      <Box bg="#ffb2ef" position="relative">
        <Container maxW="4xl" p={4}>
          <Text fontSize="3xl">Charge your car off peak for less.</Text>
          {/* <Image
            src={car}
            alt="Car Icon"
            position="absolute"
            bottom="-0"
            right="10px" // Adjust this value to move it more or less to the right
            w="50px" // adjust the width
            h="50px" // adjust the height
          />{" "} */}
        </Container>
      </Box>
      <Outlet />
      <Box borderBottom="1px solid" borderColor="black" />
      <Container maxW="4xl" p={4}>
        <Text fontSize="xl" align={"right"}>
          Here's some places that have signed up.
        </Text>
        <Grid templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}>
          {sites.map((site) => (
            <SiteCard
              key={site.site_id}
              site={site}
              site_settings={getSiteSettingForSite(site)}
            />
          ))}
        </Grid>
      </Container>
    </>
  )
}

export default Page

const CarIcon = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "absolute",
      bottom: 0,
      right: "10px", // Adjust this value to move it more or less to the right
    }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V14H23V16H1V14H3V9ZM3 16C1.89543 16 1 16.8954 1 18V20C1 20.5523 1.44772 21 2 21H3C3.55228 21 4 20.5523 4 20V18C4 17.4477 3.55228 17 3 17H2V18C2 18.2652 2.10536 18.5196 2.29289 18.7071C2.48043 18.8946 2.73478 19 3 19C3.26522 19 3.51957 18.8946 3.70711 18.7071C3.89464 18.5196 4 18.2652 4 18V17H3V18ZM5 9V14H19V9H5ZM21 17H23V18C23 18.2652 22.8946 18.5196 22.7071 18.7071C22.5196 18.8946 22.2652 19 22 19C21.7348 19 21.4804 18.8946 21.2929 18.7071C21.1054 18.5196 21 18.2652 21 18V17Z"
      fill="black"
    />
  </svg>
)
