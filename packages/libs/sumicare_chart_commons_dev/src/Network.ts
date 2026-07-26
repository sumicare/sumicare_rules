/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/** Checks whether github.com is reachable via HEAD request. */
export const hasNetwork = async () => {
	try {
		const res = await fetch("https://github.com", { method: "HEAD" });
		return res.ok;
	} catch {
		return false;
	}
};
