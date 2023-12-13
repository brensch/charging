package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"github.com/stripe/stripe-go/v76/paymentmethod"
)

var (
	customerID = "cus_PB8hQDgj04WIIp"
)

func main() {
	// This is your test secret API key.
	stripe.Key = "redacto"

	http.Handle("/", http.FileServer(http.Dir("public")))
	// http.HandleFunc("/checkout", createCheckoutSession)
	http.HandleFunc("/create", handleCreateCheckoutSession)
	http.HandleFunc("/charge", handleChargeCustomer)
	addr := "localhost:4242"
	log.Printf("Listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

// func createCheckoutSession(w http.ResponseWriter, r *http.Request) {
// 	domain := "http://localhost:4242"

// 	// Create a new customer object
// 	cusParams := &stripe.CustomerParams{
// 		Description: stripe.String("cool customer "),
// 	}
// 	cus, err := customer.New(cusParams)
// 	if err != nil {
// 		log.Printf("customer.New: %v", err)
// 		return
// 	}

// 	// Configure the checkout session
// 	params := &stripe.CheckoutSessionParams{
// 		Customer: stripe.String(cus.ID),
// 		LineItems: []*stripe.CheckoutSessionLineItemParams{
// 			{
// 				Price:    stripe.String("price_1OKykiEiJxehnemBIECNlyoM"),
// 				Quantity: stripe.Int64(10),
// 			},
// 		},
// 		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
// 		SuccessURL: stripe.String(domain + "/success"),
// 		CancelURL:  stripe.String(domain + "/cancel"),
// 		PaymentMethodTypes: stripe.StringSlice([]string{
// 			"card",
// 		}),
// 		// Save the payment method to the customer for future usage
// 		// SetupFutureUsage: stripe.String(string(stripe.CheckoutSessionSetupFutureUsageOffSession)),
// 	}

// 	s, err := session.New(params)
// 	if err != nil {
// 		log.Printf("session.New: %v", err)
// 		return
// 	}

// 	http.Redirect(w, r, s.URL, http.StatusSeeOther)
// }

func handleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {

	// Create a new customer object
	cusParams := &stripe.CustomerParams{
		Description: stripe.String("cool customer "),
	}
	cus, err := customer.New(cusParams)
	if err != nil {
		log.Printf("customer.New: %v", err)
		return
	}
	customerID = cus.ID

	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),

		// PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		Currency:   stripe.String("aud"),
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSetup)),
		SuccessURL: stripe.String("https://example.com/success"),
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
