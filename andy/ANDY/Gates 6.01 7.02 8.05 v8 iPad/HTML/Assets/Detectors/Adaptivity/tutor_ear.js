//detector template

//add output variable name below
var variableName = "tutor_ear"

//initializations (do not touch)
var detector_output = {name: variableName,
						category: "Adaptivity", 
						value: 0,
						history: "",
						skill_names: "",
						step_id: "",
						transaction_id: "",
						time: ""
						};
var mailer;

//creates an array of different responses

var customIdleMessages = ["<img src='Assets/tutor_images/panda_idle_attempt.png' width='300' height='246'>"];

var customHintAvoidMessages = ["<img src='Assets/tutor_images/panda_hint_avoidance.png' width='300' height='246'>", 
							"<img src='Assets/tutor_images/panda_hint_avoidance_2.png' width='300' height='246'>"];
							
var customHintAbuseMessages = ["<img src='Assets/tutor_images/panda_hint_abuse_2.png' width='300' height='246'>", 
								"<img src='Assets/tutor_images/panda_hint_abuse.png' width='300' height='246'>"];
							
var customGoodAttempt = ["<img src='Assets/tutor_images/panda_default.png' width='179' height='246'>"]							

//declare any custom global variables that will be initialized 
//based on "remembered" values across problem boundaries, here
// (initialize these at the bottom of this file, inside of self.onmessage)
//
//
//
//
//


//declare and/or initialize any other custom global variables for this detector here...
var currentDetectorValues = {};
var timerID;
//
//
//
//
//[optional] single out TUNABLE PARAMETERS below
//
//
//
//


function sendTutorMessage(updateType, messageContent){

	//tutor update type ("hint_window_message" or "other")
	detector_output.history = updateType;

	detector_output.value = messageContent;

	//mailer.postMessage(detector_output); 
	postMessage(detector_output); 
	console.log("output_data = ", detector_output);

}

function receive_transaction( e ){
	//e is the data of the transaction from mailer from transaction assembler

	clearTimeout(timerID);

	//set conditions under which transaction should be processed 
	//(i.e., to update internal state and history, without 
	//necessarily updating external state and history)

	if(e.data.tool_data.action == "UpdateVariable"){
		//  update store of current detector values
		currentDetectorValues[e.data.tool_data.selection] = e.data.tool_data.input;
	}

	timerID = setTimeout(function() { 

		console.log(currentDetectorValues);

		//set conditions under which detector should update
		//external state and history
		if(e.data.tool_data.action == "UpdateVariable"){
			detector_output.time = new Date();
			detector_output.transaction_id = e.data.transaction_id;

			//custom processing (set tutor-performed actions here)

			if(currentDetectorValues["idle"].split(',')[0]=="1"){
				var updateType = "write_text";
				var messageContent = customIdleMessages[Math.floor(Math.random() * customIdleMessages.length)];
				sendTutorMessage(updateType, messageContent);


				//var updateType = "write_text_cumulative";
				//var messageContent = ;
				//sendTutorMessage(updateType, messageContent);
			}
			else{
				// write custom messages here
				if(currentDetectorValues["help_model_variant"].indexOf("true, abusing hints?")!=-1){
					var updateType = "write_text";
					var messageContent = customHintAbuseMessages[Math.floor(Math.random() * customHintAbuseMessages.length)];
					sendTutorMessage(updateType, messageContent);
				}
				else if(currentDetectorValues["help_model_variant"].indexOf("true, avoiding hints?")!=-1){
					var updateType = "write_text";
					var messageContent =  customHintAvoidMessages[Math.floor(Math.random() * customHintAvoidMessages.length)];
					sendTutorMessage(updateType, messageContent);
				}
				else{
					var updateType = "write_text";
					var messageContent = customGoodAttempt[Math.floor(Math.random() * customGoodAttempt.length)];
					sendTutorMessage(updateType, messageContent); 
				}

				var updateType = "write_text_cumulative";
				var messageContent = currentDetectorValues["help_model_variant"].split(',')[2].toString();
				sendTutorMessage(updateType, messageContent);

			}
	
			
		}
	}, 800);
}


self.onmessage = function ( e ) {
    console.log(variableName, " self.onmessage:", e, e.data, (e.data?e.data.commmand:null), (e.data?e.data.transaction:null), e.ports);
    switch( e.data.command )
    {
    case "connectMailer":
		mailer = e.ports[0];
		mailer.onmessage = receive_transaction;
	break;
	case "initialize":
		for (initItem in e.data.initializer){
			if (e.data.initializer[initItem].name == variableName){
				detector_output.history = e.data.initializer[initItem].history;
				detector_output.value = e.data.initializer[initItem].value;
			}
		}


		//optional: In "detectorForget", specify conditions under which a detector
		//should NOT remember their most recent value and history (using the variable "detectorForget"). 
		//(e.g., setting the condition to "true" will mean that the detector 
		// will always be reset between problems... and setting the condition to "false"
		// means that the detector will never be reset between problems)
		//
		detectorForget = true;
		//
		//

		if (detectorForget){
			detector_output.history = {};
			detector_output.value = 0;
		}


		//optional: If any global variables are based on remembered values across problem boundaries,
		// these initializations should be written here
		//
		//
		if (detector_output.history == "" || detector_output.history == null){
			//in the event that the detector history is empty,
			//initialize variables to your desired 'default' values
			//
			//
		}
		else{
			//if the detector history is not empty, you can access it via:
			//     JSON.parse(detector_output.history);
			//...and initialize your variables to your desired values, based on 
			//this history
			//
			//
		}

	break;
    default:
	break;

    }

}