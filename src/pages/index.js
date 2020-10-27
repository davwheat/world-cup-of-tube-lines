import React from "react"
import Layout from "../components/layout"
import Stages from "../components/Stages"

export default function Home() {
  return (
    <Layout>
      <h1>World Cup of Lines on the TfL Map 2020</h1>
      <h2>(Plus Thameslink!)</h2>
      <p>
        This page will not display correctly in IE11 or on iOS 10.2 or lower.
      </p>

      <Stages />

      <section className="other-projects">
        <h3>My other projects</h3>
        <a href="https://ukdotmatrix.web.app/" target="_blank" rel="noreferrer">
          UK Departure Board Emulator
        </a>
        <a href="https://github.com/davwheat" target="_blank" rel="noreferrer">
          My GitHub
        </a>
      </section>
    </Layout>
  )
}
