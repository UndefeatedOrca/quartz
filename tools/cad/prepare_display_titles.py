"""Prepare editorial sentence-case labels; source metadata and filenames stay unchanged.

Review the resulting JSON before rendering new records. This vocabulary describes
the current collection, not a general-purpose automatic proper-name detector.
"""
import re
from archive import Archive, save

PROTECTED = '''Cross Examination Debate Association|Open Society Institute|First Amendment|New York|New York Times|Ideafest II|Ideafest|Detroit|Chicago|Tuscaloosa|Schrodinger|Whately|Crenshaw|Korcok|Buchanan|CEDA|NDT|ELM|CAD|C.E.|U.S.|1AR|Alfred C. Snider|Alfred Snider|Alfred|Snider|David Frank|Frank Lane|Walter Swift|Schnurer|Woods|Warner|Florida|Paris|Lucia Cormier|Margaret Chase Smith|Maine|Senate|November|South Carolina|Hillary Clinton|Rick Lazio|American|Canadian|Victor Davis Hanson|Suicide Girls|Saddleback|Jefferson Davis|Latina/o|British|Deacon Source|Texas Normal Debating League|Healthy Debate Initiative|Tuna|Doctor Who|Illichian|Venezuela|Louisville Project|Grindr|Eleazar|Native|Black|White|Earth'''.split('|')


PROTECTED.remove('White')
PROTECTED += ['CEDA-L', 'PC', 'Tab Room on the PC', 'Smart Tournament Administrator', 'DebateWatch',
              'Aristotle', 'Lincoln', 'Homer Simpson', 'Michael Calvin McGee', 'Dr.', 'Blackness', 'Antiblackness']


def sentence_case(title):
    text = title.lower().replace('\x93', '“').replace('\x94', '”')
    text = re.sub(r'[a-zA-ZÀ-ÿ]', lambda m: m[0].upper(), text, count=1)
    text = re.sub(r'([:?!][\"\']?\s+[\"\']?)([a-z])', lambda m: m[1]+m[2].upper(), text)
    text = re.sub(r'\bi\b', 'I', text)
    for name in sorted(PROTECTED, key=len, reverse=True):
        text = re.sub(r'(?<!\w)'+re.escape(name)+r'(?!\w)', lambda m: name, text, flags=re.I)
    text = text.replace('Black hole', 'black hole')
    text = text.replace('100 Years', '100 years')
    text = text.replace('"faculty help', '"Faculty help').replace('"the hygiene', '"The hygiene')
    text = text.replace("'dominant form", "'Dominant form")
    text = text.replace(' / critical thinking', ' / Critical thinking').replace(' / the art', ' / The art').replace(' / understanding', ' / Understanding')
    return text


if __name__ == '__main__':
    archive = Archive()
    labels = {r['id']: sentence_case(r['title']) for r in archive.manifest['records']}
    save(archive.data / 'display-titles.json', labels)
    print(f'Prepared {len(labels)} display labels; review before rendering.')
