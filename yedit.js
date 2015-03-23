// ==UserScript==
// @name           Y! Edit
// @namespace      timw.com
// @include        http://*.store.yahoo.net/RT/NEWEDIT*
// @version        1.2
// @copyright      2013 Tim Whitacre
// ==/UserScript==

var atags = document.getElementsByTagName("a");
for (var i = 0, j = atags.length; i < j; i++) {
    if (atags[i].title == "Publish") {
        var iTag = atags[i].firstChild;
        if ((iTag.nodeType == 1) && (iTag.getAttribute("alt") == "Publish")) {
            atags[i].innerHTML = ""
        }
    }
}
try {
    function getAcctID() {
        var parseAcct = /\/NEWEDIT(?:-CM)?\.([^\/]*)/;
        var acctTemp = document.location.href.match(parseAcct);
        return (acctTemp) ? acctTemp[1] : null;
    }
    var yID = getAcctID();
    var storeEdit = (document.title == "Yahoo Store Editor");
    var varEdit = (document.body.innerHTML.indexOf("yb32.gif") > -1);
    var editMode = (storeEdit && !varEdit);
    var quickLinks = null;
    var quickLinksPrefix = null;
    var parseLoc = document.location.href.match(/\.store\.yahoo\.net\/RT\/NEWEDIT(?:\-CM)?\.([^\/]*)\/[^\/]*\/([^\?\#]*)/);
    if (parseLoc) {
        quickLinks = [
            ["Home Page", "index.html"],
            ["Site Map", "ind.html"],
            ["Store Manager", "http://us-dc1-edit.store.yahoo.com/RT/MGR." + yID]
        ];
        if (parseLoc[1] && parseLoc[2] && !parseLoc[2].match(/\./)) {
            quickLinksPrefix = {};
            var lastTemplate = GM_getValue(parseLoc[1] + "_lastTemplate");
            var prevTemplate = GM_getValue(parseLoc[1] + "_prevTemplate");
            for (var i in quickLinksPrefix) {
                switch (quickLinksPrefix[i][1].replace((parseLoc[2] + "?e="), "")) {
                    case lastTemplate:
                    case prevTemplate:
                        delete quickLinksPrefix[i];
                }
            }
            if (lastTemplate) {
                quickLinksPrefix.last = [lastTemplate, (parseLoc[2] + "?e=" + lastTemplate)];
            }
            if (prevTemplate) {
                quickLinksPrefix.prev = [prevTemplate, (parseLoc[2] + "?e=" + prevTemplate)];
            }
        }
    }

    function assignHotKeys(keyMap) {
        for (var i in keyMap) {
            keyMap[i].title += (" [Alt + Shift + " + i + "]");
            if (window.setLastCmd) {
                keyMap[i].addEventListener("click", setLastCmd, false);
            }
            if (keyMap[i].tagName.toLowerCase() == 'a') {
                document.addEventListener("keydown", function(ev) {
                    var jsRegex = /^javascript:/,
                        jsFunc = function() {}, returnVal = true,
                        tmpKey = String.fromCharCode(ev.keyCode).toLowerCase();
                    if (ev.altKey) {
                        ev.preventDefault();
                    }
                    if (ev.altKey && keyMap[tmpKey]) {
                        keyMap
                        if (returnVal) {
                            window.location.href = keyMap[tmpKey].href;
                        }
                    }
                }, false);
            } else {
                keyMap[i].accessKey = i;
            }
        }
    }
    if (editMode) {
        var templateEdit = 0;
        var aList = document.getElementsByTagName('a');
        var bList = document.getElementsByTagName('b');
        var preList = document.getElementsByTagName('pre');
        var pnls = [];
        var ctrls = [];
        var stkCtrls = [];
        var libCtrls = [];
        var stack = false;
        var callBy = false;
        var addFilterStaged = false;

        function isCtrl(ch) {
            if (ch && !ctrls[ch] && !stkCtrls[ch] && !libCtrls[ch]) {
                return true
            }
            return false;
        }
        for (var i = 0, j = aList.length; i < j; i++) {
            switch (aList[i].title) {
                case "Copy Template":
                    if (!callBy) {
                        templateEdit++;
                        try {
                            callBy = aList[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                            do {
                                callBy = callBy.nextSibling;
                            } while (callBy.nextSibling && !((callBy.nextSibling.nodeType == 1) && callBy.nextSibling.childNodes));
                        } catch (err) {};
                    }
                    break;
                case "Delete Template":
                    if (templateEdit == 1) {
                        templateEdit++;
                    }
                    break;
                case "Contents":
                    if (!pnls[aList[i].title]) {
                        pnls[aList[i].title] = aList[i]
                    }
                    break;
                case "Variables":
                    if (!pnls[aList[i].title]) {
                        pnls[aList[i].title] = aList[i];
                    }
                    break;
                case "Files":
                    if (!pnls[aList[i].title]) {
                        pnls[aList[i].title] = aList[i];
                    }
                    break;
                case "Templates":
                    if (!pnls[aList[i].title]) {
                        pnls[aList[i].title] = aList[i];
                    }
                    break;
                case "Edit":
                    if (isCtrl('e')) {
                        ctrls['e'] = aList[i];
                    }
                    break;
                case "Cut":
                    if (isCtrl('x')) {
                        ctrls['x'] = aList[i];
                    }
                    break;
                case "Copy":
                    if (isCtrl('c')) {
                        ctrls['c'] = aList[i];
                    }
                    break;
                case "New":
                    if (isCtrl('a')) {
                        ctrls['a'] = aList[i];
                    }
                    break;
                case "Paste After":
                    if (isCtrl('f')) {
                        ctrls['f'] = aList[i];
                    }
                    break;
                case "Paste Within":
                    if (isCtrl('v')) {
                        ctrls['v'] = aList[i];
                    }
                    break;
                case "Replace":
                    if (isCtrl('r')) {
                        ctrls['r'] = aList[i];
                    }
                    break;
                case "Contract":
                    if (isCtrl('q')) {
                        ctrls['q'] = aList[i];
                    }
                    break;
                case "Expand":
                    if (isCtrl('q')) {
                        ctrls['q'] = aList[i];
                    }
                    break;
                case "Delete":
                    if (isCtrl('d')) {
                        stkCtrls['d'] = aList[i];
                    }
                    break;
                case "To Top":
                    if (isCtrl('t')) {
                        stkCtrls['t'] = aList[i];
                    }
                    break;
                case "Clear":
                    if (!stack) {
                        try {
                            stack = aList[i].parentNode.parentNode.parentNode.parentNode.parentNode;
                            if (isCtrl('s')) {
                                stkCtrls['s'] = aList[i + 1];
                            }
                        } catch (err) {};
                    }
                    break;
                case "Upload":
                    addFilterStaged = true;
                    if (isCtrl('u')) {
                        libCtrls['u'] = aList[i];
                    }
                    break;
            }
        }

        function getAcctID() {
            var parseAcct = /\/NEWEDIT(?:-CM)?\.([^\/]*)/;
            var acctTemp = document.location.href.match(parseAcct);
            return (acctTemp) ? acctTemp[1] : null;
        }

        function jumpToLast() {
            try {
                var acctId = getAcctID();
                var lastTemplate = GM_getValue(acctId + "_lastTemplate");
                var currTemplate = (bList && (bList.length > 0)) ? bList[0].firstChild.nodeValue.toLowerCase() : null;
                var lastPos = 0;
                if (currTemplate) {
                    if (lastTemplate) {
                        if (lastTemplate != currTemplate) {
                            GM_setValue(acctId + "_prevTemplate", lastTemplate);
                            GM_setValue(acctId + "_lastTemplate", currTemplate);
                        } else {
                            if (quickLinksPrefix) {
                                delete quickLinksPrefix.last;
                            }
                        }
                    } else {
                        GM_setValue(acctId + "_lastTemplate", currTemplate);
                    }
                    document.getElementsByTagName("body")[0].addEventListener("click", setLastPos, false);
                    if (lastTemplate && (lastTemplate == currTemplate)) {
                        lastPos = GM_getValue(acctId + "_lastPos");
                        scroll(0, lastPos);
                    }
                }
                if (preList && preList[0].getElementsByTagName) {
                    var b = preList[0].getElementsByTagName('b');
                    if (b && b[0]) {
                        var currNode = b[0];
                        GM_setValue(acctId + "_lastFocus", currNode.offsetTop);
                        do {
                            currNode = currNode.nextSibling;
                        } while (currNode && (!currNode.tagName || (currNode.tagName.toLowerCase() !== "a")));
                        if (currNode && currNode.tagName && (currNode.tagName.toLowerCase() === "a")) {
                            currNode.focus();
                        } else {
                            currNode = b[0];
                            do {
                                currNode = currNode.previousSibling;
                            } while (currNode && (!currNode.tagName || (currNode.tagName.toLowerCase() !== "a")));
                            if (currNode && currNode.tagName && (currNode.tagName.toLowerCase() === "a")) {
                                currNode.focus();
                            }
                        }
                    } else {
                        var a = preList[0].getElementsByTagName('a');
                        var targPos = GM_getValue(acctId + "_lastFocus") || lastPos;
                        for (var i = 0, j = a.length; i < j; i++) {
                            if (i < (j - 1)) {
                                if (a[i].offsetTop >= targPos) {
                                    if (i !== 0) {
                                        a[i - 1].focus();
                                    } else {
                                        a[i].focus();
                                    }
                                    break;
                                }
                            } else {
                                a[i].focus();
                            }
                        }
                    }
                }
            } catch (err) {};
        }

        function setLastPos() {
            var acctId = getAcctID();
            GM_setValue(acctId + "_lastPos", window.scrollY);
        }

        function setLastCmd(ev) {
            var acctId = getAcctID();
            if (this.title) {
                if (this.title.match(/^Select/)) {
                    var lastCmd = "";
                    try {
                        lastCmd = "^^" + this.firstChild.nodeValue;
                    } catch (err) {}
                    var stackMatch = this.title.match(/^(.*)\^\^FromStack$/);
                    lastCmd = (stackMatch) ? (stackMatch[1] + lastCmd + "^^FromStack") : (this.title + lastCmd);
                    GM_setValue(acctId + "_lastCmd", lastCmd);
                } else {
                    GM_setValue(acctId + "_lastCmd", this.title);
                }
            }
        }

        function addLastCmdSetter(obj, suffix) {
            if (obj) {
                var objAs = obj.getElementsByTagName('a');
                for (var i = 0, j = objAs.length; i < j; i++) {
                    if (suffix) {
                        objAs[i].setAttribute("title", (objAs[i].getAttribute("title") + suffix));
                    }
                    objAs[i].addEventListener("click", setLastCmd, false);
                }
            }
        }

        function afixHolster() {
            var ctrlsHolster = document.createElement("div");
            with(ctrlsHolster.style) {
                width = "360px";
                position = "fixed";
                bottom = "30px";
                right = "30px";
                zIndex = "100";
                border = "solid 1px #000";
                backgroundColor = "#405580";
            }
            document.getElementsByTagName("body")[0].appendChild(ctrlsHolster);
            return ctrlsHolster;
        }

        function afixName(obj) {
            var b = (bList && (bList.length > 0)) ? bList[0] : false;
            if (b && (obj && obj.appendChild)) {
                var newB = b.cloneNode(true);
                newB.firstChild.nodeValue = newB.firstChild.nodeValue.toLowerCase();
                document.title = "scE: " + newB.firstChild.nodeValue;
                if (acctID) newB.firstChild.nodeValue = newB.firstChild.nodeValue.replace(acctID, "...");
                with(newB.style) {
                    display = "block";
                    position = "absolute";
                    top = "-24px";
                    left = "5px";
                    height = "14px";
                    width = "158px";
                    padding = "4px 6px";
                    textAlign = "center";
                    overflow = "hidden";
                    backgroundColor = "#F4F4F4";
                    border = "solid 1px #000";
                    font = "bold 12px Verdana, sans-serif";
                }
                obj.appendChild(newB);
            }
        }

        function afixCallBy(obj) {
            if (callBy && (callBy.nodeType == "3")) {
                var cbHolster = document.createElement("div");
                cbHolster.setAttribute("id", "callByHolster");
                with(cbHolster.style) {
                    display = "block";
                    position = "absolute";
                    top = "-24px";
                    left = "183px";
                    height = "22px";
                    width = "170px";
                    overflow = "hidden";
                    backgroundColor = "#F4F4F4";
                    border = "solid 1px #000";
                    font = "bold 12px Verdana, sans-serif";
                }
                var cbtitle = document.createElement("a");
                with(cbtitle.style) {
                    display = "block";
                    height = "14px";
                    padding = "4px 6px";
                    textAlign = "center";
                    borderBottom = "dashed 1px #000";
                    textDecoration = "none";
                    color = "#000";
                }
                cbtitle.setAttribute("href", "#");
                cbtitle.appendChild(callBy.cloneNode(true));
                cbHolster.appendChild(cbtitle);
                var linksHolster = document.createElement("div");
                with(linksHolster.style) {
                    display = "none";
                    height = "249px";
                    overflow = "auto";
                }
                do {
                    callBy = callBy.nextSibling;
                    if (callBy && (callBy.nodeType == "1")) {
                        var newA = callBy.cloneNode(true);
                        with(newA.style) {
                            display = "block";
                            height = "14px";
                            padding = "4px 6px";
                            fontSize = "11px";
                        }
                        newA.firstChild.nodeValue = newA.firstChild.nodeValue.toLowerCase();
                        if (acctID) newA.firstChild.nodeValue = newA.firstChild.nodeValue.replace(acctID, "...");
                        linksHolster.appendChild(newA);
                    }
                } while (callBy.nextSibling && !((callBy.nextSibling.nodeType == 1) && (callBy.nextSibling.tagName.toLowerCase() == "p")));
                cbHolster.appendChild(linksHolster);
                cbHolster.addEventListener("click", toggleCallBy, false);
                obj.appendChild(cbHolster);
            }
        }

        function afixCtrls(obj) {
            var ctrlsTable = false;
            for (var i in ctrls) {
                try {
                    ctrlsTable = ctrls[i].parentNode.parentNode.parentNode.parentNode;
                } catch (err) {};
                if (ctrlsTable) break;
            }
            if (ctrlsTable) {
                var ctrlsTableCopy = ctrlsTable.cloneNode(true);
                ctrlsTableCopy.style.margin = "auto";
                if (obj && obj.appendChild) {
                    obj.appendChild(ctrlsTableCopy);
                }
                addLastCmdSetter(ctrlsTable);
                addLastCmdSetter(ctrlsTableCopy);
            }
        }

        function afixPnls(obj) {
            var pnlsTable = false;
            for (var i in pnls) {
                try {
                    pnlsTable = pnls[i].parentNode.parentNode.parentNode.parentNode;
                } catch (err) {};
                if (pnlsTable) break;
            }
            if (pnlsTable) {
                var pnlsTableCopy = pnlsTable.cloneNode(true);
                try {
                    var pnlRow = pnlsTableCopy.firstChild.firstChild;
                    var pnlCells = pnlRow.childNodes;
                    for (var i = 0; i < pnlCells.length; i++) {
                        var tempPnl = pnlCells[i].firstChild;
                        if ((tempPnl.nodeType == 1) && !pnls[tempPnl.title]) {
                            pnlRow.removeChild(pnlCells[i--]);
                            if (tempPnl.title == "Controls") break;
                        }
                    }
                    pnlsTableCopy.style.margin = "auto";
                } catch (err) {};
                if (obj && obj.appendChild) {
                    obj.appendChild(pnlsTableCopy);
                }
            }
        }

        function afixStack(obj) {
            if (stack) {
                var stackCopy = stack.cloneNode(true);
                stackCopy.style.margin = "auto";
                addLastCmdSetter(stack);
                addLastCmdSetter(stackCopy);
                obj.appendChild(stackCopy);
                var stackImg = null;
                try {
                    stackImg = stackCopy.getElementsByTagName("img")[0];
                    if (stackImg.alt != "Stack") stackImg = false;
                } catch (err) {};
                var stackBody = null;
                try {
                    stackBody = document.getElementsByTagName("pre")[1];
                } catch (err) {};
                if (stackBody) {
                    var stackBodyCopy = stackBody.cloneNode(true);
                    addLastCmdSetter(stackBody, "^^FromStack");
                    addLastCmdSetter(stackBodyCopy, "^^FromStack");
                    var sbcHolster = document.createElement("div");
                    sbcHolster.setAttribute("id", "stackHolster");
                    with(sbcHolster.style) {
                        width = "340px";
                        padding = "0 5px";
                        height = "300px";
                        margin = "auto";
                    }
                    var acctId = getAcctID();
                    var lastCmd = GM_getValue(acctId + "_lastCmd");
                    var stackOpen = GM_getValue("stackOpen");
                    if (!stackOpen || !lastCmd.match(/^Cut|^Copy|^New|^Replace|^To Top|^Delete|\^\^FromStack$/)) sbcHolster.style.display = "none";
                    with(sbcHolster.style) {
                        border = "solid 1px #000";
                        backgroundColor = "#F4F4F4";
                        overflow = "auto";
                    }
                    sbcHolster.appendChild(stackBodyCopy);
                    obj.appendChild(sbcHolster);
                }
                if (stackImg && stackBodyCopy) {
                    try {
                        var siParent = stackImg.parentNode;
                        var siA = document.createElement("a");
                        siA.setAttribute("href", "#");
                        siA.addEventListener('click', toggleStack, false);
                        siParent.replaceChild(siA, stackImg);
                        siA.appendChild(stackImg);
                    } catch (err) {};
                }
            }
        }

        function toggleCallBy(ev) {
            var cbHolster = document.getElementById("callByHolster");
            try {
                var linkHolster = cbHolster.childNodes[1];
                if (linkHolster.style.display == "none") {
                    linkHolster.style.display = "block";
                    with(cbHolster.style) {
                        height = "272px";
                        top = "-274px";
                    }
                } else {
                    linkHolster.style.display = "none";
                    with(cbHolster.style) {
                        height = "22px";
                        top = "-24px";
                    }
                }
            } catch (err) {};
            var loc = document.location.href;
            var tar = ev.target;
            if ((loc == tar) || ((loc + "#") == tar)) {
                ev.preventDefault();
            }
        }

        function toggleStack(ev) {
            var sbHolster = document.getElementById("stackHolster");
            try {
                if (sbHolster.style.display == "none") {
                    sbHolster.style.display = "block";
                    GM_setValue("stackOpen", true);
                } else {
                    sbHolster.style.display = "none";
                    GM_setValue("stackOpen", false);
                }
            } catch (err) {};
            ev.preventDefault();
        }

        function sourceHighlight() {
            with(preList[0].style) {
                background = "url('http://h.timw.co/code/yedit/highBG.gif') repeat left top";
                border = "solid 1px #888"
            }
        }
        if (templateEdit > 1) {
            sourceHighlight();
            jumpToLast();
            addLastCmdSetter(preList[0]);
            assignHotKeys(ctrls);
            assignHotKeys(stkCtrls);
            var holster = afixHolster();
            var acctID = getAcctID();
            afixName(holster);
            afixCallBy(holster);
            afixPnls(holster);
            afixStack(holster);
            afixCtrls(holster);
        } else {
            try {
                if (bList && bList[0].firstChild && (bList[0].firstChild.nodeValue === "Lib Files")) {
                    assignHotKeys(libCtrls);
                }
            } catch (err) {}
        }
        var firstIns = new Array();
        var ins = document.getElementsByTagName("input");
        var oprForm = document.getElementsByTagName("form")[0];
        var oprSel = document.getElementsByTagName("select")[0];
        var pageType = "";
        for (var i = 0, j = ins.length; i < j; i++) {
            switch (ins[i].type) {
                case "text":
                    pageType = (firstIns.length > 0) ? "fileUpload" : "newOpr";
                    firstIns.push(ins[i]);
                    i = ins.length;
                    break;
                case "file":
                    pageType = "imgUpload";
                    firstIns.push(ins[i]);
                    break;
            }
        }

        function autoSubmit() {
            oprForm.submit();
        }

        function copyFileName() {
            try {
                var noDirs = /[^\\\/]*$/;
                firstIns[1].value = firstIns[0].value.match(noDirs)[0];
                firstIns[1].focus();
            } catch (err) {};
        }

        function selOpr() {
            if (findOpr()) {
                firstIns[0].value = "";
            }
        }

        function findOpr() {
            var returnVal = false;
            var parseOpr = /^;([^\d]*)([\d]*)/;
            var oprMatStr = firstIns[0].value.match(parseOpr);
            if (oprMatStr) {
                if (oprMatStr[1]) {
                    var oprOpts = oprSel.options;
                    var checkOpr = new RegExp(("^" + oprMatStr[1]), "i");
                    var oprMatches = 0;
                    var matchNum = oprMatStr[2];
                    if (!matchNum) {
                        matchNum = 0;
                    }
                    for (var i = 0, j = oprOpts.length; i < j; i++) {
                        if ((oprOpts[i].nodeType == 1) && oprOpts[i].firstChild.nodeValue.match(checkOpr) && ((++oprMatches) >= matchNum)) {
                            oprSel.selectedIndex = ((i + 10) >= oprOpts.length) ? (oprOpts.length - 1) : (i + 10);
                            oprSel.selectedIndex = i;
                            returnVal = true;
                            break;
                        }
                    }
                    if (!returnVal) {
                        if (matchNum) {
                            oprMatches = 0;
                            var tempMatchNum = Math.floor(matchNum / 10);
                            for (var i = 0, j = oprOpts.length; i < j; i++) {
                                if ((oprOpts[i].nodeType == 1) && oprOpts[i].firstChild.nodeValue.match(checkOpr) && ((++oprMatches) >= tempMatchNum)) {
                                    oprSel.selectedIndex = ((i + 10) >= oprOpts.length) ? (oprOpts.length - 1) : (i + 10);
                                    oprSel.selectedIndex = i;
                                    returnVal = true;
                                    break;
                                }
                            }
                            delete tempMatchNum;
                        }
                        if (!returnVal) {
                            for (var g = 0, h = (oprMatStr[1].length - 1); g < h; g++) {
                                var tmpOprMatStr = (oprMatStr[1].substr(0, g) + oprMatStr[1][g + 1] + oprMatStr[1][g] + oprMatStr[1].substr((g + 2), (h + 1)));
                                var checkOpr = new RegExp(("^" + tmpOprMatStr), "i");
                                for (var i = 0, j = oprOpts.length; i < j; i++) {
                                    if ((oprOpts[i].nodeType == 1) && oprOpts[i].firstChild.nodeValue.match(checkOpr) && ((++oprMatches) >= matchNum)) {
                                        oprSel.selectedIndex = ((i + 10) >= oprOpts.length) ? (oprOpts.length - 1) : (i + 10);
                                        oprSel.selectedIndex = i;
                                        returnVal = true;
                                        firstIns[0].value = (";" + tmpOprMatStr);
                                        break;
                                    }
                                }
                            }
                        }
                        if (!returnVal) {
                            var bestMatchIndex = 0;
                            var fuzz = -1;
                            var lastFuzz = -1;
                            var matchThis = oprMatStr[1].toLowerCase();
                            for (var i = 0, j = oprOpts.length; i < j; i++) {
                                if (oprOpts[i].nodeType == 1) {
                                    var testFuzz = 0;
                                    var testLastFuzz = -1;
                                    var testVal = oprOpts[i].firstChild.nodeValue.toLowerCase();
                                    var len = (matchThis.length < testVal.length) ? matchThis.length : testVal.length;
                                    for (var g = 0, h = len; g < h; g++) {
                                        if (matchThis[g] != testVal[g]) {
                                            testFuzz++;
                                            testLastFuzz = g;
                                        }
                                    }
                                    if (matchThis.length > testVal.length) {
                                        if (!testFuzz) {
                                            testLastFuzz = testVal.length;
                                        }
                                        testFuzz += (matchThis.length - testVal.length);
                                    }
                                    if ((fuzz < 0) || (fuzz > testFuzz) || ((fuzz == testFuzz) && (lastFuzz < testLastFuzz))) {
                                        bestMatchIndex = i;
                                        fuzz = testFuzz;
                                        lastFuzz = testLastFuzz;
                                    }
                                }
                            }
                            oprSel.selectedIndex = ((bestMatchIndex + 10) >= oprOpts.length) ? (oprOpts.length - 1) : (bestMatchIndex + 10);
                            oprSel.selectedIndex = bestMatchIndex;
                            returnVal = true;
                        }
                    }
                } else if (oprMatStr[2]) {
                    var optsLen = oprSel.options.length;
                    var matchNum = parseInt(oprMatStr[2]);
                    matchNum = (isNaN(matchNum) || (matchNum < 1)) ? 0 : ((matchNum >= optsLen) ? (optsLen - 1) : (matchNum - 1));
                    oprSel.selectedIndex = ((matchNum + 10) >= optsLen) ? (optsLen - 1) : (matchNum + 10);
                    oprSel.selectedIndex = matchNum;
                    returnVal = true;
                }
            }
            return returnVal;
        }

        function addDblClcks() {
            var oprOpts = oprSel.options;
            for (var i = 0, j = oprOpts.length; i < j; i++) {
                oprOpts[i].addEventListener("dblclick", clkOpr, false);
            }
        }

        function clkOpr() {
            firstIns[0].value = "";
            oprForm.submit();
        }

        function filterStaged(ev) {
            ev.preventDefault();
            var fileTable = oprForm.getElementsByTagName('table')[0];
            var trs = fileTable.getElementsByTagName('tr');
            for (var i = trs.length - 1; i >= 0; i--) {
                if (/Published/.test(trs[i].childNodes[trs[i].childNodes.length - 1].innerHTML)) {
                    trs[i].style.display = 'none';
                }
            }
            this.firstChild.nodeValue = 'Show All';
            this.removeEventListener('click', filterStaged, false);
            this.addEventListener('click', filterAll, false);
        }

        function filterAll(ev) {
            ev.preventDefault();
            var fileTable = oprForm.getElementsByTagName('table')[0];
            var trs = fileTable.getElementsByTagName('tr');
            for (var i = trs.length - 1; i >= 0; i--) {
                trs[i].style.display = '';
            }
            this.firstChild.nodeValue = 'Show only Staged';
            this.removeEventListener('click', filterAll, false);
            this.addEventListener('click', filterStaged, false);
        }
        if (pageType == "fileUpload") {
            firstIns[0].focus();
            firstIns[0].addEventListener("change", copyFileName, false);
        } else if (pageType == "newOpr") {
            firstIns[0].focus();
            if (oprForm && oprSel) {
                addDblClcks();
                oprForm.addEventListener("submit", selOpr, false);
                firstIns[0].addEventListener("keyup", findOpr, false);
            } else {
                firstIns[0].select();
            }
        } else if (pageType == "imgUpload") {
            firstIns[0].focus();
            firstIns[0].addEventListener("change", autoSubmit, false);
        } else if (addFilterStaged) {
            var filterLink = document.body.appendChild(document.createElement('a'));
            filterLink.setAttribute('href', '#');
            filterLink.style.position = 'fixed';
            filterLink.style.right = '0';
            filterLink.style.bottom = '0';
            filterLink.style.border = "solid 1px #000";
            filterLink.style.padding = "4px 6px";
            filterLink.style.backgroundColor = "#92B5E7";
            filterLink.style.zIndex = "20000";
            filterLink.style.font = "bold 11px Verdana, sans-serif";
            filterLink.style.textDecoration = "none";
            filterLink.style.color = "#fff";
            filterLink.appendChild(document.createTextNode('Show only Staged'));
            var filterCtrls = [];
            filterCtrls['s'] = filterLink;
            assignHotKeys(filterCtrls);
            filterLink.addEventListener('click', filterStaged, false);
        }
    } else {
        if (varEdit) {
            var varForm = document.getElementsByTagName("form");
            if (varForm = (varForm) ? varForm[0] : null) {
                var hkLink = varForm.appendChild(document.createElement("a"));
                hkLink.setAttribute("href", "javascript: var varForm=document.getElementsByTagName('form');if(varForm){document.body.appendChild(document.createTextNode('Saving...'));varForm[0].style.display='none';var varIns=varForm[0].getElementsByTagName('input');for(var i=0,j=varIns.length;i<j;i++){if(varIns[i].value==='Update'){var updateIn=varIns[i].cloneNode(true);updateIn.type='hidden';varForm[0].appendChild(updateIn);break;}}varForm[0].submit();varForm[0].onsubmit=function(){return false;};}");
                var varCtrls = [];
                varCtrls['s'] = hkLink;
                assignHotKeys(varCtrls);
            }
        }
    } if (parseLoc) {
        function toggleQuickLinks(ev) {
            var quickLinksOpen = GM_getValue("quickLinksOpen");
            if (quickLinksOpen) {
                GM_setValue("quickLinksOpen", false);
                shrinkQuickLinks(ev);
            } else {
                GM_setValue("quickLinksOpen", true);
                expandQuickLinks(ev);
            }
        }

        function killToggleQuickLinks(ev) {
            ev.stopPropagation();
        }

        function expandQuickLinks(ev) {
            var quickLinksOpen = GM_getValue("quickLinksOpen");
            if (!quickLinksOpen) {
                var cNs = this.getElementsByTagName("a");
                for (var i = 0, j = cNs.length; i < j; i++) {
                    cNs[i].style.display = "block";
                }
            }
        }

        function shrinkQuickLinks(ev) {
            var quickLinksOpen = GM_getValue("quickLinksOpen");
            if (!quickLinksOpen) {
                var cNs = this.getElementsByTagName("a");
                for (var i = 0, j = cNs.length; i < j; i++) {
                    cNs[i].style.display = "none";
                }
            }
        }

        function drawQuickLinks() {
            if (quickLinks) {
                var quickLinksHolster = document.createElement("div");
                with(quickLinksHolster.style) {
                    overflow = "hidden";
                    position = "fixed";
                    top = "0";
                    right = "0";
                    border = "solid 1px #000";
                    padding = "4px 6px";
                    backgroundColor = "#92B5E7";
                    zIndex = "20000";
                    font = "bold 11px Verdana, sans-serif";
                    textAlign = "right";
                    color = "#fff";
                }
                quickLinksHolster.addEventListener("mouseover", expandQuickLinks, false);
                quickLinksHolster.addEventListener("mouseout", shrinkQuickLinks, false);
                quickLinksHolster.addEventListener("click", toggleQuickLinks, false);
                document.getElementsByTagName("body")[0].appendChild(quickLinksHolster);
                quickLinksHolster.appendChild(document.createTextNode("Useful Links"));
                for (var i in quickLinksPrefix) {
                    quickLinks.push(quickLinksPrefix[i]);
                }
                for (var i = 0, j = quickLinks.length; i < j; i++) {
                    var tempA = document.createElement("a");
                    tempA.setAttribute("href", quickLinks[i][1]);
                    tempA.addEventListener("click", killToggleQuickLinks, false);
                    tempA.appendChild(document.createTextNode(quickLinks[i][0]));
                    var quickLinksOpen = GM_getValue("quickLinksOpen");
                    with(tempA.style) {
                        display = (quickLinksOpen) ? "block" : "none";
                        height = "14px";
                        fontSize = "11px";
                        padding = "4px 6px";
                        backgroundColor = "#F4F4F4";
                        border = "solid 1px #000";
                        textDecoration = "none";
                        color = "#000";
                        textAlign = "left";
                        whiteSpace = "nowrap";
                        marginTop = "4px";
                    }
                    quickLinksHolster.appendChild(tempA);
                }
                showHideQuickLinks(quickLinksHolster);
            }
        }
        drawQuickLinks();
    }
} catch (err) {}
