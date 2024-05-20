import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react"
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore"
import { firestore } from "../firebase"
import {
  AutoTopupPreferences,
  CustomerBalance,
  StripeCustomer,
  Transaction,
} from "../contracts/stripe"
import { useAuth } from "./AuthContext"
import { PlugStatus, Session } from "../contracts/objects"

// Define the context value's type
interface CustomerContextValue {
  customerBalance: CustomerBalance | null
  stripeCustomer: StripeCustomer | null
  autoTopupPreferences: AutoTopupPreferences | null
  transactions: Transaction[]
  sessions: Session[]
  inUsePlugs: PlugStatus[]
}
export const CustomerContext = createContext<CustomerContextValue>({
  customerBalance: null,
  stripeCustomer: null,
  autoTopupPreferences: null,
  transactions: [],
  sessions: [],
  inUsePlugs: [],
})
interface CustomerProviderProps {
  children: ReactNode
}

export const useCustomer = () => useContext(CustomerContext)

export const CustomerProvider: React.FC<CustomerProviderProps> = ({
  children,
}) => {
  const auth = useAuth()
  const [customerBalance, setCustomerBalance] =
    useState<CustomerBalance | null>(null)
  const [stripeCustomer, setStripeCustomer] = useState<StripeCustomer | null>(
    null,
  )
  const [autoTopupPreferences, setAutoTopupPreferences] =
    useState<AutoTopupPreferences | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [inUsePlugs, setInUsePlugs] = useState<PlugStatus[]>([])

  useEffect(() => {
    if (auth.currentUser) {
      const db = firestore
      const balanceDocRef = doc(db, "customer_balances", auth.currentUser.uid)
      const stripeDocRef = doc(db, "stripe_customers", auth.currentUser.uid)
      const topupDocRef = doc(db, "autotopup_preferences", auth.currentUser.uid)

      const unsubscribeBalance = onSnapshot(balanceDocRef, (doc) => {
        const data = doc.data()
        if (data) {
          setCustomerBalance(CustomerBalance.fromJSON(data))
        }
      })

      const unsubscribeStripe = onSnapshot(stripeDocRef, (doc) => {
        const data = doc.data()
        if (data) {
          setStripeCustomer(StripeCustomer.fromJSON(data))
        }
      })

      const unsubscribeTopup = onSnapshot(topupDocRef, (doc) => {
        const data = doc.data()
        if (data) {
          setAutoTopupPreferences(AutoTopupPreferences.fromJSON(data))
        }
      })

      // Transactions query
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("firestore_id", "==", auth.currentUser.uid),
        orderBy("completed_ms", "desc"),
        limit(10),
      )

      const unsubscribeTransactions = onSnapshot(
        transactionsQuery,
        (querySnapshot) => {
          const transactionsArray: Transaction[] = []
          querySnapshot.forEach((doc) => {
            transactionsArray.push(doc.data() as Transaction)
          })
          setTransactions(transactionsArray)
        },
      )

      // sessions
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("owner_id", "==", auth.currentUser.uid),
        orderBy("finish_ms", "desc"),
        limit(10),
      )

      const unsubscribeSessions = onSnapshot(sessionsQuery, (querySnapshot) => {
        const sessionsArray: Session[] = []
        querySnapshot.forEach((doc) => {
          sessionsArray.push(Session.fromJSON(doc.data()))
        })
        setSessions(sessionsArray)
      })

      // get all currently controlled plugs
      // Create a query against the "user_requests" collection, ordered by "time_requested" descending, limited to 5 documents
      const q = query(
        collection(firestore, "plug_status"),
        where("state.owner_id", "==", auth.currentUser?.uid),
        limit(5),
      )

      // Subscribe to the query
      const unsubscribeInUsePlugs = onSnapshot(q, (querySnapshot) => {
        const inUsePlugs: PlugStatus[] = []
        querySnapshot.forEach((doc) => {
          const status = PlugStatus.fromJSON(doc.data())

          inUsePlugs.push(status)
        })
        setInUsePlugs(inUsePlugs)
      })

      // Clean up the subscription when the component unmounts

      return () => {
        unsubscribeBalance()
        unsubscribeStripe()
        unsubscribeTopup()
        unsubscribeTransactions()
        unsubscribeSessions()
        unsubscribeInUsePlugs()
      }
    }
  }, [auth])

  const contextValue = {
    customerBalance,
    stripeCustomer,
    autoTopupPreferences,
    transactions,
    sessions,
    inUsePlugs,
  }

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}
