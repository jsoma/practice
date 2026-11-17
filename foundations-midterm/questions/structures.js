// Structures questions. Format: see questions/README.md.
export default [
  // Lists: positions
  {
    id: "code-list-first",
    family: "code-list-first",
    type: "code",
    difficulty: "easy",
    code: "cities = ['Accra', 'Lima', 'Seoul']",
    stem: "Write code to get the first city.",
    accepted: ["cities[0]", "cities[-3]"],
    explanation: "Python counts positions from zero, so the first item is at position 0 and `cities[0]` is 'Accra'. The number in the square brackets is called the index. Saying \"index 0\" instead of \"the first\" helps you avoid being off by one.",
    hint: "What number does Python start counting from?",
  },
  {
    id: "code-list-first-x1",
    family: "code-list-first",
    type: "code",
    difficulty: "easy",
    code: "stops = ['Canal St', 'Spring St', 'Houston St']",
    stem: "Write code to get the first stop.",
    accepted: ["stops[0]", "stops[-3]"],
    explanation: "An index is an item's position in a list, and Python starts counting at 0. `stops[0]` is 'Canal St'. `stops[1]` would be the second stop, 'Spring St'.",
    hint: "The first position is not 1.",
  },
  {
    id: "code-list-first-mc",
    family: "code-list-first",
    type: "mc",
    difficulty: "easy",
    code: "years = [2019, 2020, 2021, 2022]",
    stem: "Which expression gets the first year?",
    choices: ["years[0]", "years[1]", "years(0)", "years(1)"],
    explanation: "You get an item out of a list with square brackets and its index, and the first index is 0, so `years[0]` is 2019. `years[1]` is the second item, 2020. Parentheses are for calling functions, so `years(0)` raises `TypeError: 'list' object is not callable`.",
    hint: "Brackets or parentheses? And which number comes first?",
  },
  {
    id: "code-list-second",
    family: "code-list-second",
    type: "code",
    difficulty: "easy",
    code: "cats = ['jack', 'mulberry', 'boxcar']",
    stem: "Write code to get the second item.",
    accepted: ["cats[1]", "cats[-2]"],
    explanation: "Indexes start at 0, so the second item is at index 1 and `cats[1]` is 'mulberry'. The index is always one less than the position you'd say out loud.",
    hint: "If the first item is 0, what is the second?",
  },
  {
    id: "code-list-second-x1",
    family: "code-list-second",
    type: "code",
    difficulty: "easy",
    code: "parties = ['Republican', 'Democrat', 'Independent', 'Libertarian']",
    stem: "Write code to get the third party in the list.",
    accepted: ["parties[2]", "parties[-2]"],
    explanation: "The third item is at index 2, one less than its position, so `parties[2]` is 'Independent'. `parties[3]` would skip ahead to 'Libertarian'.",
    hint: "First is 0, second is 1…",
  },
  {
    id: "code-list-second-x2",
    family: "code-list-second",
    type: "code",
    difficulty: "standard",
    code: "stops = ['Canal St', 'Spring St', 'Bleecker St', 'Astor Pl', 'Union Sq']",
    stem: "Write code to get the second-to-last stop.",
    accepted: ["stops[-2]", "stops[3]", "stops[len(stops) - 2]"],
    explanation: "Negative indexes count back from the end: -1 is the last item and -2 is the one before it, so `stops[-2]` is 'Astor Pl'. `stops[3]` gives the same item here, but -2 keeps working if the list gets longer.",
    hint: "-1 is the last item.",
  },
  {
    id: "code-list-last",
    family: "code-list-last",
    type: "code",
    difficulty: "easy",
    code: "cats = ['jack', 'mulberry', 'boxcar']",
    stem: "Write code to get the last item.",
    accepted: ["cats[-1]", "cats[2]", "cats[len(cats) - 1]"],
    explanation: "Negative indexes count back from the end of a list, so `cats[-1]` is always the last item: 'boxcar'. `cats[2]` also works, but only because this list has exactly three items.",
    hint: "You can count from the end with a negative number.",
  },
  {
    id: "code-list-last-states",
    family: "code-list-last",
    type: "mc",
    difficulty: "standard",
    bullets: ["`states` is a list of all 50 U.S. states, in alphabetical order."],
    stem: "Which expression gets the last state?",
    choices: ["states[-1]", "states[50]", "states[-0]", "states[len(states)]"],
    explanation: "With 50 items, the indexes run from 0 to 49. `states[50]` and `states[len(states)]` both ask for index 50, which doesn't exist, so they raise `IndexError`. `-0` is just 0, the first state. `states[-1]` counts back one from the end, which always lands on the last item: 'Wyoming'.",
    hint: "If the first state is at index 0, where is the 50th?",
  },
  {
    id: "code-list-last-len-error",
    family: "code-list-last",
    type: "mc",
    difficulty: "stretch",
    code: `stops = ['Canal St', 'Spring St', 'Bleecker St', 'Astor Pl', 'Union Sq']
print(stops[len(stops)])`,
    stem: "What happens when you run this code?",
    choices: ["IndexError: list index out of range", "Union Sq", "5", "Astor Pl"],
    explanation: "`len(stops)` is 5, so this asks for `stops[5]`. But the indexes of a five-item list run from 0 to 4, so there is no index 5, and Python raises `IndexError`. The length is always one more than the last index. To get the last item, use `stops[-1]`.",
    hint: "Work out `len(stops)` first, then look for that index.",
  },
  {
    id: "code-list-length",
    family: "code-list-length",
    type: "code",
    difficulty: "easy",
    code: "cats = ['jack', 'mulberry', 'boxcar']",
    stem: "Write code to find how many items are in this list.",
    accepted: ["len(cats)"],
    explanation: "`len()` is a built-in function that counts the items in a list, so `len(cats)` is 3. The list goes inside the parentheses.",
    hint: "There is a built-in function for length.",
  },
  {
    id: "code-list-length-x1",
    family: "code-list-length",
    type: "code",
    difficulty: "easy",
    code: "stops = ['Canal St', 'Spring St', 'Bleecker St', 'Astor Pl', 'Union Sq']",
    stem: "Write code to find how many stops there are.",
    accepted: ["len(stops)"],
    explanation: "`len(stops)` returns 5. The count is one more than the last index: five stops have indexes 0 through 4.",
    hint: "There is a built-in function for length.",
  },
  {
    id: "code-list-length-mc",
    family: "code-list-length",
    type: "mc",
    difficulty: "easy",
    code: "stops = ['Canal St', 'Spring St', 'Bleecker St', 'Astor Pl', 'Union Sq']",
    stem: "Which expression gets the number of stops?",
    choices: ["len(stops)", "stops.len()", "stops.length", "len[stops]"],
    explanation: "Python writes `len(stops)`: the function name, then the list in parentheses. JavaScript writes `stops.length`, which fails in Python with `AttributeError`. There's no logic to find here; it's a rule you memorize. Square brackets get items out of a list, so `len[stops]` is an error too.",
    hint: "In Python, length is a function, and functions use parentheses.",
  },

  // Lists: slices
  {
    id: "code-slices-x1",
    family: "code-slices",
    type: "code",
    difficulty: "standard",
    code: "cats = ['jack', 'mulberry', 'boxcar']",
    stem: "Write code to get the first two cats.",
    accepted: ["cats[:2]", "cats[0:2]", "cats[:-1]"],
    explanation: "This is a slice, a way to take part of a list. A slice puts a colon inside the square brackets, `[start:stop]`, and gives you everything from the start index up to, but not including, the stop index. `cats[:2]` leaves the start blank, so it begins at the beginning, and stops before index 2. You get indexes 0 and 1: `['jack', 'mulberry']`.",
    hint: "A slice uses a colon. The stop position is not included.",
  },
  {
    id: "code-slices-x2",
    family: "code-slices",
    type: "code",
    difficulty: "standard",
    code: "stops = ['Canal St', 'Spring St', 'Bleecker St', 'Astor Pl', 'Union Sq']",
    stem: "Write code to get the last two stops.",
    accepted: ["stops[-2:]", "stops[3:]", "stops[3:5]"],
    explanation: "A slice, `[start:stop]`, takes part of a list. Leaving the stop blank means \"run to the end.\" A negative start counts back from the end, so `stops[-2:]` starts at the second-to-last item and takes everything after it: `['Astor Pl', 'Union Sq']`. `stops[3:]` gives the same result here, but `-2:` still works if the list changes length.",
    hint: "Start counting from the end with a negative number, then leave the end of the slice blank.",
  },
  {
    id: "code-slices-x3",
    family: "code-slices",
    type: "code",
    difficulty: "standard",
    code: "stops = ['Canal St', 'Spring St', 'Bleecker St', 'Astor Pl']",
    stem: "Write code to get every stop except the first one.",
    accepted: ["stops[1:]", "stops[1:4]", "stops[-3:]"],
    explanation: "A slice, `[start:stop]`, takes part of a list. `stops[1:]` starts at index 1, the second item, and the blank stop runs to the end, so it leaves out only 'Canal St'. A slice gives you a new list and doesn't change `stops` itself.",
    hint: "Where does the slice start? Leave the end blank.",
  },
  {
    id: "code-slices-x4",
    family: "code-slices",
    type: "mc",
    difficulty: "standard",
    code: `numbers = [10, 20, 30, 40, 50]
print(numbers[1:3])`,
    stem: "What does this code print?",
    choices: ["[20, 30]", "[10, 20, 30]", "[20, 30, 40]", "[10, 20]"],
    explanation: "`numbers[1:3]` is a slice: start at index 1 and stop before index 3. Index 1 is 20 and index 2 is 30. Index 3, which holds 40, is where the slice stops, so it isn't included. A quick check: 3 minus 1 is 2, and the slice has two items.",
    hint: "The second number in a slice is where it stops, not the last one included.",
  },
  {
    id: "code-slices-boroughs",
    family: "code-slices",
    type: "mc",
    difficulty: "standard",
    code: `boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island']
print(boroughs[2:])`,
    stem: "What does this code print?",
    choices: [
      "['Queens', 'The Bronx', 'Staten Island']",
      "['Brooklyn', 'Queens', 'The Bronx', 'Staten Island']",
      "['Manhattan', 'Brooklyn']",
      "['Manhattan', 'Brooklyn', 'Queens']",
    ],
    explanation: "In a slice, `[start:stop]`, a blank stop means \"run to the end.\" `boroughs[2:]` starts at index 2, the third item, which is 'Queens', and takes everything after it. The opposite slice, `boroughs[:2]`, gives the first two: 'Manhattan' and 'Brooklyn'. Where the colon sits tells you which side is blank.",
    hint: "Which side of the colon is the number on?",
  },
  {
    id: "code-slices-test-loop",
    family: "code-slices",
    type: "mc",
    difficulty: "standard",
    code: `for state in states[:3]:
    print(state)`,
    stem: "`states` is a list of all 50 states. Why write `states[:3]` here instead of `states`?",
    choices: [
      "To check the loop on three items before running all 50",
      "To skip the first three states and loop through the rest",
      "To stop the loop from crashing when it reaches the end",
      "To loop through the states three at a time, in groups",
    ],
    explanation: "`states[:3]` is a slice of the first three items, indexes 0, 1 and 2. If the loop scrapes a website or calls an API for each state, running it on three first lets you check that it works before you spend the time on all 50. Skipping the first three would be `states[3:]`, the colon on the other side.",
    hint: "What does `[:3]` give you, and why would you want only that much?",
  },

  // Dictionaries
  {
    id: "code-dict-name",
    family: "code-dict-name",
    type: "code",
    difficulty: "easy",
    code: "cat = {'name': 'jack', 'age': 6, 'color': 'white'}",
    stem: "Write code to get the cat’s name.",
    accepted: ["cat['name']"],
    explanation: "A dictionary stores each value under a key. To get a value, put its key in square brackets, in quotes: `cat['name']` is 'jack'. You make a dictionary with curly braces, but you always get things out with square brackets.",
    hint: "Which key holds the name?",
  },
  {
    id: "code-dict-name-x1",
    family: "code-dict-name",
    type: "code",
    difficulty: "easy",
    code: "politician = {'name': 'Ana Ruiz', 'party': 'Democrat', 'state': 'MT'}",
    stem: "Write code to get the politician’s party.",
    accepted: ["politician['party']"],
    explanation: "`politician['party']` looks up the key 'party' and returns 'Democrat'. With a dictionary you ask for a value by its key, the way you look up a word in a real dictionary to get its definition.",
    hint: "Dictionaries use keys in square brackets.",
  },
  {
    id: "code-dict-name-x2",
    family: "code-dict-name",
    type: "code",
    difficulty: "easy",
    code: "current = {'temp_c': 14.2, 'humidity': 82, 'is_day': 1}",
    stem: "Write code to get the temperature.",
    accepted: ["current['temp_c']"],
    explanation: "`current['temp_c']` returns 14.2. Keys have to match exactly, so `current['temp']` or `current['Temp_c']` would raise `KeyError`.",
    hint: "Use the exact key name, in quotes.",
  },
  {
    id: "code-dict-name-color",
    family: "code-dict-name",
    type: "mc",
    difficulty: "easy",
    code: "cat = {'name': 'Jack', 'age': 6, 'color': 'white'}",
    stem: "Which expression gets 'white'?",
    choices: ["cat['color']", "cat[color]", "cat[2]", "cat.color"],
    explanation: "You ask a dictionary for a value by its key, in quotes: `cat['color']`. Without quotes, `color` is a variable name, and since no variable called color exists, Python raises `NameError`. Dictionaries aren't numbered like lists, so `cat[2]` looks for a key called 2 and raises `KeyError`. `cat.color` is how some other languages do it, not Python.",
    hint: "Is color a key or a variable?",
  },
  {
    id: "code-dict-age",
    family: "code-dict-age",
    type: "code",
    difficulty: "easy",
    code: "cat = {'name': 'mulberry', 'age': 4}",
    stem: "Write code to get the cat’s age.",
    accepted: ["cat['age']"],
    explanation: "`cat['age']` returns 4. A dictionary is looked up by key, not by position, so `cat[1]` would raise `KeyError` rather than give you the second value.",
    hint: "Which key holds the age?",
  },
  {
    id: "code-dict-age-x1",
    family: "code-dict-age",
    type: "code",
    difficulty: "easy",
    code: "pokemon = {'name': 'snorlax', 'height': 21, 'weight': 4600}",
    stem: "Write code to get the Pokémon’s weight.",
    accepted: ["pokemon['weight']"],
    explanation: "`pokemon['weight']` asks the dictionary for the value stored under the key 'weight', which is 4600.",
    hint: "Which key holds the weight?",
  },
  {
    id: "code-dict-age-x2",
    family: "code-dict-age",
    type: "mc",
    difficulty: "standard",
    code: `cat = {'name': 'jack', 'age': 6}
key = 'name'
print(cat[key])`,
    stem: "What does this code print?",
    choices: ["jack", "key", "name", "KeyError"],
    explanation: "Without quotes, `key` is a variable, and Python swaps in whatever it holds: 'name'. So `cat[key]` is the same as `cat['name']`, which is 'jack'. Using a variable as a key isn't a mistake; you'll do it on purpose in loops.",
    hint: "No quotes means it is a variable. What is inside it?",
  },
  {
    id: "code-dict-age-x3",
    family: "code-dict-age",
    type: "mc",
    difficulty: "standard",
    code: `cat = {'name': 'jack', 'age': 6}
print(cat[age])`,
    stem: "Why does this code raise an error?",
    choices: [
      "age has no quotes, so Python looks for a variable named age",
      "Dictionary values can only be strings, and 6 is a number",
      "Keys are capitalized when you look them up, so it needs 'Age'",
      "print can only show strings, so it can't display the 6",
    ],
    explanation: "With quotes, 'age' is text, the name of a key. Without quotes, `age` is a variable name, and since no variable called age exists, Python raises `NameError: name 'age' is not defined`. `cat['age']` asks for the key and gives 6.",
    hint: "What is the difference between age and 'age'?",
  },
  {
    id: "code-dict-age-x4",
    family: "code-dict-age",
    type: "mc",
    difficulty: "stretch",
    code: `people = [
    {'name': 'Ana', 'age': 34},
    {'name': 'Ben'},
    {'name': 'Cy', 'age': 51}
]
for person in people:
    print(person['age'])`,
    stem: "This loop prints 34 and then raises `KeyError: 'age'`. Why?",
    choices: [
      "Ben's dictionary has no 'age' key",
      "'age' needs to be written without quotes",
      "Python can't loop over a list of dictionaries",
      "The loop should use people['age'] instead",
    ],
    explanation: "`KeyError: 'age'` means the dictionary you asked has no key called 'age'. The loop worked for Ana, then reached Ben, whose dictionary only has a name, and stopped there. Real API data often leaves a field out of some items, so a KeyError partway through a loop usually means one record is missing something.",
    hint: "Which item is the loop on when it fails?",
  },
  {
    id: "code-dict-keys",
    family: "code-dict-keys",
    type: "code",
    difficulty: "easy",
    code: "cat = {'name': 'boxcar', 'age': 2}",
    stem: "Write code to see which keys this dictionary has.",
    accepted: ["cat.keys()", "list(cat.keys())", "list(cat)"],
    explanation: "`cat.keys()` asks the dictionary for its keys and gives back `dict_keys(['name', 'age'])`. The parentheses matter: `keys` is a method, a function that belongs to the dictionary, and it only runs when you add them.",
    hint: "Dictionaries have a method that lists their keys.",
  },
  {
    id: "code-dict-keys-x1",
    family: "code-dict-keys",
    type: "code",
    difficulty: "easy",
    code: `print(data)
{'location': {'name': 'Lima', 'region': 'Lima', 'country': 'Peru', 'lat': -12.05, 'lon': -77.05, ...`,
    stem: "You printed data and it starts with a curly brace. Write code to see what keys it has.",
    accepted: ["data.keys()", "list(data.keys())", "list(data)"],
    explanation: "A curly brace at the start means a dictionary, so the next step is `data.keys()`, which shows every key you can ask for. This is how you explore data from an API: print it, look at the outermost character, and do the next thing.",
    hint: "What do you ask a dictionary to find out what's in it?",
  },
  {
    id: "code-dict-keys-x2",
    family: "code-dict-keys",
    type: "mc",
    difficulty: "standard",
    stem: "You ran `print(data.keys)` and it printed `<built-in method keys of dict object at 0x104f2c0c0>`. What went wrong?",
    choices: [
      "The parentheses are missing; it should be data.keys()",
      "data is a list, so it doesn't have any keys",
      "The dictionary is empty, so there are no keys",
      "keys needs to be in quotes, as in data['keys']",
    ],
    explanation: "`keys` is a method, a function that belongs to the dictionary, and a method only runs when you add parentheses. Without them, Python hands you the method itself, which is why the output says `built-in method`. Whenever you see those words, look for missing parentheses.",
    hint: "Methods have to be called.",
  },
  {
    id: "code-dict-values",
    family: "code-dict-values",
    type: "code",
    difficulty: "easy",
    code: "counts = {'North': 12, 'South': 8, 'West': 5}",
    stem: "Write code to add up all the counts.",
    accepted: [
      "sum(counts.values())",
      "sum(list(counts.values()))",
      "counts['North'] + counts['South'] + counts['West']",
    ],
    explanation: "The keys are on the left of each colon and the values on the right. `counts.values()` gives the numbers 12, 8 and 5, and `sum()` adds them up to 25. Adding `counts['North'] + counts['South'] + counts['West']` by hand works too, but breaks as soon as a region is added.",
    hint: "You want the values, not the keys.",
  },
  {
    id: "code-dict-values-x1",
    family: "code-dict-values",
    type: "code",
    difficulty: "standard",
    code: "populations = {'Billings': 117000, 'Missoula': 75000, 'Bozeman': 56000}",
    stem: "Write code to add up all the populations.",
    accepted: [
      "sum(populations.values())",
      "sum(list(populations.values()))",
      "populations['Billings'] + populations['Missoula'] + populations['Bozeman']",
    ],
    explanation: "The city names are the keys and the populations are the values. `populations.values()` gives just the numbers, and `sum()` adds them: 248000. `sum(populations)` on its own would try to add up the city names and fail.",
    hint: "You want the values, not the keys.",
  },
  {
    id: "values-0",
    family: "values-0",
    type: "mc",
    difficulty: "easy",
    code: `populations = {
    "North": 100,
    "South": 250
}`,
    stem: "Which expression totals all the populations?",
    choices: [
      "sum(populations.values())",
      "len(populations)",
      "sum(populations.keys())",
      "populations.sum()",
    ],
    explanation: "A dictionary has keys on the left of each colon and values on the right. Here the keys are area names and the values are populations, so `sum(populations.values())` adds 100 and 250 to get 350. `len(populations)` counts the entries instead, giving 2, and `sum` can't add up the names.",
    hint: "Separate the dictionary’s labels from its numeric values.",
  },
  {
    id: "values-0-x1",
    family: "values-0",
    type: "mc",
    difficulty: "easy",
    code: "populations = {'Billings': 117000, 'Missoula': 75000}",
    stem: "Which expression gets the names of the cities?",
    choices: ["populations.keys()", "populations.values()", "populations[0]", "populations['name']"],
    explanation: "The city names sit on the left of each colon, so they are the keys: `populations.keys()`. `.values()` would give the populations. A dictionary has no numbered positions, so `populations[0]` looks for a key called 0 and raises `KeyError`, and there's no key called 'name' either.",
    hint: "Which side of the colon are the names on?",
  },
  {
    id: "values-0-x2",
    family: "values-0",
    type: "mc",
    difficulty: "standard",
    code: `populations = {'Billings': 117000, 'Missoula': 75000}
print(len(populations))`,
    stem: "What does this code print?",
    choices: ["2", "192000", "4", "['Billings', 'Missoula']"],
    explanation: "`len()` counts entries, and each key–value pair is one entry, so this dictionary has length 2. It doesn't add anything up; to total the populations you'd use `sum(populations.values())`, which gives 192000.",
    hint: "len counts entries; it does not add.",
  },

  // Lists of dictionaries
  {
    id: "index-0",
    family: "index-record",
    type: "mc",
    difficulty: "easy",
    code: `donors = [
    {'name': 'Ari'},
    {'name': 'Bea'},
    {'name': 'Cal'}
]`,
    stem: "Which expression gets the name of the second record?",
    choices: ["donors[1]['name']", "donors[2]['name']", "donors['name'][1]", "donors(1)['name']"],
    explanation: "`donors` is a list, so the first step is a position, and positions start at 0: the second record is `donors[1]`. That record is a dictionary, so the next step is a key: `['name']` gives 'Bea'. `donors['name']` fails because a list can't take a key.",
    hint: "Select a list item by position, then a dictionary value by key.",
  },
  {
    id: "index-1",
    family: "index-record",
    type: "mc",
    difficulty: "easy",
    code: `cities = [
    {'name': 'Lima'},
    {'name': 'Accra'},
    {'name': 'Seoul'}
]`,
    stem: "Which expression gets the name of the third record?",
    choices: ["cities[2]['name']", "cities[3]['name']", "cities['name'][2]", "cities(2)['name']"],
    explanation: "The third record is at index 2, because indexes start at 0, so `cities[2]` is Seoul's dictionary and `['name']` gives 'Seoul'. `cities[3]` is past the end of a three-item list. The position always comes before the key, because the outer thing is a list.",
    hint: "Select a list item by position, then a dictionary value by key.",
  },
  {
    id: "index-record-whole",
    family: "index-record",
    type: "mc",
    difficulty: "standard",
    code: `cats = [
    {'name': 'Jack'},
    {'name': 'Fern'},
    {'name': 'Boxcar'}
]
print(cats[1])`,
    stem: "What does this code print?",
    choices: ["{'name': 'Fern'}", "Fern", "{'name': 'Jack'}", "Jack"],
    explanation: "`cats[1]` picks the second item in the list, and each item is a whole dictionary, so you get `{'name': 'Fern'}`. To get just 'Fern', add the key: `cats[1]['name']`.",
    hint: "What kind of thing is each item in this list?",
  },
  {
    id: "code-list-dict",
    family: "code-list-dict",
    type: "code",
    difficulty: "easy",
    code: `cats = [
    {'name': 'jack', 'age': 6},
    {'name': 'mulberry', 'age': 4},
    {'name': 'boxcar', 'age': 2}
]`,
    stem: "Write code to get the name of the second cat.",
    accepted: ["cats[1]['name']", "cats[-2]['name']"],
    explanation: "Work from the outside in. `cats` is a list, so it takes a position: `cats[1]` is the second dictionary. That dictionary takes a key: `['name']` gives 'mulberry'.",
    hint: "Pick the cat by position first, then the value by key.",
  },
  {
    id: "code-list-dict-x1",
    family: "code-list-dict",
    type: "code",
    difficulty: "easy",
    code: `presidents = [
    {'name': 'Obama', 'party': 'Democrat'},
    {'name': 'Trump', 'party': 'Republican'},
    {'name': 'Biden', 'party': 'Democrat'}
]`,
    stem: "Write code to get the party of the first president.",
    accepted: ["presidents[0]['party']", "presidents[-3]['party']"],
    explanation: "`presidents[0]` is the first dictionary in the list, Obama's, and `['party']` asks it for the party: 'Democrat'. A list of dictionaries works like a table, with the list holding the rows and the keys naming the columns.",
    hint: "Pick the item from the list, then the key from the dictionary.",
  },
  {
    id: "code-list-dict-x2",
    family: "code-list-dict",
    type: "code",
    difficulty: "standard",
    code: `art_pieces = [
    {'title': 'Untitled', 'year': 1948},
    {'title': 'Flag', 'year': 1955},
    {'title': 'Marilyn', 'year': 1962}
]`,
    stem: "Write code to get the year of the second artwork.",
    accepted: ["art_pieces[1]['year']", "art_pieces[-2]['year']"],
    explanation: "`art_pieces[1]` is the second dictionary, because indexes start at 0, and `['year']` gives 1955.",
    hint: "Second item is position 1.",
  },
  {
    id: "code-list-dict-x3",
    family: "code-list-dict",
    type: "mc",
    difficulty: "standard",
    code: `cats = [
    {'name': 'jack', 'age': 6},
    {'name': 'mulberry', 'age': 4}
]`,
    stem: "`cats['name']` raises `TypeError: list indices must be integers or slices, not str`. Why?",
    choices: [
      "cats is a list, and a list only takes integer positions",
      "Keys are case-sensitive, so it needs to be 'Name'",
      "A list can't hold dictionaries, so the names are lost",
      "Lists use dot notation, so it should be cats.name",
    ],
    explanation: "Read the error word by word. List indices, the numbers in square brackets after a list, must be integers, and you gave it a str, a string. `cats` is a list, so it can only do list things: give you an item by position, or be looped through. `cats[0]['name']` gets one cat's name; a loop gets all of them.",
    hint: "What kind of thing is cats itself?",
  },
  {
    id: "code-list-dict-x4",
    family: "code-list-dict",
    type: "output",
    difficulty: "stretch",
    code: `cats = [
    {'name': 'jack', 'age': 6},
    {'name': 'mulberry', 'age': 4},
    {'name': 'boxcar', 'age': 2}
]
names = []
for cat in cats:
    if cat['age'] > 3:
        names.append(cat['name'])
print(names)`,
    stem: "What does this code print? Type the output.",
    accepted: ["['jack', 'mulberry']"],
    explanation: "The loop hands you one dictionary at a time as `cat`. jack (6) and mulberry (4) are older than 3, so their names are appended to `names`; boxcar (2) is skipped. The printed list is `['jack', 'mulberry']`.",
    hint: "Check each cat’s age, and keep track of what gets appended.",
  },
  {
    id: "code-last-dict",
    family: "code-last-dict",
    type: "code",
    difficulty: "easy",
    code: `cats = [
    {'name': 'jack', 'age': 6},
    {'name': 'mulberry', 'age': 4},
    {'name': 'boxcar', 'age': 2}
]`,
    stem: "Write code to get the age of the last cat.",
    accepted: ["cats[-1]['age']", "cats[2]['age']", "cats[len(cats) - 1]['age']"],
    explanation: "`cats[-1]` picks the last dictionary in the list, boxcar's, and `['age']` takes the value under that key: 2. The list takes a position, then the dictionary takes a key.",
    hint: "-1 gets the last item.",
  },
  {
    id: "code-last-dict-x1",
    family: "code-last-dict",
    type: "code",
    difficulty: "easy",
    code: `songs = [
    {'title': 'Harvest Moon', 'plays': 812},
    {'title': 'Autumn Leaves', 'plays': 455},
    {'title': 'September', 'plays': 1290}
]`,
    stem: "Write code to get the title of the last song.",
    accepted: ["songs[-1]['title']", "songs[2]['title']", "songs[len(songs) - 1]['title']"],
    explanation: "`songs[-1]` is the last dictionary in the list, and `['title']` gives 'September'. Using -1 means you don't need to know how long the list is.",
    hint: "-1 gets the last item.",
  },
  {
    id: "code-last-dict-mc",
    family: "code-last-dict",
    type: "mc",
    difficulty: "standard",
    code: `presidents = [
    {'name': 'Jimmy Carter', 'party': 'Democratic'},
    {'name': 'Ronald Reagan', 'party': 'Republican'},
    {'name': 'George H. W. Bush', 'party': 'Republican'}
]`,
    stem: "Which expression gets the last president's name?",
    choices: [
      "presidents[-1]['name']",
      "presidents['name'][-1]",
      "presidents[-1].name",
      "presidents[3]['name']",
    ],
    explanation: "The outer thing is a list, so the position comes first: `presidents[-1]` is the last dictionary. Then the key: `['name']` gives 'George H. W. Bush'. `presidents['name']` fails because a list can't take a key, and `presidents[3]` is past the end of a three-item list.",
    hint: "Position first or key first?",
  },

  // Nested data
  {
    id: "code-nested-dict",
    family: "code-nested-dict",
    type: "code",
    difficulty: "easy",
    code: "weather = {'location': {'city': 'Lima', 'country': 'Peru'}}",
    stem: "Write code to get the country.",
    accepted: ["weather['location']['country']"],
    explanation: "This is nested data: a dictionary inside a dictionary. `weather['location']` gives the inner dictionary, `{'city': 'Lima', 'country': 'Peru'}`, and adding `['country']` asks that dictionary for 'Peru'. Each pair of square brackets goes one level deeper.",
    hint: "Which key holds the inner dictionary?",
  },
  {
    id: "code-nested-dict-x1",
    family: "code-nested-dict",
    type: "code",
    difficulty: "standard",
    code: `weather = {
    'current': {
        'temp_c': 14.2,
        'condition': {'text': 'Cloudy', 'code': 1006}
    }
}`,
    stem: "Write code to get the condition text (“Cloudy”).",
    accepted: ["weather['current']['condition']['text']"],
    explanation: "Follow the keys one level at a time. `weather['current']` is a dictionary, `weather['current']['condition']` is a dictionary inside that one, and `['text']` gives 'Cloudy'. The indentation shows the levels: 'text' is indented under 'condition', which is indented under 'current'.",
    hint: "Three dictionaries deep.",
  },
  {
    id: "code-nested-dict-x2",
    family: "code-nested-dict",
    type: "code",
    difficulty: "standard",
    code: `data = {
    'location': {'name': 'Missoula', 'region': 'Montana'},
    'current': {'temp_c': 3.1}
}`,
    stem: "Write code to get the city name.",
    accepted: ["data['location']['name']"],
    explanation: "`data` has two keys, 'location' and 'current', and each holds another dictionary. The city is in the location dictionary, so `data['location']` gets you there and `['name']` gives 'Missoula'.",
    hint: "Which top-level key holds place information?",
  },
  {
    id: "code-json-list",
    family: "code-json-list",
    type: "code",
    difficulty: "easy",
    code: "data = {'results': {'items': [{'name': 'Jack'}, {'name': 'Fern'}]}}",
    stem: "Write code to get the whole list of items.",
    accepted: ["data['results']['items']"],
    explanation: "`data` is a dictionary, and so is `data['results']`. Its 'items' key holds the list, so `data['results']['items']` gives you all of it. You'd add an index like `[0]` only to pull out one item.",
    hint: "Two keys get you to the list.",
  },
  {
    id: "code-json-list-x1",
    family: "code-json-list",
    type: "code",
    difficulty: "standard",
    code: `data = {
    'forecast': {
        'forecastday': [
            {'date': '2026-11-18', 'maxtemp_c': 9},
            {'date': '2026-11-19', 'maxtemp_c': 11}
        ]
    }
}`,
    stem: "Write code to get the first forecast day.",
    accepted: ["data['forecast']['forecastday'][0]", "data['forecast']['forecastday'][-2]"],
    explanation: "Two keys get you to the list: `data['forecast']['forecastday']`. The square bracket after 'forecastday' shows it's a list, so it takes a position, and `[0]` gives the first day's whole dictionary.",
    hint: "Two keys get you to the list, then a position.",
  },
  {
    id: "code-json-list-x2",
    family: "code-json-list",
    type: "code",
    difficulty: "stretch",
    code: `data = {
    'forecast': {
        'forecastday': [
            {'date': '2026-11-18', 'maxtemp_c': 9},
            {'date': '2026-11-19', 'maxtemp_c': 11}
        ]
    }
}`,
    stem: "Write code to get the max temperature of the second forecast day.",
    accepted: [
      "data['forecast']['forecastday'][1]['maxtemp_c']",
      "data['forecast']['forecastday'][-1]['maxtemp_c']",
    ],
    explanation: "Name each level as you go: dictionary, dictionary, list, dictionary. `data['forecast']` and `['forecastday']` are keys that get you to the list, `[1]` picks the second day, and `['maxtemp_c']` asks that day's dictionary for its temperature: 11. If you lose track, print each step and look at the first character: a curly brace takes a key, a square bracket takes a position.",
    hint: "Read one level at a time.",
  },
  {
    id: "code-json-list-x3",
    family: "code-json-list",
    type: "output",
    difficulty: "stretch",
    code: `data = {
    'results': [
        {'name': 'Ari', 'tags': ['a', 'b']},
        {'name': 'Bea', 'tags': ['c']}
    ]
}
print(len(data['results'][0]['tags']))`,
    stem: "What does this code print? Type the output.",
    accepted: ["2"],
    explanation: "Follow the brackets left to right. `data['results']` is a list of two dictionaries, `[0]` picks Ari's, and `['tags']` is Ari's list of tags, `['a', 'b']`. `len()` counts what's inside its own parentheses, that list of tags, so it prints 2.",
    hint: "Follow the brackets left to right, then count.",
  },
  {
    id: "code-json-list-count",
    family: "code-json-list",
    type: "code",
    difficulty: "standard",
    code: `data = {
    'count': 760,
    'results': {
        'items': [
            {'size': '48', 'price': 19.90, 'type': 'shoe'},
            {'size': 'L', 'price': 100, 'type': 'shirt'},
            {'size': 'S', 'price': 75, 'type': 'shirt'}
        ]
    }
}`,
    stem: "Write code to count how many items are in this response.",
    accepted: ["len(data['results']['items'])"],
    explanation: "`len()` counts the items in a list, but first you have to reach the list: `data['results']['items']`. That's what goes inside the parentheses, and it gives 3. `count` says 760 because that's how many results exist in total; the API only sent back some of them.",
    hint: "Find the list first, then count it.",
  },
  {
    id: "nested-0",
    family: "nested-json",
    type: "mc",
    difficulty: "standard",
    code: `data = {
    'results': {
        'items': [
            {'price': 10},
            {'price': 30}
        ]
    }
}`,
    stem: "Which expression gets the second item's price?",
    choices: [
      "data['results']['items'][1]['price']",
      "data['results']['items']['price']",
      "data['items'][1]['price']",
      "data['results'][1]['items']['price']",
    ],
    explanation: "Read nested data one level at a time, from the outside in. `data` is a dictionary, `data['results']` is another dictionary, and `data['results']['items']` is a list. A list takes a position, so `[1]` picks the second item, and that item is a dictionary, so `['price']` gives 30. You can't skip a level: `data['items']` fails because 'items' is inside 'results'.",
    hint: "Read one level at a time: dictionary, dictionary, list, dictionary.",
  },
  {
    id: "nested-json-results-level",
    family: "nested-json",
    type: "mc",
    difficulty: "standard",
    code: `data = {
    'count': 760,
    'results': {
        'items': [
            {'size': '48', 'price': 19.90, 'type': 'shoe'},
            {'size': 'L', 'price': 100, 'type': 'shirt'},
            {'size': 'S', 'price': 75, 'type': 'shirt'}
        ]
    }
}`,
    stem: "What is `data['results']`?",
    choices: [
      "A dictionary with one key, 'items'",
      "The list of three items",
      "The number 760",
      "The first item in the list",
    ],
    explanation: "The value of 'results' starts with a curly brace, so `data['results']` is a dictionary, and its only key is 'items'. The list is one level further down, at `data['results']['items']`. A list inside a dictionary inside a dictionary is one of the most common shapes for API data, so it's worth recognizing on sight.",
    hint: "Look at the first character after 'results'.",
  },
  {
    id: "nested-json-x1",
    family: "nested-json",
    type: "mc",
    difficulty: "standard",
    code: `data = {
    'name': 'bulbasaur',
    'types': [
        {'slot': 1, 'type': {'name': 'grass'}},
        {'slot': 2, 'type': {'name': 'poison'}}
    ]
}`,
    stem: "Which expression gets the name of the first type (“grass”)?",
    choices: [
      "data['types'][0]['type']['name']",
      "data['types']['type']['name']",
      "data['types'][0]['name']",
      "data['type'][0]['name']",
    ],
    explanation: "`data['types']` is a list, because its value starts with a square bracket, so it takes a position: `[0]` is the first entry. That entry is a dictionary with the keys 'slot' and 'type', and 'type' holds yet another dictionary, so you need `['type']` and then `['name']`. Without the `[0]`, you'd be asking a list for a key, which raises `TypeError`.",
    hint: "Look for the square bracket that starts a list.",
  },
  {
    id: "nested-json-x2",
    family: "nested-json",
    type: "mc",
    difficulty: "standard",
    code: `data = {'results': [{'name': 'Ari'}, {'name': 'Bea'}, {'name': 'Cal'}]}
print(len(data['results']))`,
    stem: "What does this code print?",
    choices: ["3", "1", "6", "KeyError: 'results'"],
    explanation: "`data['results']` is a list holding three dictionaries, and `len()` counts the items in a list, so it prints 3. It doesn't look inside the dictionaries, and it isn't counting `data` itself, which has only one key.",
    hint: "What is data['results']?",
  },
  {
    id: "nested-json-x3",
    family: "nested-json",
    type: "mc",
    difficulty: "stretch",
    code: `data = {
    'forecast': {
        'forecastday': [
            {'date': '2026-11-18', 'day': {'maxtemp_c': 9}},
            {'date': '2026-11-19', 'day': {'maxtemp_c': 11}}
        ]
    }
}`,
    stem: "Which code prints the max temperature for every forecast day?",
    choices: [
      `for day in data['forecast']['forecastday']:
    print(day['day']['maxtemp_c'])`,
      "print(data['forecast']['forecastday']['day']['maxtemp_c'])",
      `for day in data['forecast']:
    print(day['day']['maxtemp_c'])`,
      `for day in data['forecast']['forecastday']:
    print(day['maxtemp_c'])`,
    ],
    explanation: "\"Every\" means a loop, and you loop over the list, which is at `data['forecast']['forecastday']`. Each time through, `day` is one dictionary like `{'date': '2026-11-18', 'day': {'maxtemp_c': 9}}`. Its 'day' key holds another dictionary, so the temperature is `day['day']['maxtemp_c']`. Looping over `data['forecast']` would go through that dictionary's keys, and asking a list for `['day']` raises `TypeError`.",
    hint: "Find the list first, then look inside one item.",
  },

  // Choosing a structure
  {
    id: "unit-0-cats-mc",
    family: "unit-0",
    type: "mc",
    difficulty: "easy",
    stem: "You want to store the name, age and color of each of your six cats. Which structure fits best?",
    choices: [
      "A list of dictionaries, one dictionary per cat",
      "One dictionary with keys like name1, name2, name3",
      "Six separate variables, each holding a dictionary",
      "One long list of all 18 names, ages and colors",
    ],
    explanation: "Each cat has several attributes that belong together, so each cat is a dictionary with keys name, age and color. Six cats are a bunch of the same kind of thing, so they go in a list. A list of dictionaries works like a table: the list holds the rows, and the keys are the columns.",
    hint: "You need both a collection of cats and several facts about each cat.",
  },
  {
    id: "unit-0-politicians-mc",
    family: "unit-0",
    type: "mc",
    difficulty: "easy",
    stem: "You want to store the name, party and state of 50 politicians. Which structure do you use?",
    choices: [
      "A list of 50 dictionaries with keys name, party and state",
      "One dictionary with names as keys and parties as values",
      "A list of 50 strings, like 'Ana Ruiz, Democrat, MT'",
      "One dictionary with the keys name, party and state",
    ],
    explanation: "Each politician has three facts that belong together, so each one is a dictionary with keys name, party and state, and the 50 dictionaries go in a list. A dictionary of names and parties has nowhere to put the state. A string like 'Ana Ruiz, Democrat, MT' can't be asked for its party, and a single dictionary only describes one politician.",
    hint: "One collection, many records.",
  },
  {
    id: "unit-0-add-attribute",
    family: "unit-0",
    type: "mc",
    difficulty: "standard",
    code: `presidents = [
    {'name': 'Jimmy Carter', 'party': 'Democratic'},
    {'name': 'Ronald Reagan', 'party': 'Republican'},
    {'name': 'George H. W. Bush', 'party': 'Republican'}
]`,
    stem: "You want to add the year each president took office. What changes?",
    choices: [
      "Each dictionary gets one more key, like 'start'",
      "The list gets three more items, one per year",
      "Each dictionary becomes a list of its values",
      "A new dictionary is added that holds the years",
    ],
    explanation: "The list holds the presidents and each dictionary holds one president's attributes. A new fact about each president is a new attribute, so every dictionary gets one more key, like `{'name': 'Jimmy Carter', 'party': 'Democratic', 'start': 1977}`. The list stays the same length, because you still have three presidents.",
    hint: "Is a start year a new president, or a new fact about each one?",
  },
  {
    id: "unit-1",
    family: "unit-1",
    type: "short",
    difficulty: "standard",
    stem: "When would you choose a list, and when would you choose a dictionary?",
    groups: [
      [
        "a list is a collection of things",
        "collection",
        "bunch",
        "group",
        "sequence",
        "ordered",
        "order",
        "many",
        "multiple",
        "several",
        "items",
        "same kind",
        "same type",
        "loop",
        "position",
        "positions",
        "index",
      ],
      [
        "a dictionary gives values names (keys)",
        "key",
        "keys",
        "attribute",
        "attributes",
        "named",
        "label",
        "labels",
        "labeled",
        "property",
        "properties",
        "field",
        "fields",
        "describe",
        "describes",
        "details",
        "look up",
        "lookup",
        "record",
        "pairs",
      ],
    ],
    explanation: "Use a list for a collection of the same kind of thing, like 20 names or 30 numbers, where you get items by position or loop through them. Use a dictionary when one thing has several attributes, where each value has a key that names it, like a cat's name, age and color. When you have many things with the same attributes, put dictionaries inside a list.",
    hint: "Compare a list of cat names with a record containing one cat’s name, age, and color.",
  },
  {
    id: "unit-1-bracket-mc",
    family: "unit-1",
    type: "mc",
    difficulty: "easy",
    stem: "You print some data and it starts with `[`. What is it, and how do you get one item out?",
    choices: [
      "A list; ask for an item by position, like data[0]",
      "A dictionary; ask for an item by key, like data['name']",
      "A list; ask for an item by key, like data['name']",
      "A dictionary; ask for an item by position, like data[0]",
    ],
    explanation: "A square bracket at the start means a list, and a curly brace means a dictionary. A list gives you items by position, so `data[0]` is the first one, or you can loop through all of them. A list can be empty, so a loop or a quick `len(data)` is safer than grabbing `[0]` blind.",
    hint: "Square brackets versus curly braces.",
  },
  {
    id: "unit-1-borough-times",
    family: "unit-1",
    type: "mc",
    difficulty: "standard",
    stem: "Which structure fits the average ambulance response time for each borough?",
    choices: [
      "A dictionary with boroughs as keys and times as values",
      "A list of every response time recorded last year",
      "A list of the borough names, in alphabetical order",
      "A single number for the citywide average time",
    ],
    explanation: "Each average needs a label saying which borough it belongs to, and labels are what dictionary keys are for: `{'Brooklyn': 5, 'Bronx': 10}`. A list of times would lose which borough each one came from. The right structure depends on what you have: every response time from last year, ready for statistics, would be a list.",
    hint: "Does each number need a label?",
  },
];
