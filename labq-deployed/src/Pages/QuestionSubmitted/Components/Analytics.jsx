import { useLayoutEffect } from "react";
import { useEffect, useState } from "react";
import authAccess from "../../../Context/auth-access";
import { useContext } from "react";

let place_in_queue;
let question_id;
let expected_wait_time;

const Analytics = () => {
  const [loadingState, setLoadingState] = useState(true);
  const [loadingWaitTime, setLoadingWaitTime] = useState(true);
  let {
    accessToken,
    setAccessToken,
    username,
    setUsername,
    loading,
    setLoading,
  } = useContext(authAccess);

  useEffect(() => {
    console.log(username);
    if (username != "") {
      placeInQueue()
        .then(async () => {
          await fetchWaitTime();
        })
        .then(() => {
          setLoadingState(false);
        })
        .then(() => {
          setLoadingWaitTime(false);
        });
    }
  }, [loading, username]);

  const placeInQueue = async () => {
    console.log("place in queue is activating with: ", username);
    let justAsked = await fetch("/cslabs/retrievejustasked", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ username }),
    });
    let response = await justAsked.json();
    question_id = response.retrieve[0].question_id;

    console.log(response);

    let queuePlaceJson = await fetch(
      "/cslabs/retrieveplaceinqueue",
      {
        method: "POST",
        body: JSON.stringify({ question_id }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    let random = await queuePlaceJson.json();
    console.log(random);
    place_in_queue = random[0].place_in_queue;
    console.log(place_in_queue);
  };

  const fetchWaitTime = async () => {
    let waitTimejson = await fetch("/cslabs/fetchwaittime");
    let waitTime = await waitTimejson.json();
    console.log(waitTime);
    //Need to calculate it by number in the queue
    expected_wait_time = waitTime.avgTimeWaited/(place_in_queue - 1);
    
    console.log(expected_wait_time);
  };

  return (
    <>
      <h1>You have submitted your question</h1>
      <p>
        Expected Wait time:{" "}
        {loadingWaitTime == false ? (isNaN(expected_wait_time)? (<>You are first in the queue, the teacher will be around as fast as possible</>) : (`${Math.round(expected_wait_time)} minute(s)`)) : <></>}{" "}
      </p>
      <p>No. in the queue: </p>
      {loadingState == false ? <p>{`${place_in_queue}`}</p> : <p>Loading...</p>}
    </>
  );
};
export default Analytics;
