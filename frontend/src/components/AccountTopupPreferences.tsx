import React, { useContext, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Switch,
  Icon,
} from "@chakra-ui/react"
import SiteCard from "./SiteCard"
import { auth, firestore } from "../firebase"
import { CustomerContext } from "../contexts/CustomerContext"
import { doc, updateDoc } from "firebase/firestore"
import { AutoTopupPreferences } from "../contracts/stripe"
import { MdArrowBack, MdBackHand } from "react-icons/md"
import { PaymentsAPI } from "../constants/urls"

function Page() {
  let navigate = useNavigate()
  const [autoTopUpTrigger, setAutoTopUpTrigger] = useState("")
  const [autoTopUpAmount, setAutoTopUpAmount] = useState("")
  const [isAutoTopUpEnabled, setIsAutoTopUpEnabled] = useState(false)

  const { customerBalance, stripeCustomer, autoTopupPreferences } =
    useContext(CustomerContext)

  // Load initial state from autoTopupPreferences context
  useEffect(() => {
    if (autoTopupPreferences) {
      setIsAutoTopUpEnabled(autoTopupPreferences.enabled)
    }
  }, [autoTopupPreferences])

  const handleToggleAutoTopUp = () => {
    const newEnabledState = !isAutoTopUpEnabled
    setIsAutoTopUpEnabled(newEnabledState)

    const firestoreId = auth.currentUser?.uid
    if (firestoreId) {
      updateAutoTopupPreferences(firestoreId, {
        enabled: newEnabledState,
      })
    }
  }

  const updateAutoTopupPreferences = (
    firestoreId: string,
    updatedPreferences: Partial<AutoTopupPreferences>,
  ) => {
    const docRef = doc(firestore, "autotopup_preferences", firestoreId)
    updateDoc(docRef, updatedPreferences)
      .then(() => {
        console.log("Document successfully updated!")
      })
      .catch((error) => {
        console.error("Error updating document: ", error)
      })
  }

  const handleAutoTopUpConfirm = () => {
    // Convert entered values to cents
    const triggerCents = parseFloat(autoTopUpTrigger) * 100
    const amountCents = parseFloat(autoTopUpAmount) * 100

    // Update Firestore
    const firestoreId = auth.currentUser?.uid // Assuming this is the correct ID for Firestore
    if (firestoreId) {
      updateAutoTopupPreferences(firestoreId, {
        threshold_cents: triggerCents,
        recharge_value_cents_aud: amountCents,
      })
    }
  }
  console.log(autoTopUpTrigger === "" || autoTopUpAmount === "")

  return (
    <Container maxW="4xl" p={4}>
      <Button onClick={() => navigate("/account")}>
        <Icon as={MdArrowBack} />
      </Button>
      <Text>Autotopup Settings</Text>
      {stripeCustomer?.payment_methods.length === 0 ? (
        <VStack spacing={4}>
          <Button
            onClick={() => {
              const url = `${PaymentsAPI}/manage/${auth.currentUser?.uid}`
              window.open(url)
            }}
          >
            Add payment method
          </Button>
          <Text>
            Can only use autotopup once payment method has been added.
          </Text>
        </VStack>
      ) : (
        <React.Fragment>
          <Button
            onClick={() => {
              const url = `${PaymentsAPI}/manage/${auth.currentUser?.uid}`
              window.open(url)
            }}
          >
            Manage payment methods
          </Button>
          <HStack>
            <Text>Enable Auto Top-Up:</Text>
            <Switch
              isChecked={isAutoTopUpEnabled}
              onChange={handleToggleAutoTopUp}
            />
          </HStack>
          {autoTopupPreferences && autoTopupPreferences.enabled && (
            <VStack spacing={4}>
              <Text fontSize="md" mt={4}>
                Auto Top-Up Settings:
              </Text>
              <Text>
                Threshold: ${autoTopupPreferences?.threshold_cents / 100}
              </Text>
              <Text>
                Recharge with: $
                {autoTopupPreferences?.recharge_value_cents_aud / 100}
              </Text>

              <Text fontSize="md" mt={4}>
                New Auto Top-Up Settings:
              </Text>
              <HStack>
                <NumberInput
                  min={0}
                  value={autoTopUpTrigger}
                  onChange={setAutoTopUpTrigger}
                  precision={2}
                >
                  <NumberInputField placeholder="When I'm below" />
                </NumberInput>
                <Text>$</Text>
              </HStack>
              <HStack>
                <NumberInput
                  min={0}
                  value={autoTopUpAmount}
                  onChange={setAutoTopUpAmount}
                  precision={2}
                >
                  <NumberInputField placeholder="Top up with" />
                </NumberInput>
                <Text>$</Text>
              </HStack>
              <Button
                isDisabled={autoTopUpTrigger === "" || autoTopUpAmount === ""}
                onClick={handleAutoTopUpConfirm}
              >
                Update Auto Top-Up
              </Button>
            </VStack>
          )}
        </React.Fragment>
      )}
    </Container>
  )
}

export default Page
