import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { firestore } from "../firebase"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { Plug } from "../contracts/objects"

const PlugsList: React.FC = () => {
  const [plugs, setPlugs] = useState<Plug[]>([])
  const { id } = useParams() // Get the site_id from the route params
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) {
      return // Return early if id is not available
    }

    const plugsCollectionRef = collection(firestore, "plugs")
    const q = query(plugsCollectionRef, where("site_id", "==", id)) // Filter plugs by site_id

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const plugsData: Plug[] = []
      querySnapshot.forEach((doc) => {
        const plug = doc.data() as Plug
        plugsData.push(plug)
      })
      setPlugs(plugsData)
      console.log(plugsData)
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
