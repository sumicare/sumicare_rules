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
	{Key: "ome", Repo: "https://github.com/sgl-project/ome.git"},
}

func main() {
	if err := versions.UpdateAllTools(context.Background(), Tools); err != nil {
		log.Fatalf("Failed to update ome version: %v", err)
	}

	if err := templating.RenderTemplates(
		versions.Repositories(Tools),
		template.FuncMap{},
	); err != nil {
		log.Fatalf("Error rendering templates: %v", err)
	}
}
