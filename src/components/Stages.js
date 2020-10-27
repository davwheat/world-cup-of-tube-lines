import clsx from "clsx"
import React, { useEffect, useState } from "react"
import "./stages.css"
import CupData from "../cup.json"
import KnownPlayers from "../knownPlayers.json"

const RefreshTime = 60

async function GetData() {
  /**
   * @type {{
   *  player1: string,
   *  player2: string,
   *  player1votes: number,
   *  player2votes: number,
   *  totalVotes: number,
   *  started: boolean,
   *  name: string,
   * }[]}
   */
  let allGames = []

  /**
   * @type {{ name: string, tweetId: string }[]}
   */
  let allTweets = []

  for (const key in CupData.knockoutRounds) {
    if (CupData.knockoutRounds.hasOwnProperty(key)) {
      const game = CupData.knockoutRounds[key]

      allTweets.push({
        name: `knockout${key}`,
        tweetId: game,
      })
    }
  }

  for (const key in CupData.quarterFinals) {
    if (CupData.quarterFinals.hasOwnProperty(key)) {
      const game = CupData.quarterFinals[key]

      allTweets.push({
        name: `quarter${key}`,
        tweetId: game,
      })
    }
  }

  for (const key in CupData.semiFinals) {
    if (CupData.semiFinals.hasOwnProperty(key)) {
      const game = CupData.semiFinals[key]

      allTweets.push({
        name: `semi${key}`,
        tweetId: game,
      })
    }
  }

  allTweets.push({
    name: `final`,
    tweetId: CupData.finals.winner,
  })

  allTweets.push({
    name: `playoff`,
    tweetId: CupData.finals.playoff,
  })

  const tweetIds = allTweets.reduce(
    (prev, curr) => (curr.tweetId ? [...prev, curr.tweetId] : prev),
    []
  )
  const apiUrl = `https://api.davwheat.dev/getpoll/${tweetIds.join(",")}`

  /**
   * @type {{
   * tweets: {attachments: {poll_ids: string[]}, id: string, text: string}[]
   * polls: {id: string, options: {position: number, label: string, votes: number}[]}[]
   * }}
   */
  const data = await (await fetch(apiUrl)).json()

  console.log(data)

  allTweets.forEach(tweet => {
    const thisTweet = data.tweets.find(t => t.id === tweet.tweetId)
    const poll = thisTweet
      ? data.polls.find(p => p.id === thisTweet.attachments.poll_ids[0])
      : undefined

    console.log(tweet.name)

    allGames.push({
      name: tweet.name,
      player1: poll
        ? poll.options[0].label
        : KnownPlayers[tweet.name].player1 || null,
      player2: poll
        ? poll.options[1].label
        : KnownPlayers[tweet.name].player2 || null,
      player1votes: poll ? poll.options[0].votes : null,
      player2votes: poll ? poll.options[1].votes : null,
      totalVotes: poll ? poll.options[0].votes + poll.options[1].votes : null,
      started: !!poll,
    })
  })

  console.log(allGames)

  return allGames
}

export default function Stages() {
  /**
   * @type {[?{
   *  player1: string,
   *  player2: string,
   *  player1votes: number,
   *  player2votes: number,
   *  totalVotes: number,
   *  started: boolean,
   *  name: string,
   * }[], Function]}
   */
  const [gameData, setGameData] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(RefreshTime)

  useEffect(() => {
    if (gameData === null || timeRemaining < 0) {
      GetData().then(d => setGameData(d))
      setTimeRemaining(RefreshTime)
    }

    let x = setTimeout(() => {
      setTimeRemaining(t => t - 1)
    }, 1000)

    return () => {
      clearTimeout(x)
    }
  }, [gameData, timeRemaining, setTimeRemaining])

  return (
    <>
      <p>Refreshing in {timeRemaining < 0 ? 0 : timeRemaining}s</p>
      <article className="cup-root">
        <p className="label" style={{ gridArea: "knockoutLabel" }}>
          Knockout
        </p>
        <p className="label" style={{ gridArea: "quarterLabel" }}>
          Quarter-finals
        </p>
        <p className="label" style={{ gridArea: "semiLabel" }}>
          Semi-finals
        </p>
        <p className="label" style={{ gridArea: "finalLabel" }}>
          Final
        </p>
        <p className="label" style={{ gridArea: "playoffLabel" }}>
          Playoff
        </p>
        {gameData &&
          gameData.map(g => (
            <Game
              key={g.name}
              gameName={g.name}
              player1={g.player1}
              player2={g.player2}
              player1pct={((g.player1votes || 1) / (g.totalVotes || 1)) * 100}
              player2pct={((g.player2votes || 1) / (g.totalVotes || 1)) * 100}
              hasStarted={g.started}
            />
          ))}
      </article>
    </>
  )
}

function Game({
  player1,
  player2,
  hasStarted,
  player1pct,
  player2pct,
  gameName,
}) {
  return (
    <section className={clsx("game", gameName)} style={{ gridArea: gameName }}>
      <div
        className={clsx(
          "player",
          "player1",
          player1
            ? player1.toLowerCase().replace(/(\s|&)/g, "_")
            : "unknown-player",
          hasStarted && "started"
        )}
      >
        <span className="progress" style={{ width: `${player1pct}%` }} />
        <span className="label">
          {player1
            ? player1 +
              (hasStarted ? `(${parseFloat(player1pct).toFixed(2)}%)` : "")
            : "???"}
        </span>
      </div>
      <div
        className={clsx(
          "player",
          "player2",
          player2
            ? player2.toLowerCase().replace(/\s/g, "_")
            : "unknown-player",
          hasStarted && "started"
        )}
      >
        <span className="progress" style={{ width: `${player2pct}%` }} />
        <span className="label">
          {player2
            ? player2 +
              (hasStarted ? `(${parseFloat(player2pct).toFixed(2)}%)` : "")
            : "???"}
        </span>
      </div>
    </section>
  )
}
