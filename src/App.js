//import "./App.css";
import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const axios = require("axios");
const url = "https://api.spotify.com/v1/me/top/artists";

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

  function getTopArtists() {
    var auth = "Bearer " + sessionStorage.getItem("authtoken");
    const headers = {
      Authorization: auth,
    };

    axios({
      method: "get",
      url,
      headers,
    })
      .then((response) => {
        console.log("GET DATA SUCCESSFUL", response.data);
        var temp = playerData;
        var temp2 = temp.concat(response.data);

        sessionStorage.setItem("playerData", JSON.stringify(temp2));
        console.log("HEREEEE:", temp2);
        setPlayerData(temp2);
      })
      .catch(function (error) {
        console.log("GET DATA ERROR");
        console.log(error);
      });
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
            <div>
              <button onClick={() => getTopArtists()}>Get My data</button>
            </div>
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
            <div>
              <button onClick={() => getTopArtists()}>Get My data</button>
            </div>
            <div>
              {playerData.length > 2 && (
                <Typography variant="subtitle1" gutterBottom>
                  Have Player2 Data Now
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>intersects</Paper>
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
