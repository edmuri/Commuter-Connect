import React, { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_CTA_BUS_API_KEY;

export default function BusArrivals() {
  const [predictions, setPredictions] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState(["8"]);

  const stopIds = ["4618", "4639", "4640", "14487", "18184", "4638","6701","6700","6627","17277","6347","198","206","210", "14459", "17366", "5802", "5928"]; 
  const routes = ["8", "60", "157", "7"];

  const handleRouteChange = (rt) => {
    setSelectedRoutes((prev) =>
      prev.includes(rt) ? prev.filter((r) => r !== rt) : [...prev, rt]
    );
  };

  useEffect(() => {
    if (selectedRoutes.length === 0) {
      setPredictions([]);
      return;
    }

    const fetchPredictions = async () => {
      const fetches = [];

      for (const stpid of stopIds) {
        for (const rt of selectedRoutes) {
          const url = `/api/bustime/api/v2/getpredictions?key=${API_KEY}&rt=${rt}&stpid=${stpid}&format=json`;
          fetches.push(fetch(url).then((res) => res.json()));
        }
      }

      const responses = await Promise.all(fetches);
      const all = responses.flatMap(
        (res) => res["bustime-response"]?.prd || []
      );
      setPredictions(all);
    };

    fetchPredictions();
  }, [selectedRoutes]);

  const sortedItems = [...predictions].sort((a, b) => a.prdctdn - b.prdctdn);

  const formatArrivalTime = (prdctdn) => {
    if (prdctdn == "DUE") {
      return "Due";
    } 
    else if (prdctdn == "DLY") {
      return "Delayed";
    }else {
      return `${prdctdn} min.`;
    }
  };

  const formatDirection = (rtdir) => {
    if (rtdir == "Northbound") return "N";
    else if (rtdir == "Southbound") return "S";
    else if (rtdir == "Eastbound") return "E";
    else return "W";
  };

  return (
    <div>
      <div>
        <h2 className="page-title">Incoming Buses</h2>
        <div className="choose-bus-route">
          {routes.map((rt) => (
            <label key={rt} style={{ marginRight: "1rem" }} className="bus-check-label">
              <input
                type="checkbox"
                checked={selectedRoutes.includes(rt)}
                onChange={() => handleRouteChange(rt)}
                className="bus-check"
              / >
              Route {rt}
            </label>
          ))}
        </div>
        <ul className="bus-predictions">
          {sortedItems.slice(0,10).map((p, i) => (
            <li key={i}>
              <div>
                <strong>
                  {p.rt} {formatDirection(p.rtdir)}
                </strong>{" "}
                {p.stpnm}
              </div>
              <em>{formatArrivalTime(p.prdctdn)}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}