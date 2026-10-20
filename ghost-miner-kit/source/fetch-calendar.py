"""Read the public GitHub calendar and retain every day's count and level."""
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
import argparse
import json
import re

ROOT=Path(__file__).resolve().parent.parent
class CalendarParser(HTMLParser):
    def __init__(self):
        super().__init__();self.days={};self.labels={};self.current=None;self.buffer=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'data-date' in a:
            key=a.get('id')
            if not key or key in self.days:raise ValueError('Invalid calendar day identity')
            self.days[key]={'date':a['data-date'],'level':int(a['data-level'])}
        if tag=='tool-tip':self.current=a.get('for');self.buffer=[]
    def handle_data(self,text):
        if self.current:self.buffer.append(text)
    def handle_endtag(self,tag):
        if tag=='tool-tip' and self.current:
            self.labels[self.current]=' '.join(''.join(self.buffer).split());self.current=None
    def calendar(self):
        result=[]
        for key,day in self.days.items():
            m=re.match(r'(No|[\d,]+) contributions? on ',self.labels.get(key,''))
            if not m:raise ValueError('GitHub calendar markup changed: count unavailable')
            count=0 if m[1]=='No' else int(m[1].replace(',',''))
            if day['level'] not in range(5) or (count==0)!=(day['level']==0):raise ValueError('Invalid activity level')
            date.fromisoformat(day['date']);result.append({**day,'count':count})
        result.sort(key=lambda d:d['date'])
        if not 350<=len(result)<=371:raise ValueError('Expected one year of daily cells')
        dates=[date.fromisoformat(d['date']) for d in result]
        if len(set(dates))!=len(dates) or (dates[-1]-dates[0]).days+1!=len(dates):raise ValueError('Missing calendar dates')
        return result

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--html',type=Path);args=parser.parse_args()
    username=json.loads((ROOT/'miner-config.json').read_text())['username']
    if not re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?',username):raise ValueError('Invalid username')
    source=f'https://github.com/users/{username}/contributions'
    if args.html:html=args.html.read_text(encoding='utf-8')
    else:
        with urlopen(Request(source,headers={'User-Agent':'GhostMiner/0.1','Accept-Language':'en-US'}),timeout=30) as response:html=response.read().decode('utf-8')
    p=CalendarParser();p.feed(html);days=p.calendar()
    data={'username':username,'source':source,'fetched_at':datetime.now(timezone.utc).isoformat(),'start_date':days[0]['date'],'end_date':days[-1]['date'],'days':days}
    (ROOT/'data/calendar.json').write_text(json.dumps(data,indent=2)+'\n')
    print(json.dumps({'username':username,'days':len(days),'active_days':sum(d['count']>0 for d in days),'start':data['start_date'],'end':data['end_date']}))
