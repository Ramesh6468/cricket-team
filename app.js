const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at https://locolhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// all API
app.get("/players/", async (request, response) => {
  const getAllQuery = `SELECT * FROM cricket_team`;
  const queryResult = await db.all(getAllQuery);
  const convertedData = queryResult.map((dbObject) =>
    convertDbObjectToResponseObject(dbObject)
  );
  response.send(convertedData);
});

// post API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const postQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ('${playerName}', ${jerseyNumber}, '${role}')`;
  const dbResponse = await db.run(postQuery);
  const playerID = dbResponse.lastID;
  response.send("Player Added to Team");
});

//get API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const postQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const dbResponse = await db.get(postQuery);
  const convertedData = convertDbObjectToResponseObject(dbResponse);
  response.send(convertedData);
});

//put API
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const postQuery = `UPDATE cricket_team SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}' WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(postQuery);
  const playerID = dbResponse.lastID;
  res.send("Player Details Updated");
});

//delete API
app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const postQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  const dbResponse = await db.get(postQuery);
  res.send("Player Removed");
});

module.exports = app;
