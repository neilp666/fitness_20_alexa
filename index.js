var https = require('https');
var queryString = require('querystring');

// Lambda function:
exports.handler = function (event, context) {

    console.log('Running event');

};


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
         }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
            ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
            ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);


}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
            ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;


    if("WorkoutType" === intentName){
        var destination = intentRequest.intent.slots.Destination.value;

        if("chest" === destination){
            handleChestRequest(intent, session, callback);
        } else if ("abs" === destination){
            handleAbsRequest(intent, session, callback);
        } else if ("cardio" === destination){
           handleCardioRequest(intent, session, callback);
        } else if ("yoga" === destination){
           handleYogaRequest(intent, session, callback);
          }
        }
        else {
          throw "Invalid intent";
        }

}

function handleCardioRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Welcome to the cardio workout. You must perform. Twenty jumping jacks in twenty seconds. Ready. Three. Two. One. Go. <break time='20s'/> We’re done. Let’s do it again. Don’t be lazy.", "", "true"));
}

function handleAbsRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Welcome to the abs workout. You must perform. twenty sit-ups in twenty seconds. Ready. Three. Two. One. <break time='20s'/>  We’re done. Let’s do it again. Don’t be lazy. ", "", "true"));
}

function handleChestRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Welcome to the chest workout. You must perform. twenty regular pushups in twenty seconds. Ready. Three. Two. One. <break time='20s'/> We’re done. Let’s do it again. Don’t be lazy. ", "", "true"));
}

function handleYogaRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Welcome to the yoga workout. You must perform. A twenty second leg stretch. Ready. Three. Two. One. <break time='20s'/> We’re done. Let’s do it again. Don’t be lazy. ", "", "true"));
}


/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
            ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------



function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to Fitness Twenty, please say the workout you would like to do today. Just say chest, abs, cardio or yoga workout.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me what action to undertake. ";
    var shouldEndSession = false;

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
            "type": "SSML",
            "ssml": "<speak>" + output + "</speak>"
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
