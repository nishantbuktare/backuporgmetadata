(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Docxtemplater = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("xmldom"),
    DOMParser = _require.DOMParser,
    XMLSerializer = _require.XMLSerializer;

var _require2 = require("./errors"),
    throwXmlTagNotFound = _require2.throwXmlTagNotFound;

function parser(tag) {
	return _defineProperty({}, "get", function get(scope) {
		if (tag === ".") {
			return scope;
		}
		return scope[tag];
	});
}

function unique(arr) {
	var hash = {},
	    result = [];
	for (var i = 0, l = arr.length; i < l; ++i) {
		if (!hash.hasOwnProperty(arr[i])) {
			hash[arr[i]] = true;
			result.push(arr[i]);
		}
	}
	return result;
}

function chunkBy(parsed, f) {
	return parsed.reduce(function (chunks, p) {
		var currentChunk = last(chunks);
		if (currentChunk.length === 0) {
			currentChunk.push(p);
			return chunks;
		}
		var res = f(p);
		if (res === "start") {
			chunks.push([p]);
		} else if (res === "end") {
			currentChunk.push(p);
			chunks.push([]);
		} else {
			currentChunk.push(p);
		}
		return chunks;
	}, [[]]).filter(function (p) {
		return p.length > 0;
	});
}

function last(a) {
	return a[a.length - 1];
}

var defaults = {
	nullGetter: function nullGetter(part) {
		if (!part.module) {
			return "undefined";
		}
		if (part.module === "rawxml") {
			return "";
		}
		return "";
	},
	overrideFont: false,
	xmlFileNames: [],
	parser: parser,
	delimiters: {
		start: "{",
		end: "}"
	}
};

function mergeObjects() {
	var resObj = {};
	var obj = void 0,
	    keys = void 0;
	for (var i = 0; i < arguments.length; i += 1) {
		obj = arguments[i];
		keys = Object.keys(obj);
		for (var j = 0; j < keys.length; j += 1) {
			resObj[keys[j]] = obj[keys[j]];
		}
	}
	return resObj;
}

function xml2str(xmlNode) {
	var a = new XMLSerializer();
	return a.serializeToString(xmlNode).replace(/xmlns:[a-z0-9]+="" ?/g, "");
}

function str2xml(str, errorHandler) {
	var parser = new DOMParser({ errorHandler: errorHandler });
	return parser.parseFromString(str, "text/xml");
}

var charMap = {
	"&": "&amp;",
	"'": "&apos;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;"
};

var regexStripRegexp = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
function escapeRegExp(str) {
	return str.replace(regexStripRegexp, "\\$&");
}

var charMapRegexes = Object.keys(charMap).map(function (endChar) {
	var startChar = charMap[endChar];
	return {
		rstart: new RegExp(escapeRegExp(startChar), "g"),
		rend: new RegExp(escapeRegExp(endChar), "g"),
		start: startChar,
		end: endChar
	};
});

function wordToUtf8(string) {
	var r = void 0;
	for (var i = 0, l = charMapRegexes.length; i < l; i++) {
		r = charMapRegexes[i];
		string = string.replace(r.rstart, r.end);
	}
	return string;
}

function utf8ToWord(string) {
	if (typeof string !== "string") {
		string = string.toString();
	}
	var r = void 0;
	for (var i = 0, l = charMapRegexes.length; i < l; i++) {
		r = charMapRegexes[i];
		string = string.replace(r.rend, r.start);
	}
	return string;
}

// This function is written with for loops for performance
function concatArrays(arrays) {
	var result = [];
	for (var i = 0; i < arrays.length; i++) {
		var array = arrays[i];
		for (var j = 0, len = array.length; j < len; j++) {
			result.push(array[j]);
		}
	}
	return result;
}

var spaceRegexp = new RegExp(String.fromCharCode(160), "g");
function convertSpaces(s) {
	return s.replace(spaceRegexp, " ");
}
function pregMatchAll(regex, content) {
	/* regex is a string, content is the content. It returns an array of all matches with their offset, for example:
 	 regex=la
 	 content=lolalolilala
 returns: [{array: {0: 'la'},offset: 2},{array: {0: 'la'},offset: 8},{array: {0: 'la'} ,offset: 10}]
 */
	var matchArray = [];
	var match = void 0;
	while ((match = regex.exec(content)) != null) {
		matchArray.push({ array: match, offset: match.index });
	}
	return matchArray;
}

function getRight(parsed, element, index) {
	for (var i = index, l = parsed.length; i < l; i++) {
		var part = parsed[i];
		if (part.value === "</" + element + ">") {
			return i;
		}
	}
	throwXmlTagNotFound({ position: "right", element: element, parsed: parsed, index: index });
}

function getLeft(parsed, element, index) {
	for (var i = index; i >= 0; i--) {
		var part = parsed[i];
		if (part.value.indexOf("<" + element) === 0 && [">", " "].indexOf(part.value[element.length + 1]) !== -1) {
			return i;
		}
	}
	throwXmlTagNotFound({ position: "left", element: element, parsed: parsed, index: index });
}

function isTagStart(tagType, _ref2) {
	var type = _ref2.type,
	    tag = _ref2.tag,
	    position = _ref2.position;

	return type === "tag" && tag === tagType && position === "start";
}
function isTagEnd(tagType, _ref3) {
	var type = _ref3.type,
	    tag = _ref3.tag,
	    position = _ref3.position;

	return type === "tag" && tag === tagType && position === "end";
}
function isParagraphStart(options) {
	return isTagStart("w:p", options) || isTagStart("a:p", options);
}
function isParagraphEnd(options) {
	return isTagEnd("w:p", options) || isTagEnd("a:p", options);
}
function isTextStart(part) {
	return part.type === "tag" && part.position === "start" && part.text;
}
function isTextEnd(part) {
	return part.type === "tag" && part.position === "end" && part.text;
}

function isContent(p) {
	return p.type === "placeholder" || p.type === "content" && p.position === "insidetag";
}

var corruptCharacters = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
// 00    NUL '\0' (null character)
// 01    SOH (start of heading)
// 02    STX (start of text)
// 03    ETX (end of text)
// 04    EOT (end of transmission)
// 05    ENQ (enquiry)
// 06    ACK (acknowledge)
// 07    BEL '\a' (bell)
// 08    BS  '\b' (backspace)
// 0B    VT  '\v' (vertical tab)
// 0C    FF  '\f' (form feed)
// 0E    SO  (shift out)
// 0F    SI  (shift in)
// 10    DLE (data link escape)
// 11    DC1 (device control 1)
// 12    DC2 (device control 2)
// 13    DC3 (device control 3)
// 14    DC4 (device control 4)
// 15    NAK (negative ack.)
// 16    SYN (synchronous idle)
// 17    ETB (end of trans. blk)
// 18    CAN (cancel)
// 19    EM  (end of medium)
// 1A    SUB (substitute)
// 1B    ESC (escape)
// 1C    FS  (file separator)
// 1D    GS  (group separator)
// 1E    RS  (record separator)
// 1F    US  (unit separator)
function hasCorruptCharacters(string) {
	return corruptCharacters.test(string);
}

module.exports = {
	isContent: isContent,
	isParagraphStart: isParagraphStart,
	isParagraphEnd: isParagraphEnd,
	isTagStart: isTagStart,
	isTagEnd: isTagEnd,
	isTextStart: isTextStart,
	isTextEnd: isTextEnd,
	unique: unique,
	chunkBy: chunkBy,
	last: last,
	mergeObjects: mergeObjects,
	xml2str: xml2str,
	str2xml: str2xml,
	getRight: getRight,
	getLeft: getLeft,
	pregMatchAll: pregMatchAll,
	convertSpaces: convertSpaces,
	escapeRegExp: escapeRegExp,
	charMapRegexes: charMapRegexes,
	hasCorruptCharacters: hasCorruptCharacters,
	defaults: defaults,
	wordToUtf8: wordToUtf8,
	utf8ToWord: utf8ToWord,
	concatArrays: concatArrays,
	charMap: charMap
};
},{"./errors":2,"xmldom":19}],2:[function(require,module,exports){
"use strict";

function first(a) {
	return a[0];
}
function last(a) {
	return a[a.length - 1];
}
function XTError(message) {
	this.name = "GenericError";
	this.message = message;
	this.stack = new Error(message).stack;
}
XTError.prototype = Error.prototype;

function XTTemplateError(message) {
	this.name = "TemplateError";
	this.message = message;
	this.stack = new Error(message).stack;
}
XTTemplateError.prototype = new XTError();

function RenderingError(message) {
	this.name = "RenderingError";
	this.message = message;
	this.stack = new Error(message).stack;
}
RenderingError.prototype = new XTError();

function XTScopeParserError(message) {
	this.name = "ScopeParserError";
	this.message = message;
	this.stack = new Error(message).stack;
}
XTScopeParserError.prototype = new XTError();

function XTInternalError(message) {
	this.name = "InternalError";
	this.properties = { explanation: "InternalError" };
	this.message = message;
	this.stack = new Error(message).stack;
}
XTInternalError.prototype = new XTError();

function throwMultiError(errors) {
	var err = new XTTemplateError("Multi error");
	err.properties = {
		errors: errors,
		id: "multi_error",
		explanation: "The template has multiple errors"
	};
	throw err;
}

function getUnopenedTagException(options) {
	var err = new XTTemplateError("Unopened tag");
	err.properties = {
		xtag: last(options.xtag.split(" ")),
		id: "unopened_tag",
		context: options.xtag,
		offset: options.offset,
		lIndex: options.lIndex,
		explanation: "The tag beginning with \"" + options.xtag.substr(0, 10) + "\" is unopened"
	};
	return err;
}

function getUnclosedTagException(options) {
	var err = new XTTemplateError("Unclosed tag");
	err.properties = {
		xtag: first(options.xtag.split(" ")).substr(1),
		id: "unclosed_tag",
		context: options.xtag,
		offset: options.offset,
		lIndex: options.lIndex,
		explanation: "The tag beginning with \"" + options.xtag.substr(0, 10) + "\" is unclosed"
	};
	return err;
}

function throwXmlTagNotFound(options) {
	var err = new XTTemplateError("No tag \"" + options.element + "\" was found at the " + options.position);
	err.properties = {
		id: "no_xml_tag_found_at_" + options.position,
		explanation: "No tag \"" + options.element + "\" was found at the " + options.position,
		part: options.parsed[options.index],
		parsed: options.parsed,
		index: options.index,
		element: options.element
	};
	throw err;
}

function throwCorruptCharacters(_ref) {
	var tag = _ref.tag,
	    value = _ref.value;

	var err = new RenderingError("There are some XML corrupt characters");
	err.properties = {
		id: "invalid_xml_characters",
		xtag: tag,
		value: value,
		explanation: "There are some corrupt characters for the field ${name}"
	};
	throw err;
}

function throwContentMustBeString(type) {
	var err = new XTInternalError("Content must be a string");
	err.properties.id = "xmltemplater_content_must_be_string";
	err.properties.type = type;
	throw err;
}

function throwRawTagNotInParagraph(options) {
	var err = new XTTemplateError("Raw tag not in paragraph");
	var _options$part = options.part,
	    value = _options$part.value,
	    offset = _options$part.offset;

	err.properties = {
		id: "raw_tag_outerxml_invalid",
		explanation: "The tag \"" + value + "\" is not inside a paragraph",
		rootError: options.rootError,
		xtag: value,
		offset: offset,
		postparsed: options.postparsed,
		expandTo: options.expandTo,
		index: options.index
	};
	throw err;
}

function throwRawTagShouldBeOnlyTextInParagraph(options) {
	var err = new XTTemplateError("Raw tag should be the only text in paragraph");
	var tag = options.part.value;
	err.properties = {
		id: "raw_xml_tag_should_be_only_text_in_paragraph",
		explanation: "The tag \"" + tag + "\" should be the only text in this paragraph",
		xtag: options.part.value,
		offset: options.part.offset,
		paragraphParts: options.paragraphParts
	};
	throw err;
}

function getUnmatchedLoopException(options) {
	var location = options.location;

	var t = location === "start" ? "unclosed" : "unopened";
	var T = location === "start" ? "Unclosed" : "Unopened";

	var err = new XTTemplateError(T + " loop");
	var tag = options.part.value;
	err.properties = {
		id: t + "_loop",
		explanation: "The loop with tag \"" + tag + "\" is " + t,
		xtag: tag
	};
	return err;
}

function getClosingTagNotMatchOpeningTag(options) {
	var tags = options.tags;


	var err = new XTTemplateError("Closing tag does not match opening tag");
	err.properties = {
		id: "closing_tag_does_not_match_opening_tag",
		explanation: "The tag \"" + tags[0].value + "\" is closed by the tag \"" + tags[1].value + "\"",
		openingtag: tags[0].value,
		offset: [tags[0].offset, tags[1].offset],
		closingtag: tags[1].value
	};
	return err;
}

function getScopeCompilationError(_ref2) {
	var tag = _ref2.tag,
	    rootError = _ref2.rootError;

	var err = new XTScopeParserError("Scope parser compilation failed");
	err.properties = {
		id: "scopeparser_compilation_failed",
		tag: tag,
		explanation: "The scope parser for the tag \"" + tag + "\" failed to compile",
		rootError: rootError
	};
	return err;
}

function getScopeParserExecutionError(_ref3) {
	var tag = _ref3.tag,
	    scope = _ref3.scope,
	    error = _ref3.error;

	var err = new XTScopeParserError("Scope parser execution failed");
	err.properties = {
		id: "scopeparser_execution_failed",
		explanation: "The scope parser for the tag " + tag + " failed to execute",
		scope: scope,
		tag: tag,
		rootError: error
	};
	return err;
}

function getLoopPositionProducesInvalidXMLError(_ref4) {
	var tag = _ref4.tag;

	var err = new XTTemplateError("The position of the loop tags \"" + tag + "\" would produce invalid XML");
	err.properties = {
		tag: tag,
		id: "loop_position_invalid",
		explanation: "The tags \"" + tag + "\" are misplaced in the document, for example one of them is in a table and the other one outside the table"
	};
	return err;
}

function throwUnimplementedTagType(part) {
	var err = new XTTemplateError("Unimplemented tag type \"" + part.type + "\"");
	err.properties = {
		part: part,
		id: "unimplemented_tag_type"
	};
	throw err;
}

function throwMalformedXml(part) {
	var err = new XTInternalError("Malformed xml");
	err.properties = {
		part: part,
		id: "malformed_xml"
	};
	throw err;
}

function throwLocationInvalid(part) {
	throw new XTInternalError("Location should be one of \"start\" or \"end\" (given : " + part.location + ")");
}

function throwFileTypeNotHandled(fileType) {
	var err = new XTInternalError("The filetype \"" + fileType + "\" is not handled by docxtemplater");
	err.properties = {
		id: "filetype_not_handled",
		explanation: "The file you are trying to generate is of type \"" + fileType + "\", but only docx and pptx formats are handled"
	};
	throw err;
}

function throwFileTypeNotIdentified() {
	var err = new XTInternalError("The filetype for this file could not be identified, is this file corrupted ?");
	err.properties = {
		id: "filetype_not_identified"
	};
	throw err;
}

module.exports = {
	XTError: XTError,
	XTTemplateError: XTTemplateError,
	XTInternalError: XTInternalError,
	XTScopeParserError: XTScopeParserError,
	RenderingError: RenderingError,
	throwMultiError: throwMultiError,
	throwXmlTagNotFound: throwXmlTagNotFound,
	throwCorruptCharacters: throwCorruptCharacters,
	throwContentMustBeString: throwContentMustBeString,
	getUnmatchedLoopException: getUnmatchedLoopException,
	throwRawTagShouldBeOnlyTextInParagraph: throwRawTagShouldBeOnlyTextInParagraph,
	throwRawTagNotInParagraph: throwRawTagNotInParagraph,
	getClosingTagNotMatchOpeningTag: getClosingTagNotMatchOpeningTag,
	throwUnimplementedTagType: throwUnimplementedTagType,
	getScopeCompilationError: getScopeCompilationError,
	getScopeParserExecutionError: getScopeParserExecutionError,
	getUnopenedTagException: getUnopenedTagException,
	getUnclosedTagException: getUnclosedTagException,
	throwMalformedXml: throwMalformedXml,
	throwFileTypeNotIdentified: throwFileTypeNotIdentified,
	throwFileTypeNotHandled: throwFileTypeNotHandled,
	getLoopPositionProducesInvalidXMLError: getLoopPositionProducesInvalidXMLError,
	throwLocationInvalid: throwLocationInvalid
};
},{}],3:[function(require,module,exports){
"use strict";

var loopModule = require("./modules/loop");
var spacePreserveModule = require("./modules/space-preserve");
var rawXmlModule = require("./modules/rawxml");
var expandPairTrait = require("./modules/expand-pair-trait");
var render = require("./modules/render");

var PptXFileTypeConfig = {
	getTemplatedFiles: function getTemplatedFiles(zip) {
		var slideTemplates = zip.file(/ppt\/(slides|slideLayouts|slideMasters)\/(slide|slideLayout|slideMaster)\d+\.xml/).map(function (file) {
			return file.name;
		});
		return slideTemplates.concat(["ppt/presentation.xml", "docProps/app.xml", "docProps/core.xml"]);
	},
	textPath: function textPath() {
		return "ppt/slides/slide1.xml";
	},

	tagsXmlTextArray: ["a:t", "m:t", "vt:lpstr", "dc:title", "dc:creator", "cp:keywords"],
	tagsXmlLexedArray: ["p:sp", "a:tc", "a:tr", "a:table", "a:p", "a:r"],
	expandTags: [{ contains: "a:tc", expand: "a:tr" }],
	onParagraphLoop: [{ contains: "a:p", expand: "a:p", onlyTextInTag: true }],
	tagRawXml: "p:sp",
	tagTextXml: "a:t",
	baseModules: [loopModule, expandPairTrait, rawXmlModule, render]
};

var DocXFileTypeConfig = {
	getTemplatedFiles: function getTemplatedFiles(zip) {
		var baseTags = ["docProps/core.xml", "docProps/app.xml", "word/document.xml", "word/document2.xml"];
		var slideTemplates = zip.file(/word\/(header|footer)\d+\.xml/).map(function (file) {
			return file.name;
		});
		return slideTemplates.concat(baseTags);
	},
	textPath: function textPath(zip) {
		if (zip.files["word/document.xml"]) {
			return "word/document.xml";
		}
		if (zip.files["word/document2.xml"]) {
			return "word/document2.xml";
		}
	},

	tagsXmlTextArray: ["w:t", "m:t", "vt:lpstr", "dc:title", "dc:creator", "cp:keywords"],
	tagsXmlLexedArray: ["w:tc", "w:tr", "w:table", "w:p", "w:r", "w:rPr", "w:pPr", "w:spacing"],
	expandTags: [{ contains: "w:tc", expand: "w:tr" }],
	onParagraphLoop: [{ contains: "w:p", expand: "w:p", onlyTextInTag: true }],
	tagRawXml: "w:p",
	tagTextXml: "w:t",
	baseModules: [loopModule, spacePreserveModule, expandPairTrait, rawXmlModule, render]
};

module.exports = {
	docx: DocXFileTypeConfig,
	pptx: PptXFileTypeConfig
};
},{"./modules/expand-pair-trait":7,"./modules/loop":8,"./modules/rawxml":9,"./modules/render":10,"./modules/space-preserve":11}],4:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require("./errors"),
    getUnclosedTagException = _require.getUnclosedTagException,
    getUnopenedTagException = _require.getUnopenedTagException,
    throwMalformedXml = _require.throwMalformedXml;

