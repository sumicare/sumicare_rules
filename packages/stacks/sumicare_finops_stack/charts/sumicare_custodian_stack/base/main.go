/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
}

package main

import (
	"context"
	"log"
	"text/template"

	"github.com/sumicare/haboku/pkg/templating"
	versions "github.com/sumicare/haboku/pkg/versioning"
)

// Tools is the canonical list of all versioned tools.
var Tools = []versions.Tool{
	{Key: "opencost", Repo: "https://github.com/opencost/opencost.git"},
	{Key: "opencost-ui", Repo: "https://github.com/opencost/opencost-ui.git"},
}

func main() {
	if err := versions.UpdateAllTools(context.Background(), Tools); err != nil {
		log.Fatalf("Failed to update opencost version: %v", err)
	}

	if err := templating.RenderTemplates(
		versions.Repositories(Tools),
		template.FuncMap{},
	); err != nil {
		log.Fatalf("Error rendering templates: %v", err)
	}
}
