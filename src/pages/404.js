import { Link } from "gatsby"
import React from "react"
import Layout from "../components/layout"

export default function Error404() {
  return (
    <Layout>
      <h1>Page not found</h1>
      <Link to="/">Home</Link>
    </Layout>
  )
}