var _require2 = require("./doc-utils"),
    concatArrays = _require2.concatArrays,
    isTextStart = _require2.isTextStart,
    isTextEnd = _require2.isTextEnd;

var EQUAL = 0;
var START = -1;
var END = 1;

function inRange(range, match) {
	return range[0] <= match.offset && match.offset < range[1];
}

function updateInTextTag(part, inTextTag) {
	if (isTextStart(part)) {
		if (inTextTag) {
			throwMalformedXml(part);
		}
		return true;
	}
	if (isTextEnd(part)) {
		if (!inTextTag) {
			throwMalformedXml(part);
		}
		return false;
	}
	return inTextTag;
}

function getTag(tag) {
	var position = "start";
	var start = 1;
	if (tag[tag.length - 2] === "/") {
		position = "selfclosing";
	}
	if (tag[1] === "/") {
		start = 2;
		position = "end";
	}
	var index = tag.indexOf(" ");
	var end = index === -1 ? tag.length - 1 : index;
	return {
		tag: tag.slice(start, end),
		position: position
	};
}

function tagMatcher(content, textMatchArray, othersMatchArray) {
	var cursor = 0;
	var contentLength = content.length;
	var allMatches = concatArrays([textMatchArray.map(function (tag) {
		return { tag: tag, text: true };
	}), othersMatchArray.map(function (tag) {
		return { tag: tag, text: false };
	})]).reduce(function (allMatches, t) {
		allMatches[t.tag] = t.text;
		return allMatches;
	}, {});
	var totalMatches = [];

	while (cursor < contentLength) {
		cursor = content.indexOf("<", cursor);
		if (cursor === -1) {
			break;
		}
		var offset = cursor;
		cursor = content.indexOf(">", cursor);
		var tagText = content.slice(offset, cursor + 1);

		var _getTag = getTag(tagText),
		    tag = _getTag.tag,
		    position = _getTag.position;

		var text = allMatches[tag];
		if (text == null) {
			continue;
		}
		totalMatches.push({
			type: "tag",
			position: position,
			text: text,
			offset: offset,
			value: tagText,
			tag: tag
		});
	}

	return totalMatches;
}

