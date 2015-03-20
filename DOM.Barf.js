/*
  Despite the name, this is a useful and straightforward library for
  generating a string representation from a composition of Barf functions

  Example:

  var _s = DOM.Barf;

  //Standard barf, without shortcuts
  var output = _s.SpitOut("div", {}, [
    _s.SpitOut("a", {href: "http://www.example.com"}, [
          _s.SpitOut("p", {style: {fontSize: "12px"}}, [
            "Hello World!"
          ])
    ])
  ]);
  console.log(output);

  //example with shortcuts
  var output = _s.div({}, [
    _s.a({href: "http://www.example.com"}, [
          _s.p({style: {fontSize: "12px"}}, [
            "Hello World!"
          ]),
          _s.p({}, "More hellos!"),
    ])
  ]);
  console.log(output);

  //Example of injecting a style sheet into the head

  document.head.innerHTML += _s.style(null, [
    ToCss("body", {
      backgroundColor: "#1d1d1d",
      position: "relative",
      width: "100%",
      height: "100%",
    })
  ])

  Dependencies:

  - es5shim (IE9+ support)
  - console shims

*/

var DOM = DOM || {};
DOM.Barf = DOM.Barf || {};

(function(context) {
    context.VERSION = "0.1.0";
    
    /*
      This is the raw input method to barf / spit out a string
      representation of XML. This forms the representation: 
      <tagName {parseTagAttributes()}>{parseTagChildren()}</tagName>

      Keyword Arguments:

      tagName -- the tag of our XML element
      
      tagAttributes -- a dictionary listing of XML attributes for the current tag

      tagChildren -- a list of other DOM.Barf functions which are
      concatenated to fill this current DOM string.

      Optional Arguments:

      bSingular -- whether the given XML element is singular. Namely,
      it has a forward flash, and no children. ex. meta tags --> <meta /> 
      [default: false]

      bConvertCamelCase -- determines whether attributes, and listed
      attribute style's names are converted from camelcase is
      converted to the equivalent dash-named, which is common in html
      attributes. ex. EquivHtmlTerm --> equiv-html-term.
      [default: true]

    */
    context.SpitOut = function(tagName, tagAttributes, tagChildren, options) {
        //defaults for tag attributes
        if (tagAttributes === undefined || tagAttributes === null) {
            tagAttributes = {};
        }
        else if (typeof tagAttributes !== "object") {
            console.warn("tag attributes does not form a dictionary: ", tagAttributes);
            console.warn("removing attributes");
            tagAttributes = {};
        }
        
        //defaults for tag children
        if (tagChildren === undefined || tagChildren === null) {
            tagChildren = "";
        }
        else if (typeof tagChildren !== "object" && typeof tagChildren !== "string") {
            console.warn("tag children must be a list object: ", tagChildren);
            console.warn("removing children");
            tagChildren = "";
        }
        
        if (options === undefined) {
            options = {};
        }

	//determines if we treat the current element as a singular element.
	//this means we ignore the children, and put a forwards slash
	//example meta tags --> <meta />
	options.bConvertCamelCase = (options.bConvertCamelCase !== undefined) ? (options.bConvertCamelCase) : true;
	options.bSingular = (options.bSingular !== undefined) ? (options.bSingular) : false;
	
        var attributesString = parseTagAttributes(tagAttributes, options);
        var childrenString = parseTagChildren(tagChildren, options);

	if (options.bSingular) {
	    var startingTag = "<" + tagName + attributesString + ">";
	    return startingTag;
	}
	else {
	    var startingTag = "<" + tagName + attributesString + ">";
	    var endingTag = "</" + tagName + ">";
            return  startingTag + childrenString + endingTag;
	}
    }
    
    /*
      
     */
    var parseTagAttributes = function(attrs, options) {
        var outputString = "";
        for (var key in attrs) {
            if (!attrs.hasOwnProperty(key)) continue;
            
            var value = attrs[key];
            //if the value is a string, just concatenate
            if (typeof value === "string") {
		key = (options.bConvertCamelCase) ? convertCamelCaseToDashed(key) : key;
                outputString += " " + key + "=" + "\"" + value + "\"";
                continue;
            }
            //we treat an object as a css separated set of values for convenience
            else if (typeof value === "object") {
                cssOutput = parseCssOutput(value, options);
                outputString += " " + key + "=" + "\"" + cssOutput + "\"";
		continue;
            }
	    else if (value === null) {
		outputString += " " + key;
	    }
	    
        }
        
        return outputString;
    }

    var parseCssOutput = function(attrs, options) {
        var cssOutput = "";
        for (var cssKey in attrs) {
            if (!attrs.hasOwnProperty(cssKey)) continue;
            
            var cssValue = attrs[cssKey];
	    cssKey = (options.bConvertCamelCase) ? convertCamelCaseToDashed(cssKey) : cssKey;
            cssOutput += cssKey + ":" + cssValue + ";";
        }
        return cssOutput;
    }
    
    var parseTagChildren = function(children, options) {
        if (typeof children === "string") {
            return children;
        }
	
        //concatenate the children, assuming they're children
        return children.reduce(function(a,b) {
            return a + b;
        }, "");
    }

    var convertCamelCaseToDashed = function(s) {
        return s.replace(/([A-Z])/g, "-$1").toLowerCase();
    }

    var toSpit = function(tag, passedOptions) {
	passedOptions = passedOptions || {};
        return function(attrs, children, options) {
	    options = options || {};
	    for (key in passedOptions) {
		if (!passedOptions.hasOwnProperty(key)) continue;
		if (!options.hasOwnProperty(key)) {
		    options[key] = passedOptions[key];
		}
	    }
            return context.SpitOut(tag, attrs, children, options);
        };
    }
    context.toSpit = toSpit;
    
    /* bunch of DOM shortcut functions */
    context.html = toSpit("html");
    context.head = toSpit("head");
    context.title = toSpit("title");
    context.body = toSpit("body");
    context.div = toSpit("div");
    context.h1 = toSpit("h1");
    context.h2 = toSpit("h2");
    context.h3 = toSpit("h3");
    context.h4 = toSpit("h4");
    context.h5 = toSpit("h5");
    context.img = toSpit("img", {bSingular:true});
    context.a = toSpit("a");
    context.b = toSpit("b");
    context.span = toSpit("span");
    context.p = toSpit("p");
    context.input = toSpit("input");
    context.button = toSpit("button");
    context.table = toSpit("table");
    context.tr = toSpit("tr");
    context.td = toSpit("td");
    context.li = toSpit("li");
    context.ul = toSpit("ul");
    context.style = toSpit("style");
    context.script = toSpit("script");
    context.meta = toSpit("meta", {bSingular:true});

    /* Small Function for performing the stylesheet output */
    context.ToCss = function(name, attrs) {
	var options = { bConvertCamelCase: true };
        return name + " {" + parseCssOutput(attrs, options) + "} ";
    }

    /*
      simply concatenates the list of children
     */
    context.ToRaw = function(children) {
	return parseTagChildren(children);
    }

    /*
      Merges the object attributes from b into a
     */
    context.Merge = function(a, b) {
        for (key in b) {
            if (b.hasOwnProperty(key)) {
                if (typeof a[key] == "object" && typeof b[key] == "object") {
                    a[key] = merge(a[key], b[key]);
                }
                else {
                    a[key] = b[key];
                }
            }
        }
	return a;
    }

    context.ToDOMNode = function(s) {
	var wrapper = document.createElement("div");
	wrapper.innerHTML = s;
	return wrapper.firstChild;
    }
    
})(DOM.Barf);

//testing
/*
var _s = DOM.Barf;

var output = _s.SpitOut("div", {}, [
    _s.SpitOut("a", {href: "http://www.example.com"}, [
        _s.SpitOut("p", {style: {fontSize: "12px"}}, [
            "Hello World!"
        ])
    ])
]);

console.log(output);

var output = _s.div({}, [
    _s.a({href: "http://www.example.com"}, [
        _s.p({style: {fontSize: "12px"}}, [
            "Hello World!"
        ]),
        _s.p({}, "More hellos!"),
    ])
]);

console.log(output);
console.log(_s.a({href: "http://test.com"}));
*/
