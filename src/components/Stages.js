import clsx from "clsx"
import React, { useEffect, useState } from "react"
import "./stages.css"
import CupData from "../cup.json"
import KnownPlayers from "../knownPlayers.json"
import useStateWithLocalStorage from "../useStateWithLocalStorage"

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
   *  id: string,
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

  const apiUrl = `https://api.davwheat.dev/getpolls`
  // const apiUrl = `http://localhost:2678/getpolls`

  /**
   * @type {{
   * tweets: {attachments: {poll_ids: string[]}, id: string, text: string}[]
   * polls: {id: string, options: {position: number, label: string, votes: number}[]}[]
   * }}
   */
  let data

  try {
    data = await (await fetch(apiUrl)).json()
  } catch {
    return null
  }

  // console.log(data)

  data.forEach(game => {
    const poll = game.poll

    allTweets = allTweets.filter(tweet => tweet.tweetId !== game.tweetId)

    allGames.push({
      name: game.game,
      player1: poll
        ? poll.options[0].label
        : KnownPlayers[game.game].player1 || null,
      player2: poll
        ? poll.options[1].label
        : KnownPlayers[game.game].player2 || null,
      player1votes: poll ? poll.options[0].votes : null,
      player2votes: poll ? poll.options[1].votes : null,
      totalVotes: poll ? poll.options[0].votes + poll.options[1].votes : null,
      started: !!poll,
      id: game.tweetId,
    })
  })

  // console.log(allTweets);

  allTweets.forEach(tweet => {
    allGames.push({
      name: tweet.name,
      player1: null,
      player2: null,
      player1votes: null,
      player2votes: null,
      totalVotes: null,
      started: false,
      id: tweet.tweetId,
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
   *  id: string,
   * }[], Function]}
   */
  const [gameData, setGameData] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(RefreshTime)
  const [useVotes, setUseVotes] = useStateWithLocalStorage("use-votes", false)

  useEffect(() => {
    if (gameData === null || timeRemaining < 0) {
      GetData()
        .then(d => setGameData(d))
        .catch(() => {})
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
      <label>
        <input
          checked={useVotes}
          onChange={e => {
            setUseVotes(e.target.checked)
          }}
          type="checkbox"
        />{" "}
        Show vote count
      </label>
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
              p1votes={g.player1votes}
              p2votes={g.player2votes}
              player1pct={((g.player1votes || 1) / (g.totalVotes || 1)) * 100}
              player2pct={((g.player2votes || 1) / (g.totalVotes || 1)) * 100}
              hasStarted={g.started}
              useVotes={!useVotes}
              tweetId={g.id}
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
  p1votes,
  p2votes,
  gameName,
  useVotes,
  tweetId,
}) {
  return (
    <section className={clsx("game", gameName)} style={{ gridArea: gameName }}>
      <a
        href={tweetId ? `https://twitter.com/geofftech/status/${tweetId}` : "#"}
        target={tweetId && "_blank"}
        rel="noreferrer"
      >
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
                (hasStarted
                  ? useVotes
                    ? ` (${parseFloat(player1pct).toFixed(2)}%)`
                    : ` (${p1votes} votes)`
                  : "")
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
                (hasStarted
                  ? useVotes
                    ? ` (${parseFloat(player2pct).toFixed(2)}%)`
                    : ` (${p2votes} votes)`
                  : "")
              : "???"}
          </span>
        </div>
      </a>
    </section>
  )
}
