import React, { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_CTA_TRAIN_API_KEY;

export default function TrainArrivals() {
  const [arrivals, setArrivals] = useState([]);

  const mapid = ["40350","40380","41000"];

  const handleRouteChange = (rt) => {
    setSelectedRoutes((prev) =>
      prev.includes(rt) ? prev.filter((r) => r !== rt) : [...prev, rt]
    );
  };

  // fetch(`/api2/api/1.0/ttarrivals.aspx?key=${API_KEY}&staId=40350&stpId=30069&outputType=JSON`)
  useEffect(() => {
    fetch(`/api2/api/1.0/ttarrivals.aspx?key=${API_KEY}&mapid=40350&max=5&outputType=JSON`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Full CTA train data:", data);
        const arrivalList = data?.ctatt?.eta || [];
        setArrivals(arrivalList);
      })
      .catch((err) => {
        console.error("❌ Error fetching train data:", err);
      });
  }, []);

  // Helper function to calculate "minutes away"
  function getMinutesAway(arrivalTimeString) {
    const arrivalTime = new Date(arrivalTimeString);
    const now = new Date();
    const diffMs = arrivalTime - now;
    const diffMins = Math.round(diffMs / 60000); 
    return diffMins;
  }

  return (
    <div>
      <h2>Incoming Trains at UIC-Halsted 🚆</h2>
      {arrivals.length === 0 ? (
        <p>No incoming trains at this time.</p>
      ) : (
        <ul classname="train-predictions">
          {arrivals.map((train, index) => {
            const minutesAway = getMinutesAway(train.arrT);
            return (
              <li key={index}>
                
                <div>
                  <strong>{train.rt} {train.destNm}</strong>{" "}
                </div>
                <em>{minutesAway <= 0 ? "Due" : `${minutesAway} min`}</em>
              </li>
            );
          })}
        </ul>
      )}
    </div>
    
  );
}

// <ul className="bus-predictions">
//           {sortedItems.slice(0,10).map((p, i) => (
//             <li key={i}>
//               <div>
//                 <strong>
//                   {p.rt} {formatDirection(p.rtdir)}
//                 </strong>{" "}
//                 {p.stpnm}
//               </div>
//               <em>{formatArrivalTime(p.prdctdn)}</em>
//             </li>
//           ))}
//         </ul>