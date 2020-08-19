TransactionMailerUsers =
{
    process_transactions_url: "",
    process_detectors_url: "",
    authenticity_token: "",
    mailerURL: "mail-worker.js",
    mailer: null,
    mailerPort: null,
    scripts: ["Detectors/Adaptivity/help_model_variant.js",
    "Detectors/Adaptivity/idle.js",
    "Detectors/Adaptivity/tutor_ear.js"],
    active: []
};

TransactionMailerUsers.create = function(path, txDestURL, scriptsDestURL, authToken, scriptsInitzer, xApiKeyHeader)
{
    console.log("TransactionMailerUsers.create(): at entry, scriptsInitzer ", scriptsInitzer );

    TransactionMailerUsers.mailer = new Worker(path+'/'+TransactionMailerUsers.mailerURL);
    
    TransactionMailerUsers.process_transactions_url = txDestURL;
    TransactionMailerUsers.authenticity_token = authToken;
    TransactionMailerUsers.process_detectors_url = scriptsDestURL;
    TransactionMailerUsers.x_api_key_header = (xApiKeyHeader? xApiKeyHeader : "");

    TransactionMailerUsers.mailer.postMessage({
        command: "process_transactions_url",
        process_transactions_url: TransactionMailerUsers.process_transactions_url,
        process_detectors_url: TransactionMailerUsers.process_detectors_url,
        x_api_key_header: TransactionMailerUsers.x_api_key_header,
        authenticity_token: TransactionMailerUsers.authenticity_token
    });

    var channel = new MessageChannel();
    TransactionMailerUsers.mailer.postMessage(
            { command: "connectTransactionAssembler" },
            [ channel.port1 ]
    );
    TransactionMailerUsers.mailerPort = channel.port2;
    TransactionMailerUsers.mailerPort.onmessage = function(event) {
            console.log("From mailer: "+event);
    };

    for(var i = 0; i < TransactionMailerUsers.scripts.length; ++i)
    {
    var s = path + '/' + TransactionMailerUsers.scripts[i];
    var detector = new Worker(s);
    var mc = new MessageChannel();
    TransactionMailerUsers.mailer.postMessage({ command: "connectDetector" }, [ mc.port1 ]);
    detector.postMessage({ command: "connectMailer" }, [ mc.port2 ]);
    if(scriptsInitzer)
    {
        detector.postMessage({ command: "initialize", initializer: scriptsInitzer });
        console.log("TransactionMailerUsers.create(): sent command: initialize, scriptsInitzer ", scriptsInitzer );
    }
    TransactionMailerUsers.active.push(detector);
    console.log("TransactionMailerUsers.create(): s, active["+i+"]=", s, TransactionMailerUsers.active[i]);

    detector.onmessage = function(e) 
        {
            var sel = e.data.name;
            var action = "UpdateVariable";
            var input = e.data.value;
            var timerID;

            if(sel!="tutor_ear"){
                var sai = new CTATSAI();
                sai.setSelection(sel);
                sai.setAction(action);
                sai.setInput(input);
                CTATCommShell.commShell.processComponentAction(sai=sai, tutorComponent=false, aTrigger="tutor");
            }
            else if(input != ""){
                //selection action input
                var transactionID=CTATGuid.guid();
                var updateType = e.data.history;

                if(updateType=="hint_window_message"){
                    var builder = new CTATTutorMessageBuilder();
                    var msg = builder.createHintMessage([input], new CTATSAI(), 32, transactionID);
                    msg = CTATMsgType.setProperty(msg, CTATTutorMessageBuilder.TRIGGER, "DATA");
                    msg = CTATMsgType.setProperty(msg, CTATTutorMessageBuilder.SUBTYPE, CTATTutorMessageBuilder.TUTOR_PERFORMED);

                    CTAT.ToolTutor.sendToInterface(msg);
                }
                else if(updateType=="write_text"){
                    document.getElementById("OLM").style.visibility = "visible";
                    document.getElementById("OLM").innerHTML = input;

                }
                else if(updateType=="write_text_cumulative"){
                    document.getElementById("OLMcumulative").style.visibility = "visible";
                    document.getElementById("OLMcumulative").innerHTML = input;
                }
                else if(updateType=="interface_action"){
                    var sai = new CTATSAI(input[0], input[1], input[2]);
                    var builder = new CTATTutoringServiceMessageBuilder();
                    var msg = builder.createInterfaceActionMessage(transactionID, sai);
                    msg = CTATMsgType.setProperty(msg, CTATTutorMessageBuilder.TRIGGER, "DATA");
                    msg = CTATMsgType.setProperty(msg, CTATTutorMessageBuilder.SUBTYPE, CTATTutorMessageBuilder.TUTOR_PERFORMED);

                    CTAT.ToolTutor.sendToInterface(msg);
                }

            }

                
        };


    }
    return TransactionMailerUsers;
}; 

TransactionMailerUsers.sendTransaction = function(tx)
{
    TransactionMailerUsers.mailerPort.postMessage(tx);  // post to listener in other thread

    var tmUsers = TransactionMailerUsers.active;
    for(var i = 0; i < tmUsers; ++i)
    {
    tmUsers[i].postMessage(tx);
    }
};