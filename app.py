from flask import render_template
from flask import request

import time
import flask
from flask import Flask
app = Flask(__name__)

import requests

@app.route('/')
def index():
  url=request.args.get('u')
  print("looks like "+str(url))

  if url:
    try:
      if ':' not in url:
        print("whoops let me fix that")
        url='http://'+url
      agent = request.headers.get('User-Agent')
      user_agent = {'User-agent': agent}
      rt = requests.get(str(url), headers = user_agent).text
    except:
      return url+" is DOWN"

    response = flask.Response(rt)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return url+" is UP "+response.status

  return render_template('index.html')

