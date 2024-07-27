import lorem
import random,math, time
import json

def post(text):
	words = text.split(' ')
	p = [("",""), ("**","**"),("*","*"),("~~","~~"),("[","](google.com)")]
	w = [30, 1, 3, 2, 1]
	for i in range(len(words)):
		if words[i]:
			pp = random.choices(p, weights=w)[0]
			words[i] = pp[0]+words[i]+pp[1]

	return " ".join(words)

itms = [{
		'parent_id':-1,
		'id': 0,
		'text': '',
		'checked':False,
		'archived': False
	}]

for i in range(1,20):
	itm = {
		'parent_id':random.choice(itms)['id'],
		'id': i,
		'text': random.choices([lorem.sentence(), lorem.paragraph()], weights=[4,1],k=1)[0],
		'checked':random.choice([True, False]),
		'archived': False
	}
	i+=1
	itms.append(itm)

for itm in itms:
	itm['text'] = post(itm['text'])

with open("test.json","w") as F:
	json.dump(itms, F, indent=2)
print(itms)