import React, { useState } from "react";
import './App.css';

function TextInput() {
  const [inputValue, setInputValue] = useState("");
  const [text, setText] = useState("ticket info here");
  const [ticketName, setTicketName] = useState("ticket name here");
  const [memberName, setMemberName] = useState("");
  const Members= [{name: 'Clayton'},{name: 'Samuel'}];
  const [allMembers, setMember] = React.useState(Members);
  const displayMembers = allMembers.map((member) =>
        <li>{member.name}</li>);
    
    

  function handleInputChange(event) {
    setInputValue(event.target.value);
  }

  function handleTaskButtonClick() {

  }

  function handleMemberChange(event) {
    setMemberName(event.target.value);
  }

  function handleMemberAdd(){
    const addMember = allMembers.concat({name: memberName})
    setMember(addMember);
  }

  return (
    <div className="Container">
        <div className="TicketBody">
            
            <div>
                <div  >
                    <div  className="Title" contenteditable={true}>
                        {ticketName}
                    </div>
                    

                    <div className ="TicketDetails" contentEditable={true}>
                        {text} 
                    </div>
                </div>
            </div>
            <div>
                <h3 htmlFor="text-input">Add task to Ticket: </h3>
                <input
                    type="text"
                    id="text-input"
                    name="text-input"
                    placeholder="Enter task here"
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <button onClick={handleTaskButtonClick}>Submit</button>
            </div>
        </div>
        
        <div className="TeamMembers">
            <div className="Title">
                <p>Team Members</p>
            </div>
            <div>
                <ul>
                    {displayMembers}
                </ul>
            </div>
            <div>
            <input
                    type="text"
                    id="text-input"
                    name="text-input"
                    placeholder="Enter member name here"
                    value={memberName}
                    onChange={handleMemberChange}
                />
                <button onClick={handleMemberAdd}>Add</button>
            </div>
        </div>

        
    </div>
  );
}

const styles = {
    ticketName:{
        fontSize: 10,

    }
}

export default TextInput;
