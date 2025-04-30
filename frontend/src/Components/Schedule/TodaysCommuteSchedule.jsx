import React, { useState, useEffect } from "react";
import "./Styles/Schedule.css";
import CommuteScheduleRoute from "./CommuteScheduleRoute";
import CommuteRoutes from "./CommuteRoutes";
import SavedRoute from "./SavedRoute";

const Schedule = () => {
  const usersArray = [
    { id: 1, name: "Ted", color: "#769EB8" },
    { id: 2, name: "Robin", color: "#EC7D0E" },
  ];

  const [editMode, setEditMode] = useState(false);
  const [addNewRoute, setAddNewRoute] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [user, setUser] = useState("");

  const [routes, setRoutes] = useState([]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await getUserID();
      setUser(userId); // Update the state with the user ID
      console.log(userId);
    };

    fetchUser();
  }, []);

  // This function should only be called after the user state has been updated.
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
          "Content-Type": "application/json",
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

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const handleEditSchedule = () => {
    setEditMode(!editMode);
    setAddNewRoute(false);
  };

  const handleAddNewRoute = () => {
    setAddNewRoute(!addNewRoute);
  };

  // const handleAddRouteToDB = () => {
  //     console.log(user);
  //     console.log(selectedOptions);
  //     console.log(departTime);
  //     console.log(arrivalTime);
  //     console.log(departLocation);
  //     console.log(arrivalLocation);
  //     console.log(commuteTitle);
  // };

  const handleAddRouteToDB = async (e) => {
    console.log("Add Route Button Clicked");
    e.preventDefault();

    const sendRouteReq = {
      username: user, // Make sure this is a valid string
      route: {
        day: selectedDay, // Make sure this is a valid string
        friends: selectedOptions,
        departTime: departTime,
        departLocation: departLocation,
        arrivalLocation: arrivalLocation,
        commuteTitle: commuteTitle,
      },
    };

    console.log("Sending data:", JSON.stringify(sendRouteReq)); // Log the exact data being sent

    try {
      const response = await fetch("http://127.0.0.1:5000/createRoute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendRouteReq),
      });

      const result = await response.json();

      if (response.status === 409) {
        // setFail(true);
        console.log(result.Message); // "Username already exists!"
      } else if (response.ok) {
        console.log(result.Message); // "Profile successfully sent!"
        console.log(user);
        console.log(selectedOptions);
        console.log(departTime);
        console.log(arrivalTime);
        console.log(departLocation);
        console.log(arrivalLocation);
        console.log(commuteTitle);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      //   setResponseMessage('Something went wrong!');
    }
  };

  // const [isCheckedTrain, setIsCheckedTrain] = useState(false);
  // const [isCheckedBus, setIsCheckedBus] = useState(false);
  // const [isCheckedWalk, setIsCheckedWalk] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [departTime, setDepartTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  const [departLocation, setDepartLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");

  const [commuteTitle, setCommuteTitle] = useState("");

  const handleChangeTrain = (event) => {
    setIsCheckedTrain(event.target.checked);
  };

  const handleChangeBus = (event) => {
    setIsCheckedBus(event.target.checked);
  };

  const handleChangeWalk = (event) => {
    setIsCheckedWalk(event.target.checked);
  };

  const handleChange = (event) => {
    const values = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setSelectedOptions((prevItems) => [...prevItems, values]);
  };

  const handleExit = () => {
    setAddNewRoute(!addNewRoute);
    setSelectedOptions([]); // Empties the array
  };

  return (
    <div className="scheduleAndBuddiesComponent">
      <div className="todaysCommuteScedule">
        <div
          className="fullTitle"
          style={{ gap: editMode ? "140px" : "200px" }}
        >
          <div id="titleBar">
            <h2>Today’s Commute Schedule</h2>

            {!editMode && (
              <>
                <button
                  id="editScheduleId"
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={handleEditSchedule}
                >
                  Edit Schedule
                </button>
              </>
            )}
            {editMode && (
              <>
                <h3 style={{ color: "#769EB8" }}>Schedule Edit Mode</h3>
                <button
                  id="editScheduleId"
                  style={{
                    color: "#769EB8",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={handleEditSchedule}
                >
                  Exit
                </button>
              </>
            )}
          </div>
          {/* <h2 id="commute-buddies-title">Commute Buddies</h2> */}
        </div>

        <div>
          {/* [Backend incorperation] Loop through the commute routes using a map here (look at CommuteRoute.jsx under the commuteBuddies div for an example).
                     And when you are adding the time make sure you change the totalTime value in the Commute Route */}

          {routes.map((route, index) => {
            // Get current time
            const currentTime = new Date();

            // Parse the route's departure time string into a Date object
            const departureTimeString = route.departTime; // e.g., "10:15 AM"

            // Function to convert time string to Date object
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

            const departureTime = parseTimeString(departureTimeString);

            // Check if the current time matches the departure time
            const isActive =
              currentTime.getHours() === departureTime.getHours() &&
              currentTime.getMinutes() === departureTime.getMinutes();

            return (
              <div key={index}>
                <CommuteScheduleRoute
                  isActive={isActive} // Set isActive based on time comparison
                  totalTime={100} // Replace with actual logic if needed
                  overallTime={route.departTime} // Example, adjust if necessary
                  routeTitle={route.commuteTitle} // Using the commute title from the route
                  routeStatus={"En Route"} // Static, replace if dynamic status is needed
                  startLocation={route.arrivalLocation} // Start location is the arrival location
                  endLocation={route.departLocation} // End location is the departure location
                  departTime={route.departTime} // Departure time
                  arrivalTime={"8:15 AM"} // Static, adjust if necessary
                  buddies={route.friends} // Friends array
                  editMode={editMode} // Assuming `editMode` is already set somewhere
                />
              </div>
            );
          })}

          {/* <CommuteScheduleRoute 
                        isActive={true}
                        totalTime={100}
                        overallTime={"8 AM"}
                        routeTitle={"Home to School"}
                        routeStatus={"En Route"}
                        startLocation={"1200 W Harrison St, Chicago, IL 60607"}
                        endLocation={"600 E Grand Ave, Chicago, IL 60611"}
                        departTime={"8:00 AM"}
                        arrivalTime={"8:15 AM"}
                        buddies={usersArray}
                        editMode={editMode}
                />
                <CommuteScheduleRoute 
                        isActive={false}
                        totalTime={100} 
                        overallTime={"10 AM"}
                        routeTitle={"School to Home"}
                        routeStatus={"Upcoming"}
                        startLocation={"1200 W Harrison St, Chicago, IL 60607"}
                        endLocation={"600 E Grand Ave, Chicago, IL 60611"}
                        departTime={"8:00 AM"}
                        arrivalTime={"8:15 AM"}
                        buddies={[{ id: 1, name: "Lily", color: "#48C738" }]}
                        editMode={editMode}
                /> */}
        </div>
      </div>

      <div className="addNewRouteButtonComp">
        {editMode && (
          <>
            <button id="newRouteButton" onClick={handleAddNewRoute}>
              Add New Route
            </button>
          </>
        )}
      </div>

      {!editMode && (
        <>
          <CommuteRoutes />
        </>
      )}

      {addNewRoute && (
        <>
          <div className="AddNewRoute">
            <h2>Add New Route</h2>
            <h3 style={{ fontWeight: "normal" }}>
              Add pre-made routes. If you want to create a new route, exit edit
              mode and create a new route.{" "}
            </h3>

            <div className="addNewRoute">
              
                <div className="savedRoutes">
                  {
                    routes.map((route, index) => (
                      <div key={index}>
                        <SavedRoute
                          routeTitle={route.commuteTitle}
                          totalTime={15}
                        />
                      </div>
                    ))
                  }
                </div>
              
              <div className="routeOptions">
                <div className="writtenInputs">
                  <div className="commuteTimes">
                    {/* <h3 style={{fontWeight: 'bold'}}>Depart Time: <input name="myInput" onChange={(e) => setDepartTime(e.target.value)}/> </h3>
                                    <h3 style={{fontWeight: 'bold'}}>Arrival Time: <input name="myInput" onChange={(e) => setArrivalTime(e.target.value)}/> </h3>
                                     */}
                    <label className="custom-field">
                      <input
                        type="time"
                        name="myInput"
                        placeholder="&nbsp;"
                        onChange={(e) => setDepartTime(e.target.value)}
                      />{" "}
                      <span className="placeholder">Depart Time</span>
                    </label>

                    {/* <h3 style={{ fontWeight: "bold" }}>
                      Depart Location:{" "}
                      <input
                        name="myInput"
                        onChange={(e) => setDepartLocation(e.target.value)}
                      />{" "}
                    </h3>
                    <h3 style={{ fontWeight: "bold" }}>
                      Arrival Location:{" "}
                      <input
                        name="myInput"
                        onChange={(e) => setArrivalLocation(e.target.value)}
                      />{" "}
                    </h3>
                   */}

                    <label className="custom-field">
                      <input
                        name="myInput"
                        placeholder="&nbsp;"
                        onChange={(e) => setDepartLocation(e.target.value)}
                      />{" "}
                      <span className="placeholder">Depart Location</span>
                    </label>

                    <label className="custom-field">
                      <input
                        name="myInput"
                        placeholder="&nbsp;"
                        onChange={(e) => setArrivalLocation(e.target.value)}
                      />{" "}
                      <span className="placeholder">Arrival Location</span>
                    </label>

                    {/* <h3 style={{ fontWeight: "bold" }}>
                    Commute Title:{" "}
                    <input
                      name="myInput"
                      onChange={(e) => setCommuteTitle(e.target.value)}
                    />{" "}
                  </h3> */}

                    <label className="custom-field">
                      <input
                        name="myInput"
                        placeholder="&nbsp;"
                        onChange={(e) => setCommuteTitle(e.target.value)}
                      />{" "}
                      <span className="placeholder">Commute Title</span>
                    </label>
                  </div>

                  <div>
                    <h2>Select a Day of the Week</h2>
                    <select
                      className="dropdown"
                      value={selectedDay}
                      onChange={handleDayChange}
                    >
                      <option value="" disabled>
                        Select a day
                      </option>
                      {daysOfWeek.map((day, index) => (
                        <option key={index} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    {selectedDay && <p>You selected: {selectedDay}</p>}
                  </div>
                </div>

                {/* <div>
                                <h3 id='text' style={{fontWeight: 'bold'}}>Transportation Modes:</h3>

                                <div id='options'>

                                    <div id='individualCheckBox'>
                                        <input type="checkbox" checked={isCheckedTrain} onChange={handleChangeTrain} />
                                        <h3>Train</h3>
                                    </div>

                                    <div id='individualCheckBox'>
                                        <input type="checkbox" checked={isCheckedBus} onChange={handleChangeBus} />
                                        <h3>Bus</h3>
                                    </div>

                                    <div id='individualCheckBox'>
                                        <input type="checkbox" checked={isCheckedWalk} onChange={handleChangeWalk} />
                                        <h3>Walk</h3>
                                    </div>

                                </div>

                            </div> */}

                <div id="addCommuteBuddies">
                  <h3 style={{ fontWeight: "bold" }}>Add Commute Buddies: </h3>
                  <select
                    className="dropdown"
                    value={selectedOptions}
                    onChange={handleChange}
                  >
                    <option value="">None Selected</option>
                    <option value="Ted">Ted</option>
                    <option value="Robin">Robin</option>
                    <option value="Lily">Lily</option>
                  </select>
                  <p>{selectedOptions.join(" , ")}</p>
                </div>

                <div id="buttonOptions">
                  <button
                    id="button"
                    onClick={handleExit}
                    style={{
                      backgroundColor: "#EAEAEA",
                      color: "black",
                      borderColor: "#EAEAEA",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    id="button"
                    onClick={handleAddRouteToDB}
                    style={{ backgroundColor: "#769EB8" }}
                  >
                    Add Route
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Schedule;
