package main

import (
	"regexp"
	"syscall/js"
)

const BRACED_REGEX = "/{{(([^}][^}]?|[^}]}?)*)}}/g"

var bracedRegex = regexp.MustCompile(BRACED_REGEX)

func containsEnvVariable(path string) bool {
	return bracedRegex.MatchString(path)
}

type MatchItem struct {
	LeadOffset     int    `json:"leadOffset"`
	MatchingString string `json:"matchingString"`
}

func matchAllEnvVariables(path string) []MatchItem {
	matches := bracedRegex.FindAllString(path, -1)
	matchItems := make([]MatchItem, len(matches))

	for i, match := range matches {
		matchItems[i] = MatchItem{
			LeadOffset:     bracedRegex.FindStringIndex(match)[0],
			MatchingString: match,
		}
	}

	return matchItems
}

func main() {
	c := make(chan struct{}, 0)

	js.Global().Set("containsEnvVariable", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return containsEnvVariable(args[0].String())
	}))

	js.Global().Set("matchAllEnvVariables", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return matchAllEnvVariables(args[0].String())
	}))

	<-c
}
