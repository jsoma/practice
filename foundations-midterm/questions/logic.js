// Logic questions. Format: see questions/README.md.
export default [
  {
    id: "code-convert",
    family: "code-convert",
    type: "code",
    difficulty: "easy",
    code: "age = '24'",
    stem: "Write code to convert `age` to an integer and save it back in `age`.",
    accepted: ["age = int(age)", "age = int('24')"],
    explanation: "The quotes make `'24'` a string: text that happens to contain digits. `int()` converts it to an integer, a whole number you can do math with, and `age = ` saves the result back under the same name, so you only convert once.",
    hint: "Which function turns text into a whole number?",
  },
  {
    id: "code-convert-x1",
    family: "code-convert",
    type: "code",
    difficulty: "easy",
    code: "price = '4.99'",
    stem: "Write code to convert `price` to a decimal number and save it back in `price`.",
    accepted: ["price = float(price)", "price = float('4.99')"],
    explanation: "A number with a decimal point is a float. `float(price)` turns the text `'4.99'` into the number 4.99. `int()` wouldn't work here, because `'4.99'` isn't a whole number.",
    hint: "`int` is for whole numbers. Which function is for decimals?",
  },
  {
    id: "code-convert-x2",
    family: "code-convert",
    type: "output",
    difficulty: "standard",
    code: `a = '3'
b = '4'
print(a + b)`,
    stem: "What does this code print?",
    accepted: ["34"],
    explanation: "The quotes make `a` and `b` strings. With strings, `+` glues the text together, so `'3' + '4'` is `'34'`: two characters, not the number thirty-four. To add them as numbers, convert first: `int(a) + int(b)` is 7.",
    hint: "Look at the quotes.",
  },
  {
    id: "code-convert-x3",
    family: "code-convert",
    type: "output",
    difficulty: "easy",
    code: `birth_year = '1990'
print(2026 - int(birth_year))`,
    stem: "What does this code print?",
    accepted: ["36"],
    explanation: "`int('1990')` turns the text into the number 1990, so Python can subtract: 2026 - 1990 = 36. Without the `int()`, Python would refuse to subtract a string from a number.",
    hint: "`int` turns the text into a number first.",
  },
  {
    id: "code-convert-x4",
    family: "code-convert",
    type: "mc",
    difficulty: "standard",
    code: "zip_code = '02134'",
    stem: "Why store ZIP codes as strings instead of integers?",
    choices: [
      "An integer drops the leading zero, and you never do math with ZIP codes",
      "CSV files can only hold text, so every column has to be a string",
      "Strings take up less memory than integers in a big dataset",
      "Python can't store an integer with more than four digits",
    ],
    explanation: "A ZIP code looks like a number but doesn't behave like one: you never add two of them. Stored as an integer, 02134 becomes 2134, and every ZIP code that starts with zero is now wrong. Codes and IDs are labels for categories, so store them as strings.",
    hint: "Would you ever add two ZIP codes together?",
  },
  {
    id: "code-convert-cents",
    family: "code-convert",
    type: "mc",
    difficulty: "stretch",
    code: `>>> 0.1 + 0.2
0.30000000000000004`,
    stem: "Why do systems that handle money store whole cents as integers instead of dollars as floats?",
    choices: [
      "Float math can drift slightly, while integer cents stay exact",
      "Floats can't hold amounts larger than one million dollars",
      "Python rounds every float to two decimal places automatically",
      "Integers print with commas, which makes amounts easier to read",
    ],
    explanation: "A float is a number with a decimal point. Computers can't store some decimals exactly, which is why 0.1 + 0.2 comes out a hair over 0.3. One tiny error doesn't matter, but do enough math with floats and the errors add up. Whole cents as integers (101 for $1.01) stay exact, and you divide by 100 only when you show the amount to a person.",
    hint: "Look at what Python printed for 0.1 + 0.2.",
  },
  {
    id: "code-convert-str-plus-int",
    family: "code-convert",
    type: "mc",
    difficulty: "standard",
    code: "print('2' + 2)",
    stem: "What happens when this runs?",
    choices: ["It raises an error", "It prints 22", "It prints 4", "It prints 2"],
    explanation: "`'2'` in quotes is a string, and `2` without quotes is an integer. Python won't guess whether you meant to join text or add numbers, so it stops with `TypeError: can only concatenate str (not \"int\") to str`. Make both the same type first: `int('2') + 2` is 4, and `'2' + '2'` is `'22'`.",
    hint: "One of them has quotes and the other doesn't.",
  },
  {
    id: "code-sum-list",
    family: "code-sum-list",
    type: "code",
    difficulty: "easy",
    code: "amounts = [10, 20, 40]",
    stem: "Write code to get the total of these numbers.",
    accepted: ["sum(amounts)", "total = sum(amounts)", "amounts[0] + amounts[1] + amounts[2]"],
    explanation: "`sum()` adds up every number in a list: 10 + 20 + 40 = 70. It works however long the list is, so you never have to type out each item.",
    hint: "Python has a built-in function that adds up a list.",
  },
  {
    id: "code-sum-list-x1",
    family: "code-sum-list",
    type: "code",
    difficulty: "easy",
    code: "temps = [9, 14, 11, 6]",
    stem: "Write code to find the largest number.",
    accepted: ["max(temps)", "largest = max(temps)", "highest = max(temps)"],
    explanation: "`max()` returns the biggest item in a list, here 14. Its partner `min()` returns the smallest, 6.",
    hint: "There is a built-in function like `sum` and `len` for this.",
  },
  {
    id: "code-sum-dict-values",
    family: "code-sum-list",
    type: "code",
    difficulty: "standard",
    code: `murders = {
    'Albany': 23,
    'Kings County': 10,
    'Erie': 7,
    'Monroe': 9
}`,
    stem: "Write code to get the total number of murders across all four counties.",
    accepted: [
      "sum(murders.values())",
      "total = sum(murders.values())",
      "sum(list(murders.values()))",
    ],
    explanation: "`sum()` needs numbers, but `murders` is a dictionary: counties are the keys on the left, counts are the values on the right. `murders.values()` gives just the counts, and `sum()` adds them: 23 + 10 + 7 + 9 = 49. Calling `sum(murders)` would try to add up the county names.",
    hint: "Which part of the dictionary holds the numbers?",
  },
  {
    id: "code-sorted",
    family: "code-sorted",
    type: "code",
    difficulty: "standard",
    code: "numbers = [22, 90, 0]",
    stem: "Create a sorted copy called `sorted_numbers`. Keep `numbers` in its original order.",
    accepted: ["sorted_numbers = sorted(numbers)"],
    explanation: "There are two ways to sort a list. `sorted(numbers)` builds a new sorted list and leaves `numbers` alone, so saving it as `sorted_numbers` keeps both. `numbers.sort()` would sort `numbers` itself, permanently, and the original order would be gone.",
    hint: "One way of sorting makes a new list. The other changes the old one.",
  },
  {
    id: "code-sort-permanent",
    family: "code-sorted",
    type: "code",
    difficulty: "easy",
    code: "countries = ['Peru', 'Chad', 'Fiji', 'Laos']",
    stem: "Sort `countries` permanently, so the list itself ends up in alphabetical order.",
    accepted: ["countries.sort()", "countries = sorted(countries)"],
    explanation: "`countries.sort()` sorts the list in place: `countries` itself is now `['Chad', 'Fiji', 'Laos', 'Peru']`, and the old order is gone. `countries = sorted(countries)` gets the same result by making a sorted copy and saving it under the old name.",
    hint: "Lists have a method that sorts them in place.",
  },
  {
    id: "code-sorted-second-largest",
    family: "code-sorted",
    type: "code",
    difficulty: "stretch",
    code: "numbers = [22, 90, 0, -10, 3, 22, 48]",
    stem: "Write code to display the second-largest value without changing `numbers`.",
    accepted: [
      "sorted(numbers)[-2]",
      "print(sorted(numbers)[-2])",
      "sorted(numbers, reverse=True)[1]",
    ],
    explanation: "`sorted(numbers)` makes a new list from smallest to largest: `[-10, 0, 3, 22, 22, 48, 90]`. Negative positions count from the end, so `[-1]` is the last item (the largest, 90) and `[-2]` is the one before it, 48. Using `sorted()` instead of `.sort()` leaves `numbers` in its original order.",
    hint: "Sort a copy, then count from the end.",
  },
  {
    id: "sort-0",
    family: "sort-0",
    type: "mc",
    difficulty: "standard",
    code: "numbers = [22, 90, 0]",
    stem: "You need a sorted list, and you also need the original order later. Which line keeps both?",
    choices: [
      "sorted_numbers = sorted(numbers)",
      "sorted_numbers = numbers.sort()",
      "numbers.sort()",
      "numbers = sorted(numbers)",
    ],
    explanation: "`sorted(numbers)` returns a new sorted list and leaves `numbers` untouched, so saving it under a new name keeps both. `numbers.sort()` sorts `numbers` itself and gives back `None`, so `sorted_numbers = numbers.sort()` saves `None`, and `numbers` itself gets sorted, so the original order is lost. `numbers = sorted(numbers)` reuses the old name, so the original order is lost.",
    hint: "Keep the sorted result under a different name.",
  },
  {
    id: "sort-0-x1",
    family: "sort-0",
    type: "mc",
    difficulty: "stretch",
    code: `numbers = [22, 90, 0]
result = numbers.sort()
print(result)`,
    stem: "What does this code print?",
    choices: ["None", "[0, 22, 90]", "[22, 90, 0]", "[90, 22, 0]"],
    explanation: "`.sort()` sorts `numbers` in place and returns `None`, Python's word for nothing. So `result` holds `None`, while `numbers` is now `[0, 22, 90]`. To get a sorted list back as a value, use `sorted(numbers)`.",
    hint: "`.sort()` changes the list. What does it give back?",
  },
  {
    id: "sort-0-in-place",
    family: "sort-0",
    type: "output",
    difficulty: "standard",
    code: `numbers = [22, 90, 0]
numbers.sort()
print(numbers)`,
    stem: "What does this code print?",
    accepted: ["[0, 22, 90]"],
    explanation: "`.sort()` sorts the list in place, meaning it changes `numbers` itself. You don't need to save anything: after that line, `numbers` is `[0, 22, 90]` for the rest of the program.",
    hint: "Does `.sort()` change the original list?",
  },
  {
    id: "sort-0-sorted-discarded",
    family: "sort-0",
    type: "output",
    difficulty: "stretch",
    code: `numbers = [22, 90, 0]
sorted(numbers)
print(numbers)`,
    stem: "What does this code print?",
    accepted: ["[22, 90, 0]"],
    explanation: "`sorted(numbers)` builds a new sorted list, but nothing saves it, so it's thrown away. `numbers` was never changed, and it still prints `[22, 90, 0]`. To keep the sorted list, save it: `sorted_numbers = sorted(numbers)`.",
    hint: "Where did the sorted list go?",
  },
  {
    id: "string-0",
    family: "f-string",
    type: "mc",
    difficulty: "easy",
    code: `name = 'Bea'
amount = 120`,
    stem: "Which line saves the sentence “Bea gave 120 dollars” in `sentence`?",
    choices: [
      `sentence = f"{name} gave {amount} dollars"`,
      `sentence = "{name} gave {amount} dollars"`,
      `print(name, "gave", amount, "dollars")`,
      `sentence = f"name gave amount dollars"`,
    ],
    explanation: "An f-string is a string with an `f` before the quotes. Python replaces each `{...}` with the value inside it. Without the `f`, the braces stay as plain text, and without braces, `name` is just the word name. `print` shows the sentence but doesn't save it. An f-string makes a string you can store and use anywhere.",
    hint: "You need the `f`, the braces, and somewhere to save the result.",
  },
  {
    id: "f-string-x1",
    family: "f-string",
    type: "mc",
    difficulty: "standard",
    code: "cat = {'name': 'jack', 'age': 6}",
    stem: "Which line prints “jack is 6 years old”?",
    choices: [
      `print(f"{cat['name']} is {cat['age']} years old")`,
      `print("{cat['name']} is {cat['age']} years old")`,
      `print(f"{name} is {age} years old")`,
      `print(f"cat['name'] is cat['age'] years old")`,
    ],
    explanation: "The `f` tells Python to fill in whatever is inside the braces. The values live in the dictionary, so each pair of braces needs `cat['name']` or `cat['age']`. There are no variables called `name` or `age`, so `{name}` would be an error.",
    hint: "There are no variables called `name` or `age`.",
  },
  {
    id: "f-string-x2",
    family: "f-string",
    type: "output",
    difficulty: "easy",
    code: `city = 'Lima'
temp = 18
print(f"It is {temp} degrees in {city}")`,
    stem: "What does this code print?",
    accepted: ["It is 18 degrees in Lima"],
    explanation: "Python swaps each set of braces for that variable's value: `{temp}` becomes 18 and `{city}` becomes Lima. The rest of the text stays as written.",
    hint: "Swap each `{…}` for its value.",
  },
  {
    id: "f-string-commas",
    family: "f-string",
    type: "mc",
    difficulty: "standard",
    code: "total = 1871035",
    stem: "Which line prints 1,871,035?",
    choices: [
      `print(f"{total:,}")`,
      `print(f"{total}")`,
      `print("{total:,}")`,
      `print(f"{total:.2f}")`,
    ],
    explanation: "Inside an f-string's braces, a colon adds a format code. `:,` means put commas between the thousands, so `{total:,}` shows 1,871,035. Plain `{total}` shows 1871035. Without the `f`, Python prints the braces as text, and `:.2f` means two decimal places: 1871035.00.",
    hint: "The format code goes after a colon inside the braces.",
  },
  {
    id: "condition-0",
    family: "conditions",
    type: "mc",
    difficulty: "standard",
    code: `amount = 120
if amount > 100:
    print('large')
if amount > 200:
    print('check')
else:
    print('recorded')`,
    stem: "What is printed, in order?",
    choices: [`large
recorded`, "large", `check
recorded`, "Nothing"],
    explanation: "These are two separate `if` statements, so Python checks both. 120 > 100 is true, so it prints large. The `else` belongs only to the second `if`, which asks about 200. 120 > 200 is false, so the `else` runs and prints recorded.",
    hint: "Follow each `if` separately, and notice which one owns the `else`.",
  },
  {
    id: "condition-1",
    family: "conditions",
    type: "mc",
    difficulty: "standard",
    code: `amount = 60
if amount > 100:
    print('large')
if amount > 200:
    print('check')
else:
    print('recorded')`,
    stem: "What is printed, in order?",
    choices: ["recorded", `large
recorded`, `check
recorded`, "Nothing"],
    explanation: "These are two separate `if` statements. 60 > 100 is false, so large is skipped. The `else` belongs to the second `if`: 60 > 200 is also false, so the `else` runs and prints recorded.",
    hint: "Follow each `if` separately, and notice which one owns the `else`.",
  },
  {
    id: "conditions-x1",
    family: "conditions",
    type: "mc",
    difficulty: "standard",
    code: `temp = 75
if temp > 90:
    print('hot')
elif temp > 60:
    print('warm')
else:
    print('cold')`,
    stem: "What is printed?",
    choices: ["warm", "hot", `warm
cold`, "cold"],
    explanation: "In an `if`/`elif`/`else` chain, exactly one branch runs. 75 > 90 is false, so Python moves to the `elif`. 75 > 60 is true, so it prints warm and skips the `else`.",
    hint: "Only one branch of an `if`/`elif`/`else` runs.",
  },
  {
    id: "conditions-x2",
    family: "conditions",
    type: "mc",
    difficulty: "stretch",
    code: `amount = 300
if amount > 100:
    print('large')
if amount > 200:
    print('check')
else:
    print('recorded')`,
    stem: "What is printed, in order?",
    choices: [`large
check`, "large", "check", `large
recorded`],
    explanation: "Two `if` statements are two separate questions. 300 > 100 is true, so large prints. 300 > 200 is also true, so check prints. The `else` belongs only to the second `if`, and since that `if` ran, the `else` is skipped.",
    hint: "Two `if` statements means two separate questions.",
  },
  {
    id: "conditions-x3",
    family: "conditions",
    type: "output",
    difficulty: "easy",
    code: `party = 'Democrat'
if party == 'Republican':
    print('R')
else:
    print('Not R')`,
    stem: "What does this code print?",
    accepted: ["Not R"],
    explanation: "`==` asks whether two things are equal. `party` is 'Democrat', not 'Republican', so the condition is false and the `else` runs.",
    hint: "Check the condition with the actual value.",
  },
  {
    id: "conditions-x4",
    family: "conditions",
    type: "output",
    difficulty: "stretch",
    code: `amount = 500
if amount > 100:
    print('medium')
elif amount > 400:
    print('large')`,
    stem: "What does this code print?",
    accepted: ["medium"],
    explanation: "Python checks an `if`/`elif` chain from the top and runs only the first branch that's true. 500 > 100 is true, so it prints medium and never looks at the `elif`, even though 500 > 400 is also true. To get large, put the stricter test first.",
    hint: "Only one branch runs, and Python checks from the top.",
  },
  {
    id: "loop-0",
    family: "loop-total",
    type: "mc",
    difficulty: "standard",
    code: `amounts = [40, 120, 60]
total = 0
for amount in amounts:
    if amount >= 100:
        total = total + amount
print(total)`,
    stem: "What is printed?",
    choices: ["120", "220", "3", "0"],
    explanation: "The loop visits each amount in turn, and the `if` lets through only amounts of 100 or more. Only 120 passes, so `total` goes from 0 to 120. 220 would be the total of every amount, as if the `if` weren't there.",
    hint: "Write down which amounts pass the condition before adding them.",
  },
  {
    id: "loop-1",
    family: "loop-total",
    type: "mc",
    difficulty: "standard",
    code: `amounts = [10, 20, 90]
total = 0
for amount in amounts:
    if amount >= 20:
        total = total + amount
print(total)`,
    stem: "What is printed?",
    choices: ["110", "90", "120", "0"],
    explanation: "`>=` means greater than or equal to, so 20 counts. 10 is skipped, and 20 + 90 = 110. With `>` instead, 20 would be skipped too and the total would be 90.",
    hint: "Does 20 pass `>= 20`?",
  },
  {
    id: "loop-total-x1",
    family: "loop-total",
    type: "mc",
    difficulty: "standard",
    code: `amounts = [40, 120, 60, 250]
count = 0
for amount in amounts:
    if amount > 50:
        count = count + 1
print(count)`,
    stem: "What is printed?",
    choices: ["3", "430", "4", "1"],
    explanation: "Each time an amount is above 50, `count` goes up by 1. 120, 60 and 250 pass, so `count` is 3. This loop counts; it adds 1, not the amount. Adding the amounts would give 430.",
    hint: "What gets added to `count` each time?",
  },
  {
    id: "loop-total-x2",
    family: "loop-total",
    type: "output",
    difficulty: "standard",
    code: `songs = [
    {'title': 'Harvest Moon', 'plays': 800},
    {'title': 'September', 'plays': 1200}
]
total = 0
for song in songs:
    total = total + song['plays']
print(total)`,
    stem: "What does this code print?",
    accepted: ["2000"],
    explanation: "Like a cash register: `total` starts at 0, and each pass through the loop adds one song's plays. After the first song it's 800, after the second it's 800 + 1200 = 2000.",
    hint: "Track `total` after each pass through the loop.",
  },
  {
    id: "loop-total-x3",
    family: "loop-total",
    type: "mc",
    difficulty: "standard",
    code: `art_pieces = [
    {'title': 'Untitled', 'year': 1948},
    {'title': 'Flag', 'year': 1955}
]
for art in art_pieces:
    ...`,
    stem: "Inside this loop, which line prints each title?",
    choices: [
      "print(art['title'])",
      "print(art_pieces['title'])",
      "print(art_pieces[0]['title'])",
      "print(title)",
    ],
    explanation: "Inside the loop, `art` is one dictionary at a time, so `art['title']` is that piece's title. `art_pieces` is the whole list, which only takes positions like `[0]`, so `art_pieces['title']` is an error. `art_pieces[0]['title']` would print Untitled on every pass. Inside the loop, use the name on the left of `in`.",
    hint: "Use the loop variable.",
  },
  {
    id: "loop-total-x4",
    family: "loop-total",
    type: "output",
    difficulty: "stretch",
    code: `contributions = [
    {'party': 'R', 'amount': 100},
    {'party': 'D', 'amount': 50},
    {'party': 'R', 'amount': 25}
]
total = 0
for c in contributions:
    if c['party'] == 'R':
        total = total + c['amount']
print(total)`,
    stem: "What does this code print?",
    accepted: ["125"],
    explanation: "The loop looks at each contribution, and the `if` lets only the R ones add to the total. The D contribution of 50 is skipped, so the total is 100 + 25 = 125.",
    hint: "Skip the rows that fail the condition.",
  },
  {
    id: "code-list-comp-x1",
    family: "code-list-comp",
    type: "mc",
    difficulty: "stretch",
    code: `art_pieces = [
    {'title': 'Untitled', 'year': 1948},
    {'title': 'Flag', 'year': 1955},
    {'title': 'Marilyn', 'year': 1962}
]
[art['title'] for art in art_pieces if art['year'] > 1950]`,
    stem: "What list does this produce?",
    choices: ["['Flag', 'Marilyn']", "['Untitled']", "[1955, 1962]", "['Untitled', 'Flag', 'Marilyn']"],
    explanation: "A list comprehension builds a new list from an old one. Read it in three parts: `for art in art_pieces` goes through each piece, `if art['year'] > 1950` keeps only Flag and Marilyn, and `art['title']` at the front says what to put in the new list: their titles, not their years.",
    hint: "Read it as: the title, for each art, if its year is after 1950.",
  },
  {
    id: "code-list-comp-x2",
    family: "code-list-comp",
    type: "mc",
    difficulty: "standard",
    code: `cats = [
    {'name': 'jack', 'age': 6},
    {'name': 'mulberry', 'age': 4}
]`,
    stem: "Which comprehension makes a list of every cat’s name?",
    choices: [
      "[cat['name'] for cat in cats]",
      "[cats['name'] for cat in cats]",
      "[cat for cat in cats['name']]",
      "[name for cat in cats]",
    ],
    explanation: "`for cat in cats` hands you one dictionary at a time, and what goes in front says what to keep from each: `cat['name']`. The result is `['jack', 'mulberry']`. `cats['name']` treats the whole list like a dictionary, which is an error, the same mistake as in a regular loop.",
    hint: "Use the single item, not the whole list.",
  },
  {
    id: "code-list-comp-prices",
    family: "code-list-comp",
    type: "code",
    difficulty: "stretch",
    code: `art_pieces = [
    {'title': 'Gold Star', 'year': 1805, 'price': 234},
    {'title': 'Blunderbuss', 'year': 1800, 'price': 4},
    {'title': 'Chairlift', 'year': 1976, 'price': 1234},
    {'title': 'Rancor', 'year': 2002, 'price': 200}
]`,
    stem: "Write a list comprehension for the prices of the pieces made before 1950.",
    accepted: [
      "[art['price'] for art in art_pieces if art['year'] < 1950]",
      "prices = [art['price'] for art in art_pieces if art['year'] < 1950]",
      "[piece['price'] for piece in art_pieces if piece['year'] < 1950]",
      "prices = [piece['price'] for piece in art_pieces if piece['year'] < 1950]",
      "[art_piece['price'] for art_piece in art_pieces if art_piece['year'] < 1950]",
      "prices = [art_piece['price'] for art_piece in art_pieces if art_piece['year'] < 1950]",
      "[item['price'] for item in art_pieces if item['year'] < 1950]",
      "prices = [item['price'] for item in art_pieces if item['year'] < 1950]",
      "[a['price'] for a in art_pieces if a['year'] < 1950]",
      "prices = [a['price'] for a in art_pieces if a['year'] < 1950]",
      "[x['price'] for x in art_pieces if x['year'] < 1950]",
      "prices = [x['price'] for x in art_pieces if x['year'] < 1950]",
      "[p['price'] for p in art_pieces if p['year'] < 1950]",
      "prices = [p['price'] for p in art_pieces if p['year'] < 1950]",
      "[row['price'] for row in art_pieces if row['year'] < 1950]",
      "prices = [row['price'] for row in art_pieces if row['year'] < 1950]",
      "[artwork['price'] for artwork in art_pieces if artwork['year'] < 1950]",
      "prices = [artwork['price'] for artwork in art_pieces if artwork['year'] < 1950]",
      "[work['price'] for work in art_pieces if work['year'] < 1950]",
      "prices = [work['price'] for work in art_pieces if work['year'] < 1950]",
      "[i['price'] for i in art_pieces if i['year'] < 1950]",
      "prices = [i['price'] for i in art_pieces if i['year'] < 1950]",
    ],
    explanation: "Build it a piece at a time. Square brackets, because you want a list. `for art in art_pieces` inside, to go through each piece. `art['price']` in front, for what to keep from each one. `if art['year'] < 1950` at the end, to keep only the old pieces. The result is `[234, 4]`, and `sum()` of that is 238.",
    hint: "What you keep goes first, then the loop, then the condition.",
  },
  {
    id: "pipeline-1",
    family: "pipeline-1",
    type: "short",
    difficulty: "standard",
    stem: "Why can breaking a long calculation into named steps, one per line, make code easier to check?",
    groups: [
      [
        "each step is easier to follow",
        "step",
        "steps",
        "inspect",
        "read",
        "readable",
        "follow",
        "understand",
        "clear",
        "clearer",
        "see",
        "one thing",
      ],
      [
        "you can find where a mistake is",
        "error",
        "errors",
        "mistake",
        "mistakes",
        "debug",
        "debugging",
        "bug",
        "bugs",
        "check",
        "test",
        "wrong",
        "fails",
        "failed",
        "broke",
        "breaks",
        "find",
      ],
    ],
    explanation: "Readable code exists so other people can follow what you did. With one step per line, a reader can follow the calculation and check each result on its own. And when something is wrong, the error points at a line doing one thing, so you can find which step failed instead of untangling a line doing five.",
    hint: "Imagine trying to find which part of a calculation produced a wrong result.",
  },
  {
    id: "pipeline-1-x1",
    family: "pipeline-1",
    type: "short",
    difficulty: "standard",
    code: `RABBIT_BPM = 150
MINUTES_IN_A_YEAR = 365 * 24 * 60
rabbit_heartbeats = age * MINUTES_IN_A_YEAR * RABBIT_BPM`,
    stem: "Why store `RABBIT_BPM = 150` instead of one big beats-per-year number?",
    groups: [
      [
        "beats per minute is what people measure",
        "measure",
        "measured",
        "measures",
        "look up",
        "looked up",
        "source",
        "real",
        "actual",
        "known",
        "cite",
        "citation",
        "editor",
      ],
      [
        "easy to check or change",
        "check",
        "change",
        "verify",
        "update",
        "edit",
        "fix",
        "hide",
        "hides",
        "understand",
        "follow",
      ],
    ],
    explanation: "Nobody has ever measured a rabbit's heartbeats per year. Beats per minute is the number people actually measure and look up, so an editor can check it against a source you cite, and if someone measures 175 instead, you change one number. A single beats-per-year figure hides how you got it.",
    hint: "Which number could an editor look up?",
  },
  {
    id: "pipeline-1-x2",
    family: "pipeline-1",
    type: "mc",
    difficulty: "easy",
    stem: "Your code has `int(birth_year)` in six places. What does “don’t repeat yourself” tell you to do?",
    choices: [
      "Convert once near the top with birth_year = int(birth_year), then reuse it",
      "Move all six conversions onto one long line so there's less code",
      "Keep all six, so the value is checked again each time it's used",
      "Switch to float(birth_year) in all six places so decimals work too",
    ],
    explanation: "Don't repeat yourself (DRY) means that when you write the same thing again and again, it's a sign the code needs a structural fix. Here the fix is converting once, `birth_year = int(birth_year)`, at the top. Every later line uses the integer, and if the conversion ever needs to change, you change one line.",
    hint: "Could you do the conversion in one place?",
  },
  {
    id: "pipeline-1-split-lines",
    family: "pipeline-1",
    type: "mc",
    difficulty: "standard",
    code: `# Version A
age = 2026 - int(input("What year were you born? "))

# Version B
birth_year = input("What year were you born? ")
birth_year = int(birth_year)
age = 2026 - birth_year`,
    stem: "Someone types `10 years ago`, and both versions crash. Why is Version B easier to debug?",
    choices: [
      "The error points at a line doing one thing, the conversion",
      "Version B checks the input before it tries to convert it",
      "Version B runs faster, so the error shows up sooner",
      "Python gives longer error messages for longer files",
    ],
    explanation: "Python's error names the line that failed. In Version A, that line asks for input, converts it and subtracts, so you have to work out which part broke. In Version B, the error points at `birth_year = int(birth_year)`, which does only the conversion, so you know `int()` got text it couldn't turn into a number.",
    hint: "Which line would the error point at in each version?",
  },
];
