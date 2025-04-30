import React, { useState, useEffect } from "react";
import "./Styles/Schedule.css";
import SavedRoute from "./SavedRoute";
import mapsLogo from "../../assets/mapImage.png";
import ScrollableRoutes from "./ScrollableRoutes";
import GoogleMap from "../Map/GoogleMap";

const CommuteRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createNewRoute, setCreateNewRoute] = useState(false);
  const [isCheckedTrain, setIsCheckedTrain] = useState(false);
  const [isCheckedBus, setIsCheckedBus] = useState(false);
  const [isCheckedWalk, setIsCheckedWalk] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [departTime, setDepartTime] = useState("");
  const [departLocation, setDepartLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [commuteTitle, setCommuteTitle] = useState("");

  const [friendsData, setFriendsData] = useState([]);

  const [user, setUser] = useState("");

  const [arrivalCords, setArrialCords] = useState();
  const [departCords, setDepartCords] = useState();

  



  useEffect(() => {
    const fetchUser = async () => {
      const userId = await getUserID();
      setUser(userId); // Update the state with the user ID
      console.log(userId);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserRouteSettings(user); // Call loadUserRouteSettings after user is updated
    }
  }, [user]); // Only run this effect when user changes

  async function getUserID() {
    let response = await fetch(`http://127.0.0.1:5000/getUsername`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    let data = await response.json();
    console.log(data);
    return data["user"];
  }

  async function loadUserRouteSettings(user) {
    let response = await fetch(
      `http://127.0.0.1:5000/getUsersRoutes?userID=${user}`,
      {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "ap plication/json",
          Accept: "application/json",
        },
      }
    );

    let data = await response.json();

    console.log(data);

    // Function to convert time string to Date object for comparison
    const parseTimeString = (timeString) => {
      const [time, period] = timeString.split(" ");
      const [hours, minutes] = time.split(":");
      let hours24 = parseInt(hours, 10);

      if (period === "PM" && hours24 !== 12) {
        hours24 += 12;
      } else if (period === "AM" && hours24 === 12) {
        hours24 = 0;
      }

      const currentDate = new Date();
      currentDate.setHours(hours24);
      currentDate.setMinutes(parseInt(minutes, 10));
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);

      return currentDate;
    };

    // Sort the routes array by departure time in ascending order (earliest to latest)
    const sortedRoutes = data.routes.routes.sort((a, b) => {
      const timeA = parseTimeString(a.departTime);
      const timeB = parseTimeString(b.departTime);

      return timeA - timeB; // Sorting in ascending order (earliest to latest)
    });

    // Set the sorted routes
    setRoutes(sortedRoutes);
    console.log("R: " + sortedRoutes);

    let responseMessage = data["Response"];

    if (responseMessage == "All good!") {
      // change front end to the schedule page with all the information added
    } else if (responseMessage == "Wrong Password") {
      // Display wrong password to user
    } else {
      // Display User does not exist
    }
  }

  const [departureCoords, setDepartureCoords] = useState(null);
  const [arrivalCoords, setArrivalCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClickSavedRoute = async (route) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Loading route details for:", route);
      console.log("Arrival Location:", route.arrivalLocation);
      console.log("Departure Location:", route.departLocation);
      
      // Get coordinates for arrival location
      const arrivalCoordsData = await loadLatAndLonFromLocationName(route.arrivalLocation);
      console.log("Arrival coordinates:", arrivalCoordsData);
      setArrivalCoords(arrivalCoordsData);
      
      // Get coordinates for departure location
      const departureCoordsData = await loadLatAndLonFromLocationName(route.departLocation);
      console.log("Departure coordinates:", departureCoordsData);
      setDepartureCoords(departureCoordsData);

      const baseUrl = "https://www.google.com/maps/dir/?api=1";
      const url = `${baseUrl}&origin=${encodeURIComponent(route.arrivalLocation)}&destination=${encodeURIComponent(route.departLocation)}`;
      window.open(url, '_blank'); // Opens in a new tab
      
    } catch (error) {
      console.error("Error getting coordinates:", error);
      setError("Failed to load route coordinates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  async function loadLatAndLonFromLocationName(locationName) {
    try {
      // Encode the location name properly for URL
      const encodedLocation = encodeURIComponent(locationName);
      
      // Make the API call
      const response = await fetch(
        `http://127.0.0.1:5000/getLocationCoordinatesFromAddress?locationName=${encodedLocation}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        }
      );
      
      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Response data:", data);
      
      return data;
    } catch (error) {
      console.error("Error in loadLatAndLonFromLocationName:", error);
      throw error;
    }
  }

  // Load saved routes
  useEffect(() => {
    async function fetchRoutes() {
      try {
        const response = await fetch("http://127.0.0.1:5000/getSavedRoutes");
        const data = await response.json();
        setRoutes(data.routes || []);
      } catch (error) {
        console.error("Error loading routes:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchFriends() {
      try {
        const response = await fetch("http://127.0.0.1:5000/getFriends");
        const data = await response.json();
        setFriendsData(data || []);
      } catch (error) {
        console.error("Error loading friends:", error);
      }
    }

    fetchRoutes();
    fetchFriends();
  }, []);

  const handleChangeTrain = (e) => setIsCheckedTrain(e.target.checked);
  const handleChangeBus = (e) => setIsCheckedBus(e.target.checked);
  const handleChangeWalk = (e) => setIsCheckedWalk(e.target.checked);

  const handleChange = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedOptions((prev) => [...prev, ...values]);
  };

  const handleExit = () => {
    setCreateNewRoute(false);
    setSelectedOptions([]);
  };

  const handleCreateNewRoute = () => {
    setCreateNewRoute(true);
  };

  const handleAddNewRoute = async () => {
    const routeData = {
      departLocation,
      arrivalLocation,
      commuteTitle,
      selectedOptions,
      departTime,
    };

    

    try {
      await fetch("http://127.0.0.1:5000/addRouteE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
      });
      console.log("Route added!");
    } catch (error) {
      console.error("Error adding route:", error);
    }
  };

  return (
    <div
      className="mainCommuteRoutes"
      style={{ gap: createNewRoute ? "100px" : "50px" }}
    >
      <div className="CommuteRoutes">
        <h2>Commute Routes</h2>

        <h3 id="text" style={{ fontWeight: "normal" }}>
          Create or click on an existing route to show details and get started
          on your journey!
        </h3>

        {/* <div className="routes"> */}
          {/* <div className="savedRoutes"  > */}
            {loading ? (
              <p>Loading routes...</p>
            ) : routes.length === 0 ? (
              <p>No saved routes yet!</p>
            ) : (
              routes.map((route, index) => (
                <li key={index} className="savedRoutes-li" onClick={() => handleClickSavedRoute(route)}>
                  <SavedRoute routeTitle={route.commuteTitle} totalTime={15} arrivalLocation={route.arrivalLocation} departLocation={route.departLocation}/>
                </li>
              ))
            )}
          {/* </div> */}
        {/* </div> */}
      </div>

      {!createNewRoute && (
        <div id="mapAndButton">
          {/* <div id="commute-map-container"></div> */}
          <div id="commute-map-container">
            <GoogleMap departureCoords={departureCoords} 
            arrivalCoords={arrivalCoords} />
          </div>
          <button id="newRouteButton" onClick={handleCreateNewRoute}>
            Create New Route
          </button>
        </div>
      )}

      {createNewRoute && (
        <div className="routeOptions" style={{ paddingTop: "50px" }}>
          <div className="writtenInputs">
            <label className="custom-field">
              <input
                type="time"
                placeholder="&nbsp;"
                onChange={(e) => setDepartTime(e.target.value)}
              />
              <span className="placeholder">Depart Time</span>
            </label>

            <label className="custom-field">
              <input
                placeholder="&nbsp;"
                onChange={(e) => setDepartLocation(e.target.value)}
              />
              <span className="placeholder">Depart Location</span>
            </label>

            <label className="custom-field">
              <input
                placeholder="&nbsp;"
                onChange={(e) => setArrivalLocation(e.target.value)}
              />
              <span className="placeholder">Arrival Location</span>
            </label>

            <label className="custom-field">
              <input
                placeholder="&nbsp;"
                onChange={(e) => setCommuteTitle(e.target.value)}
              />
              <span className="placeholder">Commute Title</span>
            </label>
          </div>

          <div id="options">
            <div id="individualCheckBox">
              <input
                type="checkbox"
                checked={isCheckedTrain}
                onChange={handleChangeTrain}
              />
              <h3>Train</h3>
            </div>
            <div id="individualCheckBox">
              <input
                type="checkbox"
                checked={isCheckedBus}
                onChange={handleChangeBus}
              />
              <h3>Bus</h3>
            </div>
            <div id="individualCheckBox">
              <input
                type="checkbox"
                checked={isCheckedWalk}
                onChange={handleChangeWalk}
              />
              <h3>Walk</h3>
            </div>
          </div>

          <div id="addCommuteBuddies">
            <h3 style={{ fontWeight: "bold" }}>Add Commute Buddies: </h3>
            <select
              className="dropdown"
              value={selectedOptions}
              onChange={handleChange}
              multiple
            >
              {friendsData.map((friend, i) => (
                <option key={i}>{friend}</option>
              ))}
            </select>
            <p>{selectedOptions.join(", ")}</p>
          </div>

          <div id="buttonOptions">
            <button
              id="button"
              onClick={handleExit}
              style={{ backgroundColor: "#EAEAEA", color: "black" }}
            >
              Cancel
            </button>
            <button
              id="button"
              onClick={handleAddNewRoute}
              style={{ backgroundColor: "#769EB8" }}
            >
              Add Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommuteRoutes;
