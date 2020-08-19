// moreIsBetter a boolean, true if the correct option is the larger

function answers(q1, q2, c1, c2, commonamt, moreIsBetter, myName) {
    let me = this;
    myName = (myName || "ans");
    let sais = [];
    let e1 = (c1/q1)*commonamt;
    let e2 = (c2/q2)*commonamt;
    if(e1 != Math.round(e1)) e1=sprintf("%.2f", e1);
    if(e2 != Math.round(e2)) e2=sprintf("%.2f", e2);
    let choice = (moreIsBetter ? (e1 >= e2 ? e1 : e2) : (e1 <= e2 ? e1 : e2));

    let last=-1;
    sais.push(new CTATSAI("option1amt",  "UpdateTextField",   q1));
    sais.push(new CTATSAI("option2amt",  "UpdateTextField",   q2));
    sais.push(new CTATSAI("option1cost", "UpdateTextField",   c1));
    sais.push(new CTATSAI("option2cost", "UpdateTextField",   c2));
    sais.push(new CTATSAI("commonamt",   "UpdateTextField",   commonamt));
    sais.push(new CTATSAI("option1end",  "UpdateTextField",   e1));
    sais.push(new CTATSAI("option2end",  "UpdateTextField",   e2));
    sais.push(new CTATSAI("radioGroup",  "UpdateRadioButton", (choice == e1 ? "option1radio: Option 1" :  "option2radio: Option 2")));
    sais.push(new CTATSAI("done",        "ButtonPressed",     "completeSequence"));

    this.send = function(n, k) {
        if(n===null || isNaN(n))
            throw new Error("send: bad argument n="+n+";");
        if(n>=sais.length)
            throw new Error("Past last step "+n);
        if(k == null) {
            CTATCommShell.commShell.processComponentAction(sais[n]);
            return "Sent sai ["+n+"]: "+sais[n].toString();
        }
        try {
            let rtn = "";
            for(k = Number(k) + n; n < k; ++n)
                rtn += (rtn ? "\n" : "") + me.send(n);
            return rtn;
        } catch(e) {
            return e.message;
        }
    }
    this.next = function() { return me.send(++last); };
    this.rest = function() { while(last<sais.length-1) me.next(); return me.next(); }
    this.all = function() { let s=""; for(let i = 0; i<sais.length-1; ++i) s=s+me.send(i)+"\n"; return s+me.send(sais.length-1); }
    this.list = function() {
        let s="";
        for(let i=0; i<sais.length; ++i) {
            s=sprintf("%s[%d] %-11.11s %-17.17s %s\n", s, i, sais[i].getSelection(), sais[i].getAction(), sais[i].getInput());
        }
        console.log(s);
    }

    /** {string} help message */
    this.help = function() {
        console.log("Enter "+myName+".list() to see the list of preset answers;\n      "+myName+".next() to do the next step;\n      "+myName+".rest() to do the remaining;\n      "+myName+".all() to do all;\n      "+myName+".send(n) to send the nth step;\n      "+myName+".send(n, k) to send k steps starting with the nth;\n      "+myName+".help() to see this list again");
    }

    me.help();
    me.list();
}

$(window).on("load", ()=>{console.log("\n*** To get preset answers, enter ***\n    var ans = new answers(count1, count2, cost1, cost2, commonAmt, booleanMoreIsBetter);")});
