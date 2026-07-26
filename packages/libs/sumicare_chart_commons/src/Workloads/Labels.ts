/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/** Standard `app.kubernetes.io/*` labels for all resources of a chart. */
export const commonLabels = (opts: { name: string; version: string }) => ({
	"app.kubernetes.io/name": opts.name,
	"app.kubernetes.io/instance": opts.name,
	"app.kubernetes.io/version": opts.version,
	"app.kubernetes.io/part-of": opts.name,
	"app.kubernetes.io/managed-by": "sumicare_rules",
});

/** Minimal label selector for matching pods of a chart. */
export const selectorLabels = (name: string) => ({
	"app.kubernetes.io/name": name,
	"app.kubernetes.io/instance": name,
});

/** Selector labels plus a component label for multi-component charts. */
export const componentLabels = (name: string, component: string) => ({
	...selectorLabels(name),
	"app.kubernetes.io/component": component,
});
