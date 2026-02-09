import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios"
import { globalStartLoading, globalStopLoading } from "./loaderBridge"

/* ------------------------------------------------------------------ */
/*  Extend AxiosRequestConfig with `meta`                             */
/* ------------------------------------------------------------------ */

interface RequestMeta {
  /** Set to `false` to suppress the global loading overlay */
  loading?: boolean
}

declare module "axios" {
  interface AxiosRequestConfig {
    /** Custom metadata consumed by interceptors */
    meta?: RequestMeta
  }
}

/** Extended internal config that carries the loading flag */
interface InternalConfigWithLoader extends InternalAxiosRequestConfig {
  __shouldLoad?: boolean
}

/* ------------------------------------------------------------------ */
/*  Normalised error shape                                            */
/* ------------------------------------------------------------------ */

export interface NormalizedError {
  message: string
  status?: number
}

function normalizeError(error: AxiosError): NormalizedError {
  if (error.response) {
    const data = error.response.data as { message?: string } | undefined
    return {
      status: error.response.status,
      message:
        data?.message ||
        `Request failed with status ${error.response.status}`,
    }
  }
  if (error.request) {
    return { message: "Không thể kết nối đến máy chủ" }
  }
  return { message: error.message || "Đã xảy ra lỗi" }
}

/* ------------------------------------------------------------------ */
/*  Axios instance                                                    */
/* ------------------------------------------------------------------ */

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

/* ---------- Request interceptor ---------- */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const shouldLoad = config.meta?.loading !== false
  // Store the flag so response interceptor can read it
  const extConfig = config as InternalConfigWithLoader
  extConfig.__shouldLoad = shouldLoad
  if (shouldLoad) {
    globalStartLoading()
  }
  return config
})

/* ---------- Response interceptor ---------- */
api.interceptors.response.use(
  (response) => {
    if ((response.config as InternalConfigWithLoader).__shouldLoad) {
      globalStopLoading()
    }
    return response
  },
  (error: AxiosError) => {
    if ((error.config as InternalConfigWithLoader | undefined)?.__shouldLoad) {
      globalStopLoading()
    }
    // Attach normalised error so callers can use it
    const extError = error as AxiosError & { normalized: NormalizedError }
    extError.normalized = normalizeError(error)
    return Promise.reject(extError)
  },
)

export { api }
export default api
