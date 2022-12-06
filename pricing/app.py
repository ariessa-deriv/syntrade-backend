import gevent
from gevent.pywsgi import WSGIServer
from gevent import monkey
monkey.patch_all()
import json
import random as random
import numpy as np
import pytz
from datetime import datetime
from flask import Flask, json, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

S1 = [100000]
S2 = [100000]
S3 = [100000]
S4 = [100000]
S5 = [100000]
S6 = [100000]
S7 = [100000]
S8 = [100000]

mu = 0
sigma_10 = 0.1
sigma_25 = 0.25
dt = 2/31536000

def event():
    while True:
        # Boom 100 model
        A1 = random.choices((0,1), weights=(99, 1), k=1)
        unif_boom100_1 = np.random.uniform(0, 1, 1)
        unif_boom100_2 = np.random.uniform(75, 125, 1)
        price_move_boom_100 = np.round(-1.5 + unif_boom100_2*A1[0] + unif_boom100_1, 6)
        curr_boom_100_price = S1[-1] + price_move_boom_100
        S1.append(curr_boom_100_price)

        # Crash 100 model
        A2 = random.choices((0,1), weights=(99, 1), k=1)
        unif_crash100_1 = np.random.uniform(0, 1, 1)
        unif_crash100_2 = np.random.uniform(75, 125, 1)
        price_move_crash_100 = np.round(1.5 - unif_crash100_2*A2[0] - unif_crash100_1, 6)
        curr_crash_100_price = S2[-1] + price_move_crash_100
        S2.append(curr_crash_100_price)

        # Boom 300 model
        A3 = random.choices((0,1), weights=(299, 1), k=1)
        unif_boom300_1 = np.random.uniform(0, 1, 1)
        unif_boom300_2 = np.random.uniform(225, 375, 1)
        price_move_boom_300 = np.round(-1.5 + unif_boom300_2*A3[0] + unif_boom300_1, 6)
        curr_boom_300_price = S3[-1] + price_move_boom_300
        S3.append(curr_boom_300_price)

        # Crash 300 model
        A4 = random.choices((0,1), weights=(299, 1), k=1)
        unif_crash300_1 = np.random.uniform(0, 1, 1)
        unif_crash300_2 = np.random.uniform(225, 375, 1)
        price_move_crash_300 = np.round(1.5 - unif_crash300_2*A4[0] - unif_crash300_1, 6)
        curr_crash_300_price = S4[-1] + price_move_crash_300
        S4.append(curr_crash_300_price)

        # Boom 500 model
        A5 = random.choices((0,1), weights=(499, 1), k=1)
        unif_boom500_1 = np.random.uniform(0, 1, 1)
        unif_boom500_2 = np.random.uniform(375, 625, 1)
        price_move_boom_500 = np.round(-1.5 + unif_boom500_2*A5[0] + unif_boom500_1, 6)
        curr_boom_500_price = S5[-1] + price_move_boom_500
        S5.append(curr_boom_500_price)

        # Crash 500 model
        A6 = random.choices((0,1), weights=(499, 1), k=1)
        unif_crash500_1 = np.random.uniform(0, 1, 1)
        unif_crash500_2 = np.random.uniform(375, 625, 1)
        price_move_crash_500 = np.round(1.5 - unif_crash500_2*A6[0] - unif_crash500_1, 6)
        curr_crash_500_price = S6[-1] + price_move_crash_500
        S6.append(curr_crash_500_price)

        # Volatility 10 model
        dW = np.sqrt(dt)*np.random.normal(0,1,1)
        curr_price_vol_10 = S7[-1] * np.exp((mu-0.5*sigma_10**2)*dt + sigma_10*dW)
        S7.append(curr_price_vol_10)

        # Volatility 25 model
        dW = np.sqrt(dt)*np.random.normal(0,1,1)
        curr_price_vol_25 = S8[-1] * np.exp((mu-0.5*sigma_25**2)*dt + sigma_25*dW)
        S8.append(curr_price_vol_25)

        # Current Time
        now = datetime.now()
        time_asia_kuala_lumpur = int(now.replace(tzinfo=pytz.utc).astimezone(pytz.timezone("Asia/Kuala_Lumpur")).strftime("%s"))

        pricing = json.dumps({
            'current_boom_100_price': round(curr_boom_100_price[-1],2), 
            'current_boom_300_price': round(curr_boom_300_price[-1],2),
            'current_boom_500_price': round(curr_boom_500_price[-1],2),
            'current_crash_100_price': round(curr_crash_100_price[-1],2),
            'current_crash_300_price': round(curr_crash_300_price[-1],2), 
            'current_crash_500_price': round(curr_crash_500_price[-1],2), 
            'current_vol_10_price': round(curr_price_vol_10[-1],2), 
            'current_vol_25_price': round(curr_price_vol_25[-1],2),
            'time_asia_kuala_lumpur': time_asia_kuala_lumpur})
            
        yield 'data: ' + pricing + '\n\n'
        gevent.sleep(seconds=1)

@app.route('/', methods=['GET'])
def stream():
    response= Response(event(), mimetype="application/json")
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Methods: GET')
    return response

if __name__ == "__main__":
    WSGIServer(('0.0.0.0', 5000), app).serve_forever()