function getDelimiterErrors(delimiterMatches, fullText, ranges) {
	if (delimiterMatches.length === 0) {
		return [];
	}
	var errors = [];
	var inDelimiter = false;
	var lastDelimiterMatch = { offset: 0 };
	var xtag = void 0;
	var rangeIndex = 0;
	delimiterMatches.forEach(function (delimiterMatch) {
		while (ranges[rangeIndex + 1]) {
			if (ranges[rangeIndex + 1].offset > delimiterMatch.offset) {
				break;
			}
			rangeIndex++;
		}
		xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);
		if (delimiterMatch.position === "start" && inDelimiter || delimiterMatch.position === "end" && !inDelimiter) {
			if (delimiterMatch.position === "start") {
				errors.push(getUnclosedTagException({ xtag: xtag, offset: lastDelimiterMatch.offset }));
				delimiterMatch.error = true;
			} else {
				errors.push(getUnopenedTagException({ xtag: xtag, offset: delimiterMatch.offset }));
				delimiterMatch.error = true;
			}
		} else {
			inDelimiter = !inDelimiter;
		}
		lastDelimiterMatch = delimiterMatch;
	});
	var delimiterMatch = { offset: fullText.length };
	xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);
	if (inDelimiter) {
		errors.push(getUnclosedTagException({ xtag: xtag, offset: lastDelimiterMatch.offset }));
		delimiterMatch.error = true;
	}
	return errors;
}

function compareOffsets(startOffset, endOffset) {
	if (startOffset === endOffset) {
		return 0;
	}
	if (startOffset === -1 || endOffset === -1) {
		return endOffset < startOffset ? START : END;
	}
	return startOffset < endOffset ? START : END;
}

function splitDelimiters(inside) {
	var newDelimiters = inside.split(" ");
	if (newDelimiters.length !== 2) {
		throw new Error("New Delimiters cannot be parsed");
	}

	var _newDelimiters = _slicedToArray(newDelimiters, 2),
	    start = _newDelimiters[0],
	    end = _newDelimiters[1];

	if (start.length === 0 || end.length === 0) {
		throw new Error("New Delimiters cannot be parsed");
	}
	return [start, end];
}

function getAllIndexes(fullText, delimiters) {
	var indexes = [];
	var start = delimiters.start,
	    end = delimiters.end;

	var offset = -1;
	while (true) {
		var startOffset = fullText.indexOf(start, offset + 1);
		var endOffset = fullText.indexOf(end, offset + 1);
		var position = null;
		var len = void 0;
		var compareResult = compareOffsets(startOffset, endOffset);
		if (compareResult === EQUAL) {
			return indexes;
		}
		if (compareResult === END) {
			offset = endOffset;
			position = "end";
			len = end.length;
		}
		if (compareResult === START) {
			offset = startOffset;
			position = "start";
			len = start.length;
		}
		if (position === "start" && fullText[offset + start.length] === "=") {
			indexes.push({
				offset: startOffset,
				position: "start",
				length: start.length,
				changedelimiter: true
			});
			var nextEqual = fullText.indexOf("=", offset + start.length + 1);
			var _endOffset = fullText.indexOf(end, nextEqual + 1);

			indexes.push({
				offset: _endOffset,
				position: "end",
				length: end.length,
				changedelimiter: true
			});
			var insideTag = fullText.substr(offset + start.length + 1, nextEqual - offset - start.length - 1);

			var _splitDelimiters = splitDelimiters(insideTag);

			var _splitDelimiters2 = _slicedToArray(_splitDelimiters, 2);

			start = _splitDelimiters2[0];
			end = _splitDelimiters2[1];

			offset = _endOffset;
			continue;
		}
		indexes.push({ offset: offset, position: position, length: len });
	}
}

function Reader(innerContentParts) {
	var _this = this;

	this.innerContentParts = innerContentParts;
	this.full = "";
	this.parseDelimiters = function (delimiters) {
		_this.full = _this.innerContentParts.map(function (p) {
			return p.value;
		}).join("");
		var delimiterMatches = getAllIndexes(_this.full, delimiters);

		var offset = 0;
		var ranges = _this.innerContentParts.map(function (part) {
			offset += part.value.length;
			return { offset: offset - part.value.length, lIndex: part.lIndex };
		});

		var errors = getDelimiterErrors(delimiterMatches, _this.full, ranges);
		var cutNext = 0;
		var delimiterIndex = 0;

		_this.parsed = ranges.map(function (p, i) {
			var offset = p.offset;

			var range = [offset, offset + this.innerContentParts[i].value.length];
			var partContent = this.innerContentParts[i].value;
			var delimitersInOffset = [];
			while (delimiterIndex < delimiterMatches.length && inRange(range, delimiterMatches[delimiterIndex])) {
				delimitersInOffset.push(delimiterMatches[delimiterIndex]);
				delimiterIndex++;
			}
			var parts = [];
			var cursor = 0;
			if (cutNext > 0) {
				cursor = cutNext;
				cutNext = 0;
			}
			var insideDelimiterChange = void 0;
			delimitersInOffset.forEach(function (delimiterInOffset) {
				var value = partContent.substr(cursor, delimiterInOffset.offset - offset - cursor);
				if (value.length > 0) {
					if (insideDelimiterChange) {
						if (delimiterInOffset.changedelimiter) {
							cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
							insideDelimiterChange = delimiterInOffset.position === "start";
						}
						return;
					}
					parts.push({ type: "content", value: value, offset: cursor + offset });
					cursor += value.length;
				}
				var delimiterPart = {
					type: "delimiter",
					position: delimiterInOffset.position,
					offset: cursor + offset
				};
				if (delimiterInOffset.error) {
					delimiterPart.error = delimiterInOffset.error;
				}
				if (delimiterInOffset.changedelimiter) {
					insideDelimiterChange = delimiterInOffset.position === "start";
					cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
					return;
				}
				parts.push(delimiterPart);
				cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
			});
			cutNext = cursor - partContent.length;
			var value = partContent.substr(cursor);
			if (value.length > 0) {
				parts.push({ type: "content", value: value, offset: offset });
			}
			return parts;
		}, _this);
		_this.errors = errors;
	};
}

function getContentParts(xmlparsed) {
	var inTextTag = false;
	var innerContentParts = [];
	xmlparsed.forEach(function (part) {
		inTextTag = updateInTextTag(part, inTextTag);
		if (inTextTag && part.type === "content") {
			innerContentParts.push(part);
		}
	});
	return innerContentParts;
}

module.exports = {
	parse: function parse(xmlparsed, delimiters) {
		var inTextTag = false;
		var reader = new Reader(getContentParts(xmlparsed));
		reader.parseDelimiters(delimiters);

		var lexed = [];
		var index = 0;
		xmlparsed.forEach(function (part) {
			inTextTag = updateInTextTag(part, inTextTag);
			if (part.type === "content") {
				part.position = inTextTag ? "insidetag" : "outsidetag";
			}
			if (inTextTag && part.type === "content") {
				Array.prototype.push.apply(lexed, reader.parsed[index].map(function (p) {
					if (p.type === "content") {
						p.position = "insidetag";
					}
					return p;
				}));
				index++;
			} else {
				lexed.push(part);
			}
		});
		lexed = lexed.map(function (p, i) {
			p.lIndex = i;
			return p;
		});
		return { errors: reader.errors, lexed: lexed };
	},
	xmlparse: function xmlparse(content, xmltags) {
		var matches = tagMatcher(content, xmltags.text, xmltags.other);
		var cursor = 0;
		var parsed = matches.reduce(function (parsed, match) {
			var value = content.substr(cursor, match.offset - cursor);
			if (value.length > 0) {
				parsed.push({ type: "content", value: value });
			}
			cursor = match.offset + match.value.length;
			delete match.offset;
			if (match.value.length > 0) {
				parsed.push(match);
			}
			return parsed;
		}, []);
		var value = content.substr(cursor);
		if (value.length > 0) {
			parsed.push({ type: "content", value: value });
		}
		return parsed;
	}
};
},{"./doc-utils":1,"./errors":2}],5:[function(require,module,exports){
"use strict";

function getMinFromArrays(arrays, state) {
	var minIndex = -1;
	for (var i = 0, l = arrays.length; i < l; i++) {
		if (state[i] >= arrays[i].length) {
			continue;
		}
		if (minIndex === -1 || arrays[i][state[i]].offset < arrays[minIndex][state[minIndex]].offset) {
			minIndex = i;
		}
	}
	if (minIndex === -1) {
		throw new Error("minIndex negative");
	}
	return minIndex;
}

module.exports = function (arrays) {
	var totalLength = arrays.reduce(function (sum, array) {
		return sum + array.length;
	}, 0);
	arrays = arrays.filter(function (array) {
		return array.length > 0;
	});

	var resultArray = new Array(totalLength);

	var state = arrays.map(function () {
		return 0;
	});

	var i = 0;

	while (i <= totalLength - 1) {
		var arrayIndex = getMinFromArrays(arrays, state);
		resultArray[i] = arrays[arrayIndex][state[arrayIndex]];
		state[arrayIndex]++;
		i++;
	}

	return resultArray;
};
},{}],6:[function(require,module,exports){
"use strict";

function emptyFun() {}
function identity(i) {
	return i;
}
module.exports = function (module) {
	var defaults = {
		set: emptyFun,
		parse: emptyFun,
		render: emptyFun,
		getTraits: emptyFun,
		optionsTransformer: identity,
		errorsTransformer: identity,
		getRenderedMap: identity,
		postparse: identity,
		on: emptyFun,
		resolve: emptyFun
	};
	if (Object.keys(defaults).every(function (key) {
		return !module[key];
	})) {
		throw new Error("This module cannot be wrapped, because it doesn't define any of the necessary functions");
	}
	Object.keys(defaults).forEach(function (key) {
		module[key] = module[key] || defaults[key];
	});
	return module;
};
},{}],7:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var traitName = "expandPair";
var mergeSort = require("../mergesort");

