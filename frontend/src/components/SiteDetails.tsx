import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { firestore } from "../firebase"
import { collection, doc, onSnapshot, query, where } from "firebase/firestore"
import { Plug, Site } from "../contracts/objects"

const PlugsList: React.FC = () => {
  const [plugs, setPlugs] = useState<Plug[]>([])
  const { id } = useParams() // Get the site_id from the route params
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) {
      return // Return early if id is not available
    }

    // Directly reference the site document with the given id
    const siteDocRef = doc(firestore, "sites", id)

    // Listen for real-time updates on the site document
    const unsubscribe = onSnapshot(siteDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const siteData = Site.fromJSON(docSnapshot.data())
        setPlugs(siteData.plugs)
        console.log(siteData.plugs)
      }
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [id]) // Dependency on id so that it refetches when id changes

  return (
    <div>
      <h1>Plugs for Site {id}</h1>
      <ul>
        {plugs.map((plug) => (
          <li
            key={plug.plug_id}
            onClick={() => navigate(`/plug/${plug.plug_id}`)}
          >
            Plug ID: {plug.plug_id}
            {/* Display other plug information here */}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PlugsList
