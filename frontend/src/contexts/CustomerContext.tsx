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
import { auth, firestore } from "../firebase"
import {
  AutoTopupPreferences,
  CustomerBalance,
  StripeCustomer,
  Transaction,
} from "../contracts/stripe"

// Define the context value's type
interface CustomerContextValue {
  customerBalance: CustomerBalance | null
  stripeCustomer: StripeCustomer | null
  autoTopupPreferences: AutoTopupPreferences | null
  transactions: Transaction[]
}
export const CustomerContext = createContext<CustomerContextValue>({
  customerBalance: null,
  stripeCustomer: null,
  autoTopupPreferences: null,
  transactions: [],
})
interface CustomerProviderProps {
  children: ReactNode
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({
  children,
}) => {
  const [customerBalance, setCustomerBalance] =
    useState<CustomerBalance | null>(null)
  const [stripeCustomer, setStripeCustomer] = useState<StripeCustomer | null>(
    null,
  )
  const [autoTopupPreferences, setAutoTopupPreferences] =
    useState<AutoTopupPreferences | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

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

      return () => {
        unsubscribeBalance()
        unsubscribeStripe()
        unsubscribeTopup()
        unsubscribeTransactions()
      }
    }
  }, [auth.currentUser])

  const contextValue = {
    customerBalance,
    stripeCustomer,
    autoTopupPreferences,
    transactions,
  }

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}