var _require = require("../doc-utils"),
    getLeft = _require.getLeft,
    getRight = _require.getRight;

var wrapper = require("../module-wrapper");

var _require2 = require("../traits"),
    getExpandToDefault = _require2.getExpandToDefault;

var _require3 = require("../errors"),
    getUnmatchedLoopException = _require3.getUnmatchedLoopException,
    getClosingTagNotMatchOpeningTag = _require3.getClosingTagNotMatchOpeningTag,
    throwLocationInvalid = _require3.throwLocationInvalid;

function getOpenCountChange(part) {
	switch (part.location) {
		case "start":
			return 1;
		case "end":
			return -1;
		default:
			throwLocationInvalid(part);
	}
}

function getPairs(traits) {
	var errors = [];
	var pairs = [];
	if (traits.length === 0) {
		return { pairs: pairs, errors: errors };
	}
	var countOpen = 1;

	var _traits = _slicedToArray(traits, 1),
	    firstTrait = _traits[0];

	if (firstTrait.part.location === "start") {
		for (var i = 1; i < traits.length; i++) {
			var currentTrait = traits[i];
			countOpen += getOpenCountChange(currentTrait.part);
			if (countOpen === 0) {
				var _outer = getPairs(traits.slice(i + 1));
				if (currentTrait.part.value !== firstTrait.part.value && currentTrait.part.value !== "") {
					errors.push(getClosingTagNotMatchOpeningTag({
						tags: [firstTrait.part, currentTrait.part]
					}));
				} else {
					pairs = [[firstTrait, currentTrait]];
				}
				return {
					pairs: pairs.concat(_outer.pairs),
					errors: errors.concat(_outer.errors)
				};
			}
		}
	}
	var part = firstTrait.part;

	errors.push(getUnmatchedLoopException({ part: part, location: part.location }));
	var outer = getPairs(traits.slice(1));
	return { pairs: outer.pairs, errors: errors.concat(outer.errors) };
}

var expandPairTrait = {
	name: "ExpandPairTrait",
	optionsTransformer: function optionsTransformer(options, docxtemplater) {
		this.expandTags = docxtemplater.fileTypeConfig.expandTags.concat(docxtemplater.options.paragraphLoop ? docxtemplater.fileTypeConfig.onParagraphLoop : []);
		return options;
	},
	postparse: function postparse(postparsed, _ref) {
		var _this = this;

		var getTraits = _ref.getTraits,
		    _postparse = _ref.postparse;

		var traits = getTraits(traitName, postparsed);
		traits = traits.map(function (trait) {
			return trait || [];
		});
		traits = mergeSort(traits);

		var _getPairs = getPairs(traits),
		    pairs = _getPairs.pairs,
		    errors = _getPairs.errors;

		var expandedPairs = pairs.map(function (pair) {
			var expandTo = pair[0].part.expandTo;

			if (expandTo === "auto") {
				var result = getExpandToDefault(postparsed, pair, _this.expandTags);
				if (result.error) {
					errors.push(result.error);
				}
				expandTo = result.value;
			}
			if (!expandTo) {
				return [pair[0].offset, pair[1].offset];
			}
			var left = getLeft(postparsed, expandTo, pair[0].offset);
			var right = getRight(postparsed, expandTo, pair[1].offset);
			return [left, right];
		});

		var currentPairIndex = 0;
		var innerParts = void 0;
		var newParsed = postparsed.reduce(function (newParsed, part, i) {
			var inPair = currentPairIndex < pairs.length && expandedPairs[currentPairIndex][0] <= i;
			var pair = pairs[currentPairIndex];
			var expandedPair = expandedPairs[currentPairIndex];
			if (!inPair) {
				newParsed.push(part);
				return newParsed;
			}
			if (expandedPair[0] === i) {
				innerParts = [];
			}
			if (pair[0].offset !== i && pair[1].offset !== i) {
				innerParts.push(part);
			}
			if (expandedPair[1] === i) {
				var basePart = postparsed[pair[0].offset];
				basePart.subparsed = _postparse(innerParts, { basePart: basePart });
				delete basePart.location;
				delete basePart.expandTo;
				newParsed.push(basePart);
				currentPairIndex++;
			}
			return newParsed;
		}, []);
		return { postparsed: newParsed, errors: errors };
	}
};

module.exports = function () {
	return wrapper(expandPairTrait);
};
},{"../doc-utils":1,"../errors":2,"../mergesort":5,"../module-wrapper":6,"../traits":16}],8:[function(require,module,exports){
"use strict";

var _require = require("../doc-utils"),
    mergeObjects = _require.mergeObjects,
    chunkBy = _require.chunkBy,
    last = _require.last,
    isParagraphStart = _require.isParagraphStart,
    isParagraphEnd = _require.isParagraphEnd,
    isContent = _require.isContent;

var dashInnerRegex = /^-([^\s]+)\s(.+)$/;
var wrapper = require("../module-wrapper");

var moduleName = "loop";

function hasContent(parts) {
	return parts.some(function (part) {
		return isContent(part);
	});
}

function isEnclosedByParagraphs(parsed) {
	if (parsed.length === 0) {
		return false;
	}
	return isParagraphStart(parsed[0]) && isParagraphEnd(last(parsed));
}

function getOffset(chunk) {
	return hasContent(chunk) ? 0 : chunk.length;
}

var loopModule = {
	name: "LoopModule",
	prefix: {
		start: "#",
		end: "/",
		dash: "-",
		inverted: "^"
	},
	parse: function parse(placeHolderContent) {
		var module = moduleName;
		var type = "placeholder";
		var prefix = this.prefix;
		if (placeHolderContent[0] === prefix.start) {
			return {
				type: type,
				value: placeHolderContent.substr(1),
				expandTo: "auto",
				module: module,
				location: "start",
				inverted: false
			};
		}
		if (placeHolderContent[0] === prefix.inverted) {
			return {
				type: type,
				value: placeHolderContent.substr(1),
				expandTo: "auto",
				module: module,
				location: "start",
				inverted: true
			};
		}
		if (placeHolderContent[0] === prefix.end) {
			return {
				type: type,
				value: placeHolderContent.substr(1),
				module: module,
				location: "end"
			};
		}
		if (placeHolderContent[0] === prefix.dash) {
			var value = placeHolderContent.replace(dashInnerRegex, "$2");
			var expandTo = placeHolderContent.replace(dashInnerRegex, "$1");
			return {
				type: type,
				value: value,
				expandTo: expandTo,
				module: module,
				location: "start",
				inverted: false
			};
		}
		return null;
	},
	getTraits: function getTraits(traitName, parsed) {
		if (traitName !== "expandPair") {
			return;
		}

		return parsed.reduce(function (tags, part, offset) {
			if (part.type === "placeholder" && part.module === moduleName) {
				tags.push({ part: part, offset: offset });
			}
			return tags;
		}, []);
	},
	postparse: function postparse(parsed, _ref) {
		var basePart = _ref.basePart;

		if (!isEnclosedByParagraphs(parsed)) {
			return parsed;
		}
		if (!basePart || basePart.expandTo !== "auto") {
			return parsed;
		}
		var chunks = chunkBy(parsed, function (p) {
			if (isParagraphStart(p)) {
				return "start";
			}
			if (isParagraphEnd(p)) {
				return "end";
			}
			return null;
		});
		if (chunks.length <= 2) {
			return parsed;
		}
		var firstChunk = chunks[0];
		var lastChunk = last(chunks);
		var firstOffset = getOffset(firstChunk);
		var lastOffset = getOffset(lastChunk);
		if (firstOffset === 0 || lastOffset === 0) {
			return parsed;
		}
		var result = parsed.slice(firstOffset, parsed.length - lastOffset);
		return result;
	},
	render: function render(part, options) {
		if (!part.type === "placeholder" || part.module !== moduleName) {
			return null;
		}
		var totalValue = [];
		var errors = [];
		function loopOver(scope, i) {
			var scopeManager = options.scopeManager.createSubScopeManager(scope, part.value, i);
			var subRendered = options.render(mergeObjects({}, options, {
				compiled: part.subparsed,
				tags: {},
				scopeManager: scopeManager
			}));
			totalValue = totalValue.concat(subRendered.parts);
			errors = errors.concat(subRendered.errors || []);
		}
		options.scopeManager.loopOver(part.value, loopOver, part.inverted);
		return { value: totalValue.join(""), errors: errors };
	},
	resolve: function resolve(part, options) {
		if (!part.type === "placeholder" || part.module !== moduleName) {
			return null;
		}
		var value = options.scopeManager.getValue(part.value);
		var promises = [];
		function loopOver(scope, i) {
			var scopeManager = options.scopeManager.createSubScopeManager(scope, part.value, i);
			promises.push(options.resolve(mergeObjects(options, {
				compiled: part.subparsed,
				tags: {},
				scopeManager: scopeManager
			})));
		}
		return Promise.resolve(value).then(function (value) {
			options.scopeManager.loopOverValue(value, loopOver, part.inverted);
			return Promise.all(promises).then(function (r) {
				return r.map(function (_ref2) {
					var resolved = _ref2.resolved;

					return resolved;
				});
			});
		});
	}
};

module.exports = function () {
	return wrapper(loopModule);
};
},{"../doc-utils":1,"../module-wrapper":6}],9:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var traits = require("../traits");

var _require = require("../doc-utils"),
    isContent = _require.isContent;

