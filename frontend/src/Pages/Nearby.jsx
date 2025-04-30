import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar/Nav";
import './Styles/Nearby.css'
import Event from "../Components/Nearby/Event";

export default function Nearby() {
  const [user, setUser] = useState("");
  const [events, setEvents] = useState([]);
  const [createEvent, setCreateEvent] = useState(false);
  const [count, setCount] = useState(0);
  const [time, setTime] = useState("");
  const [AMPM, setAMPM] = useState("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  const [changeAMPM, setChangeAMPM] = useState(false);
  const [changeColor, setChangeColor] = useState(false);
  const [changeType, setChangeType] = useState(false);
  
  const [selectedID, setSelectedID] = useState("");

  const [createEventChange, setCreateEventChange] = useState({
    Name: '',
    Date: '',
    Time: '',
    Location: '',
    Description: '',
    Email: '',
    Color: '',
    Type: ''
  });

  const [updateEventInfo, setUpdateEventInfo] = useState({});

  // Update Time whenever time or AMPM changes
  useEffect(() => {
    if (time && AMPM) {
      setCreateEventChange(prev => ({
        ...prev,
        Time: `${time} ${AMPM}`
      }));
    }
  }, [time, AMPM]);

  // When in edit mode, initialize the form with existing event data
  useEffect(() => {
    if (editEvent && updateEventInfo) {
      setCreateEventChange({
        Name: updateEventInfo.Name || '',
        Date: updateEventInfo.Date || '',
        Time: updateEventInfo.Time || '',
        Location: updateEventInfo.Location || '',
        Description: updateEventInfo.Description || '',
        Email: updateEventInfo.Email || '',
        Color: updateEventInfo.Color || '',
        Type: updateEventInfo.Type || ''
      });

      // Extract time and AM/PM separately
      if (updateEventInfo.Time) {
        const timeParts = updateEventInfo.Time.split(' ');
        if (timeParts.length === 2) {
          setTime(timeParts[0]);
          setAMPM(timeParts[1]);
        }
      }

      // Set color and type from existing event
      setColor(updateEventInfo.Color || '');
      setType(updateEventInfo.Type || '');
    }
  }, [editEvent, updateEventInfo]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    const newData = {...createEventChange, [name]: value};
    setCreateEventChange(newData);
  };

  const handleAddTime = (e) => {
    const {value} = e.target;
    setTime(value);
  };

  const handleColorChange = (selectedColor) => {
    setColor(selectedColor);
    setChangeColor(true);
    setCreateEventChange(prev => ({
      ...prev,
      Color: selectedColor
    }));
  };

  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    setChangeType(true);
    setCreateEventChange(prev => ({
      ...prev,
      Type: selectedType
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await getUserID();
      setUser(userId); // Update the state with the user ID
      if(userId === "UIC_Admin"){
        setIsAdmin(true);
      }else{
        setIsAdmin(false);
      }
    };

    fetchUser();
  }, []);

  async function getUserID() {
    let response = await fetch(`http://127.0.0.1:5000/getUsername`, {
      method: "GET",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    
    let data = await response.json();
    return data['user'];
  }

  useEffect(() => {
    if (user) {
      loadCommunityEvents(); // Load events after user is set
    }
  }, [user]); // Only run this effect when user changes

  async function loadCommunityEvents() {
    let response = await fetch(`http://127.0.0.1:5000/getCommunityEvents`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    let data = await response.json();
    setEvents(data);
  };
  
  // Get the id of the event
  const handleClickOnCommunityEvent = (id) => {
    if(isAdmin){
      setCreateEvent(true);
      setEditEvent(true);
      loadSpecificEvents(id);
      setSelectedID(id);
    }
  }

  const loadSpecificEvents = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/getSpecificEvent?id=${id}`);
      const data = await res.json();
      
      setUpdateEventInfo({
        Name: data.Name || '',
        Date: data.Date || '',
        Time: data.Time || '',
        Location: data.Location || '',
        Description: data.Description || '',
        Email: data.Email || '',
        Color: data.Color || '',
        Type: data.Type || ''
      });

    } catch (err) {
      console.error("Error fetching event data", err);
    }
  };

  const handleCreateEvent = () => {
    setCount(count + 1);
    setCreateEvent(!createEvent);
    // Reset form when opening create event form
    setCreateEventChange({
      Name: '',
      Date: '',
      Time: '',
      Location: '',
      Description: '',
      Email: '',
      Color: '',
      Type: ''
    });
    setTime("");
    setAMPM("");
    setColor("");
    setType("");
    setChangeAMPM(false);
    setChangeColor(false);
    setChangeType(false);
  };

  // Handler functions for AM/PM buttons
  const handleAM = () => {
    setChangeAMPM(true);
    setAMPM("AM");
  };

  const handlePM = () => {
    setChangeAMPM(true);
    setAMPM("PM");
  };
  
  const handleAddEvent = async (e) => {
    e.preventDefault();
  
    // Form validation
    if (!createEventChange.Name || !createEventChange.Date || !time || !AMPM || 
        !createEventChange.Location || !createEventChange.Email || !color || !type) {
      alert("Please fill in all required fields");
      return;
    }
  
    // Generate a random ID for the event document
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
    const sendEventReq = {
      random_id: randomId,
      event: createEventChange
    };
  
    try {
      const response = await fetch('http://127.0.0.1:5000/setCommunityEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendEventReq),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Error response:', result.message);
        alert('Failed to create event. Please try again.');
      } else {
        // Reset form and update UI
        setCreateEventChange({
          Name: '',
          Date: '',
          Time: '',
          Location: '',
          Description: '',
          Email: '',
          Color: '',
          Type: ''
        });
        
        // Reset other state values
        setTime("");
        setAMPM("");
        setColor("");
        setType("");
        
        // Update events list and reset UI
        setCount(count + 1);
        setCreateEvent(false);
        setChangeAMPM(false);
        setChangeType(false);
        setChangeColor(false);
        loadCommunityEvents(); // Refresh the events list
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Cancel handler
  const handleCancel = () => {
    setCreateEventChange({
      Name: '',
      Date: '',
      Time: '',
      Location: '',
      Description: '',
      Email: '',
      Color: '',
      Type: ''
    });
    setTime("");
    setAMPM("");
    setColor("");
    setType("");
    setCreateEvent(false);
    setChangeAMPM(false);
    setChangeType(false);
    setChangeColor(false);
    setEditEvent(false);
  };

  const handleUpdateEvent = async () => {
    // Form validation
    if (!createEventChange.Name || !createEventChange.Date || 
        !createEventChange.Time || !createEventChange.Location || 
        !createEventChange.Email || !createEventChange.Color || 
        !createEventChange.Type) {
      alert("Please fill in all required fields");
      return;
    }
  
    const sendEventReq = {
      id: selectedID,
      event: createEventChange
    };
  
    try {
      const response = await fetch('http://127.0.0.1:5000/updateSpecificCommunityEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendEventReq),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Error response:', result.message);
        alert('Failed to update event. Please try again.');
      } else {
        // Reset form and update UI
        setCreateEventChange({
          Name: '',
          Date: '',
          Time: '',
          Location: '',
          Description: '',
          Email: '',
          Color: '',
          Type: ''
        });
  
        setTime("");
        setAMPM("");
        setColor("");
        setType("");
  
        setCount(count + 1);
        setCreateEvent(false);
        setEditEvent(false);
        loadCommunityEvents(); // Refresh the events list
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedID) {
      alert('No event selected for deletion');
      return;
    }
        
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Change to POST method and properly format the request
        const response = await fetch(`http://127.0.0.1:5000/deleteSpecificCommunityEvent?id=${selectedID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
              
        const result = await response.json();
            
        if (!response.ok) {
          console.error('Error response:', result.message);
          alert('Failed to delete event. Please try again.');
        } else {
          // Reset form and update UI
          handleCancel();
          loadCommunityEvents(); // Refresh the events list
          alert('Event successfully deleted');
        }
        
      } catch (err) {
        console.error(err);
        alert('An error occurred. Please try again.');
      }
    }
  }; 

  return (
    <>
    <NavBar/>
    <div className="Events">
      <div className="eventsTitle">
        <h1>Community Events</h1>

        {user === "UIC_Admin" && !createEvent && (
          <button 
            id="editScheduleId" 
            style={{ cursor: 'pointer', textDecoration: "underline" }} 
            onClick={handleCreateEvent}
          >
            <h2 id="createEvent">Create Event</h2>
          </button>
        )}
        
      </div>

      {!createEvent && (
        <div className="listOfEvents">
          {events && events.length > 0 ? (
            events.map((event, index) => (
              <div className="eventCard" key={event.id || index} onClick={() => handleClickOnCommunityEvent(event.id)}>
                <Event 
                  eventTitle={event.Name}
                  date={event.Date}
                  time={event.Time}
                  location={event.Location}
                  description={event.Description}
                  email={event.Email}
                  color={event.Color}
                  type={event.Type}
                />
              </div>
            ))
          ) : (
            <div className="no-events-message">
              <p>No events found. Create an event to get started!</p>
            </div>
          )}
        </div>
      )}

      {createEvent && (
        <div className="bigComponentForCreateEvent">
          <div className="allEvents">

            <div className="eventsBoxOne">

              <div className="textinputs">
                <h2 style={{ fontWeight: 'normal' }}>Title</h2>
                <h2 style={{ fontWeight: 'normal' }}>Date</h2>
                <h2 style={{ fontWeight: 'normal' }}>Time</h2>
                <h2 style={{ fontWeight: 'normal' }}>Location</h2>
                <div id="descriptionText">
                  <h2 style={{ fontWeight: 'normal' }}>Description</h2>
                  <h4 style={{fontWeight: 'normal'}}>Max: 50 words</h4>
                </div>
              </div>

              <div className="textInputsBoxes">
                <input
                  id="eventName"
                  name="Name"
                  value={createEventChange.Name}
                  onChange={handleChange}
                  placeholder={editEvent ? updateEventInfo.Name : "Event Name"}
                />

                <input
                  id="eventName"
                  name="Date"
                  value={createEventChange.Date}
                  onChange={handleChange}
                  placeholder={editEvent ? updateEventInfo.Date : "DD Month"}
                />

                <div id="TimeDiv">
                  <input
                    id="eventTime"
                    value={time}
                    onChange={handleAddTime}
                    placeholder={editEvent ? updateEventInfo.Time?.replace(/\s[AP]M$/, '') : "##:## - ##:##"}
                  />
                  <button 
                    onClick={handleAM} 
                    id="TOD" 
                    style={{ 
                      backgroundColor: AMPM === "AM" || (editEvent && !changeAMPM && createEventChange.Time?.includes("AM")) 
                        ? 'rgba(19, 185, 226, 0.596)' 
                        : 'rgba(240, 248, 255, 0)'
                    }}
                  >
                    AM
                  </button>
                  <button 
                    onClick={handlePM} 
                    id="TOD" 
                    style={{ 
                      backgroundColor: AMPM === "PM" || (editEvent && !changeAMPM && createEventChange.Time?.includes("PM")) 
                        ? 'rgba(19, 185, 226, 0.596)' 
                        : 'rgba(240, 248, 255, 0)'
                    }}
                  >
                    PM
                  </button>
                </div>

                <input
                  id="eventName"
                  name="Location"
                  value={createEventChange.Location}
                  onChange={handleChange}
                  placeholder={editEvent ? updateEventInfo.Location : "Location"}
                />

                <textarea
                  id="eventDescription"
                  name="Description"
                  value={createEventChange.Description}
                  onChange={handleChange}
                  placeholder={editEvent ? updateEventInfo.Description : "Description"}
                  rows={4}
                  maxLength={500}
                /> 
              </div>
            </div>

            <div className="eventsBoxOne">
              <div className="textinputs">
                <h2 style={{ fontWeight: 'normal' }}>Email</h2>
                <h2 style={{ fontWeight: 'normal' }}>Color</h2>
                <h2 style={{ fontWeight: 'normal' }}>Type</h2>
              </div>

              <div className="textInputsBoxes">
                <input
                  id="eventName"
                  name="Email"
                  value={createEventChange.Email}
                  onChange={handleChange}
                  placeholder={editEvent ? updateEventInfo.Email : "Email"}
                />

                <div id="colors">
                  <button 
                    id="button" 
                    onClick={() => handleColorChange('#5D576A')}
                    style={{ 
                      borderColor: color === '#5D576A' || (editEvent && !changeColor && updateEventInfo.Color === '#5D576A') ? '#190e32' : '#5D576A', 
                      borderWidth: color === '#5D576A' || (editEvent && !changeColor && updateEventInfo.Color === '#5D576A') ? '3px' : '0px', 
                      borderStyle: color === '#5D576A' || (editEvent && !changeColor && updateEventInfo.Color === '#5D576A') ? 'solid' : 'none', 
                      backgroundColor: '#5D576A'
                    }}
                  ></button>
                  <button 
                    id="button"
                    style={{ 
                      borderColor: color === '#7D91B8' || (editEvent && !changeColor && updateEventInfo.Color === '#7D91B8') ? '#111f3b' : '#7D91B8', 
                      borderWidth: color === '#7D91B8' || (editEvent && !changeColor && updateEventInfo.Color === '#7D91B8') ? '3px' : '0px', 
                      borderStyle: color === '#7D91B8' || (editEvent && !changeColor && updateEventInfo.Color === '#7D91B8') ? 'solid' : 'none', 
                      backgroundColor: '#7D91B8'
                    }}
                    onClick={() => handleColorChange('#7D91B8')}
                  ></button>
                  <button 
                    id="button"
                    style={{ 
                      borderColor: color === '#C5D4EA' || (editEvent && !changeColor && updateEventInfo.Color === '#C5D4EA') ? '#1c2839' : '#C5D4EA', 
                      borderWidth: color === '#C5D4EA' || (editEvent && !changeColor && updateEventInfo.Color === '#C5D4EA') ? '3px' : '0px', 
                      borderStyle: color === '#C5D4EA' || (editEvent && !changeColor && updateEventInfo.Color === '#C5D4EA') ? 'solid' : 'none', 
                      backgroundColor: '#C5D4EA'
                    }}
                    onClick={() => handleColorChange('#C5D4EA')}
                  ></button>
                  <button 
                    id="button"
                    style={{ 
                      borderColor: color === '#E3C698' || (editEvent && !changeColor && updateEventInfo.Color === '#E3C698') ? '#2e261a' : '#E3C698', 
                      borderWidth: color === '#E3C698' || (editEvent && !changeColor && updateEventInfo.Color === '#E3C698') ? '3px' : '0px', 
                      borderStyle: color === '#E3C698' || (editEvent && !changeColor && updateEventInfo.Color === '#E3C698') ? 'solid' : 'none', 
                      backgroundColor: '#E3C698'
                    }}
                    onClick={() => handleColorChange('#E3C698')}
                  ></button>
                </div>

                <div id="TimeDiv"> 
                  <button 
                    id="TOD" 
                    onClick={() => handleTypeChange('UIC')} 
                    style={{ 
                      backgroundColor: type === "UIC" || (editEvent && !changeType && updateEventInfo.Type === "UIC") 
                        ? 'rgba(19, 185, 226, 0.596)' 
                        : 'rgba(240, 248, 255, 0)' 
                    }}
                  >
                    UIC
                  </button>
                  <button 
                    id="TOD" 
                    onClick={() => handleTypeChange('CC')} 
                    style={{ 
                      backgroundColor: type === "CC" || (editEvent && !changeType && updateEventInfo.Type === "CC") 
                        ? 'rgba(19, 185, 226, 0.596)' 
                        : 'rgba(240, 248, 255, 0)' 
                    }}
                  >
                    Commuter Center
                  </button>
                </div>
              </div>
            </div>
          </div>

          {editEvent && (
            <div id="buttonHandleCreateEvent">
              <button id="createEventButton" onClick={handleUpdateEvent}>Update Event</button>
              <button id="deleteEventButton" onClick={handleDeleteEvent}>Delete Event</button>
              <button id="cancelEventButton" onClick={handleCancel}>Cancel</button>
            </div>
          )}
          
          {!editEvent && (
            <div id="buttonHandleCreateEvent">
              <button id="createEventButton" onClick={handleAddEvent}>Create Event</button>
              <button id="cancelEventButton" onClick={handleCancel}>Cancel</button>
            </div>
          )}
          
        </div>
      )}
    </div>
    </>
  );
}