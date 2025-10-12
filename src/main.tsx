import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import "./index.css" // Make sure you have a global CSS file

// Create a new router instance
const router = createRouter({
    routeTree,
    // Pass the auth context to all routes
    context: {
        auth: undefined!, // This will be initialized in the __root.tsx
    },
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>,
    )
}