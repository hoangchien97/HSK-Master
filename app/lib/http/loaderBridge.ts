/**
 * Loader Bridge – connects axios interceptors ↔ React provider
 *
 * Works as a global singleton so the non-React axios module can
 * call startLoading / stopLoading that ultimately drive the
 * PortalUIProvider state.
 */

type LoaderFn = (key?: string) => void

let _startLoading: LoaderFn = () => {}
let _stopLoading: LoaderFn = () => {}

/** Called once from PortalUIProvider to register React state setters */
export function setGlobalLoader(start: LoaderFn, stop: LoaderFn) {
  _startLoading = start
  _stopLoading = stop
}

/** Called by axios request interceptor */
export function globalStartLoading(key?: string) {
  _startLoading(key)
}

/** Called by axios response / error interceptor */
export function globalStopLoading(key?: string) {
  _stopLoading(key)
}
