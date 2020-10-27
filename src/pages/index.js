import React from "react"
import Layout from "../components/layout"
import Stages from "../components/Stages"

export default function Home() {
  return (
    <Layout>
      <h1>World Cup of Tube Lines 2020</h1>
      <h2>(Plus Thameslink!)</h2>
      <p>
        This page will not display correctly in IE11 or on iOS 10.2 or lower.
      </p>

      <Stages />
    </Layout>
  )
}