var _require2 = require("../errors"),
    throwRawTagShouldBeOnlyTextInParagraph = _require2.throwRawTagShouldBeOnlyTextInParagraph;

var moduleName = "rawxml";
var wrapper = require("../module-wrapper");

function getInner(_ref) {
	var part = _ref.part,
	    left = _ref.left,
	    right = _ref.right,
	    postparsed = _ref.postparsed,
	    index = _ref.index;

	var paragraphParts = postparsed.slice(left + 1, right);
	paragraphParts.forEach(function (p, i) {
		if (i === index - left - 1) {
			return;
		}
		if (isContent(p)) {
			throwRawTagShouldBeOnlyTextInParagraph({ paragraphParts: paragraphParts, part: part });
		}
	});
	return part;
}

var RawXmlModule = function () {
	function RawXmlModule() {
		_classCallCheck(this, RawXmlModule);

		this.name = "RawXmlModule";
		this.prefixMap = [{
			prefix:"@", skip:1
		},{
			prefix:"RTB_", skip:0
		}];
		//method to get parapraph and run level properties
		this.getDocxRunProps = function(part) {
			var _i;
			var docxProps = {};
			if(part!=null || part!=undefined ||part!='') {
				var len = part.expanded[0].length;
				for (_i = 0; _i<len-1; _i++) {
					var token = part.expanded[0][_i];
					if (token.type == "tag" && token.tag == "w:pPr" && token.position == "start") {
						var paragraphLevelProps = part.expanded[0][_i+1];
						if (paragraphLevelProps != undefined && paragraphLevelProps != null && paragraphLevelProps.type == "content") {
							docxProps["paragraphLevelProps"] = paragraphLevelProps.value
						}
					}	
					if (token.type == "tag" && token.tag == "w:r" && token.position == "start") {
						var runLevelProps = part.expanded[0][_i+2];
						if (runLevelProps != undefined && runLevelProps != null && runLevelProps.type == "content") {
							docxProps["runLevelProps"] = runLevelProps.value
						}
					}
				}
		
			}
			return docxProps;
		};
	}

	_createClass(RawXmlModule, [{
		key: "optionsTransformer",
		value: function optionsTransformer(options, docxtemplater) {
			this.fileTypeConfig = docxtemplater.fileTypeConfig;
			this.overrideFont = options.overrideFont;
			return options;
		}
	}, {
		key: "parse",
		value: function parse(placeHolderContent) {
			var type = "placeholder";
			var i;
			for(i=0;i<this.prefixMap.length;i++) {
				if(placeHolderContent.startsWith(this.prefixMap[i].prefix)) {
					return { type: type, value: placeHolderContent.substr(this.prefixMap[i].skip), module: moduleName };
				}
			}
			return null;
		}
	}, {
		key: "postparse",
		value: function postparse(postparsed) {
			return traits.expandToOne(postparsed, {
				moduleName: moduleName,
				getInner: getInner,
				expandTo: this.fileTypeConfig.tagRawXml
			});
		}
	}, {
		key: "render",
		value: function render(part, options) {
			if (part.module !== moduleName) {
				return null;
			}
			var value = options.scopeManager.getValue(part.value);
			if (value == null) {
				value = options.nullGetter(part);
			}
			var documentProps = this.getDocxRunProps(part);
			//Add rtl property to the wml, if document token has right to left property (<w:bidi/>)
			if(documentProps['paragraphLevelProps'] && documentProps['paragraphLevelProps'].indexOf('<w:bidi/>')> -1) {
				var getRunNode = value.split(/(?:<\/w:p>)/g); //Replaced the regex '?<=' to '?:' as the former is unsupported by Safari browser
					for(var i=0; i<getRunNode.length; i++) {
						if(getRunNode[i].indexOf('<w:pPr>') == -1) {
							getRunNode[i] = getRunNode[i].replace('<w:p>','<w:p><w:pPr><w:bidi/></w:pPr>' );
						} else {
							getRunNode[i]= getRunNode[i].replace('</w:pPr>','<w:bidi/></w:pPr>' );
						}
					}
					value = getRunNode.join('</w:p>'); //adding end tag explicitly as the split with regex above does not capture the end tag while splitting
			}
			//override the font from token runLevel properties 
			if(this.overrideFont) {
				if(documentProps['runLevelProps'] && documentProps['runLevelProps'].indexOf('<w:rFonts')> -1) {
					var fontRegex = /<w:rFonts(.*?)\/>/g;
					var docxFont = documentProps['runLevelProps'].match(fontRegex)[0];

					//overirde field value Font with token/document font.
					value = value.replaceAll(fontRegex,'');
					var getRunNode = value.split(/(?:<\/w:r>)/g); //Replaced the regex '?<=' to '?:' as the former is unsupported by Safari browser
					for(var i=0; i<getRunNode.length; i++) {
						if(getRunNode[i].indexOf('<w:rPr>') == -1) {
							getRunNode[i] = getRunNode[i].replace('<w:r>','<w:r><w:rPr>'+docxFont+'</w:rPr>')
						} else {
							getRunNode[i]= getRunNode[i].replace('</w:rPr>', docxFont+'</w:rPr>')
						}
					}
					value = getRunNode.join('</w:r>');	//adding end tag explicitly as the split with regex above does not capture the end tag while splitting
				}
			}
			return { value: value };
		}
	}]);

	return RawXmlModule;
}();

module.exports = function () {
	return wrapper(new RawXmlModule());
};
},{"../doc-utils":1,"../errors":2,"../module-wrapper":6,"../traits":16}],10:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wrapper = require("../module-wrapper");

var _require = require("../errors"),
    getScopeCompilationError = _require.getScopeCompilationError;

var Render = function () {
	function Render() {
		_classCallCheck(this, Render);

		this.name = "Render";
	}

	_createClass(Render, [{
		key: "set",
		value: function set(obj) {
			if (obj.compiled) {
				this.compiled = obj.compiled;
			}
			if (obj.data != null) {
				this.data = obj.data;
			}
		}
	}, {
		key: "getRenderedMap",
		value: function getRenderedMap(mapper) {
			var _this = this;

			return Object.keys(this.compiled).reduce(function (mapper, from) {
				mapper[from] = { from: from, data: _this.data };
				return mapper;
			}, mapper);
		}
	}, {
		key: "optionsTransformer",
		value: function optionsTransformer(options, docxtemplater) {
			this.parser = docxtemplater.parser;
			return options;
		}
	}, {
		key: "postparse",
		value: function postparse(postparsed) {
			var _this2 = this;

			var errors = [];
			postparsed.forEach(function (p) {
				if (p.type === "placeholder") {
					var tag = p.value;
					try {
						_this2.parser(tag);
					} catch (rootError) {
						errors.push(getScopeCompilationError({ tag: tag, rootError: rootError }));
					}
				}
			});
			return { postparsed: postparsed, errors: errors };
		}
	}]);

	return Render;
}();

