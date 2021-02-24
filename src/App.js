//import "./App.css";
import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

import { useStateWithCallbackLazy } from "use-state-with-callback";

const axios = require("axios");

const getDataUrl = "https://api.spotify.com/v1/me/top/tracks";
const makePlaylistUrl = "https://api.spotify.com/v1/users/";
const userUrl = "https://api.spotify.com/v1/me";

const useStyles = makeStyles((theme) => ({
  spotifyTheme: {
    background: "#1aa34a",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function App(props) {
  const classes = useStyles();
  const params = getHashParams();

  const token = params.access_token;
  if (token) {
    sessionStorage.setItem("authtoken", token);
  }
  let initialVal = sessionStorage.getItem("playerData")
    ? JSON.parse(sessionStorage.getItem("playerData"))
    : [];

  const [playerData, setPlayerData] = useState(initialVal);
  const [userID, setUserID] = useState("");
  const [addTrackUrl, setAddTrackUrl] = useState("");
  //const [addTrackUrl, setAddTrackUrl] = useStateWithCallbackLazy("");

  function getTopArtists() {
    var auth = "Bearer " + sessionStorage.getItem("authtoken");
    const headers = {
      Authorization: auth,
    };

    axios({
      method: "get",
      url: getDataUrl,
      headers,
    })
      .then((response) => {
        console.log("GET DATA SUCCESSFUL");
        var temp = playerData;
        var temp2 = temp.concat(response.data);

        sessionStorage.setItem("playerData", JSON.stringify(temp2));
        console.log("Data:", temp2);
        setPlayerData(temp2);

        getCurrentUserID();
      })
      .catch(function (error) {
        console.log("GET DATA ERROR");
        console.log(error);
      });
  }

  function enable1Button(playernum) {
    if (playernum === 0) {
      return <button onClick={() => getTopArtists()}>Get My data</button>;
    }
  }

  function enable2Button(playernum) {
    if (playernum <= 1) {
      return <button onClick={() => getTopArtists()}>Get My data</button>;
    }
  }

  function getCurrentUserID() {
    var auth = "Bearer " + sessionStorage.getItem("authtoken");
    const headers = {
      Authorization: auth,
    };

    axios({
      method: "get",
      url: userUrl,
      headers,
    })
      .then((response) => {
        console.log("GET USERPROFILE SUCCESSFUL");
        var temp = response.data["id"];
        //sessionStorage.setItem("userID", temp);
        setUserID(temp);
      })
      .catch(function (error) {
        console.log("GET USERPROFILE ERROR");
        console.log(error);
      });
  }

  function makeIntersectionPlaylist() {
    var auth = "Bearer " + sessionStorage.getItem("authtoken");
    var mplurl = makePlaylistUrl + userID + "/playlists";

    const headers = {
      Authorization: auth,
    };

    axios({
      method: "post",
      url: mplurl,
      headers,
      data: {
        name: "IntersectionPlaylist",
      },
    })
      .then((response) => {
        console.log("CREATE PLAYLIST SUCCESSFUL");
        var temp = response.data["href"];

        getAddIntersectSongs(temp);
        //setAddTrackUrl(temp, addIntersectSongs);
      })
      .catch(function (error) {
        console.log("CREATE PLAYLIST ERROR");
        console.log(error);
      });
  }

  async function getAddIntersectSongs(playlistUrl) {
    var auth = "Bearer " + sessionStorage.getItem("authtoken");
    var plURL = playlistUrl + "/tracks";

    var arr = await getCommonTracks();

    //arr = [playerData[0]["items"][0]["uri"]];

    const headers = {
      Authorization: auth,
    };

    axios({
      method: "post",
      url: plURL,
      headers,
      data: {
        uris: arr,
      },
    })
      .then((response) => {
        console.log("ADDING TRACKS SUCCESSFUL");
      })
      .catch(function (error) {
        console.log("ADDING TRACKS ERROR");
        console.log(error);
      });
  }

  function getCommonTracks() {
    //sleep(3000);
    //return [playerData[0]["items"][0]["uri"]];
    let arr = [];
    let set = new Set();
    for (let i = 0; i < playerData[0]["items"].length; i++) {
      set.add(playerData[0]["items"][i]["uri"]);
    }
    for (let i = 0; i < playerData[1]["items"].length; i++) {
      if (set.has(playerData[1]["items"][i]["uri"])) {
        arr.push(playerData[1]["items"][i]["uri"]);
      }
    }
    return arr;
  }

  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  return (
    <React.Fragment>
      <CssBaseline />

      <AppBar className={classes.spotifyTheme} position="relative">
        <Toolbar>
          <Typography variant="h6" align="left" color="inherit">
            Spotify Intersection
          </Typography>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <a href="http://localhost:8888/login">
              Player1 Login to Spotify Intersection
            </a>
            <div>{enable1Button(playerData.length)}</div>
            <div>
              {playerData.length >= 1 && (
                <Typography variant="subtitle1" gutterBottom>
                  Have Player1 Data Now
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <a href="http://localhost:8888/login">
              Player2 Login to Spotify Intersection
            </a>
            <div>{enable2Button(playerData.length)}</div>
            <div>
              {playerData.length === 2 && (
                <Typography variant="subtitle1" gutterBottom>
                  Have Player2 Data Now
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            intersects
            <div>
              {playerData.length === 2 && (
                <button onClick={() => makeIntersectionPlaylist()}>
                  Make the playlist!
                </button>
              )}
            </div>
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}
