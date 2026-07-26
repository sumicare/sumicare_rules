/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createHash } from "node:crypto";

/** Computes the SHA-256 hash of a string. */
export const sha256 = (s: string) =>
	createHash("sha256").update(s).digest("hex");
