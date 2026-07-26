// Copyright (c) 2026 Sumicare Contributors
//
// Licensed under the terms of MIT License


package main

import (
	"fmt"
	"os"
	"text/template"

	"github.com/sumicare/haboku/pkg/templating"
)

func main() {

	if err := templating.RenderTemplates(make(map[string]string), template.FuncMap{}); err != nil {
		fmt.Fprintf(os.Stderr, "Error rendering templates: %v\n", err)
		os.Exit(1)
	}
}
