;(function (window, document, undefined) {
    var globV = {
        //maintain status of cntrl button pressed
        cntrlPrsd: false,
        ctrl: false,
        alt: false,
        //maintain status of initialized and binded
        initialized: false,
        binded: false,
        selector: ''
    },
        //cache dom elements
        getDom = function (id) {
            if (!globV[id]) {
                globV[id] = document.getElementById(id);
            }
            return globV[id];
        }



        //return a findR object
    var findR = function (selector) {
        findR.fn.eventAssigner(window, 'load', function () {
            findR.fn.init(selector);
        });
    }

    //create protype of findR
    findR.fn = findR.prototype = {
        init: function (selector) {
            if (!selector || selector == document) {
                selector = document.getElementsByTagName('body')[0];
            } else {
                selector = document.getElementById(selector);
            }


            if (!selector) return;
            this.selector = selector;

            if (!globV.binded) {
                globV.binded = true;

                //add html
                this.addHtml();

                //to bind events
                this.bindKeyEvent();
            }

            //to bind click event on instance
            this.eventAssigner(selector, 'click', function () {
                if (!globV.initialized) {
                    //to make initialze flag true
                    globV.initialized = true;

                    //to change selector
                    globV.selector = selector;
                }
            });

        },
        eventAssigner: function (elm, events, callback) {
            //for all browser other than ie
            if (window.addEventListener) {
                elm.addEventListener(events, callback, false)
            }
            //for ie	
            else {
                elm.attachEvent(events, callback)
            }
        },
        eventRemove: function (elm, events, callback) {
            //for all browser other than ie

            if (window.removeEventListener) {
                elm.removeEventListener(events, callback)
            }

            //for ie	
            else {
                elm.detachEvent(events, callback);
            }

        },
        bindKeyEvent: function () {

            //objects
            //find textbox
            var findT = getDom('findTextbx'),

                eventCallback = function (e) {

                    if (!globV.cntrlPrsd || !globV.selector) return;

                    //to stop default exection
                    e.preventDefault();

                    var keyCode = e.keyCode;

                    //for find
                    if (keyCode == 70) {
                        //to open find and box
                        findR.fn.openToolbar();
                    }
                    if (keyCode == 78) {
                        findR.fn.focusNext();
                    }
                    if (keyCode == 80) {
                        findR.fn.focusPrev();
                    }
                    if (keyCode == 82) {
                        findR.fn.replaceMethod();
                    }

                }


                //to bind event on all keys
            this.eventAssigner(document, 'keydown', eventCallback);

            //bind key event on cntrl
            this.eventAssigner(document, 'keydown', function (e) {
                if (e.keyCode == 17) {
                    globV.ctrl = true;
                } else if (e.keyCode == 18) {
                    globV.alt = true;
                }
                //to make cntrlPrsd flag true to denote to take special action on key press
                globV.cntrlPrsd = globV.ctrl && globV.alt;
            });
            this.eventAssigner(document, 'keyup', function (e) {
                if (e.keyCode == 17) {
                    globV.ctrl = false;
                } else if (e.keyCode == 18) {
                    globV.alt = false;
                }

                //to make cntrlPrsd flag false
                globV.cntrlPrsd = globV.ctrl && globV.alt;

            });


            //bind key event on text box
            this.eventAssigner(findT, 'keyup', function (e) {
                if (e.keyCode != 17 && e.keyCode != 18) {
                    findR.fn.findTEvent();
                }
            });

            //bind event on replace button
            this.eventAssigner(getDom('replaceButn'), 'click', function () {
                findR.fn.replaceMethod();
            });

            //bind event on replace all button
            this.eventAssigner(getDom('replaceAllButn'), 'click', function () {
                findR.fn.replaceMethod(true);
            });

            //assign event on close button
            this.eventAssigner(getDom('closeFrToolbar'), 'click', function () {
                getDom('frToolbar').style.display = 'none';
                globV.initialized = false;
            });

        },

        openToolbar: function () {
            var frToolbar = getDom('frToolbar');

            frToolbar.style.display = "block";

            //to initialize/reinitialize wrappers
            this.wrapTextNodes();

        },
        wrapTextNodes: function () {
            var nodes = [];
            //get all nodes

            function findNodes(element) {
                var childNodes = element.childNodes;
                if (childNodes.length > 0) {
                    for (var i = 0, ln = childNodes.length; i < ln; i++) {
                        var elm = childNodes[i];

                        //to remove find toolbar from searched
                        if (elm.id == 'frToolbar') {
                            continue;
                        } else if (elm.nodeType == Node.TEXT_NODE) {
                            if (nodes.indexOf(elm) == -1) {
                                nodes.push(elm);

                                //if element is not already wrapped wrap text node to an span
                                if (elm.parentNode.className != 'findRTextWrapper' && elm.parentNode.parentNode.className != 'findRTextWrapper') {
                                    var newNode = document.createElement('span');
                                    newNode.setAttribute('class', 'findRTextWrapper');
                                    newNode.textContent = elm.textContent;
                                    elm.parentNode.insertBefore(newNode, elm);
                                    elm.parentNode.removeChild(elm);
                                }
                            }
                        } else {
                            findNodes(elm);
                        }
                    }
                }
            }

            //to get nodes
            findNodes(globV.selector);
            //store wrapper in this
            this.findRTextWrapper = document.getElementsByClassName('findRTextWrapper');


        },
        findTEvent: function () {
            if (globV.cntrlPrsd) return;

            var str = getDom('findTextbx').value,
                regexSearch = getDom('regexSearch').checked,
                matchCase = getDom('matchCase').checked,
                flag = matchCase ? 'g' : 'gi',
                regEx;

            //to change str according to regexSearch flag
            str = regexSearch ? str : this.escapeRegExp(str);

            //have an fallback for regex so error should not come	
            try {
                regEx = new RegExp('&[^;]+;|(' + str + ')', flag);
            } catch (e) {
                regEx = new RegExp('()', flag);
            };


            //loop on all text node and search for string
            var findRTextWrapper = this.findRTextWrapper,
                hltRegEx = /<span class="findRhighlighted">(.*?)\<\/span>/g,

                hltRegEx2 = /<span class="findRhighlighted findRhighlightedFocused">(.*?)<\/span>/g;


            for (var i = 0, ln = findRTextWrapper.length; i < ln; i++) {
                var elm = findRTextWrapper[i],
                    elmContent = elm.innerHTML;

                //to make already highlighted to normal
                elmContent = elmContent.replace(hltRegEx, '$1');
                elmContent = elmContent.replace(hltRegEx2, '$1');

                //if str is empty continue
                if (str == '') {
                    elm.innerHTML = elmContent;
                    continue;
                }

                //to highlight new text
                elmContent = elmContent.replace(regEx, function ($0, $1) {
                    return $0 == $1 ? '<span class="findRhighlighted">' + $1 + '</span>' : $0;
                });

                elm.innerHTML = elmContent;

            }

            //to add focused class on first one
            var selectedElm = document.getElementsByClassName('findRhighlighted');
            if (selectedElm.length != 0) {
                selectedElm[0].className = "findRhighlighted findRhighlightedFocused";
            }

            //store selected elmenet and focused elem on this
            this.selectedElm = selectedElm;
            this.focusedElm = document.getElementsByClassName('findRhighlightedFocused');

            this.scrollToFocus();

        },
        //replace method
        replaceMethod: function (allElm) {
            //replace string 
            var rstr = getDom('replaceTextbx').value;

            if (allElm) {
                var elm = this.selectedElm;
            }
            //replace and got to next
            else {
                var elm = this.focusedElm;

            }

            for (var i = 0, ln = elm.length; i < ln; i++) {
                elm[i].innerHTML = rstr;
            }

            //to goto next elemnet if one element to be replaced
            if (!allElm) {
                this.focusNext();
            }

        },


        focusNext: function () {
            var selElm = this.selectedElm,
                elmFoc = this.focusedElm[0],
                index = this.getIndexElm(selElm, elmFoc);

            //to make it circular
            if (index == selElm.length - 1) {
                index = -1;
            }

            elmFoc.className = "findRhighlighted";
            selElm[index + 1].className = "findRhighlighted findRhighlightedFocused";

            //to go to selected area		
            this.focusedElm = document.getElementsByClassName('findRhighlightedFocused');
            this.scrollToFocus();
        },
        focusPrev: function () {
            var selElm = this.selectedElm,
                elmFoc = this.focusedElm[0],
                index = this.getIndexElm(selElm, elmFoc);


            //to make it circular
            if (index == 0) {
                index = selElm.length;
            }

            elmFoc.className = "findRhighlighted";
            selElm[index - 1].className = "findRhighlighted findRhighlightedFocused";

            //to go to selected area

            this.focusedElm = document.getElementsByClassName('findRhighlightedFocused');
            this.scrollToFocus();
        },


        getIndexElm: function (collection, elm) {
            for (var i = 0, ln = collection.length; i < ln; i++) {
                if (collection[i] == elm) return i;
            }
            return -1;
        },
        escapeRegExp: function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },

        findPos: function (obj) {
            var curtop = 0;
            if (obj.offsetParent) {
                do {
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return [curtop];
            }
        },
        scrollToFocus: function () {
            var obj = this.focusedElm[0];

            if (obj) {
                var offsetTop = this.findPos(obj);
                window.scroll(0, offsetTop);
            }
        },
        addHtml: function () {
            if (!getDom('frToolbar')) {
                var findRtoolbar = document.createElement('div');
                findRtoolbar.innerHTML = 'Find :<input type="textbox" id="findTextbx"/> &nbsp;&nbsp; Replace:<input type="textbox" id="replaceTextbx"/> &nbsp;&nbsp; Match Cases:<input type="checkbox" id="matchCase" checked="checked" /> &nbsp;&nbsp; Regex Search:<input type="checkbox" id="regexSearch"  /> <input type="button" id="replaceButn" value="Find And Replace"/>&nbsp; &nbsp;<input type="button" id="replaceAllButn" value="Replace All"/> &nbsp;&nbsp;&nbsp;<span id="closeFrToolbar">&times;</span> ';
                findRtoolbar.id = "frToolbar";
                findRtoolbar.setAttribute('class', 'findRtoolbar');

                document.getElementsByTagName('body')[0].appendChild(findRtoolbar);
            }
        }

    };

    //make findR global
    window.findR = findR;
})(window, document);