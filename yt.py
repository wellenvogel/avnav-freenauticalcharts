#! /usr/bin/env python3
import sys
import yaml
from yaml import Loader
def check(inf):
    with open(inf,"r") as i:
        doc=yaml.load(i,Loader=Loader)
    

check(sys.argv[1])        