import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { firestore } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { SiteSettings, fuzeStateFromJSON } from "../contracts/objects"

const SitesList: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const sitesCollectionRef = collection(firestore, "sites") // Reference to the sites collection

    // Listen for real-time updates
    const unsubscribe = onSnapshot(sitesCollectionRef, (querySnapshot) => {
      const sitesData: SiteSettings[] = []
      querySnapshot.forEach((doc) => {
        const site = SiteSettings.fromJSON(doc.data())
        sitesData.push(site)
      })
      setSiteSettings(sitesData)
      console.log(sitesData)
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, []) // No dependencies here as we want to fetch the sites once on component mount

  return (
    <div>
      <h1>Sites List</h1>
      <ul>
        {siteSettings.map((site) => (
          <li key={site.id} onClick={() => navigate(`/site/${site.id}`)}>
            {site.id}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SitesList