module.exports = function () {
	return wrapper(new Render());
};
},{"../errors":2,"../module-wrapper":6}],11:[function(require,module,exports){
"use strict";

var wrapper = require("../module-wrapper");

var _require = require("../doc-utils"),
    isTextStart = _require.isTextStart,
    isTextEnd = _require.isTextEnd;

function addXMLPreserve(tag) {
	if (tag.indexOf('xml:space="preserve"') !== -1) {
		return tag;
	}
	return tag.substr(0, tag.length - 1) + ' xml:space="preserve">';
}

var spacePreserve = {
	name: "SpacePreserveModule",
	postparse: function postparse(postparsed) {
		var chunk = [];
		var inChunk = false;
		var endLindex = 0;
		var lastTextTag = 0;
		var result = postparsed.reduce(function (postparsed, part) {
			if (isTextStart(part) && part.tag === "w:t") {
				inChunk = true;
				lastTextTag = chunk.length;
			}
			if (!inChunk) {
				postparsed.push(part);
				return postparsed;
			}
			if (!endLindex && part.type === "placeholder" && (!part.module || part.preserveSpace)) {
				endLindex = part.endLindex;
				chunk[0].value = addXMLPreserve(chunk[0].value);
			}
			chunk.push(part);
			if (isTextEnd(part)) {
				if (!endLindex) {
					Array.prototype.push.apply(postparsed, chunk);
					inChunk = false;
					lastTextTag = 0;
					endLindex = 0;
					chunk = [];
				} else if (part.lIndex > endLindex) {
					chunk[lastTextTag].value = addXMLPreserve(chunk[lastTextTag].value);
					Array.prototype.push.apply(postparsed, chunk);
					inChunk = false;
					lastTextTag = 0;
					endLindex = 0;
					chunk = [];
				}
			}
			return postparsed;
		}, []);
		Array.prototype.push.apply(result, chunk);
		return result;
	}
};
module.exports = function () {
	return wrapper(spacePreserve);
};
},{"../doc-utils":1,"../module-wrapper":6}],12:[function(require,module,exports){
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require("./doc-utils"),
    wordToUtf8 = _require.wordToUtf8,
    concatArrays = _require.concatArrays;

function moduleParse(modules, placeHolderContent, parsed, startOffset, endLindex) {
	var moduleParsed = void 0;
	for (var i = 0, l = modules.length; i < l; i++) {
		var _module = modules[i];
		moduleParsed = _module.parse(placeHolderContent);
		if (moduleParsed) {
			moduleParsed.offset = startOffset;
			moduleParsed.endLindex = endLindex;
			parsed.push(moduleParsed);
			return parsed;
		}
	}
	parsed.push({
		type: "placeholder",
		value: placeHolderContent,
		offset: startOffset,
		endLindex: endLindex
	});
	return parsed;
}

var parser = {
	postparse: function postparse(postparsed, modules) {
		function getTraits(traitName, postparsed) {
			return modules.map(function (module) {
				return module.getTraits(traitName, postparsed);
			});
		}
		var errors = [];
		function postparse(postparsed, options) {
			return modules.reduce(function (postparsed, module) {
				var r = module.postparse(postparsed, _extends({}, options, {
					postparse: postparse,
					getTraits: getTraits
				}));
				if (r.errors) {
					errors = concatArrays([errors, r.errors]);
					return r.postparsed;
				}
				return r;
			}, postparsed);
		}
		return { postparsed: postparse(postparsed), errors: errors };
	},
	parse: function parse(lexed, modules) {
		var inPlaceHolder = false;
		var placeHolderContent = "";
		var startOffset = void 0;
		var tailParts = [];
		return lexed.reduce(function lexedToParsed(parsed, token) {
			if (token.type === "delimiter") {
				inPlaceHolder = token.position === "start";
				if (token.position === "end") {
					var endLindex = token.lIndex;
					placeHolderContent = wordToUtf8(placeHolderContent);
					parsed = moduleParse(modules, placeHolderContent, parsed, startOffset, endLindex);
					startOffset = null;
					Array.prototype.push.apply(parsed, tailParts);
					tailParts = [];
				}
				if (token.position === "start") {
					tailParts = [];
					startOffset = token.offset;
				}
				placeHolderContent = "";
				return parsed;
			}
			if (!inPlaceHolder) {
				parsed.push(token);
				return parsed;
			}
			if (token.type !== "content" || token.position !== "insidetag") {
				tailParts.push(token);
				return parsed;
			}
			placeHolderContent += token.value;
			return parsed;
		}, []);
	}
};

module.exports = parser;
},{"./doc-utils":1}],13:[function(require,module,exports){
"use strict";

var _require = require("./doc-utils"),
    utf8ToWord = _require.utf8ToWord,
    concatArrays = _require.concatArrays,
    hasCorruptCharacters = _require.hasCorruptCharacters;

var _require2 = require("./errors"),
    throwUnimplementedTagType = _require2.throwUnimplementedTagType,
    throwCorruptCharacters = _require2.throwCorruptCharacters;

function moduleRender(part, options) {
	var moduleRendered = void 0;
	for (var i = 0, l = options.modules.length; i < l; i++) {
		var _module = options.modules[i];
		moduleRendered = _module.render(part, options);
		if (moduleRendered) {
			return moduleRendered;
		}
	}
	return false;
}

function render(options) {
	var compiled = options.compiled,
	    scopeManager = options.scopeManager,
	    nullGetter = options.nullGetter;

	var errors = [];
	var parts = compiled.map(function (part, index) {
		part.lIndex = index;
		var moduleRendered = moduleRender(part, options);
		if (moduleRendered) {
			if (moduleRendered.errors) {
				errors = concatArrays([errors, moduleRendered.errors]);
			}
			return moduleRendered.value;
		}
		if (part.type === "placeholder") {
			var value = scopeManager.getValue(part.value);
			if (value == null) {
				value = nullGetter(part);
			}
			if (hasCorruptCharacters(value)) {
				throwCorruptCharacters({ tag: part.value, value: value });
			}
			return utf8ToWord(value);
		}
		if (part.type === "content" || part.type === "tag") {
			return part.value;
		}
		throwUnimplementedTagType(part);
	});
	return { errors: errors, parts: parts };
}

module.exports = render;
},{"./doc-utils":1,"./errors":2}],14:[function(require,module,exports){
"use strict";

function moduleResolve(part, options) {
	var moduleResolved = void 0;
	for (var i = 0, l = options.modules.length; i < l; i++) {
		var _module = options.modules[i];
		moduleResolved = _module.resolve(part, options);
		if (moduleResolved) {
			return moduleResolved;
		}
	}
	return false;
}

function resolve(options) {
	var resolved = [];
	var compiled = options.compiled,
	    scopeManager = options.scopeManager,
	    nullGetter = options.nullGetter;

	options.resolved = resolved;
	var errors = [];
	return Promise.all(compiled.map(function (part) {
		var moduleResolved = moduleResolve(part, options);
		if (moduleResolved) {
			return moduleResolved.then(function (value) {
				resolved.push({ tag: part.value, value: value });
			});
		}
		if (part.type === "placeholder") {
			return scopeManager.getValueAsync(part.value).then(function (value) {
				if (value == null) {
					value = nullGetter(part);
				}
				resolved.push({ tag: part.value, value: value });
				return value;
			});
		}
		return;
	}).filter(function (a) {
		return a;
	})).then(function () {
		return { errors: errors, resolved: resolved };
	});
}

module.exports = resolve;
},{}],15:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("./errors"),
    getScopeParserExecutionError = _require.getScopeParserExecutionError;

// This class responsibility is to manage the scope


var ScopeManager = function () {
	function ScopeManager(options) {
		_classCallCheck(this, ScopeManager);

		this.scopePath = options.scopePath;
		this.scopePathItem = options.scopePathItem;
		this.scopeList = options.scopeList;
		this.parser = options.parser;
		this.resolved = options.resolved;
	}

	_createClass(ScopeManager, [{
		key: "loopOver",
		value: function loopOver(tag, callback, inverted) {
			inverted = inverted || false;
			return this.loopOverValue(this.getValue(tag), callback, inverted);
		}
	}, {
		key: "functorIfInverted",
		value: function functorIfInverted(inverted, functor, value, i) {
			if (inverted) {
				functor(value, i);
			}
		}
	}, {
		key: "isValueFalsy",
		value: function isValueFalsy(value, type) {
			return value == null || !value || type === "[object Array]" && value.length === 0;
		}
	}, {
		key: "loopOverValue",
		value: function loopOverValue(value, functor, inverted) {
			var type = Object.prototype.toString.call(value);
			var currentValue = this.scopeList[this.num];
			if (this.isValueFalsy(value, type)) {
				return this.functorIfInverted(inverted, functor, currentValue, 0);
			}
			if (type === "[object Array]") {
				for (var i = 0, scope; i < value.length; i++) {
					scope = value[i];
					this.functorIfInverted(!inverted, functor, scope, i);
				}
				return;
			}
			if (type === "[object Object]") {
				return this.functorIfInverted(!inverted, functor, value, 0);
			}
			return this.functorIfInverted(!inverted, functor, currentValue, 0);
		}
	}, {
		key: "getValue",
		value: function getValue(tag, num) {
			var _this = this;

			this.num = num == null ? this.scopeList.length - 1 : num;
			var scope = this.scopeList[this.num];
			if (this.resolved) {
				var w = this.resolved;
				this.scopePath.forEach(function (p, index) {
					w = w.find(function (r) {
						if (r.tag === p) {
							return true;
						}
					});
					w = w.value[_this.scopePathItem[index]];
				});
				return w = w.find(function (r) {
					if (r.tag === tag) {
						return true;
					}
				}).value;
			}
			// search in the scopes (in reverse order) and keep the first defined value
			var result = void 0;
			var parser = this.parser(tag, { scopePath: this.scopePath });
			try {
				result = parser.get(scope, { num: this.num, scopeList: this.scopeList });
			} catch (error) {
				throw getScopeParserExecutionError({ tag: tag, scope: scope, error: error });
			}
			if (result == null && this.num > 0) {
				return this.getValue(tag, this.num - 1);
			}
			return result;
		}
	}, {
		key: "getValueAsync",
		value: function getValueAsync(tag, num) {
			var _this2 = this;

			this.num = num == null ? this.scopeList.length - 1 : num;
			var scope = this.scopeList[this.num];
			// search in the scopes (in reverse order) and keep the first defined value
			var parser = this.parser(tag, { scopePath: this.scopePath });
			return Promise.resolve(parser.get(scope, { num: this.num, scopeList: this.scopeList })).catch(function (error) {
				throw getScopeParserExecutionError({ tag: tag, scope: scope, error: error });
			}).then(function (result) {
				if (result == null && _this2.num > 0) {
					return _this2.getValueAsync(tag, _this2.num - 1);
				}
				return result;
			});
		}
	}, {
		key: "createSubScopeManager",
		value: function createSubScopeManager(scope, tag, i) {
			return new ScopeManager({
				resolved: this.resolved,
				parser: this.parser,
				scopeList: this.scopeList.concat(scope),
				scopePath: this.scopePath.concat(tag),
				scopePathItem: this.scopePathItem.concat(i)
			});
		}
	}]);

	return ScopeManager;
}();

module.exports = function (options) {
	options.scopePath = [];
	options.scopePathItem = [];
	options.scopeList = [options.tags];
	return new ScopeManager(options);
};
},{"./errors":2}],16:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = require("./doc-utils"),
    getRight = _require.getRight,
    getLeft = _require.getLeft,
    concatArrays = _require.concatArrays,
    chunkBy = _require.chunkBy,
    isTagStart = _require.isTagStart,
    isTagEnd = _require.isTagEnd,
    isContent = _require.isContent,
    last = _require.last;

var _require2 = require("./errors"),
    XTTemplateError = _require2.XTTemplateError,
    throwRawTagNotInParagraph = _require2.throwRawTagNotInParagraph,
    getLoopPositionProducesInvalidXMLError = _require2.getLoopPositionProducesInvalidXMLError;

function lastTagIsOpenTag(array, tag) {
	if (array.length === 0) {
		return false;
	}
	var lastTag = array[array.length - 1];
	var innerLastTag = lastTag.tag.substr(1);
	var innerCurrentTag = tag.substr(2, tag.length - 3);
	return innerLastTag.indexOf(innerCurrentTag) === 0;
}

function addTag(array, tag) {
	array.push({ tag: tag });
	return array;
}

function getListXmlElements(parts) {
	/*
 get the different closing and opening tags between two texts (doesn't take into account tags that are opened then closed (those that are closed then opened are returned)):
 returns:[{"tag":"</w:r>","offset":13},{"tag":"</w:p>","offset":265},{"tag":"</w:tc>","offset":271},{"tag":"<w:tc>","offset":828},{"tag":"<w:p>","offset":883},{"tag":"<w:r>","offset":1483}]
 */
	var tags = parts.filter(function (part) {
		return part.type === "tag";
	});

	var result = [];

	for (var i = 0, tag; i < tags.length; i++) {
		tag = tags[i].value;
		// closing tag
		if (tag[1] === "/") {
			if (lastTagIsOpenTag(result, tag)) {
				result.pop();
			} else {
				result = addTag(result, tag);
			}
		} else if (tag[tag.length - 2] !== "/") {
			result = addTag(result, tag);
		}
	}
	return result;
}

function has(name, xmlElements) {
	for (var i = 0; i < xmlElements.length; i++) {
		var xmlElement = xmlElements[i];
		if (xmlElement.tag.indexOf("<" + name) === 0) {
			return true;
		}
	}
	return false;
}

