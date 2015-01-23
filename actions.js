(function() {

	var all_text = '';
	var all_text_frequency = {}
	var minimum_length = 4;
	var sentiment_threshold = 0.5;
	var results = d3.select('div#results');
	var tags = results.append('div').attr('id', 'tags');
	var tweets = results.append('div').attr('id', 'tweets');

var lunr_stop_words = ["",
  "a",
  "able",
  "about",
  "across",
  "after",
  "all",
  "almost",
  "also",
  "am",
  "among",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "but",
  "by",
  "can",
  "cannot",
  "could",
  "dear",
  "did",
  "do",
  "does",
  "either",
  "else",
  "ever",
  "every",
  "for",
  "from",
  "get",
  "got",
  "had",
  "has",
  "have",
  "he",
  "her",
  "hers",
  "him",
  "his",
  "how",
  "however",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "least",
  "let",
  "like",
  "likely",
  "may",
  "me",
  "might",
  "most",
  "must",
  "my",
  "neither",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "often",
  "on",
  "only",
  "or",
  "other",
  "our",
  "own",
  "rather",
  "said",
  "say",
  "says",
  "she",
  "should",
  "since",
  "so",
  "some",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "tis",
  "to",
  "too",
  "twas",
  "us",
  "wants",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "would",
  "yet",
  "you",
  "your"
];

var custom_stop_words = [
	'RT'
]

var stop_words = []

var important_words = function(text) {
	filtered_text = text;
	for (var i = 0; i < stop_words.length; i++) {
		var stop_word = stop_words[i];
		var pattern = new RegExp(' ' + stop_word + ' ', 'gi')
		filtered_text = filtered_text.replace(pattern, ' ');
	}
	return filtered_text;
}

var get_variants = function(text) {
	var variants = []
	var pos = nlp.pos(text).sentences[0]
	var nouns = pos.nouns().map(function(item) {
		return item.normalised;
	});
	for (var i = 0; i < nouns.length; i++) {
		var noun = nouns[i]
		if (nlp.noun(noun).is_plural) {
			variants.push(nlp.noun(noun).singularize())
		} else {
			variants.push(nlp.noun(noun).pluralize())
		}
	}
	var adjectives = pos.adjectives().map(function(item) {
		return item.normalised;
	});
	for (var i = 0; i < adjectives.length; i++) {
		var adjective = adjectives[i]
		var conjugations = nlp.adjective(adjective).conjugate();
		for (j in conjugations) {
			variants.push(conjugations[j]);
		}
	}
	var verbs = pos.verbs().map(function(item) {
		return item.normalised;
	});
	var adverbs = pos.adverbs().map(function(item) {
		return item.normalised;
	});
	for (var i = 0; i < adverbs.length; i++) {
		var adverb = adverbs[i];
		var verb_form = nlp.adverb(adverb).conjugate().adjective;
		verbs.push(verb_form);
	}
	for (var i = 0; i < verbs.length; i++) {
		var verb = verbs[i];
		var conjugations = nlp.verb(verb).conjugate()
		for (j in conjugations) {
			variants.push(conjugations[j])
		}
	}
	return variants;
}

var strip_urls = function(text) {
	var pattern  = /(https?:\/\/[^\s]+)/g;
	var no_urls = text.replace(pattern, '');
	return no_urls;
}

var strip_users = function(text) {
	var words_array = text.split(' ');
	var no_users_array = words_array.filter(function(item) {
		first_character = item.slice(0, 1);
		if (first_character != '@') {
			return true;
		}
	});
	var no_users_string = no_users_array.join(' ');
	return no_users_string;
}

var strip_punctuation = function(text) {
	var no_punctuation = text.replace(/[\.,-\/“”\[\]#!$%\^@\"\'&\*;:{}=\-_`~()]/g,"")
	return no_punctuation;
}

var count_occurrences = function(needle, haystack) {
	try {
		var pattern = new RegExp(strip_punctuation(needle), 'gi');
	}
	catch(e) {
    return;
	}
	var count = (haystack.match(pattern) || []).length;
	return count;
}

var get_word_frequency = function(text) {
	var all_text_array = filter_text(all_text).split(' ');
	word_frequency = {}
	for (var i = 0; i < all_text_array.length; i++) {
		word = all_text_array[i].toLowerCase();
		if (word_frequency[word]) {
			word_frequency[word] += 1;
		} else {
			word_frequency[word] = 1;
		}
	}
	return word_frequency;
}

var filter_text = function(string) {
	var string = strip_urls(string);
	var string = strip_users(string);
	var string = strip_punctuation(string);
	var string = important_words(string);
	words_array = string.split(' ');
	words = '';
	for (var i = 0; i < words_array.length; i++) {
		word = words_array[i];
		// count = count_occurrences(word, all_text);
	if (word.length > minimum_length - 1 /* && count > 1 */) {
			words += word + ' ';
		}
	}
	return words;
}

stop_words = stop_words.concat(
	lunr_stop_words,
	custom_stop_words
);

var stop_word_variants = get_variants(stop_words.join(' '));

stop_words = stop_words.concat(stop_word_variants);

	var get_tweets = function(search_term) {

		var api_url = './api.php?mode=twitter&q=' + search_term;

		d3.json(api_url, function(data) {

			all_text = data.statuses.map(function(item) {return item.text;}).join(' ');
			all_text_frequency = get_word_frequency(all_text);
			top_text = [];
			for (var word in all_text_frequency) {
				count = all_text_frequency[word];
				if (count > 1 && word.length > minimum_length - 1) {
					var temp = {
						word: word,
						count: count
					}
					top_text.push(temp);
				}
			}
			top_text.sort(function(a, b) {
				return a.count > b.count;
			})
			top_text.reverse();
			var subset = top_text.slice(0, 9);
			var top_text_string = '';
			for (var i = 0; i < subset.length; i++) {
				var top_item = subset[i];
				top_text_string += '[' + top_item.word + ' ' + top_item.count + '] + '
			}

			data = data.statuses.map(function(item) {
				var tweet = item;
				var filtered_text = filter_text(item.text);
				var temp = {
					tweet: tweet,
					filtered_text: filtered_text,
					sentiment: '?'
				}
				return temp;
			});

			tag = tags.selectAll('div.tag').data(subset).enter().append('div').classed('tag', true)
			var word = tag.append('div').classed('word', true);
			word.text(function(d) {
				return d.word;
			});
			var count = tag.append('div').classed('count', true);
			count.text(function(d) {
				return d.count;
			});
			tag.attr('id', function(d) {
				return 'word-' + d.word.toLowerCase();
			})

			color_tags();

		});

		var color_scale = d3.scale.linear();
		color_scale
			.domain([0, 0.5, 1])
			.range(['red', 'grey', 'green'])

		var color_tags =function() {
			d3.select('div#tags').selectAll('div.tag').each(function(item) {
				var api_url = 'api.php?mode=sentiment&q=' + item.word;
				d3.json(api_url, function(sentiment) {
					color = color_scale(sentiment.probability);
					if(
						(sentiment.probability > 1 - sentiment_threshold) ||
						(sentiment.probability < sentiment_threshold)
					)
					var extreme_sentiment = false;
					if (
						(sentiment.probability > 1 - sentiment_threshold) ||
						(sentiment.probability < sentiment_threshold)
					) {
						extreme_sentiment = true;
					}
					if (extreme_sentiment) {
						d3.select('div#word-' + item.word).style('background-color', color);
						var sentiment_type;
						sentiment.probability > 0.5 ? sentiment_type = 'positive' : sentiment_type = 'negative';
						d3.select('div#word-' + item.word).classed(sentiment_type, true);
					}
				});
			});
		}

	}

		var clear_input = function() {
				d3.select('div#controls form input').on('click', function() {
					d3.select(this).attr('value', '');
				});
		}

		clear_input();

		jQuery('div#controls form').submit(function (evt) {
	    evt.preventDefault();
	    window.history.back();
		});

	d3.select('div#gettags a').on('click', function() {
		d3.select('div#tags').selectAll('*').remove();
		var search_term = d3.select('#input').property('value');
		get_tweets(search_term);
		clear_input();
		return;
	})

}).call(this);
