/*
 * htmldiff.js is a library that compares HTML content. It creates a diff between two
 * HTML documents by combining the two documents and wrapping the differences with
 * <ins> and <del> tags. Here is a high-level overview of how the diff works.
 *
 * 1. Tokenize the before and after HTML with html_to_tokens.
 * 2. Generate a list of operations that convert the before list of tokens to the after
 *    list of tokens with calculate_operations, which does the following:
 *      a. Find all the matching blocks of tokens between the before and after lists of
 *         tokens with find_matching_blocks. This is done by finding the single longest
 *         matching block with find_match, then recursively finding the next longest
 *         matching block that precede and follow the longest matching block with
 *         recursively_find_matching_blocks.
 *      b. Determine insertions, deletions, and replacements from the matching blocks.
 *         This is done in calculate_operations.
 * 3. Render the list of operations by wrapping tokens with <ins> and <del> tags where
 *    appropriate with render_operations.
 *
 * Example usage:
 *
 *   var htmldiff = require('htmldiff.js');
 *
 *   htmldiff('<p>this is some text</p>', '<p>this is some more text</p>')
 *   == '<p>this is some <ins>more </ins>text</p>'
 *
 *   htmldiff('<p>this is some text</p>', '<p>this is some more text</p>', 'diff-class')
 *   == '<p>this is some <ins class="diff-class">more </ins>text</p>'
 */