function getExpandToDefault(postparsed, pair, expandTags) {
	var parts = postparsed.slice(pair[0].offset, pair[1].offset);
	var xmlElements = getListXmlElements(parts);
	var closingTagCount = xmlElements.filter(function (xmlElement) {
		return xmlElement.tag[1] === "/";
	}).length;
	var startingTagCount = xmlElements.filter(function (xmlElement) {
		var tag = xmlElement.tag;

		return tag[1] !== "/" && tag[tag.length - 2] !== "/";
	}).length;
	if (closingTagCount !== startingTagCount) {
		return {
			error: getLoopPositionProducesInvalidXMLError({
				tag: pair[0].part.value
			})
		};
	}

	var _loop = function _loop(i, len) {
		var _expandTags$i = expandTags[i],
		    contains = _expandTags$i.contains,
		    expand = _expandTags$i.expand,
		    onlyTextInTag = _expandTags$i.onlyTextInTag;

		if (has(contains, xmlElements)) {
			if (onlyTextInTag) {
				var left = getLeft(postparsed, contains, pair[0].offset);
				var right = getRight(postparsed, contains, pair[1].offset);

				var chunks = chunkBy(postparsed.slice(left, right), function (p) {
					if (isTagStart(contains, p)) {
						return "start";
					}
					if (isTagEnd(contains, p)) {
						return "end";
					}
					return null;
				});

				if (chunks.length <= 2) {
					return "continue";
				}

				var firstChunk = chunks[0];
				var lastChunk = last(chunks);

				var firstContent = firstChunk.filter(isContent);
				var lastContent = lastChunk.filter(isContent);
				if (firstContent.length !== 1 || lastContent.length !== 1) {
					return "continue";
				}
			}
			return {
				v: { value: expand }
			};
		}
	};

	for (var i = 0, len = expandTags.length; i < len; i++) {
		var _ret = _loop(i, len);

		switch (_ret) {
			case "continue":
				continue;

			default:
				if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
		}
	}
	return false;
}

function expandOne(part, postparsed, options) {
	var expandTo = part.expandTo || options.expandTo;
	var index = postparsed.indexOf(part);
	if (!expandTo) {
		return postparsed;
	}
	var right = void 0,
	    left = void 0;
	try {
		right = getRight(postparsed, expandTo, index);
		left = getLeft(postparsed, expandTo, index);
	} catch (rootError) {
		if (rootError instanceof XTTemplateError) {
			throwRawTagNotInParagraph({
				part: part,
				rootError: rootError,
				postparsed: postparsed,
				expandTo: expandTo,
				index: index
			});
		}
		throw rootError;
	}
	var leftParts = postparsed.slice(left, index);
	var rightParts = postparsed.slice(index + 1, right + 1);
	var inner = options.getInner({
		index: index,
		part: part,
		leftParts: leftParts,
		rightParts: rightParts,
		left: left,
		right: right,
		postparsed: postparsed
	});
	if (!inner.length) {
		inner.expanded = [leftParts, rightParts];
		inner = [inner];
	}
	return concatArrays([postparsed.slice(0, left), inner, postparsed.slice(right + 1)]);
}

function expandToOne(postparsed, options) {
	var errors = [];
	if (postparsed.errors) {
		errors = postparsed.errors;
		postparsed = postparsed.postparsed;
	}
	var expandToElements = postparsed.reduce(function (elements, part) {
		if (part.type === "placeholder" && part.module === options.moduleName) {
			elements.push(part);
		}
		return elements;
	}, []);

	expandToElements.forEach(function (part) {
		try {
			postparsed = expandOne(part, postparsed, options);
		} catch (error) {
			if (error instanceof XTTemplateError) {
				errors.push(error);
			} else {
				throw error;
			}
		}
	});
	return { postparsed: postparsed, errors: errors };
}

module.exports = {
	expandToOne: expandToOne,
	getExpandToDefault: getExpandToDefault
};
},{"./doc-utils":1,"./errors":2}],17:[function(require,module,exports){
"use strict";
// res class responsibility is to parse the XML.

var _require = require("./doc-utils"),
    pregMatchAll = _require.pregMatchAll;

function handleRecursiveCase(res) {
	/*
 	 Because xmlTemplater is recursive (meaning it can call it self), we need to handle special cases where the XML is not valid:
 	 For example with res string "I am</w:t></w:r></w:p><w:p><w:r><w:t>sleeping",
 	 - we need to match also the string that is inside an implicit <w:t> (that's the role of replacerUnshift) (in res case 'I am')
 	 - we need to match the string that is at the right of a <w:t> (that's the role of replacerPush) (in res case 'sleeping')
 	 the test: describe "scope calculation" it "should compute the scope between 2 <w:t>" makes sure that res part of code works
 	 It should even work if they is no XML at all, for example if the code is just "I am sleeping", in res case however, they should only be one match
 	 */

	function replacerUnshift() {
		var pn = { array: Array.prototype.slice.call(arguments) };
		pn.array.shift();
		var match = pn.array[0] + pn.array[1];
		// add match so that pn[0] = whole match, pn[1]= first parenthesis,...
		pn.array.unshift(match);
		pn.array.pop();
		var offset = pn.array.pop();
		pn.offset = offset;
		pn.first = true;
		// add at the beginning
		res.matches.unshift(pn);
	}

	if (res.content.indexOf("<") === -1 && res.content.indexOf(">") === -1) {
		res.content.replace(/^()([^<>]*)$/, replacerUnshift);
	}

	var r = new RegExp("^()([^<]+)</(?:" + res.tagsXmlArrayJoined + ")>");
	res.content.replace(r, replacerUnshift);

	function replacerPush() {
		var pn = { array: Array.prototype.slice.call(arguments) };
		pn.array.pop();
		var offset = pn.array.pop();
		pn.offset = offset;
		pn.last = true;
		if (pn.array[0].indexOf("/>") !== -1) {
			return;
		}
		// add at the end
		res.matches.push(pn);
	}

	r = new RegExp("(<(?:" + res.tagsXmlArrayJoined + ")[^>]*>)([^>]+)$");
	res.content.replace(r, replacerPush);
	return res;
}

module.exports = function xmlMatcher(content, tagsXmlArray) {
	var res = {};
	res.content = content;
	res.tagsXmlArray = tagsXmlArray;
	res.tagsXmlArrayJoined = res.tagsXmlArray.join("|");
	var regexp = new RegExp("(?:(<(?:" + res.tagsXmlArrayJoined + ")[^>]*>)([^<>]*)</(?:" + res.tagsXmlArrayJoined + ")>)|(<(?:" + res.tagsXmlArrayJoined + ")[^>]*/>)", "g");
	res.matches = pregMatchAll(regexp, res.content);
	return handleRecursiveCase(res);
};
},{"./doc-utils":1}],18:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("./doc-utils"),
    wordToUtf8 = _require.wordToUtf8,
    convertSpaces = _require.convertSpaces,
    defaults = _require.defaults;

var createScope = require("./scope-manager");
var xmlMatcher = require("./xml-matcher");

var _require2 = require("./errors"),
    throwMultiError = _require2.throwMultiError,
    throwContentMustBeString = _require2.throwContentMustBeString;

var Lexer = require("./lexer");
var Parser = require("./parser.js");
var _render = require("./render.js");
var resolve = require("./resolve.js");

function _getFullText(content, tagsXmlArray) {
	var matcher = xmlMatcher(content, tagsXmlArray);
	var result = matcher.matches.map(function (match) {
		return match.array[2];
	});
	return wordToUtf8(convertSpaces(result.join("")));
}

module.exports = function () {
	function XmlTemplater(content, options) {
		_classCallCheck(this, XmlTemplater);

		this.fromJson(options);
		this.setModules({ inspect: { filePath: this.filePath } });
		this.load(content);
	}

	_createClass(XmlTemplater, [{
		key: "load",
		value: function load(content) {
			if (typeof content !== "string") {
				throwContentMustBeString(typeof content === "undefined" ? "undefined" : _typeof(content));
			}
			this.content = content;
		}
	}, {
		key: "setTags",
		value: function setTags(tags) {
			this.tags = tags != null ? tags : {};
			this.scopeManager = createScope({ tags: this.tags, parser: this.parser });
			return this;
		}
	}, {
		key: "resolveTags",
		value: function resolveTags(tags) {
			var _this = this;

			this.tags = tags != null ? tags : {};
			this.scopeManager = createScope({ tags: this.tags, parser: this.parser });
			var options = {
				compiled: this.postparsed,
				tags: this.tags,
				modules: this.modules,
				parser: this.parser,
				nullGetter: this.nullGetter,
				filePath: this.filePath,
				resolve: resolve
			};
			options.scopeManager = createScope(options);
			return resolve(options).then(function (_ref) {
				var resolved = _ref.resolved;

				return Promise.all(resolved.map(function (r) {
					return Promise.resolve(r);
				})).then(function (resolved) {
					return _this.resolved = resolved;
				});
			});
		}
	}, {
		key: "fromJson",
		value: function fromJson(options) {
			this.filePath = options.filePath;
			this.modules = options.modules;
			this.fileTypeConfig = options.fileTypeConfig;
			Object.keys(defaults).map(function (key) {
				this[key] = options[key] != null ? options[key] : defaults[key];
			}, this);
		}
	}, {
		key: "getFullText",
		value: function getFullText() {
			return _getFullText(this.content, this.fileTypeConfig.tagsXmlTextArray);
		}
	}, {
		key: "setModules",
		value: function setModules(obj) {
			this.modules.forEach(function (module) {
				module.set(obj);
			});
		}
	}, {
		key: "parse",
		value: function parse() {
			var allErrors = [];
			var img_tag = "{{IMG_";
			var end_tag = "}}";
			var tag_divider = '</w:t><w:t xml:space="preserve">';
			var startIndex = 0, index, indices = [];
			
			if(this.filePath.indexOf('ppt') === -1 && this.content.indexOf(img_tag) > -1) {
				while ((index = this.content.indexOf(img_tag, startIndex)) > -1) {
					indices.push(index);
					startIndex = index + img_tag.length+ end_tag.length;
				}
				//Add the tag separater between the tags and insert xml:space="preserve"
				for(var i=0; i<indices.length;i++){
					var start = indices[i];
					var end_tag_index = this.content.indexOf(end_tag, start);
					this.content = this.content.slice(0,end_tag_index+end_tag.length) + tag_divider + this.content.slice(end_tag_index+end_tag.length);
				}

			}
			
			this.xmllexed = Lexer.xmlparse(this.content, {
				text: this.fileTypeConfig.tagsXmlTextArray,
				other: this.fileTypeConfig.tagsXmlLexedArray
			});
			this.setModules({ inspect: { xmllexed: this.xmllexed } });

			var _Lexer$parse = Lexer.parse(this.xmllexed, this.delimiters),
			    lexed = _Lexer$parse.lexed,
			    lexerErrors = _Lexer$parse.errors;

			allErrors = allErrors.concat(lexerErrors);
			this.lexed = lexed;
			this.setModules({ inspect: { lexed: this.lexed } });
			this.parsed = Parser.parse(this.lexed, this.modules);
			this.setModules({ inspect: { parsed: this.parsed } });

			var _Parser$postparse = Parser.postparse(this.parsed, this.modules),
			    postparsed = _Parser$postparse.postparsed,
			    postparsedErrors = _Parser$postparse.errors;

			this.postparsed = postparsed;
			this.setModules({ inspect: { postparsed: this.postparsed } });
			allErrors = allErrors.concat(postparsedErrors);
			this.errorChecker(allErrors);
			return this;
		}
	}, {
		key: "errorChecker",
		value: function errorChecker(errors) {
			var _this2 = this;

			if (errors.length) {
				this.modules.forEach(function (module) {
					errors = module.errorsTransformer(errors);
				});
				errors.forEach(function (error) {
					error.properties.file = _this2.filePath;
				});
				throwMultiError(errors);
			}
		}
		/*
  content is the whole content to be tagged
  scope is the current scope
  returns the new content of the tagged content
  */

	}, {
		key: "render",
		value: function render(to) {
			this.filePath = to;
			var options = {
				compiled: this.postparsed,
				tags: this.tags,
				resolved: this.resolved,
				modules: this.modules,
				parser: this.parser,
				nullGetter: this.nullGetter,
				filePath: this.filePath,
				render: _render
			};
			options.scopeManager = createScope(options);

			var _render2 = _render(options),
			    errors = _render2.errors,
			    parts = _render2.parts;

			this.errorChecker(errors);
			this.content = parts.join("");
			this.setModules({ inspect: { content: this.content } });
			return this;
		}
	}]);

	return XmlTemplater;
}();
},{"./doc-utils":1,"./errors":2,"./lexer":4,"./parser.js":12,"./render.js":13,"./resolve.js":14,"./scope-manager":15,"./xml-matcher":17}],19:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
//}

},{"./dom":20,"./sax":21}],20:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{}],21:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}],"/src/js/docxtemplater.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocUtils = require("./doc-utils");
DocUtils.traits = require("./traits");
DocUtils.moduleWrapper = require("./module-wrapper");
var defaults = DocUtils.defaults,
    str2xml = DocUtils.str2xml,
    xml2str = DocUtils.xml2str,
    moduleWrapper = DocUtils.moduleWrapper,
    concatArrays = DocUtils.concatArrays,
    unique = DocUtils.unique;

