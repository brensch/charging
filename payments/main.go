package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"github.com/stripe/stripe-go/v76/paymentmethod"
)

var (
	customerID = "cus_PEXXEakMP5rBQ0"
)

func main() {
	// This is your test secret API key.
	stripe.Key = "sk_test_51OKyPREiJxehnemBUXuQv5NDjqkPqwozTyEwxUegS5kiCCUWhgw9C6A6HCGNR9ouAwEdym9CCvZL0Spnw34cVAow00Q67ZTEyH"

	http.Handle("/", http.FileServer(http.Dir("public")))
	// http.HandleFunc("/checkout", createCheckoutSession)
	http.HandleFunc("/create", handleCreateCheckoutSession)
	http.HandleFunc("/charge", handleChargeCustomer)
	http.HandleFunc("/hook", HandleHooks)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4242" // default port if not specified
	}
	addr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("Listening on http://%s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func handleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {

	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),

		Currency:   stripe.String("aud"),
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSetup)),
		SuccessURL: stripe.String("https://sparkplugs.io/success"),
		CancelURL:  stripe.String("https://example.com/cancel"),
	}

	s, err := session.New(params)
	if err != nil {
		log.Printf("session.New: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, s.URL, http.StatusSeeOther)

}

func handleChargeCustomer(w http.ResponseWriter, r *http.Request) {

	params := &stripe.PaymentMethodListParams{
		Customer: stripe.String(customerID), // Replace with the actual customer ID
	}
	i := paymentmethod.List(params)

	var method string
	for i.Next() {
		fmt.Printf("customer: %+v\n", i.PaymentMethod().Customer)
		fmt.Printf("id: %+v\n", i.PaymentMethod().ID)
		method = i.PaymentMethod().ID
	}

	intentParams := &stripe.PaymentIntentParams{
		Amount:        stripe.Int64(2000), // Amount in cents
		Currency:      stripe.String(string(stripe.CurrencyUSD)),
		Customer:      stripe.String(customerID), // Replace with your customer's ID
		PaymentMethod: stripe.String(method),     // Replace with your saved payment method ID
		OffSession:    stripe.Bool(true),         // Indicate that the payment is happening off-session
		Confirm:       stripe.Bool(true),         // Automatically confirm the payment
	}

	pi, err := paymentintent.New(intentParams)
	if err != nil {
		log.Fatalf("paymentintent.New: %v", err)
	}

	log.Printf("PaymentIntent created: %v", pi)

}
