import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react"
import { doc, onSnapshot, getFirestore } from "firebase/firestore"
import { auth } from "../firebase"
import { CustomerBalance, StripeCustomer } from "../contracts/stripe"

// Define the context value's type
interface CustomerContextValue {
  customerBalance: CustomerBalance | null
  stripeCustomer: StripeCustomer | null
}
export const CustomerContext = createContext<CustomerContextValue>({
  customerBalance: null,
  stripeCustomer: null,
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

  useEffect(() => {
    if (auth.currentUser) {
      const db = getFirestore()
      const balanceDocRef = doc(db, "customer_balances", auth.currentUser.uid)
      const stripeDocRef = doc(db, "stripe_customers", auth.currentUser.uid)

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

      return () => {
        unsubscribeBalance()
        unsubscribeStripe()
      }
    }
  }, [auth.currentUser])

  const contextValue = {
    customerBalance,
    stripeCustomer,
  }

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}
