import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { firestore } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { Site } from "../contracts/objects"

const SitesList: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const sitesCollectionRef = collection(firestore, "sites") // Reference to the sites collection

    // Listen for real-time updates
    const unsubscribe = onSnapshot(sitesCollectionRef, (querySnapshot) => {
      const sitesData: Site[] = []
      querySnapshot.forEach((doc) => {
        const site = doc.data() as Site
        sitesData.push(site)
      })
      setSites(sitesData)
      console.log(sitesData)
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, []) // No dependencies here as we want to fetch the sites once on component mount

  return (
    <div>
      <h1>Sites List</h1>
      <ul>
        {sites.map((site) => (
          <li
            key={site.site_id}
            onClick={() => navigate(`/site/${site.site_id}`)}
          >
            {site.site_id}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SitesList
