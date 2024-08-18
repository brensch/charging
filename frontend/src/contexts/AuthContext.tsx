import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { auth } from "../firebase"
import { onAuthStateChanged, User } from "firebase/auth"

interface AuthContextType {
  currentUser: User | null
  verified: boolean | undefined
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  verified: undefined,
  loading: true,
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [verified, setVerified] = useState<boolean | undefined>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setVerified(user?.emailVerified)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload()
      console.log(auth.currentUser)
      setVerified(auth.currentUser.emailVerified)
    }
  }

  useEffect(() => {
    if (currentUser && !currentUser.emailVerified) {
      const intervalId = setInterval(refreshUser, 10000) // Every 10 seconds
      return () => clearInterval(intervalId) // Cleanup interval
    }
  }, [currentUser])

  return (
    <AuthContext.Provider
      value={{ currentUser, verified, loading, refreshUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
