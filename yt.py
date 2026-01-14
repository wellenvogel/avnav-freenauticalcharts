#! /usr/bin/env python3
import sys
import yaml
import pprint
from yaml import Loader
def check(inf,dump=False):
    with open(inf,"r") as i:
        doc=yaml.load(i,Loader=Loader)
    if dump:
        pprint.pp(doc,indent=2)

dump=False    
if len(sys.argv) > 2:
    if sys.argv[1] == '-d':
        dump=True
    else:
        print(f"invalid otion {sys.argv[1]}",file=sys.stderr)
        sys.exit(1)
    name=sys.argv[2]
else:
    name=sys.argv[1]    

check(name,dump)        