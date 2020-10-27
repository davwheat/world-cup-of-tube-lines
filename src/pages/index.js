import React from "react"
import Layout from "../components/layout"
import Stages from "../components/Stages"

export default function Home() {
  return (
    <Layout>
      <h1>
        World Cup of Lines on the TfL Map 2020{" "}
        <span style={{ fontSize: 18 }}>(Plus Thameslink!)</span>
      </h1>
      <p style={{fontSize: 18}}>Click any round to view its poll on Twitter.</p>

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
