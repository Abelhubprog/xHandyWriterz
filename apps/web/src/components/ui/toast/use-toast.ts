import { useState, useCallback } from "react"
import { ToastProps } from "./index";

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
}

type State = {
  toasts: ToasterToast[]
}

export function useToast() {
  const [state, setState] = useState<State>({ toasts: [] })

  const toast = useCallback(
    ({ ...props }: Omit<ToasterToast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)

      setState((prevState) => ({
        ...prevState,
        toasts: [
          { id, ...props },
          ...prevState.toasts,
        ].slice(0, TOAST_LIMIT),
      }))

      setTimeout(() => {
        setState((prevState) => ({
          ...prevState,
          toasts: prevState.toasts.filter((toast) => toast.id !== id),
        }))
      }, TOAST_REMOVE_DELAY)

      return {
        id,
        dismiss: () => {
          setState((prevState) => ({
            ...prevState,
            toasts: prevState.toasts.filter((toast) => toast.id !== id),
          }))
        },
      }
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      toasts: prevState.toasts.filter((toast) => toast.id !== id),
    }))
  }, [])

  return {
    toast,
    dismiss,
    toasts: state.toasts,
  }
}
