#! /usr/bin/env python3
import sys
import json
import yaml

def convert(inf,outf):
    with open(inf,"r") as i:
        doc=json.load(i)
    
    with open(outf,"w") as o:
        yaml.dump(doc,o,indent=2,default_flow_style=False)

convert(sys.argv[1],sys.argv[2])        