(function () {
  function is_end_of_tag(char) {
    return char === '>';
  }

  function is_start_of_tag(char) {
    return char === '<';
  }

  function is_start_of_close_tag(char) {
    return char === '</';
  }

  function is_whitespace(char) {
    return /^\s+$/.test(char);
  }

  function self_closing_tags(token) {
    return /(<img)|(<input)/.test(token);
  }
  function is_mearge_tag(tag_part) {
    return /^(?:<(\w+)(?:(?:\s+\w+(?:\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>[^<>]*<\/\1+\s*>|<\w+(?:(?:\s+\w+(?:\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/>|<!--.*?-->|[^<>]+)*$/.test(tag_part);
  }

  function is_tag(token) {
    return /^\s*<[^>]+>\s*$/.test(token);
  }

  function isnt_tag(token) {
    return !is_tag(token);
  }

  /*
   * Checks if the current word is the beginning of an atomic tag. An atomic tag is one whose
   * child nodes should not be compared - the entire tag should be treated as one token. This
   * is useful for tags where it does not make sense to insert <ins> and <del> tags.
   *
   * @param {string} word The characters of the current token read so far.
   *
   * @return {string|null} The name of the atomic tag if the word will be an atomic tag,
   *    null otherwise
   */
  var atomic_tag='^<(object|math|svg|script)';
  function is_start_of_atomic_tag(word) {

    var find_regex = new RegExp(atomic_tag, 'gi');
    result= find_regex.exec(word);

    if (result) {
      result = result[1];
    }
    return result;
  }

  /*
   * Checks if the current word is the end of an atomic tag (i.e. it has all the characters,
   * except for the end bracket of the closing tag, such as '<iframe></iframe').
   *
   * @param {string} word The characters of the current token read so far.
   * @param {string} tag The ending tag to look for.
   *
   * @return {boolean} True if the word is now a complete token (including the end tag),
   *    false otherwise.
   */
  function is_end_of_atomic_tag(word, tag) {
    return word.substring(word.length - tag.length - 2) === ('</' + tag);
  }

  /*
   * Checks if a tag is a void tag.
   *
   * @param {string} token The token to check.
   *
   * @return {boolean} True if the token is a void tag, false otherwise.
   */
  function is_void_tag(token) {
    return /^\s*<[^>]+\/>\s*$/.test(token);
  }

  /*
   * Checks if a token can be wrapped inside a tag.
   *
   * @param {string} token The token to check.
   *
   * @return {boolean} True if the token can be wrapped inside a tag, false otherwise.
   */
  function is_wrappable(token) {
    return isnt_tag(token) || is_start_of_atomic_tag(token) || is_void_tag(token);
  }

  /*
   * A Match stores the information of a matching block. A matching block is a list of
   * consecutive tokens that appear in both the before and after lists of tokens.
   *
   * @param {number} start_in_before The index of the first token in the list of before tokens.
   * @param {number} start_in_after The index of the first token in the list of after tokens.
   * @param {number} length The number of consecutive matching tokens in this block.
   */
  function Match(start_in_before, start_in_after, length) {
    this.start_in_before = start_in_before;
    this.start_in_after = start_in_after;
    this.length = length;
    this.end_in_before = (this.start_in_before + this.length) - 1;
    this.end_in_after = (this.start_in_after + this.length) - 1;
  }

  /*
   * Merge tokens in component by regex role.
   *
   * @param {find_regex_rules} dictate witch tag we want to merge.
   *
   *
   * @param {ignore_regex_rules} dictate witch tag we want to ignore while merging.
   *
   *
   * @param {words Array.<string>} input data already  parsed array(html tags) by html_tokens method.
   *
   * @return {Array.<string>} The list of tokens with merged components requested by component_search_role.
   */
  function merge_html_by_class(find_regex_rules, ignore_regex_rules, words) {
    var mergedWordsArray = [],
        mergedWordsToString = '',
        count_open_tags = 0;

    for (var i = 0; i < words.length; i++) {
      var tag_part = words[i],
      //create regex condition from string for merging
          find_regex = new RegExp(find_regex_rules, 'gi'),
          isFoundTagPart = find_regex.test(tag_part),
          ignore_regex,
          last_count_open_tags,
          isIgnoreTagPart;
      //create regex condition from string for ignoring tags while merging in progress, if condition exist
      if (ignore_regex_rules !== '') {
        ignore_regex = new RegExp(ignore_regex_rules, 'gi');
        isIgnoreTagPart = ignore_regex.test(tag_part);
      } else {
        isIgnoreTagPart = false;
      }
      //merge html tags until parent tag is not closed (also ignore self closed html tags)
      if (!isIgnoreTagPart && (isFoundTagPart || count_open_tags > 0)) {
        if (!is_mearge_tag(tag_part) && is_start_of_tag(tag_part.slice(0, 1)) && !is_start_of_close_tag(tag_part.slice(0, 2)) && !self_closing_tags(tag_part)) {
          count_open_tags = count_open_tags + 1;
        } else if (!is_mearge_tag(tag_part) && is_start_of_tag(tag_part.slice(0, 1)) && !self_closing_tags(tag_part)) {
          count_open_tags = count_open_tags - 1;
        }
        //combine all html string from html tokens while all condition are true
        mergedWordsToString += tag_part;

        if ((count_open_tags===1 && last_count_open_tags>count_open_tags) || count_open_tags === 0) {
          //after parent tag is closed push as one html token
          mergedWordsArray.push(mergedWordsToString);
          mergedWordsToString = '';
        }
        last_count_open_tags=count_open_tags;
      } else {
        //all tags that are not part of components we wont to merge just ignore
        mergedWordsArray.push(tag_part);
      }
    }
    return mergedWordsArray;
  }

  /*
   * Tokenizes a string of HTML.
   *
   * @param {string} html The string to tokenize.
   *
   * @return {Array.<string>} The list of tokens.
   */
  function html_to_tokens(html, component_search_roles) {
    var mode = 'char';
    var current_word = '';
    var current_atomic_tag = '';
    var words = [];
    for (var i = 0; i < html.length; i++) {
      var char = html[i];
      switch (mode) {
        case 'tag':
          var atomic_tag = is_start_of_atomic_tag(current_word);
          if (atomic_tag) {
            mode = 'atomic_tag';
            current_atomic_tag = atomic_tag;
            current_word += char;
          } else if (is_end_of_tag(char)) {
            current_word += '>';
            words.push(current_word);
            current_word = '';
            if (is_whitespace(char)) {
              mode = 'whitespace';
            } else {
              mode = 'char';
            }
          } else {
            current_word += char;
          }
          break;
        case 'atomic_tag':
          if (is_end_of_tag(char) && is_end_of_atomic_tag(current_word, current_atomic_tag)) {
            current_word += '>';
            words.push(current_word);
            current_word = '';
            current_atomic_tag = '';
            mode = 'char';
          } else {
            current_word += char;
          }
          break;
        case 'char':
          if (is_start_of_tag(char)) {
            if (current_word) {
              words.push(current_word);
            }
            current_word = '<';
            mode = 'tag';
          } else if (/\s/.test(char)) {
            if (current_word) {
              words.push(current_word);
            }
            current_word = char;
            mode = 'whitespace';
          } else if (/[\w\d\#@]/.test(char)) {
            current_word += char;
          } else if (/&/.test(char)) {
            if (current_word) {
              words.push(current_word);
            }
            current_word = char;
          } else {
            current_word += char;
            words.push(current_word);
            current_word = '';
          }
          break;
        case 'whitespace':
          if (is_start_of_tag(char)) {
            if (current_word) {
              words.push(current_word);
            }
            current_word = '<';
            mode = 'tag';
          } else if (is_whitespace(char)) {
            current_word += char;
          } else {
            if (current_word) {
              words.push(current_word);
            }
            current_word = char;
            mode = 'char';
          }
          break;
        default:
          throw new Error('Unknown mode ' + mode);
      }
    }
    if (current_word) {
      words.push(current_word);
    }

    for (var i = 0; i < component_search_roles.length; i++) {
      var role = component_search_roles[i];
      words = merge_html_by_class(role.regex, role.not, words);

    }
    return words;
  }

  /*
   * Creates a key that should be used to match tokens. This is useful, for example, if we want
   * to consider two open tag tokens as equal, even if they don't have the same attributes. We
   * use a key instead of overwriting the token because we may want to render the original string
   * without losing the attributes.
   *
   * @param {string} token The token to create the key for.
   *
   * @return {string} The identifying key that should be used to match before and after tokens.
   */
  function get_key_for_token(token) {
    var tag_name = /<([^\s>]+)[\s>]/.exec(token);
    if (tag_name) {
      return '<' + (tag_name[1].toLowerCase()) + '>';
    }
    if (token) {
      return token.replace(/(\s+|&nbsp;|&#160;)/g, ' ');
    }
    return token;
  }

  /*
   * Finds the matching block with the most consecutive tokens within the given range in the
   * before and after lists of tokens.
   *
   * @param {Array.<string>} before_tokens The before list of tokens.
   * @param {Array.<string>} after_tokens The after list of tokens.
   * @param {Object} index_of_before_locations_in_after_tokens The index that is used to search
   *      for tokens in the after list.
   * @param {number} start_in_before The beginning of the range in the list of before tokens.
   * @param {number} end_in_before The end of the range in the list of before tokens.
   * @param {number} start_in_after The beginning of the range in the list of after tokens.
   * @param {number} end_in_after The end of the range in the list of after tokens.
   *
   * @return {Match} A Match that describes the best matching block in the given range.
   */
  function find_match(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, end_in_before, start_in_after, end_in_after) {
    var best_match_in_before = start_in_before;
    var best_match_in_after = start_in_after;
    var best_match_length = 0;
    var match_length_at = {};
    for (var index_in_before = start_in_before; index_in_before < end_in_before; index_in_before++) {
      var new_match_length_at = {};
      var looking_for = before_tokens[index_in_before];
      var locations_in_after = index_of_before_locations_in_after_tokens[looking_for];

      for (var i = 0; i < locations_in_after.length; i++) {
        var index_in_after = locations_in_after[i];
        if (index_in_after < start_in_after) continue;
        if (index_in_after >= end_in_after) break;

        if (!match_length_at[index_in_after - 1]) {
          match_length_at[index_in_after - 1] = 0;
        }
        var new_match_length = match_length_at[index_in_after - 1] + 1;
        new_match_length_at[index_in_after] = new_match_length;

        if (new_match_length > best_match_length) {
          best_match_in_before = index_in_before - new_match_length + 1;
          best_match_in_after = index_in_after - new_match_length + 1;
          best_match_length = new_match_length;
        }
      }
      match_length_at = new_match_length_at;
    }
    if (best_match_length !== 0) {
      return new Match(best_match_in_before, best_match_in_after, best_match_length);
    }
    return null;
  }

  /*
   * Finds all the matching blocks within the given range in the before and after lists of
   * tokens. This function is called recursively to find the next best matches that precede
   * and follow the first best match.
   *
   * @param {Array.<string>} before_tokens The before list of tokens.
   * @param {Array.<string>} after_tokens The after list of tokens.
   * @param {Object} index_of_before_locations_in_after_tokens The index that is used to search
   *      for tokens in the after list.
   * @param {number} start_in_before The beginning of the range in the list of before tokens.
   * @param {number} end_in_before The end of the range in the list of before tokens.
   * @param {number} start_in_after The beginning of the range in the list of after tokens.
   * @param {number} end_in_after The end of the range in the list of after tokens.
   * @param {Array.<Match>} matching_blocks The list of matching blocks found so far.
   *
   * @return {Array.<Match>} The list of matching blocks in this range.
   */
  function recursively_find_matching_blocks(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, end_in_before, start_in_after, end_in_after, matching_blocks) {
    var match = find_match(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, end_in_before, start_in_after, end_in_after);
    if (match) {
      if (start_in_before < match.start_in_before && start_in_after < match.start_in_after) {
        recursively_find_matching_blocks(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, match.start_in_before, start_in_after, match.start_in_after, matching_blocks);
      }
      matching_blocks.push(match);
      if (match.end_in_before <= end_in_before && match.end_in_after <= end_in_after) {
        recursively_find_matching_blocks(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, match.end_in_before + 1, end_in_before, match.end_in_after + 1, end_in_after, matching_blocks);
      }
    }
    return matching_blocks;
  }

  /*
   * Creates an index (A.K.A. hash table) that will be used to match the list of before
   * tokens with the list of after tokens.
   *
   * @param {Object} options An object with the following:
   *    - {Array.<string>} find_these The list of tokens that will be used to search.
   *    - {Array.<string>} in_these The list of tokens that will be returned.
   *
   * @return {Object} An index that can be used to search for tokens.
   */
  function create_index(options) {
    if (!options.find_these) {
      throw new Error('params must have find_these key');
    }
    if (!options.in_these) {
      throw new Error('params must have in_these key');
    }
    var queries = options.find_these;
    var results = options.in_these;
    var index = {};
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i];
      index[query] = [];
      var idx = results.indexOf(query);
      while (idx !== -1) {
        index[query].push(idx);
        idx = results.indexOf(query, idx + 1);
      }
    }
    return index;
  }

  /*
   * Finds all the matching blocks in the before and after lists of tokens. This function
   * is a wrapper for the recursive function recursively_find_matching_blocks.
   *
   * @param {Array.<string>} before_tokens The before list of tokens.
   * @param {Array.<string>} after_tokens The after list of tokens.
   *
   * @return {Array.<Match>} The list of matching blocks.
   */
  function find_matching_blocks(before_tokens, after_tokens) {
    var matching_blocks = [];
    var index_of_before_locations_in_after_tokens = create_index({
      find_these: before_tokens,
      in_these: after_tokens
    });
    return recursively_find_matching_blocks(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, 0, before_tokens.length, 0, after_tokens.length, matching_blocks);
  }

  /*
   * Gets a list of operations required to transform the before list of tokens into the
   * after list of tokens. An operation describes whether a particular list of consecutive
   * tokens are equal, replaced, inserted, or deleted.
   *
   * @param {Array.<string>} before_tokens The before list of tokens.
   * @param {Array.<string>} after_tokens The after list of tokens.
   *
   * @return {Array.<Object>} The list of operations to transform the before list of
   *      tokens into the after list of tokens, where each operation has the following
   *      keys:
   *      - {string} action One of {'replace', 'insert', 'delete', 'equal'}.
   *      - {number} start_in_before The beginning of the range in the list of before tokens.
   *      - {number} end_in_before The end of the range in the list of before tokens.
   *      - {number} start_in_after The beginning of the range in the list of after tokens.
   *      - {number} end_in_after The end of the range in the list of after tokens.
   */
  function calculate_operations(before_tokens, after_tokens) {
    if (!before_tokens) {
      throw new Error('before_tokens?');
    }
    if (!after_tokens) {
      throw new Error('after_tokens?');
    }

    var position_in_before = 0;
    var position_in_after = 0;
    var operations = [];
    var action_map = {
      'false,false': 'replace',
      'true,false': 'insert',
      'false,true': 'delete',
      'true,true': 'none'
    };
    var matches = find_matching_blocks(before_tokens, after_tokens);
    matches.push(new Match(before_tokens.length, after_tokens.length, 0));

    for (var index = 0; index < matches.length; index++) {
      var match = matches[index];
      var match_starts_at_current_position_in_before = position_in_before === match.start_in_before;
      var match_starts_at_current_position_in_after = position_in_after === match.start_in_after;
      var action_up_to_match_positions = action_map[[match_starts_at_current_position_in_before, match_starts_at_current_position_in_after].toString()];
      if (action_up_to_match_positions !== 'none') {
        operations.push({
          action: action_up_to_match_positions,
          start_in_before: position_in_before,
          end_in_before: (action_up_to_match_positions !== 'insert' ? match.start_in_before - 1 : void 0),
          start_in_after: position_in_after,
          end_in_after: (action_up_to_match_positions !== 'delete' ? match.start_in_after - 1 : void 0)
        });
      }
      if (match.length !== 0) {
        operations.push({
          action: 'equal',
          start_in_before: match.start_in_before,
          end_in_before: match.end_in_before,
          start_in_after: match.start_in_after,
          end_in_after: match.end_in_after
        });
      }
      position_in_before = match.end_in_before + 1;
      position_in_after = match.end_in_after + 1;
    }

    var post_processed = [];
    var last_op = {
      action: 'none'
    };

    function is_single_whitespace(op) {
      if (op.action !== 'equal') {
        return false;
      }
      if (op.end_in_before - op.start_in_before !== 0) {
        return false;
      }
      return /^\s$/.test(before_tokens.slice(op.start_in_before, op.end_in_before + 1));
    }

    for (var i = 0; i < operations.length; i++) {
      var op = operations[i];

      if ((is_single_whitespace(op) && last_op.action === 'replace') || (op.action === 'replace' && last_op.action === 'replace')) {
        last_op.end_in_before = op.end_in_before;
        last_op.end_in_after = op.end_in_after;
      } else {
        post_processed.push(op);
        last_op = op;
      }
    }
    return post_processed;
  }

  /*
   * Returns a list of tokens of a particular type starting at a given index.
   *
   * @param {number} start The index of first token to test.
   * @param {Array.<string>} content The list of tokens.
   * @param {function} predicate A function that returns true if a token is of
   *      a particular type, false otherwise. It should accept the following
   *      parameters:
   *      - {string} The token to test.
   */
  function consecutive_where(start, content, predicate) {
    content = content.slice(start, content.length + 1);
    var last_matching_index = null;

    for (var index = 0; index < content.length; index++) {
      var token = content[index];
      var answer = predicate(token);

      if (answer === true) {
        last_matching_index = index;
      }
      if (answer === false) {
        break;
      }
    }

    if (last_matching_index !== null) {
      return content.slice(0, last_matching_index + 1);
    }
    return [];
  }

  /*
   * Wraps and concatenates a list of tokens with a tag. Does not wrap tag tokens,
   * unless they are wrappable (i.e. void and atomic tags).
   *
   * @param {sting} tag The tag name of the wrapper tags.
   * @param {Array.<string>} content The list of tokens to wrap.
   * @param {string} class_name (Optional) The class name to include in the wrapper tag.
   */
  function wrap(tag, content, class_name) {
    var rendering = '';
    var position = 0;
    var length = content.length;

    while (true) {
      if (position >= length) break;
      var non_tags = consecutive_where(position, content, is_wrappable);
      position += non_tags.length;
      if (non_tags.length !== 0) {
        var val = non_tags.join('');
        var attrs = class_name ? ' class="' + class_name + '"' : '';
        if (val.trim()) {
          rendering += '<' + tag + attrs + '>' + val + '</' + tag + '>';
        }
      }

      if (position >= length) break;
      var tags = consecutive_where(position, content, is_tag);
      position += tags.length;
      rendering += tags.join('');
    }
    return rendering;
  }

  /*
   * op_map.equal/insert/delete/replace are functions that render an operation into
   * HTML content.
   *
   * @param {Object} op The operation that applies to a prticular list of tokens. Has the
   *      following keys:
   *      - {string} action One of {'replace', 'insert', 'delete', 'equal'}.
   *      - {number} start_in_before The beginning of the range in the list of before tokens.
   *      - {number} end_in_before The end of the range in the list of before tokens.
   *      - {number} start_in_after The beginning of the range in the list of after tokens.
   *      - {number} end_in_after The end of the range in the list of after tokens.
   * @param {Array.<string>} before_tokens The before list of tokens.
   * @param {Array.<string>} after_tokens The after list of tokens.
   * @param {string} class_name (Optional) The class name to include in the wrapper tag.
   *
   * @return {string} The rendering of that operation.
   */
  var op_map = {
    'equal': function (op, before_tokens, after_tokens, class_name) {
      return after_tokens.slice(op.start_in_after, op.end_in_after + 1).join('');
    },
    'insert': function (op, before_tokens, after_tokens, class_name) {
      var val = after_tokens.slice(op.start_in_after, op.end_in_after + 1);
      return wrap('ins', val, class_name);
    },
    'delete': function (op, before_tokens, after_tokens, class_name) {
      var val = before_tokens.slice(op.start_in_before, op.end_in_before + 1);
      return wrap('del', val, class_name);
    }
  };

  op_map.replace = function (op, before_tokens, after_tokens, class_name) {
    return (op_map['delete'](op, before_tokens, after_tokens, class_name)) +
        (op_map.insert(op, before_tokens, after_tokens, class_name));
  };

  /*
   * Renders a list of operations into HTML content. The result is the combined version
   * of the before and after tokens with the differences wrapped in tags.
   *
   * @param {Array.<string>} before_tokens The before list of tokens.
   * @param {Array.<string>} after_tokens The after list of tokens.
   * @param {Array.<Object>} operations The list of operations to transform the before
   *      list of tokens into the after list of tokens, where each operation has the
   *      following keys:
   *      - {string} action One of {'replace', 'insert', 'delete', 'equal'}.
   *      - {number} start_in_before The beginning of the range in the list of before tokens.
   *      - {number} end_in_before The end of the range in the list of before tokens.
   *      - {number} start_in_after The beginning of the range in the list of after tokens.
   *      - {number} end_in_after The end of the range in the list of after tokens.
   * @param {string} class_name (Optional) The class name to include in the wrapper tag.
   *
   * @return {string} The rendering of the list of operations.
   */
  function render_operations(before_tokens, after_tokens, operations, class_name) {
    var rendering = '';
    for (var i = 0; i < operations.length; i++) {
      var op = operations[i];
      rendering += op_map[op.action](op, before_tokens, after_tokens, class_name);
    }
    return rendering;
  }
  /*
   * Checking if two object are equals
   * @param {Object} first object you want to compare.
   * @param {Object} second object you want to compare.
   */
  function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
      return false;
    }

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
        return false;
      }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
  }
  /*
   * @param {Array.<string>} before The before list of tokens.
   * @param {Array.<string>} after The after list of tokens.
   * @param {Array.<Object>} operations The list of operations to transform the before
   *      list of tokens into the after list of tokens, where each operation has the
   *      following keys:
   */
  function findComponentWithDifferentContent(ops, before, after) {
    var firstAlwaysEqual = {
      action: "equal",
      start_in_before: 0,
      end_in_before: 0,
      start_in_after: 0,
      end_in_after: 0
    };
    var readyForRender = [];
    /*
     * Look ops or all equal components and index range
     */
    for (var z = 0; z < ops.length; z++) {
      var op = ops[z];
      var compare = {
        before: [],
        after: []
      };
      /*Equal tokens start re-investigate status action */
      if (!isEquivalent(op, firstAlwaysEqual) && op.action === 'equal') {
        for (var i = 0; i < before.length; i++) {
          var token = before[i];
          /*Find range equal tokens in before*/
          if (i > op.start_in_before && i < op.end_in_before) {
            compare.before.push(token);
          }
        }
        /*
         * Locate tokens index  from start  to and and and compare length (different length mean is not equal token) */
        for (var j = 0; j < after.length; j++) {
          var token = after[j];
          /*Find range equal tokens in before*/
          if (j > op.start_in_after && j < op.end_in_after) {
            compare.after.push(token);
            /*Compare equal tokens in before and after by length size*/
            if (compare.before.length && compare.before[compare.after.length - 1].length !== compare.after[compare.after.length - 1].length) {
              readyForRender.push({
                before: compare.before[compare.after.length - 1],
                after: compare.after[compare.after.length - 1],
                index: j
              });
            }
          }
        }
      }

    }
    return readyForRender;
  }

  /*
   * Compares two pieces of HTML content and returns the combined content with differences
   * wrapped in <ins> and <del> tags.
   *
   * @param {string} before The HTML content before the changes.
   * @param {string} after The HTML content after the changes.
   * @param {string} class_name (Optional) The class attribute to include in <ins> and <del> tags.
   *
   * @return {string} The combined HTML content with differences wrapped in <ins> and <del> tags.
   */

  function diff(before, after, component_search_roles, one_step_deeper_in_component, class_name ) {
    if (before === after) return before;

    before = html_to_tokens(before, component_search_roles);
    after = html_to_tokens(after, component_search_roles);
    var ops = calculate_operations(before, after);
    /*
     * Find all components that was merged by merge_html_by_class() and component_search_roles but with diff content for example caption (captions are ignored in initial component_search_roles)
     */
    var componentWithDifferentContent=[];
    if(!one_step_deeper_in_component){
      componentWithDifferentContent = findComponentWithDifferentContent(ops, before, after);
    }
    /*
     * Replace component with different content in initial after and before.
     * They will be ignored because action status is equal */
    for (var i = 0; i < componentWithDifferentContent.length; i++) {
      var compare = componentWithDifferentContent[i];
      var reRender = diff(compare.before, compare.after, [],true);
      before[compare.index] = reRender;
      after[compare.index] = reRender;
    }
    return render_operations(before, after, ops, class_name);

  }

  diff.html_to_tokens = html_to_tokens;
  diff.merge_html_by_class = merge_html_by_class;
  diff.find_matching_blocks = find_matching_blocks;
  find_matching_blocks.find_match = find_match;
  find_matching_blocks.create_index = create_index;
  find_matching_blocks.get_key_for_token = get_key_for_token;
  diff.calculate_operations = calculate_operations;
  diff.render_operations = render_operations;

  if (typeof define === 'function') {
    define([], function () {
      return diff;
    });
  } else if (typeof module !== 'undefined' && module !== null) {
    module.exports = diff;
  } else {
    this.htmldiff = diff;
  }

}).call(this);