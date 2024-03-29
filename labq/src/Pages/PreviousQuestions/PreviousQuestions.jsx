import { Container, Button, Divider, TextField, Typography } from "@mui/material";
import { useContext } from "react";
import { useState, useEffect, componentDidMount } from "react";
import solution from "../../Context/Solutions";

import authAccess from "../../Context/auth-access";
import { useLayoutEffect } from "react";

//Comes in two forms, retrieved and retrieved Old.
let thisisnotgoingtobeavariablename = [];
let allcomments;
let editSolutionObject = {
  question_id:"",
  solution: "",
}



const PreviousQuestions = () => {
  const [retrievedQuestion, setRetrievedQuestion] = useState(null);
  const [clicked, setClicked] = useState({}); //All the code in relation to opening the solution comment section is taken from https://stackoverflow.com/questions/66433344/how-to-target-single-item-in-list-with-onclick-when-mapping-json-array-in-react
  const [formValues, setFormValues] = useState({});
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [solutionEdit, setSolutionEdit] = useState(null)
  const [objectEditedSolution, setObjectEditedSolution] = useState(editSolutionObject)
  const [reloadSolutions, setReloadSolutions] = useState(null)
  let { solutionOpen, setSolutionStatus } = useContext(solution);

  let {
    accessToken,
    setAccessToken,
    username,
    setUsername,
    loading,
    setLoading,
  } = useContext(authAccess);

  //Utilised chatGPT for the useEffect to correctly work
  useLayoutEffect(() => {
    if (username != "") {
      setLoading(false);
      setCommentsLoaded(false);
    }
    if (!loading) {
      if (username != "") {
        retrievePreviousQuestions()
          .then(() => fetchComments())
          .then(() => {
            setRetrievedQuestion(true);
            setCommentsLoaded(true);
            console.log(retrievedQuestion);
          });
      }
    }
  }, [username, loading]);

  useEffect(() => {
    retrievePreviousQuestions()
  }, [reloadSolutions])

  const fetchSolution = async (question_id) => {
    let solutionsjson = await fetch("/fetchsolution", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ question_id }),
    });
    let solutions = await solutionsjson.json();
    console.log(solutions);
    return (
      <>
      <p>
        <strong>Solution:</strong>
      </p>
      <p>{obj.solution}</p>
      <Button variant="contained" onClick={editSolution}>Edit Solution</Button>
    </>
    )
  };

  const sendEditedSolution = async () => {
    let responsejson = await fetch('/updatesolution', {
      method: 'PUT',
      body: JSON.stringify(formValues),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    let response = await responsejson.json();
    console.log(response)
    setSolutionEdit(false);
    setReloadSolutions(true)
  }


  const editSolution = (obj) => {
    if(solutionEdit == true) {
      return(
        <>
          <Typography sx={{mt: 1}} variant="subtitle1">Edit your Solution:</Typography>
        <TextField
          fullWidth
          id="solution"
          name="solution"
          value={formValues[obj.question_id]}
          defaultValue={obj.solution}
          onChange={(e) => {
            handleInputChange(e, obj.question_id);
          }}
          error={!isValid(obj.question_id)}
        />
        <Button variant="contained" sx={{mt: 1}} onClick={async () => {await sendEditedSolution();}}>
          Edit Solution
        </Button>
      </>
      )
    }
   
    
  }

  const clickOpenSolution = (question_id) => {
    setClicked({ ...clicked, [question_id]: !clicked[question_id] });
  };

  const handleInputChange = (e, question_id) => {
    const { name, value } = e.target; //get the name and value from the input that has been changed
    console.log("changing", name, value);
    setFormValues({
      ...formValues,
      [question_id]: value,
    }); //set all the other form values to their previous value, and the new one to the changed value
  };

  const retrievePreviousQuestions = async () => {
    try {
      console.log("SENDING");
      const questions = await fetch("http://localhost:5000/retrievequestions", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const returnedQuestions = await questions.json();
      console.log(returnedQuestions);
      thisisnotgoingtobeavariablename = returnedQuestions.retrievedOld;
      console.log(
        "This is not going to be a variable name",
        thisisnotgoingtobeavariablename
      );
      setReloadSolutions(false)

    } catch (err) {
      console.log(err);
    }
  };

  const fetchComments = async () => {
    let jsonComments = await fetch("http://localhost:5000/retrieveComments");
    let comments = await jsonComments.json();
    console.log(comments);
    allcomments = comments.comments;
    console.log("THis is all comments", allcomments)
  };

  const openSolutionPortal = () => {
    setSolutionStatus(true);
  };

  const sendSolution = async () => {
    console.log(formValues);

    try {
      const sending = await fetch("http://localhost:5000/addsolution", {
        method: "POST",
        body: JSON.stringify(formValues),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await sending.json();
      console.log(response);
      setReloadSolutions(true)
    } catch (err) {
      console.log(err);
    }
  };

  const isValid = (name) => {
    //all inputs must be filled in
    let valid = formValues[name] && formValues[name].trim() != "";
    return valid;
  };
  function returnSolution(obj) {
    if (clicked[obj.question_id]) {
      return (
        <>
          <Typography sx={{mt: 1}} variant="subtitle1">Add a Solution:</Typography>
          <TextField
            fullWidth
            id="solution"
            name="solution"
            value={formValues[obj.question_id]}
            onChange={(e) => {
              handleInputChange(e, obj.question_id);
            }}
            error={!isValid(obj.question_id)}
          />
          <Button variant="contained" sx={{mt: 1}} onClick={async () => {await sendSolution(); await fetchSolution()}}>
            Submit Solution
          </Button>
        </>
      );
    } else {
      return <></>;
    }
  }

  return (
    <Container>
      <Typography variant="h5" sx={{textAlign: 'center', mt: 3}}>Previously Asked Questions</Typography>
      {retrievedQuestion ? (
        thisisnotgoingtobeavariablename.map((obj) => (
          <article
            className="grid-cols-2 grid-rows-4 outline shadow-lg rounded-lg pl-10 pr-10 pt-4 pb-4 mt-5 mb-4"
            key={obj.question_id}
          >
            <div className="row-span-1">
              <div className="text-center">
                <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                  {obj.problem_title}
                </Typography>
              </div>
              <div className="grid-cols-1">
                <p>
                  Module Code: {obj.module}
                </p>
              </div>
              <div className="grid-cols-1">
                <p>
                  <strong>Practical: </strong>{obj.practical}
                </p>
              </div>
              <div className="grid-cols-1">
                <h4>Linked Practical: {obj.practical}</h4>
              </div>
            </div>
            <div className="row-span-2 cols-span-2"><strong>Description: </strong>{obj.problem}</div>
            <Divider sx={{m:2, borderBottomWidth: 3}} />
            <div className="row-span-1 cols-span-1 place-content-end">
              Question Date: {obj.question_date}
            </div>
            <div className="row-span-1 cols-span-1 place-content-end">
              Status: {obj.question_status}
            </div>
            {/* {allcomments.map((commentsobj) => {
              if (
                commentsLoaded == true &&
                commentsobj.question_id == obj.question_id
                && commentsobj.main_comment != null
              ) {
                return (
                  <>
                    <p>
                      <strong>Comments</strong>
                    </p>
                    <p>{commentsobj.main_comment}</p>
                  </>
                );
              } else {
                return (
                  <p>No Comments on this question</p>
                )
              }
            })} */}
            {
              allcomments.length != 0 ?
                allcomments.map((commentsobj) => {
                  if(commentsLoaded == true && commentsobj.question_id == obj.question_id) {
                    if (commentsobj.question_id == obj.question_id && commentsobj.main_comment.length > 0) {
                      return (
                        <>
                          <p>
                            <strong>Comments</strong>
                          </p>
                          <p>{commentsobj.main_comment}</p>
                        </>
                      );
                    }
                  } else {
                    return (
                      <></>
                    )
                  }                    
                })
              :
              (
                <p>No comments</p>
              )}
            {
              obj.solution == null || obj.solution == "null" ? 
                <><Button
                  variant="contained"
                  sx={{mt: 2}}
                  onClick={() => {
                    clickOpenSolution(obj.question_id);
                  } }
                >
                  Add Solution
                </Button><>{returnSolution(obj)}</></>
               : (
                <>
                  <p>
                    <strong>Solution:</strong>
                  </p>
                  <p>{obj.solution}</p>
                  <Button variant="contained" sx={{mt: 2}} onClick={() => {setSolutionEdit(true)}}>Edit Solution</Button>
                  {editSolution(obj)}
                </>
              )
            }
          </article>
        ))
      ) : (
        <p>loading</p>
      )}
    </Container>
  );
};

export default PreviousQuestions;
