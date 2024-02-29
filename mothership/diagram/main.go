package main

import (
	"fmt"
	"os"
	"sort"
	"strings"

	"github.com/brensch/charging/gen/go/contracts"
	"github.com/brensch/charging/mothership/statemachine"
)

func main() {
	var builder strings.Builder
	builder.WriteString("stateDiagram-v2\n")

	// Extract the states into a slice for sorting
	var states []contracts.StateMachineState
	for state := range statemachine.StateMap {
		states = append(states, state)
	}

	// Sort the slice of states based on their string value
	sort.Slice(states, func(i, j int) bool {
		return states[i] < states[j]
	})

	// Iterate over the sorted states
	for _, state := range states {
		transitions := statemachine.StateMap[state]
		for _, transition := range transitions {
			// Strip the prefix from the state names
			fromState := strings.TrimPrefix(state.String(), "StateMachineState_")
			toState := strings.TrimPrefix(transition.TargetState.String(), "StateMachineState_")
			condition := transition.UserPrompt
			if condition != "" {
				condition = ": " + condition // Prepend the colon only if there is a condition
			}
			builder.WriteString(fmt.Sprintf("    %s --> %s%s\n", fromState, toState, condition))
		}
	}

	// Write to a Markdown file
	file, err := os.Create("state_diagram.md")
	if err != nil {
		fmt.Println("Error creating Markdown file:", err)
		return
	}
	defer file.Close()

	_, err = file.WriteString("```mermaid\n" + builder.String() + "```\n")
	if err != nil {
		fmt.Println("Error writing to Markdown file:", err)
		return
	}

	fmt.Println("Mermaid diagram written to state_diagram.md successfully")
}