var _require = require("./errors"),
    XTInternalError = _require.XTInternalError,
    throwFileTypeNotIdentified = _require.throwFileTypeNotIdentified,
    throwFileTypeNotHandled = _require.throwFileTypeNotHandled;

var Docxtemplater = function () {
	function Docxtemplater() {
		_classCallCheck(this, Docxtemplater);

		if (arguments.length > 0) {
			throw new Error("The constructor with parameters has been removed in docxtemplater 3, please check the upgrade guide.");
		}
		this.compiled = {};
		this.modules = [];
		this.setOptions({});
	}

	_createClass(Docxtemplater, [{
		key: "setModules",
		value: function setModules(obj) {
			this.modules.forEach(function (module) {
				module.set(obj);
			});
		}
	}, {
		key: "sendEvent",
		value: function sendEvent(eventName) {
			this.modules.forEach(function (module) {
				module.on(eventName);
			});
		}
	}, {
		key: "attachModule",
		value: function attachModule(module) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var prefix = options.prefix;

			if (prefix) {
				module.prefix = prefix;
			}
			this.modules.push(moduleWrapper(module));
			return this;
		}
	}, {
		key: "setOptions",
		value: function setOptions(options) {
			var _this = this;

			this.options = options;
			Object.keys(defaults).forEach(function (key) {
				var defaultValue = defaults[key];
				_this.options[key] = _this.options[key] != null ? _this.options[key] : defaultValue;
				_this[key] = _this.options[key];
			});
			if (this.zip) {
				this.updateFileTypeConfig();
			}
			return this;
		}
	}, {
		key: "loadZip",
		value: function loadZip(zip) {
			if (zip.loadAsync) {
				throw new XTInternalError("Docxtemplater doesn't handle JSZip version >=3, see changelog");
			}
			this.zip = zip;
			this.updateFileTypeConfig();

			this.modules = concatArrays([this.fileTypeConfig.baseModules.map(function (moduleFunction) {
				return moduleFunction();
			}), this.modules]);
			return this;
		}
	}, {
		key: "compileFile",
		value: function compileFile(fileName) {
			var currentFile = this.createTemplateClass(fileName);
			currentFile.parse();
			this.compiled[fileName] = currentFile;
		}
	}, {
		key: "resolveData",
		value: function resolveData(data) {
			var _this2 = this;

			return Promise.all(Object.keys(this.compiled).map(function (from) {
				var currentFile = _this2.compiled[from];
				return currentFile.resolveTags(data);
			})).then(function (resolved) {
				return concatArrays(resolved);
			});
		}
	}, {
		key: "compile",
		value: function compile() {
			var _this3 = this;

			if (Object.keys(this.compiled).length) {
				return this;
			}
			this.options = this.modules.reduce(function (options, module) {
				return module.optionsTransformer(options, _this3);
			}, this.options);
			this.options.xmlFileNames = unique(this.options.xmlFileNames);
			this.xmlDocuments = this.options.xmlFileNames.reduce(function (xmlDocuments, fileName) {
				var content = _this3.zip.files[fileName].asText();
				xmlDocuments[fileName] = str2xml(content);
				return xmlDocuments;
			}, {});
			this.setModules({
				zip: this.zip,
				xmlDocuments: this.xmlDocuments
			});
			this.getTemplatedFiles();
			this.setModules({ compiled: this.compiled });
			// Loop inside all templatedFiles (ie xml files with content).
			// Sometimes they don't exist (footer.xml for example)
			this.templatedFiles.forEach(function (fileName) {
				if (_this3.zip.files[fileName] != null) {
					_this3.compileFile(fileName);
				}
			});
			return this;
		}
	}, {
		key: "updateFileTypeConfig",
		value: function updateFileTypeConfig() {
			var fileType = void 0;
			if (this.zip.files.mimetype) {
				fileType = "odt";
			}
			if (this.zip.files["word/document.xml"] || this.zip.files["word/document2.xml"]) {
				fileType = "docx";
			}
			if (this.zip.files["ppt/presentation.xml"]) {
				fileType = "pptx";
			}

			if (fileType === "odt") {
				throwFileTypeNotHandled(fileType);
			}
			if (!fileType) {
				throwFileTypeNotIdentified();
			}
			this.fileType = fileType;
			this.fileTypeConfig = this.options.fileTypeConfig || Docxtemplater.FileTypeConfig[this.fileType];
			return this;
		}
	}, {
		key: "render",
		value: function render() {
			var _this4 = this;

			this.compile();
			this.setModules({
				data: this.data
			});
			this.mapper = this.modules.reduce(function (value, module) {
				return module.getRenderedMap(value);
			}, {});

			this.fileTypeConfig.tagsXmlLexedArray = unique(this.fileTypeConfig.tagsXmlLexedArray);
			this.fileTypeConfig.tagsXmlTextArray = unique(this.fileTypeConfig.tagsXmlTextArray);

			Object.keys(this.mapper).forEach(function (to) {
				var _mapper$to = _this4.mapper[to],
				    from = _mapper$to.from,
				    data = _mapper$to.data;

				var currentFile = _this4.compiled[from];
				currentFile.setTags(data);
				currentFile.render(to);
				_this4.zip.file(to, currentFile.content, { createFolders: true });
			});
			this.sendEvent("syncing-zip");
			this.syncZip();
			return this;
		}
	}, {
		key: "syncZip",
		value: function syncZip() {
			var _this5 = this;

			Object.keys(this.xmlDocuments).forEach(function (fileName) {
				_this5.zip.remove(fileName);
				var content = xml2str(_this5.xmlDocuments[fileName]);
				return _this5.zip.file(fileName, content, { createFolders: true });
			});
		}
	}, {
		key: "setData",
		value: function setData(data) {
			this.data = data;
			return this;
		}
	}, {
		key: "getZip",
		value: function getZip() {
			return this.zip;
		}
	}, {
		key: "createTemplateClass",
		value: function createTemplateClass(path) {
			var usedData = this.zip.files[path].asText();
			return this.createTemplateClassFromContent(usedData, path);
		}
	}, {
		key: "createTemplateClassFromContent",
		value: function createTemplateClassFromContent(content, filePath) {
			var _this6 = this;

			var xmltOptions = {
				filePath: filePath
			};
			Object.keys(defaults).forEach(function (key) {
				xmltOptions[key] = _this6[key];
			});
			xmltOptions.fileTypeConfig = this.fileTypeConfig;
			xmltOptions.modules = this.modules;
			return new Docxtemplater.XmlTemplater(content, xmltOptions);
		}
	}, {
		key: "getFullText",
		value: function getFullText(path) {
			return this.createTemplateClass(path || this.fileTypeConfig.textPath(this.zip)).getFullText();
		}
	}, {
		key: "getTemplatedFiles",
		value: function getTemplatedFiles() {
			this.templatedFiles = this.fileTypeConfig.getTemplatedFiles(this.zip);
			return this.templatedFiles;
		}
	}]);

	return Docxtemplater;
}();

Docxtemplater.DocUtils = DocUtils;
Docxtemplater.Errors = require("./errors");
Docxtemplater.XmlTemplater = require("./xml-templater");
Docxtemplater.FileTypeConfig = require("./file-type-config");
Docxtemplater.XmlMatcher = require("./xml-matcher");
module.exports = Docxtemplater;
},{"./doc-utils":1,"./errors":2,"./file-type-config":3,"./module-wrapper":6,"./traits":16,"./xml-matcher":17,"./xml-templater":18}]},{},[])("/src/js/docxtemplater.js")
});